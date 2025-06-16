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
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

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

export function groupMessagesByFlow(messages: Message[]) {
  const groups: { messages: Message[]; summary: string }[] = [];
  let current: Message[] = [];
  let summary = '';
  let inReview = false;
  messages.forEach((msg, idx) => {
    // Start a new group on PlannerAgent plan
    if (msg.sender === 'PlannerAgent' && msg.type === 'plan') {
      if (current.length) {
        groups.push({ messages: dedupeById(current), summary });
        current = [];
      }
      summary = msg.content;
      inReview = false;
    }
    current.push(msg);
    // Mark when review is seen
    if (msg.sender === 'ReviewerAgent' && msg.type === 'review') {
      inReview = true;
    }
    // End a group only after WriterAgent draft that follows a review
    if (
      inReview &&
      msg.sender === 'WriterAgent' &&
      msg.type === 'draft' &&
      idx < messages.length - 1 &&
      // Next message is not another WriterAgent draft (to avoid splitting on rewrites)
      messages[idx + 1].sender !== 'WriterAgent'
    ) {
      groups.push({ messages: dedupeById(current), summary });
      current = [];
      summary = '';
      inReview = false;
    }
  });
  if (current.length) {
    groups.push({ messages: dedupeById(current), summary });
  }
  return groups;
}

function dedupeById(msgs: Message[]): Message[] {
  const seen = new Set<string>();
  return msgs.filter(m => {
    // Only deduplicate agent-to-agent messages; always include LLM messages
    if (m.type === 'llm_request' || m.type === 'llm_response') return true;
    if (!m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
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
    const [showPrompt, setShowPrompt] = useState(false);
    const [showUsage, setShowUsage] = useState(false);
    // Routing Section
    const routing = [
      {
        key: 'id',
        label: 'Message ID',
        value: message.id ?? 'N/A',
        icon: <></>,
        tooltip: 'Unique message identifier',
        copy: true,
      },
    ];
    // LLM Info Section
    const llmInfo = [
      {
        key: 'provider',
        label: 'LLM Provider',
        value: message.provider ?? 'N/A',
        icon: <MemoryIcon fontSize="small" />,
        tooltip: 'LLM provider (OpenAI, Anthropic, etc.)',
      },
      {
        key: 'model',
        label: 'Model',
        value: message.model ?? 'N/A',
        icon: <CodeIcon fontSize="small" />,
        tooltip: 'Model name',
      },
    ];
    // Token Usage Section
    const usage = message.usage || {};
    const usageFields = [
      { key: 'prompt_tokens', label: 'Prompt tokens', value: usage.prompt_tokens ?? 'N/A' },
      { key: 'completion_tokens', label: 'Completion tokens', value: usage.completion_tokens ?? 'N/A' },
      { key: 'total_tokens', label: 'Total tokens', value: usage.total_tokens ?? 'N/A' },
      { key: 'input_tokens', label: 'Input tokens', value: usage.input_tokens ?? 'N/A' },
      { key: 'output_tokens', label: 'Output tokens', value: usage.output_tokens ?? 'N/A' },
    ];
    // Prompt Section
    const promptValue = typeof message.prompt === 'string' ? message.prompt : JSON.stringify(message.prompt, null, 2);
    // UI
    return (
      <Paper variant="outlined" sx={{ p: 1, mb: 1, bgcolor: '#fafbfc' }}>
        {/* Envelope (meta) at the top */}
        <Box>
          {/* Routing Section */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
            {/* Sender → Receiver with single arrow */}
            <Tooltip title={`Sender → Receiver`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Sender:</Typography>
                <Typography variant="body2" sx={{ ml: 0.5 }}>{message.sender ?? 'N/A'}</Typography>
                <ArrowForwardIcon fontSize="small" sx={{ mx: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Receiver:</Typography>
                <Typography variant="body2" sx={{ ml: 0.5 }}>{message.receiver ?? 'N/A'}</Typography>
              </Box>
            </Tooltip>
            {/* Message ID, Type, Timestamp */}
            {routing.map(f => (
              <Tooltip key={f.key} title={f.tooltip}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {f.icon}
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{f.label}:</Typography>
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {f.value}
                    {f.copy && f.value !== 'N/A' && (
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(f.value)}>
                        <svg width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M19 21H9a2 2 0 0 1-2-2V7h2v12h10v2m3-16v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2Z"/></svg>
                      </IconButton>
                    )}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
            {/* Type and Timestamp */}
            <Tooltip title="Message type">
              <Chip size="small" label={message.type} sx={{ bgcolor: MESSAGE_TYPE_COLORS[message.type] || '#eee', color: '#fff', ml: 1 }} />
            </Tooltip>
            <Tooltip title="Time sent">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">{message.timestamp ? new Date(message.timestamp).toLocaleString() : 'N/A'}</Typography>
              </Box>
            </Tooltip>
          </Box>
          {/* LLM Info Section */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
            {llmInfo.map(f => (
              <Tooltip key={f.key} title={f.tooltip}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {f.icon}
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{f.label}:</Typography>
                  <Typography variant="body2" sx={{ ml: 0.5 }}>{f.value}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
          {/* Token Usage Section (expandable) */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Token Usage:</Typography>
              <IconButton size="small" onClick={() => setShowUsage(v => !v)}>
                {showUsage ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={showUsage}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                {usageFields.map(f => (
                  <Box key={f.key} sx={{ minWidth: 100 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>{f.label}:</Typography>
                    <Typography variant="body2" sx={{ ml: 0.5 }}>{f.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
          {/* Prompt Section (expandable) */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Prompt:</Typography>
              <IconButton size="small" onClick={() => setShowPrompt(v => !v)}>
                {showPrompt ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={showPrompt}>
              <Box sx={{ mt: 0.5, bgcolor: '#f5f5f5', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: 13, maxHeight: 200, overflow: 'auto' }}>
                {promptValue && promptValue !== 'undefined' ? promptValue : 'N/A'}
              </Box>
            </Collapse>
          </Box>
        </Box>
        {/* Payload Section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Payload:</Typography>
          <Paper variant="outlined" sx={{ p: 1, bgcolor: '#fff', fontFamily: 'monospace', fontSize: 14, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {message.content || 'N/A'}
          </Paper>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
          <DirectionsBusIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Box component="span" sx={{ typography: 'subtitle1', fontWeight: 700 }}>
            Agent Message Bus
          </Box>
          <Typography variant="caption" sx={{ ml: 1, color: '#888' }}>
            (Timeline)
          </Typography>
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
      {/* Description of the Agent Message Bus */}
      <Typography variant="body2" sx={{ color: '#666', mb: 2, ml: 0.5 }}>
        The Agent Message Bus shows all messages exchanged between agents and LLMs in the app. Each message represents a step in the collaborative workflow, including agent-to-agent tasks, LLM requests, and responses. Use this panel to trace, debug, and understand the flow of information between all components.
      </Typography>
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
