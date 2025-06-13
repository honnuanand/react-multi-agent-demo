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
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAgentBus } from '../context/AgentBusContext';
import { useReset } from '../context/ResetContext';
import type { Message } from '../context/AgentBusContext';

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
  const [expandedGroup, setExpandedGroup] = useState<string | false>(false);

  // Reset expanded states when reset signal changes
  useEffect(() => {
    setExpandedAgent(false);
    setExpandedGroup(false);
  }, [resetSignal]);

  // Only LLM request/response messages
  const llmMessages = messages.filter(
    (m) => m.type === 'llm_request' || m.type === 'llm_response'
  );
  const grouped = groupLLMMessages(llmMessages);

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
        {Object.keys(grouped).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No LLM interactions yet.
          </Typography>
        ) : (
          Object.entries(grouped).map(([agent, groups]) => (
            <Accordion
              key={agent}
              expanded={expandedAgent === agent}
              onChange={(_, isExpanded) => setExpandedAgent(isExpanded ? agent : false)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{agent}</Typography>
                <Chip label={groups.length} size="small" sx={{ ml: 2 }} />
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {groups.map((group, gIdx) => (
                    <Accordion
                      key={gIdx}
                      expanded={expandedGroup === `${agent}-${gIdx}`}
                      onChange={(_, isExpanded) => setExpandedGroup(isExpanded ? `${agent}-${gIdx}` : false)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Request/Response #{gIdx + 1}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>Prompt</Typography>
                            <Box sx={{ background: '#f5f5f5', p: 1, borderRadius: 1, width: '100%', mb: 1 }}>
                              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                                {group.request && 'prompt' in group.request && group.request.prompt ? JSON.stringify(group.request.prompt, null, 2) : 'N/A'}
                              </pre>
                            </Box>
                          </ListItem>
                          <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="caption" color="secondary" sx={{ fontWeight: 700 }}>Response</Typography>
                            <Box sx={{ background: '#f5f5f5', p: 1, borderRadius: 1, width: '100%' }}>
                              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                                {group.response?.content || 'N/A'}
                              </pre>
                            </Box>
                          </ListItem>
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Drawer>
  );
} 