# 🤖 React Multi-Agent Collaboration Demo

[![Build Status](https://img.shields.io/github/actions/workflow/status/honnuanand/react-multi-agent-demo/gh-pages.yml?branch=main&label=Deploy%20to%20GitHub%20Pages)](https://github.com/honnuanand/react-multi-agent-demo/actions)
[![License](https://img.shields.io/github/license/honnuanand/react-multi-agent-demo)](https://github.com/honnuanand/react-multi-agent-demo/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/honnuanand/react-multi-agent-demo?style=social)](https://github.com/honnuanand/react-multi-agent-demo/stargazers)
[![Issues](https://img.shields.io/github/issues/honnuanand/react-multi-agent-demo)](https://github.com/honnuanand/react-multi-agent-demo/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/honnuanand/react-multi-agent-demo)](https://github.com/honnuanand/react-multi-agent-demo/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/honnuanand/react-multi-agent-demo)](https://github.com/honnuanand/react-multi-agent-demo/commits/main)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-blue?logo=githubpages&style=for-the-badge)](https://honnuanand.github.io/react-multi-agent-demo/)

## Demo Video

[![Watch the demo](https://img.youtube.com/vi/OL7_WnaCMHQ/0.jpg)](https://youtu.be/OL7_WnaCMHQ)

---

## 🌟 Purpose

**React Multi-Agent Collaboration Demo** is a modern, interactive web app that demonstrates how multiple AI agents can collaborate in real time to solve complex tasks—each powered by a different LLM provider (OpenAI, Anthropic, Databricks, etc). The app is designed for:

- **Developers & Researchers** exploring agentic workflows and multi-LLM orchestration
- **Product teams** evaluating multi-agent, multi-provider AI architectures
- **Educators & Demo use** to showcase distributed AI, message buses, and LLM monitoring

---

## 🚀 Key Features

- **Multi-Agent Collaboration:** Planner, Researcher, Writer, Reviewer, HTML, and PDF agents work together via a message bus
- **Multi-LLM Support:** Assign a different LLM provider (OpenAI, Anthropic, Databricks) to each agent, with per-provider API keys and models
- **Real-Time Visualization:** See agent interactions in a 2x2 grid and a live flow graph
- **LLM Monitoring:** Right-side drawer shows all LLM requests/responses, grouped by agent and session
- **Dynamic Configuration:** Configure LLMs and assign them to agents on the fly
- **Optional Output Agents:** Generate and preview HTML or PDF outputs using LLMs
- **Robust Error Logging:** All errors are surfaced in a global Snackbar for easy debugging
- **Modern UI/UX:** Responsive, MUI-based design with clear navigation, drawers, and section titles

---

## 🖥️ App Modes

### 1. **Single LLM Agent**
- All agents use the same LLM provider (e.g., OpenAI)
- Simple, streamlined workflow for basic demos

### 2. **Multi-LLM Agent Flow**
- Each agent can use a different LLM provider and model
- Great for comparing LLMs or building advanced agentic flows

---

## 🧑‍💻 How to Use

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>.git
   cd <your-repo-dir>
   npm install
   ```
2. **Start the Backend**
   ```bash
   cd backend
   uvicorn app:app --reload --port 8000
   ```
3. **Start the Frontend**
   ```bash
   cd ..
   npm run dev
   ```
4. **Configure LLM Providers**
   - Open the Config Panel (left drawer)
   - Enter API keys and models for OpenAI, Anthropic, Databricks, etc.
   - Click **Test** for each provider. Only tested providers can be assigned to agents.
   - Click **Save** to store credentials in your session.
5. **Assign LLMs to Agents (Multi-LLM mode)**
   - In Multi-LLM mode, assign a tested provider to each agent using the dropdowns.
6. **Enter a Goal**
   - Type your article topic or requirements in the Goal section
7. **Run the Workflow**
   - Click "Generate Article Plan" to start
   - Watch agents collaborate in real time
   - View LLM interactions and token usage in the right drawer
8. **Optional Outputs**
   - Trigger HTML or PDF agents for formatted outputs
   - Preview or download results
9. **Reset**
   - Use the Reset button to clear all states and start over

---

## 📊 Architecture Overview

- **React + TypeScript + Vite** for fast, modern development
- **Material UI (MUI)** for a polished, responsive interface
- **AgentBusContext:** Central event/message bus for agent communication
- **ConfigContext:** Manages LLM provider settings and agent assignments
- **ResetContext:** Global reset mechanism for all components
- **AgentLLMDrawer:** Monitors and displays all LLM requests/responses
- **Error Logging:** All errors are captured and shown in a persistent Snackbar

---

## 🛡️ Secure Multi-Provider LLM Proxying

- All LLM requests (OpenAI, Anthropic, Databricks) are securely proxied through the FastAPI backend.
- **API keys** are never exposed to the browser or frontend network requests to LLM providers.
- You can provide API keys for each provider via the Config Panel in the app, or set them as environment variables:
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `DATABRICKS_API_KEY` and `DATABRICKS_API_URL`
- The backend will use the API key from the request body if provided, otherwise it falls back to the session or environment variable.
- The backend adapts the request format for each provider and returns the response in a unified format.
- All errors are logged and surfaced in the UI for easy debugging.

---

## 🛠️ Troubleshooting

- **API Key Required:** If you see "API key is required", ensure you have entered and saved a valid API key for the provider in the Config Panel, and that you have tested the connection.
- **Session Issues:** If the app cannot find your API key, make sure cookies are enabled and you are using the same browser session.
- **Token Usage Not Displayed:** Only tested and assigned providers will show token usage in the right panel.
- **Backend Not Running:** Ensure the FastAPI backend is running on port 8000 before starting the frontend.

---

## 📝 Notes & Tips
- The app is demo-ready and suitable for both local and GitHub Pages deployment
- **All LLM API keys are handled securely by the backend proxy.**
- Supports both desktop and mobile layouts
- For best results, use valid API keys for each LLM provider
- The flow graph and agent grid update live as agents communicate

---

## 📦 Project Structure

- `src/agents/` — Agent components (Planner, Researcher, Writer, Reviewer, HTML, PDF)
- `src/components/` — UI components (AppInfo, ConfigPanel, AgentLLMDrawer, etc.)
- `src/context/` — React contexts for config, agent bus, and reset
- `src/` — Main app entry and layout

---

## 🙏 Acknowledgements
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Material UI](https://mui.com/)
- Inspired by modern agentic AI architectures and LLM orchestration research

---

## Planned Changes

- Implement unified LLM service to support Anthropic, Databricks, and other providers for true multi-LLM agent support.

---

[View on GitHub](https://github.com/honnuanand/react-multi-agent-demo)
[Live Demo](https://honnuanand.github.io/react-multi-agent-demo/)

# Startup Scripts

- Start the frontend (Vite):
  ```sh
  ./start-frontend.sh
  ```
- Start the backend (FastAPI):
  ```sh
  ./start-backend.sh
  ```

# Local Development

- Start the frontend (React/Vite):
  ```sh
  npm run dev
  ```
- Start the backend (FastAPI):
  ```sh
  npm run backend
  ```
- The Vite dev server proxies `/api/llm/*` requests to FastAPI at `http://localhost:8000`.

# Production/Deployment

- Build the frontend:
  ```sh
  npm run build
  ```
- Start the backend (serves both API and static frontend):
  ```sh
  npm start
  ```
- FastAPI will serve the built React app as static files and handle all `/api/llm/*` API requests.

# Architecture

- **Split mode (dev):** Vite serves frontend, FastAPI serves API, proxy connects them.
- **Single-app (prod):** FastAPI serves both static frontend and API.

# Notes
- You can deploy the backend (with built frontend) to Databricks Apps, Kubernetes, or any Python hosting platform.
- For Databricks Apps, follow the [Databricks blog guide](https://www.databricks.com/blog/building-databricks-apps-react-and-mosaic-ai-agents-enterprise-chat-solutions).

## 📝 LLM API Request Interface

All LLM requests from the frontend to the backend should use the following payload structure:

```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "How AI is transforming healthcare" }
  ],
  "model": "gpt-4",
  "apiKey": "sk-...",        // optional if stored in session or env
  "apiUrl": "...",           // only for Databricks, optional
  "max_tokens": 1000,         // optional
  "temperature": 0.7          // optional
}
```

- The `messages` array is required and should follow the OpenAI/Anthropic chat format.
- The backend will convert this to the correct format for each provider (e.g., prompt string for Databricks).
- You may also send `prompt` (string or array) or `system`/`user` fields for compatibility; the backend will normalize these.
- `apiKey` and `apiUrl` can be omitted if already stored in the session or set as environment variables.

**Endpoint:**
- `POST /api/llm/{provider}`

**Example:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a planning agent." },
    { "role": "user", "content": "Plan an article about AI in healthcare." }
  ],
  "model": "gpt-4"
}
``` 