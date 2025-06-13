# 🤖 AI Agent Collaboration App

This React + Vite application simulates a **multi-agent AI system** where individual agents collaborate in a workflow using OpenAI-like logic. Each agent is isolated, yet they communicate via a shared **message bus** (similar to the Model Communication Protocol - MCP).

---

## 🚀 Features

### 🌐 UI & Framework
- Built with **React + TypeScript + Vite**
- Uses **MUI (Material UI)** for polished UI components
- Modular component-based structure with scoped responsibilities

### 🧠 Agents
Each agent performs a role in a simple chain-of-thought pipeline:
1. **PlannerAgent** - Takes user input and initiates the plan
2. **ResearchAgent** - Gathers contextual data based on the plan
3. **WriterAgent** - Generates content from research
4. **ReviewerAgent** - Finalizes and reviews the output

### 🪄 Inter-Agent Communication
Agents use a **central event bus (`AgentBusContext`)** to emit and subscribe to messages. This mimics message-based coordination in agentic architectures.

### 🔄 Reset System
You can reset the entire agent flow using the **Reset button** in the Config panel.

### 🧭 Layout Features
- **AppBar and Navigation Drawer** for tiered views
- **Tier 1 (Basic Flow)** available
- Placeholder tiers for:
  - Feedback Loop
  - Plugin System
  - Dynamic Graphs

### 🔧 Upcoming Visualizations
- Message timeline (events & messages displayed chronologically)
- React Flow-based collaboration graphs
- Multi-tier enhancements

---

## 🛠️ Installation & Running Locally

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## 📝 Notes
- The app uses Vite for fast development and building
- Material UI components are used for the interface
- The app demonstrates a simple multi-agent system with message-based communication 