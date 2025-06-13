import React, { createContext, useContext, useState } from "react";

interface ResetContextType {
  resetSignal: number;
  triggerReset: () => void;
}

const ResetContext = createContext<ResetContextType | null>(null);

export function ResetProvider({ children }: { children: React.ReactNode }) {
  const [resetSignal, setResetSignal] = useState(0);

  const triggerReset = () => {
    setResetSignal((prev) => prev + 1);
  };

  return (
    <ResetContext.Provider value={{ resetSignal, triggerReset }}>
      {children}
    </ResetContext.Provider>
  );
}

export function useReset() {
  const context = useContext(ResetContext);
  if (!context) {
    throw new Error('useReset must be used within a ResetProvider');
  }
  return context;
}
