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
  },
  anthropic: {
    model: 'claude-3-opus-20240229',
  },
  databricks: {
    model: 'databricks-dbrx-instruct',
    apiUrl: '',
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
      const model = llms[provider].model || defaultLLMConfig[provider].model;
      const response = await fetch(`/api/llm/${provider}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }], model, apiKey: llms[provider].apiKey, provider }),
      });
      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Successfully connected to ${provider}!`,
          severity: 'success',
        });
        setTestSuccess(prev => ({ ...prev, [provider]: true }));
        return true;
      } else {
        setTestSuccess(prev => ({ ...prev, [provider]: false }));
        throw new Error(`Failed to connect to ${provider}`);
      }
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      setSnackbar({
        open: true,
        message: `Failed to connect to ${provider}. Please check your configuration.`,
        severity: 'error',
      });
      setTestSuccess(prev => ({ ...prev, [provider]: false }));
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