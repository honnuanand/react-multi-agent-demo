import React, { useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Chip,
  Collapse,
  Paper,
  useTheme,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAgentBus } from '../context/AgentBusContext';
import { useReset } from '../context/ResetContext';
import type { Message } from '../context/AgentBusContext';
import { groupMessagesByFlow } from './Timeline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import MessageIcon from '@mui/icons-material/Message';

// Helper to group messages by agent and session/flow
function groupLLMMessages(messages: Message[]) {
  // For demo: group by sender, then by consecutive request/response pairs
  const groups: Record<string, { request: Message; response: Message | null; idx: number }[]> = {};
  messages.forEach((msg, idx) => {
    if (!groups[msg.sender]) groups[msg.sender] = [];
    // Start a new group on each request (type: 'llm_request')
    if (msg.type === 'llm_request') {
      groups[msg.sender].push({
        request: msg,
        response: null,
        idx,
      });
    } else if (msg.type === 'llm_response' && groups[msg.sender].length > 0) {
      groups[msg.sender][groups[msg.sender].length - 1].response = msg;
    }
  });
  return groups;
}

interface AgentLLMDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AgentLLMDrawer({ open, onClose }: AgentLLMDrawerProps) {
  const { messages } = useAgentBus();
  const { resetSignal } = useReset();
  const [expandedAgent, setExpandedAgent] = useState<string | false>(false);
  const [expandedPair, setExpandedPair] = useState<Record<string, { prompt: boolean; response: boolean }>>({});
  const theme = useTheme();

  // Reset expanded states when reset signal changes
  useEffect(() => {
    setExpandedAgent(false);
    setExpandedPair({});
  }, [resetSignal]);

  // Group all messages by flow, then filter for LLM messages in each flow
  const flows = groupMessagesByFlow(messages);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: 480,
          boxSizing: 'border-box',
          p: 0,
          background: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: theme.palette.primary.main,
        color: 'white',
        flexShrink: 0,
      }}>
        <SmartToyIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          LLM Interactions
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        p: 2,
        '& > *': {
          minHeight: 0,
        },
      }}>
        {flows.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: theme.palette.background.paper,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <MessageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No LLM interactions yet.
            </Typography>
          </Paper>
        ) : (
          flows.map((flow: { messages: Message[]; summary: string }, flowIdx: number) => {
            // Pair up LLM requests and responses in this flow
            const llmPairs: { request: Message; response?: Message }[] = [];
            let lastRequest: Message | null = null;
            for (const msg of flow.messages) {
              if (msg.type === 'llm_request') {
                if (lastRequest) {
                  llmPairs.push({ request: lastRequest });
                }
                lastRequest = msg;
              } else if (msg.type === 'llm_response' && lastRequest) {
                llmPairs.push({ request: lastRequest, response: msg });
                lastRequest = null;
              }
            }
            if (lastRequest) {
              llmPairs.push({ request: lastRequest });
            }
            console.log(`Flow ${flowIdx + 1} llmPairs:`, llmPairs);
            if (llmPairs.length === 0) return null;
            return (
              <Accordion
                key={flowIdx}
                expanded={expandedAgent === `flow-${flowIdx}`}
                onChange={(_, isExpanded) => setExpandedAgent(isExpanded ? `flow-${flowIdx}` : false)}
                sx={{ 
                  mb: 2,
                  '&:before': { display: 'none' },
                  borderRadius: '8px !important',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    background: theme.palette.background.paper,
                    '&:hover': {
                      background: theme.palette.action.hover,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                      Flow {flowIdx + 1}
                      {flow.summary ? (
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal' }}>
                          {flow.summary.slice(0, 60)}{flow.summary.length > 60 ? '...' : ''}
                        </Typography>
                      ) : null}
                    </Typography>
                    <Chip 
                      label={llmPairs.length} 
                      size="small" 
                      sx={{ 
                        ml: 2,
                        background: theme.palette.primary.main,
                        color: 'white',
                        fontWeight: 600,
                      }} 
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense sx={{ p: 0 }}>
                    {llmPairs.map((pair, idx) => {
                      const pairKey = `${flowIdx}-${idx}`;
                      const expanded = expandedPair[pairKey] || { prompt: false, response: false };
                      const toggle = (section: 'prompt' | 'response') => setExpandedPair(prev => ({
                        ...prev,
                        [pairKey]: { ...prev[pairKey], [section]: !prev[pairKey]?.[section] }
                      }));
                      return (
                        <Paper 
                          key={pair.request.id || idx} 
                          elevation={0}
                          sx={{ 
                            mb: 1,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ p: 1.5, background: theme.palette.background.paper }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CodeIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                                {pair.request.sender || 'Unknown Agent'}
                              </Typography>
                              {pair.request.timestamp && (
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(pair.request.timestamp).toLocaleTimeString()}
                                </Typography>
                              )}
                            </Box>
                            {/* Prompt Section */}
                            <Box sx={{ mb: pair.response ? 1 : 0 }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  cursor: 'pointer',
                                  p: 0.5,
                                  borderRadius: 1,
                                  '&:hover': {
                                    background: theme.palette.action.hover,
                                  },
                                }} 
                                onClick={() => toggle('prompt')}
                              >
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>Prompt</Typography>
                                <IconButton size="small">
                                  {expanded.prompt ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                </IconButton>
                              </Box>
                              <Collapse in={expanded.prompt}>
                                <Box sx={{ 
                                  background: theme.palette.grey[50], 
                                  p: 1.5, 
                                  borderRadius: 1,
                                  mt: 0.5,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  maxHeight: '300px',
                                  overflow: 'auto',
                                }}>
                                  <pre style={{ 
                                    margin: 0, 
                                    fontFamily: 'monospace', 
                                    fontSize: 13, 
                                    whiteSpace: 'pre-wrap',
                                    color: theme.palette.text.primary,
                                  }}>
                                    {pair.request.prompt ? JSON.stringify(pair.request.prompt, null, 2) : 'N/A'}
                                  </pre>
                                </Box>
                              </Collapse>
                            </Box>
                            {/* Response Section */}
                            {pair.response && (
                              <Box>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    p: 0.5,
                                    borderRadius: 1,
                                    '&:hover': {
                                      background: theme.palette.action.hover,
                                    },
                                  }} 
                                  onClick={() => toggle('response')}
                                >
                                  <Typography variant="caption" color="secondary" sx={{ fontWeight: 600 }}>Response</Typography>
                                  <IconButton size="small">
                                    {expanded.response ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                  </IconButton>
                                </Box>
                                <Collapse in={expanded.response}>
                                  <Box sx={{ 
                                    background: theme.palette.grey[50], 
                                    p: 1.5, 
                                    borderRadius: 1,
                                    mt: 0.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    maxHeight: '300px',
                                    overflow: 'auto',
                                  }}>
                                    <pre style={{ 
                                      margin: 0, 
                                      fontFamily: 'monospace', 
                                      fontSize: 13, 
                                      whiteSpace: 'pre-wrap',
                                      color: theme.palette.text.primary,
                                    }}>
                                      {pair.response.content || 'N/A'}
                                    </pre>
                                    {pair.response.usage && (
                                      <Box sx={{ 
                                        mt: 1.5, 
                                        pt: 1.5, 
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                      }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                          {pair.response.usage.prompt_tokens !== undefined && <>Prompt tokens: {pair.response.usage.prompt_tokens}</>}
                                          {pair.response.usage.completion_tokens !== undefined && <> • Completion tokens: {pair.response.usage.completion_tokens}</>}
                                          {pair.response.usage.input_tokens !== undefined && <> • Input tokens: {pair.response.usage.input_tokens}</>}
                                          {pair.response.usage.output_tokens !== undefined && <> • Output tokens: {pair.response.usage.output_tokens}</>}
                                          {pair.response.usage.total_tokens !== undefined && <> • Total tokens: {pair.response.usage.total_tokens}</>}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Collapse>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>
    </Drawer>
  );
} 