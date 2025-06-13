import React, { useState } from "react";
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

export default function App() {
  const [selectedExample, setSelectedExample] = useState("Tier 1: Basic Flow");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                  <>
                    <PlannerAgent />
                    <ResearchAgent />
                    <WriterAgent />
                    <ReviewerAgent />
                  </>
                )}
                <AgentFlowGraph />
                <CollapsibleTimeline />
              </Box>
            </Box>
          </AgentBusProvider>
        </ResetProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
