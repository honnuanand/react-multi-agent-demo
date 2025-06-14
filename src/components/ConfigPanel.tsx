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
  Grid,
} from '@mui/material';
import { useConfig, LLMProvider, AgentLLMSelection } from '../context/ConfigContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
];

export function ConfigPanel({ multiLLMMode = false }: { multiLLMMode?: boolean }) {
  const { llms, setLLM, agentLLMs, setAgentLLM, configuredLLMs, testLLMConnection, setGlobalLLMProvider, testSuccess } = useConfig();
  const [showKey, setShowKey] = useState<{ [k in LLMProvider]?: boolean }>({});
  const [temp, setTemp] = useState(() => ({
    openai: { ...llms.openai },
    anthropic: { ...llms.anthropic },
    databricks: { ...llms.databricks },
  }));
  const [open, setOpen] = useState(true);
  const [testStatus, setTestStatus] = useState<{ [k in LLMProvider]?: { success: boolean; message: string } }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleSave = async (provider: LLMProvider) => {
    await setLLM(provider, temp[provider]);
  };

  const handleToggleVisibility = (provider: LLMProvider) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleTest = async (provider: LLMProvider) => {
    try {
      const success = await testLLMConnection(provider);
      setTestStatus(prev => ({ ...prev, [provider]: { success, message: success ? `Successfully connected to ${provider}!` : `Failed to connect to ${provider}.` } }));
    } catch (error: any) {
      console.error('Error testing connection:', error);
      setTestStatus(prev => ({ ...prev, [provider]: { success: false, message: `Failed to connect to ${provider}: ${error.message}` } }));
    }
  };

  const configuredProviderKeys = configuredLLMs;
  const configuredProviders = PROVIDERS.filter(p => configuredProviderKeys.includes(p.key));

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
          {!multiLLMMode && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Select LLM Provider</Typography>
              <TextField
                select
                label="Provider"
                value={agentLLMs.PlannerAgent}
                onChange={e => setGlobalLLMProvider(e.target.value as LLMProvider)}
                sx={{ minWidth: 180 }}
              >
                {PROVIDERS.map(p => (
                  <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}
          {PROVIDERS.map(({ key, label }) => (
            <Box key={key} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, background: '#fafbfc' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>{label}</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label={`${label} API Key`}
                  type={showKey[key] ? 'text' : 'password'}
                  value={temp[key].apiKey || ""}
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
                  value={temp[key].model || ""}
                  onChange={e => setTemp(t => ({ ...t, [key]: { ...t[key], model: e.target.value } }))}
                  fullWidth
                  sx={{ mb: 2, maxWidth: 300 }}
                />
                {key === 'databricks' && (
                  <TextField
                    label="Databricks API URL"
                    value={temp[key].apiUrl || ""}
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
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => handleTest(key)}
                  sx={{ height: 56, alignSelf: 'flex-end' }}
                >
                  Test
                </Button>
                {testStatus[key]?.message && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    {testStatus[key].success && (
                      <CheckCircleIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
                    )}
                    <Typography variant="body2" color={testStatus[key].success ? 'success.main' : 'error.main'}>
                      {testStatus[key].message}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
        {/* Only show per-agent selection in multiLLMMode */}
        {multiLLMMode && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, px: 3 }}>
              Per-Agent LLM Selection
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, px: 3, pb: 3 }}>
              {AGENTS.map(agent => {
                const agentValue = configuredProviderKeys.includes(agentLLMs[agent.key])
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
                    disabled={configuredProviderKeys.length === 0}
                  >
                    {configuredProviders.map(p => (
                      <MenuItem key={p.key} value={p.key}>
                        {p.label} {testSuccess[p.key] && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18, ml: 0.5 }} />}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              })}
            </Box>
          </>
        )}
      </Collapse>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
