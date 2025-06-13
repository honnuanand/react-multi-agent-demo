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
import { AgentBusProvider, useAgentBus } from "./context/AgentBusContext";
import { ConfigProvider } from './context/ConfigContext';
import { AgentFlowGraph } from './components/AgentFlowGraph';
import { ResetButton } from "./components/ResetButton";
import { AppInfo } from "./components/AppInfo";
import GitHubIcon from '@mui/icons-material/GitHub';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import { HtmlAgent } from "./agents/HtmlAgent";
import { PdfAgent } from "./agents/PdfAgent";
import { AgentLLMDrawer } from './components/AgentLLMDrawer';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Badge from '@mui/material/Badge';
import { styled, keyframes } from '@mui/material/styles';
import { useReset } from './context/ResetContext';
import { ErrorLogProvider, useErrorLog } from './context/ErrorLogContext';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import LayersIcon from '@mui/icons-material/Layers';

const drawerWidth = 240;
const miniDrawerWidth = 56;

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

// --- LLMDrawerButton component ---
function LLMDrawerButton({ onOpen, drawerOpen, buttonRef }: { onOpen: () => void, drawerOpen: boolean, buttonRef: React.Ref<HTMLButtonElement> }) {
  const [llmTooltipOpen, setLLMTooltipOpen] = React.useState(true);
  const [unseenLLM, setUnseenLLM] = React.useState(false);
  const { messages } = useAgentBus();
  const { resetSignal } = useReset();

  // Only LLM request/response messages
  const llmMessages = messages?.filter(
    (m) => m.type === 'llm_request' || m.type === 'llm_response'
  ) || [];

  // Track unseen LLM interactions
  React.useEffect(() => {
    if (!drawerOpen && llmMessages.length > 0) {
      setUnseenLLM(true);
    }
  }, [llmMessages.length, drawerOpen]);

  // When drawer is opened, mark as seen and hide tooltip
  React.useEffect(() => {
    if (drawerOpen) {
      setUnseenLLM(false);
      setLLMTooltipOpen(false);
    }
  }, [drawerOpen]);

  // Show tooltip again on reset
  React.useEffect(() => {
    setLLMTooltipOpen(true);
  }, [resetSignal]);

  // Pulse animation for the button using sx and keyframes
  const pulse = keyframes`
    0% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
    }
    70% {
      box-shadow: 0 0 0 12px rgba(25, 118, 210, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    }
  `;

  return (
    <Tooltip
      title="See all LLM prompts & responses here!"
      open={llmTooltipOpen && unseenLLM}
      onClose={() => setLLMTooltipOpen(false)}
      disableFocusListener
      disableHoverListener={!unseenLLM}
      disableTouchListener={!unseenLLM}
      arrow
    >
      <span>
        <Badge
          color="error"
          variant={unseenLLM ? 'dot' : undefined}
          overlap="circular"
          sx={{ mr: 1 }}
        >
          <IconButton
            color="inherit"
            onClick={onOpen}
            ref={buttonRef}
            sx={unseenLLM ? {
              animation: `${pulse} 1.5s infinite`,
              borderRadius: '50%',
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
            } : {}}
          >
            <MenuOpenIcon />
          </IconButton>
        </Badge>
      </span>
    </Tooltip>
  );
}

export default function App() {
  const [selectedExample, setSelectedExample] = useState("Single LLM Agent");
  const [navOpen, setNavOpen] = useState(true);
  const [llmDrawerOpen, setLLMDrawerOpen] = useState(false);
  const llmButtonRef = React.useRef<HTMLButtonElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;

  const handleNavToggle = () => {
    setNavOpen((open) => !open);
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItem disablePadding sx={{ justifyContent: navOpen ? 'initial' : 'center', px: 1 }}>
            <ListItemButton
              selected={selectedExample === "Single LLM Agent"}
              onClick={() => { setSelectedExample("Single LLM Agent"); if (isMobile) setNavOpen(false); }}
              sx={{ justifyContent: navOpen ? 'initial' : 'center', px: navOpen ? 2 : 1 }}
            >
              <HomeIcon sx={{ mr: navOpen ? 2 : 0 }} />
              {navOpen && <ListItemText primary="Single LLM Agent" />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ justifyContent: navOpen ? 'initial' : 'center', px: 1 }}>
            <ListItemButton
              selected={selectedExample === "Multi-LLM Agent Flow"}
              onClick={() => { setSelectedExample("Multi-LLM Agent Flow"); if (isMobile) setNavOpen(false); }}
              sx={{ justifyContent: navOpen ? 'initial' : 'center', px: navOpen ? 2 : 1 }}
            >
              <LayersIcon sx={{ mr: navOpen ? 2 : 0 }} />
              {navOpen && <ListItemText primary="Multi-LLM Agent Flow" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      {/* Collapse/Expand Button */}
      {!isMobile && (
        <IconButton onClick={() => setNavOpen(!navOpen)} sx={{ position: 'absolute', top: 8, right: -20, zIndex: 1300, background: '#fff', border: '1px solid #eee', boxShadow: 1 }}>
          {navOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      )}
    </>
  );

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
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={handleNavToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                      AI Agent Collaboration
                    </Typography>
                    <LLMDrawerButton onOpen={() => setLLMDrawerOpen(true)} drawerOpen={llmDrawerOpen} buttonRef={llmButtonRef} />
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
                  variant={isMobile ? "temporary" : "persistent"}
                  open={isMobile ? navOpen : true}
                  onClose={isMobile ? () => setNavOpen(false) : undefined}
                  ModalProps={{ keepMounted: true }}
                  sx={{
                    width: navOpen ? drawerWidth : miniDrawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                      width: navOpen ? drawerWidth : miniDrawerWidth,
                      boxSizing: 'border-box',
                      overflowX: 'hidden',
                      transition: 'width 0.3s',
                    },
                  }}
                >
                  {drawerContent}
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: navOpen ? `${drawerWidth}px` : `${miniDrawerWidth}px`, xs: 0 }, transition: 'margin-left 0.3s' }}>
                  <Toolbar />
                  <AppInfo mode={selectedExample === "Multi-LLM Agent Flow" ? "multi" : "single"} />
                  <ConfigPanel multiLLMMode={selectedExample === "Multi-LLM Agent Flow"} />
                  <ResetButton />
                  {/* Agent Boxes Section with Title and Paper */}
                  <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Agent Collaboration
                    </Typography>
                    {selectedExample === "Single LLM Agent" && (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                          sx={{
                            display: { xs: 'block', md: 'flex' },
                            gap: 3,
                            alignItems: 'stretch',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            width: '100%',
                            maxWidth: 1800,
                            mx: 'auto',
                          }}
                        >
                          <PlannerAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '8px 0 24px -8px #1976d233, 0 8px 24px -8px #1976d233' }} />
                          <ResearchAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '-8px 0 24px -8px #0288d133, 0 8px 24px -8px #0288d133' }} />
                          <WriterAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '8px 0 24px -8px #7b1fa233, 0 -8px 24px -8px #7b1fa233' }} />
                          <ReviewerAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '-8px 0 24px -8px #43a04733, 0 -8px 24px -8px #43a04733' }} />
                        </Box>
                      </Box>
                    )}
                    {selectedExample === "Multi-LLM Agent Flow" && (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                          sx={{
                            display: { xs: 'block', md: 'flex' },
                            gap: 3,
                            alignItems: 'stretch',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            width: '100%',
                            maxWidth: 1800,
                            mx: 'auto',
                          }}
                        >
                          <PlannerAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '8px 0 24px -8px #1976d233, 0 8px 24px -8px #1976d233' }} />
                          <ResearchAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '-8px 0 24px -8px #0288d133, 0 8px 24px -8px #0288d133' }} />
                          <WriterAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '8px 0 24px -8px #7b1fa233, 0 -8px 24px -8px #7b1fa233' }} />
                          <ReviewerAgent sx={{ width: { xs: '100%', md: 420 }, minHeight: 220, flex: '1 1 0', boxShadow: '-8px 0 24px -8px #43a04733, 0 -8px 24px -8px #43a04733' }} />
                        </Box>
                        <Box
                          sx={{
                            mt: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 3,
                            width: '100%',
                            maxWidth: 1800,
                            mx: 'auto',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                          }}
                        >
                          <HtmlAgent sx={{ minWidth: 320, maxWidth: 480, flex: 1 }} />
                          <PdfAgent sx={{ minWidth: 320, maxWidth: 480, flex: 1 }} />
                        </Box>
                      </Box>
                    )}
                  </Paper>
                  {/* React Flow Section with Title and Paper */}
                  <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Live Agent Flow
                    </Typography>
                    <AgentFlowGraph advancedMode={selectedExample === "Multi-LLM Agent Flow"} />
                  </Paper>
                  {/* Timeline Section with Paper */}
                  <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <CollapsibleTimeline />
                  </Paper>
                </Box>
                <AgentLLMDrawer open={llmDrawerOpen} onClose={() => {
                  setLLMDrawerOpen(false);
                  setTimeout(() => {
                    llmButtonRef.current?.focus();
                  }, 0);
                }} />
              </Box>
            </AgentBusProvider>
          </ResetProvider>
        </ConfigProvider>
      </ErrorLogProvider>
    </ThemeProvider>
  );
}
