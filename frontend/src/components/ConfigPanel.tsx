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
  List,
  ListItem,
  ListItemText,
  Alert,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { useConfig, LLMProvider } from '../context/ConfigContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PROVIDERS: { key: LLMProvider; label: string }[] = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'anthropic', label: 'Anthropic' },
  { key: 'databricks', label: 'Databricks' },
];

const OPENAI_MODELS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo-preview'
];

const ANTHROPIC_MODELS = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307'
];

interface DatabricksEndpoint {
  name: string;
  status: string;
  url: string;
}

export function ConfigPanel() {
  const { llms, setLLM, testLLMConnection } = useConfig();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ [key: string]: { status: "idle" | "loading" | "success" | "error"; message?: string } }>({});
  const [databricksEndpoints, setDatabricksEndpoints] = useState<DatabricksEndpoint[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (provider: LLMProvider, field: string, value: string) => {
    setLLM(provider, { [field]: value });
  };

  const handleTest = async (provider: LLMProvider) => {
    setTestStatus((prev) => ({ ...prev, [provider]: { status: "loading" } }));
    try {
      const success = await testLLMConnection(provider);
      if (success) {
        setTestStatus((prev) => ({ ...prev, [provider]: { status: "success", message: "Connection successful!" } }));
        if (provider === "databricks") {
          // Fetch endpoints after successful connection
          const response = await fetch('/api/llm/databricks/models', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setDatabricksEndpoints(data.models || []);
          }
        }
      } else {
        setTestStatus((prev) => ({ ...prev, [provider]: { status: "error", message: "Connection failed" } }));
      }
    } catch (error) {
      setTestStatus((prev) => ({ ...prev, [provider]: { status: "error", message: "Connection test failed" } }));
    }
  };

  const handleEndpointSelect = (endpoint: DatabricksEndpoint) => {
    setLLM('databricks', { 
      model: endpoint.name,
      apiUrl: endpoint.url 
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Configuration</Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PROVIDERS.map((provider) => (
            <Paper key={provider.key} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  label="API Key"
                  type="password"
                  value={llms[provider.key].apiKey || ''}
                  onChange={(e) => handleChange(provider.key, 'apiKey', e.target.value)}
                  sx={{ width: '300px' }}
                />
                {provider.key === 'openai' && (
                  <FormControl size="small" sx={{ width: '200px' }}>
                    <InputLabel>Model</InputLabel>
                    <Select
                      value={llms[provider.key].model || 'gpt-3.5-turbo'}
                      onChange={(e) => handleChange(provider.key, 'model', e.target.value)}
                      label="Model"
                    >
                      {OPENAI_MODELS.map((model) => (
                        <MenuItem key={model} value={model}>{model}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {provider.key === 'anthropic' && (
                  <FormControl size="small" sx={{ width: '200px' }}>
                    <InputLabel>Model</InputLabel>
                    <Select
                      value={llms[provider.key].model || 'claude-3-opus-20240229'}
                      onChange={(e) => handleChange(provider.key, 'model', e.target.value)}
                      label="Model"
                    >
                      {ANTHROPIC_MODELS.map((model) => (
                        <MenuItem key={model} value={model}>{model}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleTest(provider.key)}
                  size="small"
                >
                  Test
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setLLM(provider.key, llms[provider.key])}
                  size="small"
                >
                  Save
                </Button>
              </Box>
              {testStatus[provider.key]?.status === "loading" && (
                <Box sx={{ mt: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              )}
              {testStatus[provider.key]?.status === "success" && (
                <Box sx={{ mt: 1 }}>
                  <Alert severity="success" sx={{ py: 0 }}>{testStatus[provider.key].message}</Alert>
                </Box>
              )}
              {testStatus[provider.key]?.status === "error" && (
                <Box sx={{ mt: 1 }}>
                  <Alert severity="error" sx={{ py: 0 }}>{testStatus[provider.key].message}</Alert>
                </Box>
              )}
              {provider.key === 'databricks' && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Databricks API URL"
                    value={llms[provider.key].apiUrl || ''}
                    onChange={(e) => handleChange(provider.key, 'apiUrl', e.target.value)}
                    size="small"
                  />
                </Box>
              )}
              {provider.key === 'databricks' && databricksEndpoints.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Available Databricks Endpoints:</Typography>
                  <List dense>
                    {databricksEndpoints.map((endpoint) => (
                      <ListItem key={endpoint.name}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Select Endpoint</InputLabel>
                          <Select
                            value={endpoint.name}
                            onChange={() => handleEndpointSelect(endpoint)}
                            label="Select Endpoint"
                          >
                            <MenuItem value={endpoint.name}>{endpoint.name} - {endpoint.status}</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}
