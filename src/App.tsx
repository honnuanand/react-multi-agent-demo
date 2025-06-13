import React, { useState, createContext, useContext, ReactNode } from "react";
import { CssBaseline, AppBar, Box, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Container, ThemeProvider, createTheme, IconButton } from "@mui/material";
import { ConfigPanel } from "./components/ConfigPanel";
import { PlannerAgent } from "./agents/PlannerAgent";
import { ResearchAgent } from "./agents/ResearchAgent";
import { WriterAgent } from "./agents/WriterAgent";
import { ReviewerAgent } from "./agents/ReviewerAgent";
import { CollapsibleTimeline } from './components/Timeline';
import { AgentGraph } from "./components/AgentGraph";
import { ResetProvider } from "./context/ResetContext";
import { AgentBusProvider } from "./context/AgentBusContext";
import { ConfigProvider } from './context/ConfigContext';
import { AgentFlowGraph } from './components/AgentFlowGraph';
import { ResetButton } from "./components/ResetButton";
import { AppInfo } from "./components/AppInfo";
import GitHubIcon from '@mui/icons-material/GitHub';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Error context for global error logging
const ErrorLogContext = createContext<(msg: string) => void>(() => {});
export const useErrorLog = () => useContext(ErrorLogContext);

function ErrorLogProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const logError = (msg: string) => {
    setError(msg);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <ErrorLogContext.Provider value={logError}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ErrorLogContext.Provider>
  );
}

function AgentGridConnections() {
  // The SVG overlay is sized to match the grid (2x2)
  // We'll use relative positioning and percentages for responsiveness
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Planner (0,0) to Researcher (1,0) */}
      <line x1="25" y1="25" x2="75" y2="25" stroke="#1976d2" strokeWidth="2" markerEnd="url(#arrow)" />
      {/* Researcher (1,0) to Writer (1,1) */}
      <line x1="75" y1="25" x2="75" y2="75" stroke="#0288d1" strokeWidth="2" markerEnd="url(#arrow)" />
      {/* Writer (1,1) to Reviewer (0,1) */}
      <line x1="75" y1="75" x2="25" y2="75" stroke="#7b1fa2" strokeWidth="2" markerEnd="url(#arrow)" />
      {/* Reviewer (0,1) to Planner (0,0) (optional, for loop) */}
      {/* <line x1="25" y1="75" x2="25" y2="25" stroke="#43a047" strokeWidth="2" markerEnd="url(#arrow)" /> */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="#1976d2" />
        </marker>
      </defs>
    </svg>
  );
}

export default function App() {
  const [selectedExample, setSelectedExample] = useState("Tier 1: Basic Flow");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorLogProvider>
        <ConfigProvider>
          <ResetProvider>
            <AgentBusProvider>
              <Box sx={{ display: "flex" }}>
                <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                  <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                      AI Agent Collaboration
                    </Typography>
                    <Tooltip title="View on GitHub">
                      <IconButton
                        color="inherit"
                        component="a"
                        href="https://github.com/honnuanand/react-multi-agent-demo"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="large"
                        sx={{ ml: 1 }}
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  </Toolbar>
                </AppBar>
                <Drawer
                  variant="permanent"
                  sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                      width: drawerWidth,
                      boxSizing: "border-box",
                    },
                  }}
                >
                  <Toolbar />
                  <Box sx={{ overflow: "auto" }}>
                    <List>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={selectedExample === "Tier 1: Basic Flow"}
                          onClick={() => setSelectedExample("Tier 1: Basic Flow")}
                        >
                          <ListItemText primary="Tier 1: Basic Flow" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={selectedExample === "Tier 2: Advanced Flow"}
                          onClick={() => setSelectedExample("Tier 2: Advanced Flow")}
                        >
                          <ListItemText primary="Tier 2: Advanced Flow" />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Box>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
                  <Toolbar />
                  <AppInfo />
                  <ConfigPanel />
                  <ResetButton />
                  {selectedExample === "Tier 1: Basic Flow" && (
                    <Box sx={{ position: 'relative', mt: 2 }}>
                      <AgentGridConnections />
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 2,
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                          gridTemplateRows: '1fr 1fr',
                          alignItems: 'stretch',
                          justifyItems: 'stretch',
                        }}
                      >
                        <PlannerAgent />
                        <ResearchAgent />
                        <WriterAgent />
                        <ReviewerAgent />
                      </Box>
                    </Box>
                  )}
                  <AgentFlowGraph />
                  <CollapsibleTimeline />
                </Box>
              </Box>
            </AgentBusProvider>
          </ResetProvider>
        </ConfigProvider>
      </ErrorLogProvider>
    </ThemeProvider>
  );
}
