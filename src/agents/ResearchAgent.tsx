import React, { useEffect, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import SearchIcon from "@mui/icons-material/Search";
import { callLLM } from '../services/llm';
import { AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';
import { useConfig } from "../context/ConfigContext";

const AGENT_COLOR = '#0288d1'; // cyan for Researcher
const validProviders = ['openai', 'anthropic', 'databricks'] as const;

export function ResearchAgent(props: { sx?: object }) {
  const [task, setTask] = useState("");
  const [research, setResearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { emit, subscribe } = useAgentBus();
  const { resetSignal } = useReset();
  const { llms, agentLLMs } = useConfig();

  useEffect(() => {
    const unsub = subscribe("planReady", async (msg) => {
      setTask(msg.content);
      setIsLoading(true);
      try {
        const messages: AgentMessage[] = [
          { role: 'system', content: AGENT_PROMPTS.researcher },
          { role: 'user', content: `Research the following plan: ${msg.content}` }
        ];

        // Emit LLM request event
        const provider: typeof validProviders[number] = validProviders.includes(agentLLMs.ResearchAgent as any)
          ? (agentLLMs.ResearchAgent as typeof validProviders[number])
          : 'openai';
        // console.log('ResearchAgent LLM provider:', provider);

        emit("llm_request", {
          sender: "ResearchAgent",
          receiver: "LLM",
          type: "llm_request",
          content: '',
          timestamp: new Date().toISOString(),
          prompt: messages,
          provider,
          model: llms[provider].model || '',
        });

        const researchResults = await callLLM({
          provider,
          messages: messages,
          model: llms[provider].model || '',
          apiUrl: llms[provider].apiUrl || '',
        });
        setResearch(researchResults.content);
        
        const usageRaw = researchResults.usage as any;
        const usage = usageRaw
          ? {
              prompt_tokens: usageRaw.prompt_tokens ?? usageRaw.promptTokens ?? usageRaw.input_tokens ?? 0,
              completion_tokens: usageRaw.completion_tokens ?? usageRaw.completionTokens ?? usageRaw.output_tokens ?? 0,
              total_tokens: usageRaw.total_tokens ?? usageRaw.totalTokens ?? ((usageRaw.input_tokens ?? 0) + (usageRaw.output_tokens ?? 0)),
              input_tokens: usageRaw.input_tokens,
              output_tokens: usageRaw.output_tokens,
            }
          : undefined;
        // Emit LLM response event
        emit("llm_response", {
          sender: "ResearchAgent",
          receiver: "LLM",
          type: "llm_response",
          content: researchResults.content,
          timestamp: new Date().toISOString(),
          prompt: messages,
          provider,
          model: llms[provider].model || '',
          usage,
        });

        emit("researchReady", {
          sender: "ResearchAgent",
          receiver: "WriterAgent",
          type: "research",
          content: researchResults.content,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Research error:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [subscribe, emit, llms, agentLLMs]);

  useEffect(() => {
    setTask("");
    setResearch("");
  }, [resetSignal]);

  return (
    <AgentPanel
      title="Research Agent"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      icon={<SearchIcon />}
      color={AGENT_COLOR}
      state={isLoading ? 'loading' : research ? 'done' : 'idle'}
      sx={props.sx}
      agentKey="ResearchAgent"
    >
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CollapsibleText text={research || "Waiting for task..."} />
      )}
    </AgentPanel>
  );
}
