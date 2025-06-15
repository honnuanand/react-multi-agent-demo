from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse
import httpx
import os

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

# Health check
@app.get("/api/health")
def health():
    return {"status": "ok"}

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
    api_key = data.get("apiKey") or request.session.get("openai_apiKey") or os.environ.get("OPENAI_API_KEY")
    model = data.get("model") or request.session.get("openai_model") or "gpt-3.5-turbo"
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
    api_key = data.get("apiKey") or request.session.get("anthropic_apiKey") or os.environ.get("ANTHROPIC_API_KEY")
    model = data.get("model") or request.session.get("anthropic_model") or "claude-3-opus-20240229"
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
    api_key = data.get("apiKey") or request.session.get("databricks_apiKey") or os.environ.get("DATABRICKS_API_KEY")
    api_url = data.get("apiUrl") or request.session.get("databricks_apiUrl") or os.environ.get("DATABRICKS_API_URL")
    model = data.get("model") or request.session.get("databricks_model") or "dbrx-instruct"
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