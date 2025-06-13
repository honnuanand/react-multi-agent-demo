import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface ConfigContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');

  const handleSetApiKey = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleSetModel = useCallback((newModel: string) => {
    setModel(newModel);
  }, []);

  const value = useMemo(() => ({
    apiKey,
    setApiKey: handleSetApiKey,
    model,
    setModel: handleSetModel
  }), [apiKey, handleSetApiKey, model, handleSetModel]);

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