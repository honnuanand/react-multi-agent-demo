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
import Paper from '@mui/material/Paper';

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
                  {/* Agent Boxes Section with Title and Paper */}
                  <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Agent Collaboration
                    </Typography>
                    {selectedExample === "Tier 1: Basic Flow" && (
                      <Box sx={{ position: 'relative', mb: 2 }}>
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
                          <PlannerAgent sx={{ boxShadow: '8px 0 24px -8px #1976d233, 0 8px 24px -8px #1976d233' }} />
                          <ResearchAgent sx={{ boxShadow: '-8px 0 24px -8px #0288d133, 0 8px 24px -8px #0288d133' }} />
                          <WriterAgent sx={{ boxShadow: '8px 0 24px -8px #7b1fa233, 0 -8px 24px -8px #7b1fa233' }} />
                          <ReviewerAgent sx={{ boxShadow: '-8px 0 24px -8px #43a04733, 0 -8px 24px -8px #43a04733' }} />
                        </Box>
                      </Box>
                    )}
                  </Paper>
                  {/* React Flow Section with Title and Paper */}
                  <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Agent Flow Visualization
                    </Typography>
                    <AgentFlowGraph />
                  </Paper>
                  {/* Timeline Section with Paper */}
                  <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <CollapsibleTimeline />
                  </Paper>
                </Box>
              </Box>
            </AgentBusProvider>
          </ResetProvider>
        </ConfigProvider>
      </ErrorLogProvider>
    </ThemeProvider>
  );
}
