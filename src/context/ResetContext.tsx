import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface ResetContextType {
  resetSignal: number;
  triggerReset: () => void;
}

const ResetContext = createContext<ResetContextType | null>(null);

export const ResetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resetSignal, setResetSignal] = useState(0);

  const triggerReset = useCallback(() => {
    setResetSignal(prev => prev + 1);
  }, []);

  const value = useMemo(() => ({
    resetSignal,
    triggerReset
  }), [resetSignal, triggerReset]);

  return (
    <ResetContext.Provider value={value}>
      {children}
    </ResetContext.Provider>
  );
};

export const useReset = () => {
  const context = useContext(ResetContext);
  if (!context) {
    throw new Error('useReset must be used within a ResetProvider');
  }
  return context;
};
