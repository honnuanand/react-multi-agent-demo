import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useAgentBus } from '../context/AgentBusContext';
import type { Message } from '../context/AgentBusContext';

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

  function MessageMetadataFull({ message }: { message: Message }) {
    // Always show all MCP fields, with N/A for missing values, and hide if toggle is on
    const fields = [
      {
        key: 'id',
        label: 'Message ID',
        value: message.id ?? 'N/A',
        show: !!message.id || !hideEmptyFields,
      },
      {
        key: 'sender',
        label: 'Sender',
        value: message.sender ?? 'N/A',
        show: !!message.sender || !hideEmptyFields,
      },
      {
        key: 'receiver',
        label: 'Receiver',
        value: message.receiver ?? 'N/A',
        show: !!message.receiver || !hideEmptyFields,
      },
      {
        key: 'type',
        label: 'Type',
        value: message.type ?? 'N/A',
        show: !!message.type || !hideEmptyFields,
      },
      {
        key: 'content',
        label: 'Content',
        value: message.content ? (message.content.length > 60 ? message.content.slice(0, 60) + '...' : message.content) : 'N/A',
        show: !!message.content || !hideEmptyFields,
      },
      {
        key: 'timestamp',
        label: 'Timestamp',
        value: message.timestamp ? new Date(message.timestamp).toLocaleString() : 'N/A',
        show: !!message.timestamp || !hideEmptyFields,
      },
      {
        key: 'provider',
        label: 'LLM Provider',
        value: message.provider ?? 'N/A',
        show: !!message.provider || !hideEmptyFields,
      },
      {
        key: 'model',
        label: 'Model',
        value: message.model ?? 'N/A',
        show: !!message.model || !hideEmptyFields,
      },
      {
        key: 'usage',
        label: 'Token Usage',
        value: message.usage ? `${message.usage.total_tokens || 0} tokens` : 'N/A',
        show: !!message.usage || !hideEmptyFields,
      },
      {
        key: 'prompt',
        label: 'Prompt',
        value: message.prompt ? 'Yes' : 'N/A',
        show: !!message.prompt || !hideEmptyFields,
      },
    ];
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
        {fields.filter(f => f.show).map(f => (
          <Tooltip key={f.key} title={f.label}>
            <Chip
              size="small"
              label={f.value}
              variant="outlined"
              sx={f.key === 'prompt' ? { fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' } : {}}
            />
          </Tooltip>
        ))}
      </Box>
    );
  }
} 