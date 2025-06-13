import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { initializeOpenAI } from '../services/openai';

interface ConfigContextType {
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(() => {
    // Try to load from localStorage
    return localStorage.getItem('openaiApiKey') || '';
  });

  // Initialize OpenAI client when loading a saved API key
  useEffect(() => {
    if (openaiApiKey) {
      try {
        initializeOpenAI(openaiApiKey);
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
      }
    }
  }, []); // Only run once on mount

  const handleSetApiKey = (key: string) => {
    setOpenaiApiKey(key);
    localStorage.setItem('openaiApiKey', key);
  };

  return (
    <ConfigContext.Provider value={{ openaiApiKey, setOpenaiApiKey: handleSetApiKey }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
} 