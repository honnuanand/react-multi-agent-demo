import React, { useEffect, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import CreateIcon from "@mui/icons-material/Create";
import { callLLM } from '../services/llm';
import { AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';
import { useConfig } from "../context/ConfigContext";
import { v4 as uuidv4 } from 'uuid';

// Color and state indicator for future UI enhancements
const AGENT_COLOR = '#7b1fa2'; // purple for Writer

export function WriterAgent(props: { sx?: object }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { emit, subscribe } = useAgentBus();
  const { resetSignal } = useReset();
  const { llms, agentLLMs } = useConfig();

  // Listen for researchReady to write initial content
  useEffect(() => {
    const unsub = subscribe("researchReady", async (msg) => {
      setIsLoading(true);
      try {
        const messages: AgentMessage[] = [
          { role: 'system', content: AGENT_PROMPTS.writer },
          { role: 'user', content: `Create content based on this research: ${msg.content}` }
        ];
        // Emit LLM request event
        const validProviders = ['openai', 'anthropic', 'databricks'] as const;
        for (const provider of validProviders) {
          emit("llm_request", {
            sender: "WriterAgent",
            receiver: "LLM",
            type: "llm_request",
            content: '',
            timestamp: new Date().toISOString(),
            prompt: messages,
            provider,
            model: llms[provider].model || '',
            usage: undefined,
          });
        }
        // Use the global provider for all agents in single LLM mode
        const provider: typeof validProviders[number] = validProviders.includes(agentLLMs.WriterAgent as any)
          ? (agentLLMs.WriterAgent as typeof validProviders[number])
          : 'openai';
        // console.log('WriterAgent LLM provider:', provider);
        // console.log('WriterAgent LLM call params:', {
        //   provider,
        //   model: llms[provider].model,
        //   apiUrl: llms[provider].apiUrl,
        // });
        const generatedContent = await callLLM({
          provider,
          messages: messages,
          model: llms[provider].model || '',
          apiUrl: llms[provider].apiUrl || '',
        });
        const usageRaw = generatedContent.usage as any;
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
          sender: "WriterAgent",
          receiver: "LLM",
          type: "llm_response",
          content: generatedContent.content,
          timestamp: new Date().toISOString(),
          prompt: messages,
          provider,
          model: llms[provider].model || '',
          usage,
        });
        setContent(generatedContent.content);
        emit("draftReady", {
          id: uuidv4(),
          sender: "WriterAgent",
          receiver: "ReviewerAgent",
          type: "draft",
          content: generatedContent.content,
          timestamp: new Date().toISOString(),
          prompt: messages,
          provider,
          model: llms[provider].model || '',
          usage: {
            prompt_tokens: usageRaw?.prompt_tokens ?? usageRaw?.promptTokens ?? usageRaw?.input_tokens ?? 0,
            completion_tokens: usageRaw?.completion_tokens ?? usageRaw?.completionTokens ?? usageRaw?.output_tokens ?? 0,
            total_tokens: usageRaw?.total_tokens ?? usageRaw?.totalTokens ?? ((usageRaw?.input_tokens ?? 0) + (usageRaw?.output_tokens ?? 0)),
            input_tokens: usageRaw?.input_tokens,
            output_tokens: usageRaw?.output_tokens,
          },
        });
      } catch (error) {
        console.error("Writing error:", error);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [subscribe, emit]);

  // Listen for reviewComplete to re-write content based on feedback
  useEffect(() => {
    const unsub = subscribe("reviewComplete", async (msg) => {
      setIsLoading(true);
      try {
        const messages: AgentMessage[] = [
          { role: 'system', content: AGENT_PROMPTS.writer },
          { role: 'user', content: `Revise the following content based on this feedback: ${msg.content}\n\nOriginal content: ${content}` }
        ];
        // Emit LLM request event
        const validProviders = ['openai', 'anthropic', 'databricks'] as const;
        for (const provider of validProviders) {
          emit("llm_request", {
            sender: "WriterAgent",
            receiver: "LLM",
            type: "llm_request",
            content: '',
            timestamp: new Date().toISOString(),
            prompt: messages,
            provider,
            model: llms[provider].model || '',
            usage: undefined,
          });
        }
        // Use the global provider for all agents in single LLM mode
        const provider: typeof validProviders[number] = validProviders.includes(agentLLMs.WriterAgent as any)
          ? (agentLLMs.WriterAgent as typeof validProviders[number])
          : 'openai';
        // console.log('WriterAgent LLM provider:', provider);
        // console.log('WriterAgent LLM call params:', {
        //   provider,
        //   model: llms[provider].model,
        //   apiUrl: llms[provider].apiUrl,
        // });
        const revisedContent = await callLLM({
          provider,
          messages: messages,
          model: llms[provider].model || '',
          apiUrl: llms[provider].apiUrl || '',
        });
        const usageRaw2 = revisedContent.usage as any;
        const usage2 = usageRaw2
          ? {
              prompt_tokens: usageRaw2.prompt_tokens ?? usageRaw2.promptTokens ?? usageRaw2.input_tokens ?? 0,
              completion_tokens: usageRaw2.completion_tokens ?? usageRaw2.completionTokens ?? usageRaw2.output_tokens ?? 0,
              total_tokens: usageRaw2.total_tokens ?? usageRaw2.totalTokens ?? ((usageRaw2.input_tokens ?? 0) + (usageRaw2.output_tokens ?? 0)),
              input_tokens: usageRaw2.input_tokens,
              output_tokens: usageRaw2.output_tokens,
            }
          : undefined;
        // Emit LLM response event for rewrite
        emit("llm_response", {
          sender: "WriterAgent",
          receiver: "LLM",
          type: "llm_response",
          content: revisedContent.content,
          timestamp: new Date().toISOString(),
          prompt: messages,
          provider,
          model: llms[provider].model || '',
          usage: usage2,
        });
        setContent(revisedContent.content);
        emit("rewriteComplete", {
          id: uuidv4(),
          sender: "WriterAgent",
          receiver: "ReviewerAgent",
          type: "draft",
          content: revisedContent.content,
          timestamp: new Date().toISOString(),
          prompt: undefined,
          provider: undefined,
          model: undefined,
          usage: undefined,
        });
      } catch (error) {
        console.error("Rewriting error:", error);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [subscribe, content]);

  useEffect(() => {
    setContent("");
  }, [resetSignal]);

  return (
    <AgentPanel
      title="Writer Agent"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      icon={<CreateIcon />}
      color={AGENT_COLOR}
      state={isLoading ? 'loading' : content ? 'done' : 'idle'}
      sx={props.sx}
      agentKey="WriterAgent"
    >
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CollapsibleText text={content || "Waiting for research..."} />
      )}
    </AgentPanel>
  );
}
