import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { callLLM } from '../services/llm';
import { Snackbar, Alert } from '@mui/material';

export type LLMProvider = 'openai' | 'anthropic' | 'databricks';

export type AgentType = 'PlannerAgent' | 'ResearchAgent' | 'WriterAgent' | 'ReviewerAgent';

export type LLMConfig = {
  [K in LLMProvider]: {
    model: string;
    apiUrl?: string;
    apiKey?: string;
  };
};

export type AgentLLMSelection = {
  [K in AgentType]: LLMProvider;
};

export type MultiLLMConfig = {
  openai: LLMConfig;
  anthropic: LLMConfig;
  databricks: LLMConfig;
};

export type ConfigContextType = {
  llms: LLMConfig;
  setLLM: (provider: LLMProvider, config: Partial<LLMConfig[LLMProvider]>) => void;
  agentLLMs: AgentLLMSelection;
  setAgentLLM: (agent: AgentType, provider: LLMProvider) => void;
  configuredLLMs: LLMProvider[];
  testLLMConnection: (provider: LLMProvider) => Promise<boolean>;
  setGlobalLLMProvider: (provider: LLMProvider) => void;
  testSuccess: { [k in LLMProvider]?: boolean };
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const defaultLLMConfig: LLMConfig = {
  openai: {
    model: 'gpt-4',
    apiKey: '',
  },
  anthropic: {
    model: 'claude-3-opus-20240229',
    apiKey: '',
  },
  databricks: {
    model: 'databricks-dbrx-instruct',
    apiUrl: '',
    apiKey: '',
  },
};

const defaultAgentLLMs: AgentLLMSelection = {
  PlannerAgent: 'openai',
  ResearchAgent: 'openai',
  WriterAgent: 'openai',
  ReviewerAgent: 'openai',
};

export const ConfigContext = createContext<ConfigContextType>({
  llms: defaultLLMConfig,
  setLLM: () => {},
  agentLLMs: defaultAgentLLMs,
  setAgentLLM: () => {},
  configuredLLMs: [],
  testLLMConnection: async () => false,
  setGlobalLLMProvider: () => {},
  testSuccess: {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [llms, setLLMs] = useState<LLMConfig>(defaultLLMConfig);
  const [agentLLMs, setAgentLLMs] = useState<AgentLLMSelection>(defaultAgentLLMs);
  const [testSuccess, setTestSuccess] = useState<{ [k in LLMProvider]?: boolean }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Only include providers that have passed the test
  const configuredLLMs = useMemo(() => {
    return (['openai', 'anthropic', 'databricks'] as LLMProvider[]).filter(p => testSuccess[p]);
  }, [testSuccess]);

  const setLLM = async (provider: LLMProvider, config: Partial<LLMConfig[LLMProvider]>) => {
    setLLMs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        ...config,
      },
    }));

    // Store API key in session if provided
    if (config.apiKey) {
      try {
        const response = await fetch(`/api/session/set_key`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ provider, apiKey: config.apiKey }),
        });
        if (!response.ok) {
          console.error('Failed to store API key in session');
        }
      } catch (error) {
        console.error('Error storing API key in session:', error);
      }
    }
  };

  const setAgentLLM = (agent: AgentType, provider: LLMProvider) => {
    setAgentLLMs(prev => ({
      ...prev,
      [agent]: provider,
    }));
  };

  const testLLMConnection = async (provider: LLMProvider): Promise<boolean> => {
    try {
      if (provider === 'databricks') {
        // For Databricks, we'll test by listing available models
        const response = await fetch('/api/llm/databricks/models', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Databricks API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          setTestSuccess(prev => ({ ...prev, [provider]: true }));
          setSnackbar({
            open: true,
            message: `Successfully connected to Databricks! Found ${data.models.length} models.`,
            severity: 'success',
          });
          return true;
        }
        throw new Error('Invalid response format from Databricks API');
      }
      
      // For other providers, use the existing test message
      const response = await fetch(`/api/llm/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test connection' }],
          model: llms[provider].model,
          apiKey: llms[provider].apiKey,
          apiUrl: llms[provider].apiUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${provider} API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      setTestSuccess(prev => ({ ...prev, [provider]: true }));
      setSnackbar({
        open: true,
        message: `Successfully connected to ${provider}!`,
        severity: 'success',
      });
      return true;
    } catch (error: any) {
      console.error(`Error testing ${provider} connection:`, error);
      setTestSuccess(prev => ({ ...prev, [provider]: false }));
      setSnackbar({
        open: true,
        message: `Failed to connect to ${provider}: ${error.message}`,
        severity: 'error',
      });
      return false;
    }
  };

  const setGlobalLLMProvider = (provider: LLMProvider) => {
    setAgentLLMs({
      PlannerAgent: provider,
      ResearchAgent: provider,
      WriterAgent: provider,
      ReviewerAgent: provider,
    });
  };

  return (
    <ConfigContext.Provider
      value={{
        llms,
        setLLM,
        agentLLMs,
        setAgentLLM,
        configuredLLMs,
        testLLMConnection,
        setGlobalLLMProvider,
        testSuccess,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export { useConfig }; 