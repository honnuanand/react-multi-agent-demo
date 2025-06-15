import React, { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, ListItemText, Divider, IconButton, Collapse, Box, Chip, Tooltip, Switch, FormControlLabel } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAgentBus } from "../context/AgentBusContext";
import type { Message } from "../context/AgentBusContext";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MemoryIcon from '@mui/icons-material/Memory';
import CodeIcon from '@mui/icons-material/Code';

// Message type to color mapping
const MESSAGE_TYPE_COLORS: Record<string, string> = {
  plan: '#1976d2',      // Blue
  task: '#0288d1',      // Light Blue
  research: '#43a047',  // Green
  draft: '#7b1fa2',     // Purple
  feedback: '#f57c00',  // Orange
  llm_request: '#d32f2f', // Red
  llm_response: '#388e3c', // Dark Green
};

// LLM message types to filter out
const LLM_MESSAGE_TYPES = ['llm_request', 'llm_response'];

function groupMessagesByFlow(messages: Message[]) {
  const groups: { messages: Message[]; summary: string }[] = [];
  let current: Message[] = [];
  let summary = '';
  messages.forEach((msg) => {
    // Start a new group on PlannerAgent plan
    if (msg.sender === 'PlannerAgent' && msg.type === 'plan') {
      if (current.length) {
        groups.push({ messages: current, summary });
        current = [];
      }
      summary = msg.content;
    }
    current.push(msg);
    // End a group on WriterAgent rewrite after feedback
    if (msg.sender === 'WriterAgent' && msg.type === 'draft' && current.length > 1) {
      groups.push({ messages: current, summary });
      current = [];
      summary = '';
    }
  });
  if (current.length) {
    groups.push({ messages: current, summary });
  }
  return groups;
}

function MessageMetadata({ message }: { message: Message }) {
  // Show all MCP fields if present
  const hasMCP = message.prompt || message.provider || message.model || message.usage;
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
      {message.timestamp && (
        <Tooltip title="Timestamp">
          <Chip
            size="small"
            icon={<AccessTimeIcon />}
            label={new Date(message.timestamp).toLocaleTimeString()}
            variant="outlined"
          />
        </Tooltip>
      )}
      {message.provider && (
        <Tooltip title="LLM Provider">
          <Chip
            size="small"
            icon={<MemoryIcon />}
            label={message.provider}
            variant="outlined"
          />
        </Tooltip>
      )}
      {message.model && (
        <Tooltip title="Model">
          <Chip
            size="small"
            icon={<CodeIcon />}
            label={message.model}
            variant="outlined"
          />
        </Tooltip>
      )}
      {message.usage && (
        <Tooltip title="Token Usage">
          <Chip
            size="small"
            label={`${message.usage.total_tokens || 0} tokens`}
            variant="outlined"
          />
        </Tooltip>
      )}
      {/* Show prompt for any message if present */}
      {message.prompt && (
        <Tooltip title="Prompt">
          <Chip
            size="small"
            label="Prompt"
            variant="outlined"
            sx={{ fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}
          />
        </Tooltip>
      )}
    </Box>
  );
}

export function CollapsibleTimeline() {
  const { subscribeToLog, messages } = useAgentBus();
  const [log, setLog] = useState<Message[]>([]);
  const [open, setOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({ 0: true });
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [showOnlyAgentComms, setShowOnlyAgentComms] = useState(false);
  const [hideEmptyFields, setHideEmptyFields] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLog(setLog);
    setLog(messages);
    return () => unsub();
  }, [subscribeToLog, messages]);

  // Filter messages based on the toggle state
  const filteredMessages = showOnlyAgentComms
    ? log.filter(msg => !LLM_MESSAGE_TYPES.includes(msg.type))
    : log;

  const groups = groupMessagesByFlow(filteredMessages);

  function MessageMetadataFull({ message }: { message: Message }) {
    // Always show all MCP fields, with N/A for missing values, and hide if toggle is on
    const fields = [
      {
        key: 'provider',
        label: 'LLM Provider',
        icon: <MemoryIcon />,
        value: message.provider ?? 'N/A',
        show: !!message.provider || !hideEmptyFields,
      },
      {
        key: 'model',
        label: 'Model',
        icon: <CodeIcon />,
        value: message.model ?? 'N/A',
        show: !!message.model || !hideEmptyFields,
      },
      {
        key: 'usage',
        label: 'Token Usage',
        icon: undefined,
        value: message.usage ? `${message.usage.total_tokens || 0} tokens` : 'N/A',
        show: !!message.usage || !hideEmptyFields,
      },
      {
        key: 'prompt',
        label: 'Prompt',
        icon: undefined,
        value: message.prompt ? 'Yes' : 'N/A',
        show: !!message.prompt || !hideEmptyFields,
      },
    ];
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
        <Tooltip title="Timestamp">
          <Chip
            size="small"
            icon={<AccessTimeIcon />}
            label={new Date(message.timestamp).toLocaleTimeString()}
            variant="outlined"
          />
        </Tooltip>
        {fields.map(f => f.show && (
          <Tooltip key={f.key} title={f.label}>
            <Chip
              size="small"
              icon={f.icon}
              label={f.value}
              variant="outlined"
              sx={f.key === 'prompt' ? { fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' } : {}}
            />
          </Tooltip>
        ))}
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
          <Box component="span" sx={{ typography: 'subtitle1' }}>Message Timeline</Box>
          <IconButton size="small">
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyAgentComms}
                onChange={(e) => setShowOnlyAgentComms(e.target.checked)}
                size="small"
              />
            }
            label="Show only agent communications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={hideEmptyFields}
                onChange={(e) => setHideEmptyFields(e.target.checked)}
                size="small"
              />
            }
            label="Hide empty MCP fields"
          />
        </Box>
      </Box>
      <Collapse in={open}>
        {groups.length === 0 ? (
          <Typography variant="body2" sx={{ mt: 1 }}>
            No messages exchanged yet.
          </Typography>
        ) : (
          <List dense>
            {groups.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch', background: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedGroups(prev => ({ ...prev, [gIdx]: !prev[gIdx] }))}>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                      Flow {gIdx + 1}{group.summary ? `: ${group.summary.slice(0, 60)}${group.summary.length > 60 ? '...' : ''}` : ''}
                    </Typography>
                    <IconButton size="small">
                      {expandedGroups[gIdx] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedGroups[gIdx]}>
                    <List dense sx={{ pl: 2 }}>
                      {group.messages.map((msg, idx) => {
                        const stepKey = `${gIdx}-${idx}`;
                        return (
                          <React.Fragment key={idx}>
                            <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }))}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 500,
                                      color: MESSAGE_TYPE_COLORS[msg.type] || '#666'
                                    }}
                                  >
                                    <b>{msg.sender}</b>
                                    <ArrowForwardIcon sx={{ fontSize: 16, mx: 0.5, verticalAlign: 'middle' }} />
                                    <b>{msg.receiver}</b>
                                    <Chip
                                      size="small"
                                      label={msg.type}
                                      sx={{ 
                                        ml: 1,
                                        backgroundColor: MESSAGE_TYPE_COLORS[msg.type] || '#666',
                                        color: 'white',
                                        height: 20,
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  </Typography>
                                </Box>
                                <IconButton size="small">
                                  {expandedSteps[stepKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>
                              <Collapse in={expandedSteps[stepKey]}>
                                <Box sx={{ pl: 2, pt: 0.5 }}>
                                  {msg.prompt && (
                                    <Box sx={{ mb: 1 }}>
                                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                                        Prompt:
                                      </Typography>
                                      <Box sx={{ 
                                        background: '#f8f9fa', 
                                        p: 1, 
                                        borderRadius: 1,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                        whiteSpace: 'pre-wrap'
                                      }}>
                                        {JSON.stringify(msg.prompt, null, 2)}
                                      </Box>
                                    </Box>
                                  )}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      whiteSpace: 'pre-line',
                                      fontFamily: (msg.type === 'llm_request' || msg.type === 'llm_response' || msg.prompt) ? 'monospace' : 'inherit',
                                      fontSize: (msg.type === 'llm_request' || msg.type === 'llm_response' || msg.prompt) ? '0.875rem' : 'inherit'
                                    }}
                                  >
                                    {msg.content}
                                  </Typography>
                                  <MessageMetadataFull message={msg} />
                                </Box>
                              </Collapse>
                            </ListItem>
                            {idx < group.messages.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </Collapse>
                </ListItem>
                {gIdx < groups.length - 1 && <Divider sx={{ my: 2, borderBottomWidth: 3, background: '#bbb' }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Collapse>
    </Paper>
  );
}
