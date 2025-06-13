import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type LLMProvider = 'openai' | 'anthropic' | 'databricks';
export interface LLMConfig {
  apiKey: string;
  model: string;
  apiUrl?: string; // Only for Databricks
}

export interface MultiLLMConfig {
  openai: LLMConfig;
  anthropic: LLMConfig;
  databricks: LLMConfig;
}

export interface AgentLLMSelection {
  PlannerAgent: LLMProvider;
  ResearchAgent: LLMProvider;
  WriterAgent: LLMProvider;
  ReviewerAgent: LLMProvider;
  HtmlAgent: LLMProvider;
  PdfAgent: LLMProvider;
}

interface ConfigContextType {
  llms: MultiLLMConfig;
  setLLMConfig: (provider: LLMProvider, config: LLMConfig) => void;
  agentLLMs: AgentLLMSelection;
  setAgentLLM: (agent: keyof AgentLLMSelection, provider: LLMProvider) => void;
}

const defaultLLMConfig: LLMConfig = { apiKey: '', model: '', apiUrl: '' };
const defaultAgentLLMs: AgentLLMSelection = {
  PlannerAgent: 'openai',
  ResearchAgent: 'openai',
  WriterAgent: 'openai',
  ReviewerAgent: 'openai',
  HtmlAgent: 'openai',
  PdfAgent: 'openai',
};

const ConfigContext = createContext<ConfigContextType | null>(null);

const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [llms, setLLMs] = useState<MultiLLMConfig>({
    openai: { ...defaultLLMConfig, model: 'gpt-4' },
    anthropic: { ...defaultLLMConfig, model: 'claude-3-opus-20240229' },
    databricks: { ...defaultLLMConfig, model: 'databricks-dbrx-instruct', apiUrl: '' },
  });
  const [agentLLMs, setAgentLLMs] = useState<AgentLLMSelection>(defaultAgentLLMs);

  const setLLMConfig = useCallback((provider: LLMProvider, config: LLMConfig) => {
    setLLMs(prev => ({ ...prev, [provider]: { ...prev[provider], ...config } }));
  }, []);

  const setAgentLLM = useCallback((agent: keyof AgentLLMSelection, provider: LLMProvider) => {
    setAgentLLMs(prev => ({ ...prev, [agent]: provider }));
  }, []);

  const value = useMemo(() => ({
    llms,
    setLLMConfig,
    agentLLMs,
    setAgentLLM,
  }), [llms, setLLMConfig, agentLLMs, setAgentLLM]);

  return (
    <ConfigContext.Provider value={value}>
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

export { ConfigProvider, useConfig }; 