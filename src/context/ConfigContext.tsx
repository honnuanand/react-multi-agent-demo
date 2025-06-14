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
  ResearchAgent: 'anthropic',
  WriterAgent: 'openai',
  ReviewerAgent: 'anthropic',
};

export const ConfigContext = createContext<ConfigContextType>({
  llms: defaultLLMConfig,
  setLLM: () => {},
  agentLLMs: defaultAgentLLMs,
  setAgentLLM: () => {},
  configuredLLMs: [],
  testLLMConnection: async () => false,
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [llms, setLLMs] = useState<LLMConfig>(defaultLLMConfig);
  const [agentLLMs, setAgentLLMs] = useState<AgentLLMSelection>(defaultAgentLLMs);
  const [configuredLLMs, setConfiguredLLMs] = useState<LLMProvider[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const setLLM = (provider: LLMProvider, config: Partial<LLMConfig[LLMProvider]>) => {
    setLLMs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        ...config,
      },
    }));
  };

  const setAgentLLM = (agent: AgentType, provider: LLMProvider) => {
    setAgentLLMs(prev => ({
      ...prev,
      [agent]: provider,
    }));
  };

  const testLLMConnection = async (provider: LLMProvider): Promise<boolean> => {
    try {
      const response = await fetch(`/api/llm/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test' }],
          model: llms[provider].model,
          apiKey: llms[provider].apiKey || '',
          apiUrl: llms[provider].apiUrl || '',
          provider,
        }),
      });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Successfully connected to ${provider}!`,
          severity: 'success',
        });
        return true;
      } else {
        throw new Error(`Failed to connect to ${provider}`);
      }
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      setSnackbar({
        open: true,
        message: `Failed to connect to ${provider}. Please check your configuration.`,
        severity: 'error',
      });
      return false;
    }
  };

  return (
    <ConfigContext.Provider value={{
      llms,
      setLLM,
      agentLLMs,
      setAgentLLM,
      configuredLLMs,
      testLLMConnection,
    }}>
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