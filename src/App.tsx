import React, { useState } from "react";
import { CssBaseline, AppBar, Box, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Container, ThemeProvider, createTheme } from "@mui/material";
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
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar>
                  <Typography variant="h6" noWrap component="div">
                    AI Agent Collaboration
                  </Typography>
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
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <AppInfo />
                <ConfigPanel />
                <ResetButton />
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gridTemplateRows: '1fr 1fr',
                    alignItems: 'stretch',
                    justifyItems: 'stretch',
                    mt: 2,
                  }}
                >
                  <PlannerAgent />
                  <ResearchAgent />
                  <WriterAgent />
                  <ReviewerAgent />
                </Box>
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
