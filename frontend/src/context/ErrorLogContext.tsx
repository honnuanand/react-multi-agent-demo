import React, { createContext, useContext, useState, ReactNode } from 'react';

// Context for logging errors globally
const ErrorLogContext = createContext<(msg: string) => void>(() => {});

export const useErrorLog = () => useContext(ErrorLogContext);

export const ErrorLogProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  // You can expand this to a list of errors if needed

  // The setError function is provided as the logError function
  return (
    <ErrorLogContext.Provider value={setError}>
      {children}
      {/* Optionally, render a Snackbar or Alert here for global error display */}
    </ErrorLogContext.Provider>
  );
}; 