import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  MenuItem,
  Divider,
  Collapse,
} from '@mui/material';
import { useConfig, LLMProvider, AgentLLMSelection } from '../context/ConfigContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const PROVIDERS: { key: LLMProvider; label: string }[] = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'anthropic', label: 'Anthropic' },
  { key: 'databricks', label: 'Databricks' },
];
const AGENTS: { key: keyof AgentLLMSelection; label: string }[] = [
  { key: 'PlannerAgent', label: 'Planner' },
  { key: 'ResearchAgent', label: 'Researcher' },
  { key: 'WriterAgent', label: 'Writer' },
  { key: 'ReviewerAgent', label: 'Reviewer' },
  { key: 'HtmlAgent', label: 'HTML' },
  { key: 'PdfAgent', label: 'PDF' },
];

export function ConfigPanel({ multiLLMMode = false }: { multiLLMMode?: boolean }) {
  const { llms, setLLMConfig, agentLLMs, setAgentLLM } = useConfig();
  const [showKey, setShowKey] = useState<{ [k in LLMProvider]?: boolean }>({});
  const [temp, setTemp] = useState(() => ({
    openai: { ...llms.openai },
    anthropic: { ...llms.anthropic },
    databricks: { ...llms.databricks },
  }));
  const [open, setOpen] = useState(true);

  const handleSave = (provider: LLMProvider) => {
    setLLMConfig(provider, temp[provider]);
  };

  const handleToggleVisibility = (provider: LLMProvider) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const configuredProviders = PROVIDERS.filter(p => temp[p.key].apiKey);

  return (
    <Paper
      elevation={3}
      sx={{ p: 0, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          LLM Configuration
        </Typography>
        <IconButton size="small">
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, px: 3, pb: 3 }}>
          {PROVIDERS.map(({ key, label }) => (
            <Box key={key} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, background: '#fafbfc' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>{label}</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label={`${label} API Key`}
                  type={showKey[key] ? 'text' : 'password'}
                  value={temp[key].apiKey}
                  onChange={e => setTemp(t => ({ ...t, [key]: { ...t[key], apiKey: e.target.value } }))}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleToggleVisibility(key)} edge="end">
                          {showKey[key] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2, maxWidth: 400 }}
                />
                <TextField
                  label={`${label} Model`}
                  value={temp[key].model}
                  onChange={e => setTemp(t => ({ ...t, [key]: { ...t[key], model: e.target.value } }))}
                  fullWidth
                  sx={{ mb: 2, maxWidth: 300 }}
                />
                {key === 'databricks' && (
                  <TextField
                    label="Databricks API URL"
                    value={temp[key].apiUrl}
                    onChange={e => setTemp(t => ({ ...t, [key]: { ...t[key], apiUrl: e.target.value } }))}
                    fullWidth
                    sx={{ mb: 2, maxWidth: 400 }}
                  />
                )}
                <Button
                  variant="contained"
                  onClick={() => handleSave(key)}
                  disabled={JSON.stringify(temp[key]) === JSON.stringify(llms[key])}
                  sx={{ height: 56, alignSelf: 'flex-end' }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
        {multiLLMMode && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, px: 3 }}>
              Per-Agent LLM Selection
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, px: 3, pb: 3 }}>
              {AGENTS.map(agent => {
                const agentValue = configuredProviders.some(p => p.key === agentLLMs[agent.key])
                  ? agentLLMs[agent.key]
                  : '';
                return (
                  <TextField
                    key={agent.key}
                    select
                    label={agent.label}
                    value={agentValue}
                    onChange={e => setAgentLLM(agent.key, e.target.value as LLMProvider)}
                    sx={{ minWidth: 180 }}
                    disabled={configuredProviders.length === 0}
                  >
                    {configuredProviders.map(p => (
                      <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
                    ))}
                  </TextField>
                );
              })}
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  );
}
