import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app import app
import os
import secrets

client = TestClient(app)

@pytest.fixture
def save_openai_key():
    with TestClient(app) as c:
        c.post("/api/session/set_key", json={"provider": "openai", "apiKey": "test-openai-key"})
        return c

@pytest.fixture
def save_anthropic_key():
    with TestClient(app) as c:
        c.post("/api/session/set_key", json={"provider": "anthropic", "apiKey": "test-anthropic-key"})
        return c

@pytest.fixture
def save_databricks_key():
    with TestClient(app) as c:
        c.post("/api/session/set_key", json={"provider": "databricks", "apiKey": "test-databricks-key", "apiUrl": "https://fake-databricks.com"})
        return c

def test_openai_llm_env(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "env-openai-key")
    with TestClient(app) as c:
        with patch("app.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {"choices": [{"message": {"content": "OpenAI ENV response"}}]}
            response = c.post("/api/llm/openai", json={
                "messages": [{"role": "user", "content": "test"}],
                "model": "gpt-4",
                "provider": "openai"
            })
            assert response.status_code == 200
            assert "OpenAI ENV response" in str(response.json())

def test_anthropic_llm_env(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "env-anthropic-key")
    with TestClient(app) as c:
        with patch("app.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {"content": [{"type": "text", "text": "Anthropic ENV response"}]}
            response = c.post("/api/llm/anthropic", json={
                "messages": [{"role": "user", "content": "test"}],
                "model": "claude-3-opus-20240229",
                "provider": "anthropic"
            })
            assert response.status_code == 200
            assert "Anthropic ENV response" in str(response.json())

def test_databricks_llm_env(monkeypatch):
    monkeypatch.setenv("DATABRICKS_API_KEY", "env-databricks-key")
    monkeypatch.setenv("DATABRICKS_API_URL", "https://fake-databricks.com")
    with TestClient(app) as c:
        with patch("app.requests.post") as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {"inputs": [{"prompt": "Databricks ENV response"}]}
            response = c.post("/api/llm/databricks", json={
                "messages": [{"role": "user", "content": "test"}],
                "model": "databricks-dbrx-instruct",
                "provider": "databricks",
                "apiUrl": "https://fake-databricks.com"
            })
            assert response.status_code == 200
            assert "Databricks ENV response" in str(response.json())

def test_anthropic_session_integration():
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "dummy-key")
    with TestClient(app) as c:
        resp = c.post("/api/session/set_key", json={"provider": "anthropic", "apiKey": anthropic_key})
        assert resp.status_code == 200
        def fake_post(url, headers=None, json=None):
            assert headers["x-api-key"] == anthropic_key
            class DummyResp:
                status_code = 200
                def json(self):
                    return {"content": [{"type": "text", "text": "Anthropic Session Integration Success"}]}
                @property
                def text(self):
                    return "Anthropic Session Integration Success"
            return DummyResp()
        with patch("app.requests.post", side_effect=fake_post):
            response = c.post("/api/llm/anthropic", json={
                "messages": [{"role": "user", "content": "test"}],
                "model": "claude-3-opus-20240229",
                "provider": "anthropic"
            })
            assert response.status_code == 200
            assert "Anthropic Session Integration Success" in str(response.json())

def test_databricks_session_integration():
    databricks_key = os.environ.get("DATABRICKS_API_KEY", "dummy-key")
    databricks_url = os.environ.get("DATABRICKS_API_URL", "https://fake-databricks.com")
    with TestClient(app) as c:
        resp = c.post("/api/session/set_key", json={"provider": "databricks", "apiKey": databricks_key, "apiUrl": databricks_url})
        assert resp.status_code == 200
        def fake_post(url, headers=None, json=None):
            assert headers["Authorization"] == f"Bearer {databricks_key}"
            class DummyResp:
                status_code = 200
                def json(self):
                    return {"inputs": [{"prompt": "Databricks Session Integration Success"}]}
                @property
                def text(self):
                    return "Databricks Session Integration Success"
            return DummyResp()
        with patch("app.requests.post", side_effect=fake_post):
            response = c.post("/api/llm/databricks", json={
                "messages": [{"role": "user", "content": "test"}],
                "model": "databricks-dbrx-instruct",
                "provider": "databricks",
                "apiUrl": databricks_url
            })
            assert response.status_code == 200
            assert "Databricks Session Integration Success" in str(response.json())

def test_missing_key():
    with TestClient(app) as c:
        response = c.post("/api/llm/openai", json={
            "messages": [{"role": "user", "content": "test"}],
            "model": "gpt-4",
            "provider": "openai"
        })
        assert response.status_code == 400
        assert "API key is required" in response.text

def test_session_helper_unit():
    # Simulate the session dict as used in get_api_key
    from types import SimpleNamespace
    class DummyRequest:
        def __init__(self, session):
            self.session = session
            self.scope = {"session": True}
    # Simulate a session with a stored key
    session = {"llm_keys": {"openai": {"apiKey": "unit-test-key"}}}
    dummy_data = SimpleNamespace(apiKey=None)
    from app import get_api_key
    import asyncio
    req = DummyRequest(session)
    key = asyncio.run(get_api_key(req, "openai", dummy_data))
    assert key == "unit-test-key"

def test_openai_real_integration():
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        print("No OPENAI_API_KEY set, skipping real integration test.")
        return
    with TestClient(app) as c:
        resp = c.post("/api/session/set_key", json={"provider": "openai", "apiKey": openai_key})
        assert resp.status_code == 200
        response = c.post("/api/llm/openai", json={
            "messages": [{"role": "user", "content": "Say hello!"}],
            "model": "gpt-3.5-turbo",
            "provider": "openai"
        })
        assert response.status_code == 200
        data = response.json()
        print("OpenAI real integration response:", data)
        assert "choices" in data

def test_anthropic_real_integration():
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        print("No ANTHROPIC_API_KEY set, skipping real integration test.")
        return
    with TestClient(app) as c:
        resp = c.post("/api/session/set_key", json={"provider": "anthropic", "apiKey": anthropic_key})
        assert resp.status_code == 200
        response = c.post("/api/llm/anthropic", json={
            "messages": [{"role": "user", "content": "Say hello!"}],
            "model": "claude-3-opus-20240229",
            "provider": "anthropic"
        })
        assert response.status_code == 200
        data = response.json()
        print("Anthropic real integration response:", data)
        assert "content" in data or "completion" in data

def test_databricks_real_integration():
    databricks_key = os.environ.get("DATABRICKS_API_KEY")
    databricks_url = os.environ.get("DATABRICKS_API_URL")
    if not databricks_key or not databricks_url:
        print("No DATABRICKS_API_KEY or DATABRICKS_API_URL set, skipping real integration test.")
        return
    with TestClient(app) as c:
        resp = c.post("/api/session/set_key", json={"provider": "databricks", "apiKey": databricks_key, "apiUrl": databricks_url})
        assert resp.status_code == 200
        response = c.post("/api/llm/databricks", json={
            "messages": [{"role": "user", "content": "Say hello!"}],
            "model": "databricks-dbrx-instruct",
            "provider": "databricks",
            "apiUrl": databricks_url
        })
        assert response.status_code == 200
        data = response.json()
        print("Databricks real integration response:", data)
        assert "inputs" in data or "choices" in data 