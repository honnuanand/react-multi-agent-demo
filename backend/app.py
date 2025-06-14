from fastapi import FastAPI, Request

app = FastAPI()

@app.post("/api/llm/openai")
async def call_openai(request: Request):
    print("call_openai endpoint hit")
    try:
        data = await request.json()
        print("Received OpenAI request data:", data)  # Debug log
        api_key = data.pop("apiKey", None) or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("No API key provided!")
            return JSONResponse({"error": "API key is required"}, status_code=400)
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        resp = requests.post(url, headers=headers, json={
            "model": data["model"],
            "messages": data["messages"]
        })
        print("OpenAI response status:", resp.status_code)
        if resp.status_code != 200:
            print("OpenAI error:", resp.text)
            return JSONResponse({"error": resp.text}, status_code=resp.status_code)
        return resp.json()
    except Exception as e:
        print("Exception in call_openai:", e)
        return JSONResponse({"error": str(e)}, status_code=500)

print("=== app.py loaded ===")
print("=== FastAPI app created ===")
for route in app.routes:
    print(route.path, route.methods)

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from fastapi.staticfiles import StaticFiles
import os

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global API keys for each provider
GLOBAL_KEYS = {
    "openai": os.getenv("OPENAI_API_KEY", ""),
    "anthropic": os.getenv("ANTHROPIC_API_KEY", "")
}

# Serve React static files in production
frontend_dist = os.path.join(os.path.dirname(__file__), '..', 'dist')
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

class LLMRequest(BaseModel):
    messages: list
    model: str
    provider: str
    apiKey: str = None
    apiUrl: str = None
    max_tokens: int = None
    temperature: float = None

@app.post("/api/llm/{provider}")
async def llm_router(provider: str, data: LLMRequest):
    print(f"/api/llm/{provider} called with data: {data}")
    if provider == "openai":
        return await call_openai(data)
    elif provider == "anthropic":
        return await call_anthropic(data)
    elif provider == "databricks":
        return await call_databricks(data)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

async def call_openai(data: LLMRequest):
    api_key = data.apiKey or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("No OpenAI API key provided!")
        return JSONResponse({"error": "API key is required"}, status_code=400)
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    print("Proxying to OpenAI with:", {"model": data.model, "messages": data.messages})
    resp = requests.post(url, headers=headers, json={
        "model": data.model,
        "messages": data.messages
    })
    print("OpenAI response status:", resp.status_code)
    if resp.status_code != 200:
        print("OpenAI error:", resp.text)
        return JSONResponse({"error": resp.text}, status_code=resp.status_code)
    return resp.json()

async def call_anthropic(data: LLMRequest):
    api_key = data.apiKey or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("No Anthropic API key provided!")
        return JSONResponse({"error": "API key is required"}, status_code=400)
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    print("Proxying to Anthropic with:", {"model": data.model, "messages": data.messages})
    resp = requests.post(url, headers=headers, json={
        "model": data.model,
        "messages": data.messages,
        "max_tokens": 1000
    })
    print("Anthropic response status:", resp.status_code)
    if resp.status_code != 200:
        print("Anthropic error:", resp.text)
        return JSONResponse({"error": resp.text}, status_code=resp.status_code)
    return resp.json()

async def call_databricks(data: LLMRequest):
    api_key = data.apiKey or os.environ.get("DATABRICKS_API_KEY")
    api_url = data.apiUrl or os.environ.get("DATABRICKS_API_URL")
    if not api_key or not api_url:
        print("No Databricks API key or URL provided!")
        return JSONResponse({"error": "API key and API URL are required"}, status_code=400)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "content-type": "application/json"
    }
    # Build prompt from messages
    user_prompt = "\n".join([m["content"] for m in data.messages if m["role"] == "user"])
    system_prompt = next((m["content"] for m in data.messages if m["role"] == "system"), "")
    prompt = f"{system_prompt}\n{user_prompt}" if system_prompt else user_prompt
    payload = {
        "inputs": [
            {
                "prompt": prompt
            }
        ]
    }
    # Optionally add max_tokens and temperature if present
    if hasattr(data, "max_tokens") and data.max_tokens:
        payload["max_tokens"] = data.max_tokens
    if hasattr(data, "temperature") and data.temperature:
        payload["temperature"] = data.temperature
    print("Proxying to Databricks with:", {"apiUrl": api_url, "payload": payload})
    try:
        resp = requests.post(api_url, headers=headers, json=payload)
        print("Databricks response status:", resp.status_code)
        if resp.status_code != 200:
            print("Databricks error:", resp.text)
            return JSONResponse({"error": resp.text}, status_code=resp.status_code)
        return resp.json()
    except Exception as e:
        print("Exception in call_databricks:", e)
        return JSONResponse({"error": str(e)}, status_code=500)
