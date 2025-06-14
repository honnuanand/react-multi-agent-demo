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
   git clone https://github.com/honnuanand/react-multi-agent-demo.git
   cd react-multi-agent-demo
   npm install
   ```
2. **Start the App**
   ```bash
   npm start
   # or
   npm run dev
   ```
3. **Configure LLM Providers**
   - Open the left drawer (Config Panel)
   - Enter API keys and models for OpenAI, Anthropic, Databricks, etc.
   - Assign LLMs to each agent (in Multi-LLM mode)
4. **Enter a Goal**
   - Type your article topic or requirements in the Goal section
5. **Run the Workflow**
   - Click "Generate Article Plan" to start
   - Watch agents collaborate in real time
   - View LLM interactions in the right drawer
6. **Optional Outputs**
   - Trigger HTML or PDF agents for formatted outputs
   - Preview or download results
7. **Reset**
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

## 📝 Notes & Tips
- The app is demo-ready and suitable for both local and GitHub Pages deployment
- All LLM API keys are stored in-memory (never sent to a backend)
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