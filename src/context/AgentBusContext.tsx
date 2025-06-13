import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useReset } from "./ResetContext";

export interface Message {
  sender: string;
  receiver: string;
  type: string;
  content: string;
  timestamp: string;
  prompt?: any; // Optional, for LLM request messages
}

interface AgentBusContextType {
  emit: (event: string, message: Message) => void;
  subscribe: (event: string, callback: (message: Message) => void) => () => void;
  activeAgent: string | null;
  setActiveAgent: (agent: string | null) => void;
  messages: Message[];
  subscribeToLog: (callback: (messages: Message[]) => void) => () => void;
}

const AgentBusContext = createContext<AgentBusContextType | null>(null);

const AgentBusProvider = ({ children }: { children: React.ReactNode }) => {
  const { resetSignal } = useReset();
  const listeners = useRef<{ [key: string]: ((message: Message) => void)[] }>({});
  const logListeners = useRef<((messages: Message[]) => void)[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([]);
  }, [resetSignal]);

  const emit = useCallback((event: string, message: Message) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      logListeners.current.forEach((cb) => cb(updated));
      return updated;
    });
    (listeners.current[event] || []).forEach((cb) => cb(message));
  }, []);

  const subscribe = useCallback((event: string, cb: (message: Message) => void) => {
    listeners.current[event] = listeners.current[event] || [];
    listeners.current[event].push(cb);
    return () => {
      listeners.current[event] = listeners.current[event].filter(fn => fn !== cb);
    };
  }, []);

  const subscribeToLog = useCallback((cb: (messages: Message[]) => void) => {
    logListeners.current.push(cb);
    // Immediately call with current log
    cb(messages);
    return () => {
      logListeners.current = logListeners.current.filter(fn => fn !== cb);
    };
  }, [messages]);

  const value = useMemo(() => ({
    emit,
    subscribe,
    activeAgent,
    setActiveAgent,
    messages,
    subscribeToLog
  }), [emit, subscribe, activeAgent, messages, subscribeToLog]);

  return (
    <AgentBusContext.Provider value={value}>
      {children}
    </AgentBusContext.Provider>
  );
};

const useAgentBus = () => {
  const context = useContext(AgentBusContext);
  if (!context) {
    throw new Error('useAgentBus must be used within an AgentBusProvider');
  }
  return context;
};

export { AgentBusProvider, useAgentBus };
