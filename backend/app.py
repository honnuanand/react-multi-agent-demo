from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import List, Dict

# Configuration
USE_ENV_FALLBACK = os.environ.get("USE_ENV_FALLBACK", "false").lower() == "true"

app = FastAPI()

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware (use a strong secret in production!)
app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET", "dev-secret"))

async def get_credentials(data: Dict, provider: str, required_fields: List[str]) -> Dict[str, str]:
    try:
        credentials = {}
        
        # If USE_ENV_FALLBACK is true, try to get credentials from environment first
        if USE_ENV_FALLBACK:
            for field in required_fields:
                env_key = f"{provider.upper()}_{field.upper()}"
                env_value = os.environ.get(env_key)
                if env_value:
                    credentials[field] = env_value
                else:
                    # If not in env, try to get from request
                    value = data.get(field)
                    if not value:
                        raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
                    credentials[field] = value
        else:
            # If not using env fallback, get all from request
            for field in required_fields:
                value = data.get(field)
                if not value:
                    raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
                credentials[field] = value
                
        return credentials
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Health check
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "config": {
            "use_env_fallback": USE_ENV_FALLBACK
        }
    }

# Store credentials for all providers in session
@app.post("/api/session/set_key")
async def set_key(request: Request):
    data = await request.json()
    provider = data.get("provider")
    if provider not in ("openai", "anthropic", "databricks"):
        raise HTTPException(status_code=400, detail="Invalid provider")
    # Store all fields for the provider
    for field in ["apiKey", "model", "apiUrl"]:
        if field in data:
            request.session[f"{provider}_{field}"] = data[field]
    return {"success": True}

@app.post("/api/session/get_key")
async def get_key(request: Request):
    data = await request.json()
    provider = data.get("provider")
    if provider not in ("openai", "anthropic", "databricks"):
        raise HTTPException(status_code=400, detail="Invalid provider")
    result = {}
    for field in ["apiKey", "model", "apiUrl"]:
        value = request.session.get(f"{provider}_{field}")
        if value:
            result[field] = value
    return result

# Proxy to OpenAI
@app.post("/api/llm/openai")
async def llm_openai(request: Request):
    data = await request.json()
    credentials = await get_credentials(data, "openai", ["apiKey", "model"])
    api_key = credentials["apiKey"]
    model = credentials["model"] or "gpt-3.5-turbo"
    
    if not api_key:
        return JSONResponse({"error": "API key is required"}, status_code=400)
    
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": model,
        "messages": data.get("messages", []),
        "max_tokens": data.get("max_tokens", 1000),
        "temperature": data.get("temperature", 0.7),
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0
            )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        return JSONResponse({"error": e.response.text}, status_code=e.response.status_code)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Proxy to Anthropic
@app.post("/api/llm/anthropic")
async def llm_anthropic(request: Request):
    data = await request.json()
    credentials = await get_credentials(data, "anthropic", ["apiKey", "model"])
    api_key = credentials["apiKey"]
    model = credentials["model"] or "claude-3-opus-20240229"
    
    if not api_key:
        return JSONResponse({"error": "API key is required"}, status_code=400)
    
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": model,
        "max_tokens": data.get("max_tokens", 1000),
        "temperature": data.get("temperature", 0.7),
        "messages": data.get("messages", []),
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=60.0
            )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        return JSONResponse({"error": e.response.text}, status_code=e.response.status_code)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Proxy to Databricks
@app.post("/api/llm/databricks")
async def llm_databricks(request: Request):
    data = await request.json()
    credentials = await get_credentials(data, "databricks", ["apiKey", "apiUrl", "model"])
    api_key = credentials["apiKey"]
    api_url = credentials["apiUrl"]
    model = credentials["model"] or "dbrx-instruct"
    
    if not api_key or not api_url:
        return JSONResponse({"error": "API key and API URL are required"}, status_code=400)
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": data.get("messages", []),
        "max_tokens": data.get("max_tokens", 1000),
        "temperature": data.get("temperature", 0.7),
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=60.0
            )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        return JSONResponse({"error": e.response.text}, status_code=e.response.status_code)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/llm/databricks/models")
async def list_databricks_models(request: Request):
    data = await request.json()
    credentials = await get_credentials(data, "databricks", ["apiKey", "apiUrl"])
    api_key = credentials["apiKey"]
    api_url = credentials["apiUrl"]
    
    if not api_key or not api_url:
        return JSONResponse({"error": "API key and API URL are required"}, status_code=400)
    
    # Extract the workspace URL from the API URL
    workspace_url = api_url.split("/serving-endpoints")[0]
    models_url = f"{workspace_url}/api/2.0/serving-endpoints"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # First, get all serving endpoints
            resp = await client.get(models_url, headers=headers, timeout=30.0)
            resp.raise_for_status()
            endpoints = resp.json().get("endpoints", [])
            
            # Get model details for each endpoint
            models = []
            for endpoint in endpoints:
                endpoint_name = endpoint.get("name")
                if endpoint_name:
                    # Get model details for this endpoint
                    model_url = f"{workspace_url}/api/2.0/serving-endpoints/{endpoint_name}"
                    model_resp = await client.get(model_url, headers=headers, timeout=30.0)
                    model_resp.raise_for_status()
                    model_data = model_resp.json()
                    
                    # Extract model information including the complete serving URL
                    model_info = {
                        "name": endpoint_name,
                        "type": "serving-endpoint",
                        "status": endpoint.get("state", {}).get("ready", False),
                        "config": model_data.get("config", {}),
                        "url": f"{workspace_url}/serving-endpoints/{endpoint_name}/invocations"
                    }
                    models.append(model_info)
            
            return {"models": models}
    except httpx.HTTPStatusError as e:
        return JSONResponse({"error": e.response.text}, status_code=e.response.status_code)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500) 