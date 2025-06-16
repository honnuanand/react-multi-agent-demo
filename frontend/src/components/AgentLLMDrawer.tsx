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
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAgentBus } from '../context/AgentBusContext';
import { useReset } from '../context/ResetContext';
import type { Message } from '../context/AgentBusContext';
import { groupMessagesByFlow } from './Timeline';

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

  // Reset expanded states when reset signal changes
  useEffect(() => {
    setExpandedAgent(false);
    setExpandedPair({});
  }, [resetSignal]);

  // Group all messages by flow, then filter for LLM messages in each flow
  const flows = groupMessagesByFlow(messages);
  console.log('LLMDrawer flows:', flows);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: 420,
          boxSizing: 'border-box',
          p: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Agent LLM Interactions
        </Typography>
        <IconButton onClick={onClose}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, overflowY: 'auto', height: '100%' }}>
        {flows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No LLM interactions yet.
          </Typography>
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
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Flow {flowIdx + 1}{flow.summary ? `: ${flow.summary.slice(0, 60)}${flow.summary.length > 60 ? '...' : ''}` : ''}
                  </Typography>
                  <Chip label={llmPairs.length} size="small" sx={{ ml: 2 }} />
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {llmPairs.map((pair, idx) => {
                      const pairKey = `${flowIdx}-${idx}`;
                      const expanded = expandedPair[pairKey] || { prompt: false, response: false };
                      const toggle = (section: 'prompt' | 'response') => setExpandedPair(prev => ({
                        ...prev,
                        [pairKey]: { ...prev[pairKey], [section]: !prev[pairKey]?.[section] }
                      }));
                      return (
                        <Accordion key={pair.request.id || idx} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              LLM Request/Response
                              {pair.request.sender ? ` • ${pair.request.sender}` : ''}
                              {pair.request.timestamp ? ` • ${new Date(pair.request.timestamp).toLocaleTimeString()}` : ''}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {/* Prompt Section (collapsible) */}
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggle('prompt')}>
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>Prompt</Typography>
                                <IconButton size="small">
                                  {expanded.prompt ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                </IconButton>
                              </Box>
                              <Collapse in={expanded.prompt}>
                                <Box sx={{ background: '#f5f5f5', p: 1, borderRadius: 1, width: '100%' }}>
                                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                                    {pair.request.prompt ? JSON.stringify(pair.request.prompt, null, 2) : 'N/A'}
                                  </pre>
                                </Box>
                              </Collapse>
                            </Box>
                            {/* Response Section (collapsible, only if response exists) */}
                            {pair.response && (
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggle('response')}>
                                  <Typography variant="caption" color="secondary" sx={{ fontWeight: 700 }}>Response</Typography>
                                  <IconButton size="small">
                                    {expanded.response ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                  </IconButton>
                                </Box>
                                <Collapse in={expanded.response}>
                                  <Box sx={{ background: '#f5f5f5', p: 1, borderRadius: 1, width: '100%' }}>
                                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                                      {pair.response.content || 'N/A'}
                                    </pre>
                                    {pair.response.usage && (
                                      <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                                        {pair.response.usage.prompt_tokens !== undefined && <>Prompt tokens: {pair.response.usage.prompt_tokens}<br /></>}
                                        {pair.response.usage.completion_tokens !== undefined && <>Completion tokens: {pair.response.usage.completion_tokens}<br /></>}
                                        {pair.response.usage.input_tokens !== undefined && <>Input tokens: {pair.response.usage.input_tokens}<br /></>}
                                        {pair.response.usage.output_tokens !== undefined && <>Output tokens: {pair.response.usage.output_tokens}<br /></>}
                                        {pair.response.usage.total_tokens !== undefined && <>Total tokens: {pair.response.usage.total_tokens}<br /></>}
                                      </Typography>
                                    )}
                                  </Box>
                                </Collapse>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
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