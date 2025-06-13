import React, { useEffect, useState } from "react";
import { Paper, Typography, List, ListItem, ListItemText, Divider, IconButton, Collapse, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAgentBus } from "../context/AgentBusContext";
import type { Message } from "../context/AgentBusContext";

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

export function CollapsibleTimeline() {
  const { subscribeToLog, messages } = useAgentBus();
  const [log, setLog] = useState<Message[]>([]);
  const [open, setOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({ 0: true });
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = subscribeToLog(setLog);
    setLog(messages);
    return () => unsub();
  }, [subscribeToLog, messages]);

  const groups = groupMessagesByFlow(log);

  return (
    <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>Message Timeline</Typography>
        <IconButton size="small">
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
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
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  <b>{msg.sender}</b> → <b>{msg.receiver}</b> <span style={{ color: '#888', fontSize: 12 }}>({msg.type})</span>
                                </Typography>
                                <IconButton size="small">
                                  {expandedSteps[stepKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>
                              <Collapse in={expandedSteps[stepKey]}>
                                <Typography variant="body2" sx={{ pl: 2, pt: 0.5, whiteSpace: 'pre-line' }}>{msg.content}</Typography>
                                <Typography variant="caption" sx={{ color: '#888', pl: 2 }}>{new Date(msg.timestamp).toLocaleTimeString()}</Typography>
                              </Collapse>
                            </ListItem>
                            {idx < group.messages.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </Collapse>
                </ListItem>
                {/* Separator after each flow */}
                {gIdx < groups.length - 1 && <Divider sx={{ my: 2, borderBottomWidth: 3, background: '#bbb' }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Collapse>
    </Paper>
  );
}
