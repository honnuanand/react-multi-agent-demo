import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useReset } from "./ResetContext";

export interface Message {
  id?: string;
  sender: string;
  receiver: string;
  type: string;
  content: string;
  timestamp: string;
  prompt?: any; // Optional, for LLM request messages
  provider?: string; // Optional, for LLM info
  model?: string;    // Optional, for LLM info
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
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
      logListeners.current.forEach((cb) => setTimeout(() => cb(updated), 0));
      return updated;
    });
    (listeners.current[event] || []).forEach((cb) => setTimeout(() => cb(message), 0));
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
    return () => {
      logListeners.current = logListeners.current.filter(fn => fn !== cb);
    };
  }, []);

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
