import React, { useEffect, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import SearchIcon from "@mui/icons-material/Search";
import { callOpenAI, AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';

const AGENT_COLOR = '#0288d1'; // cyan for Researcher

export function ResearchAgent(props: { sx?: object }) {
  const [task, setTask] = useState("");
  const [research, setResearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { emit, subscribe } = useAgentBus();
  const { resetSignal } = useReset();

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
        emit("llm_request", {
          sender: "ResearchAgent",
          receiver: "LLM",
          type: "llm_request",
          content: '',
          timestamp: new Date().toISOString(),
          prompt: messages,
        });

        const researchResults = await callOpenAI(messages);
        setResearch(researchResults);
        
        // Emit LLM response event
        emit("llm_response", {
          sender: "ResearchAgent",
          receiver: "LLM",
          type: "llm_response",
          content: researchResults,
          timestamp: new Date().toISOString(),
          prompt: messages,
        });

        emit("researchReady", {
          sender: "ResearchAgent",
          receiver: "WriterAgent",
          type: "research",
          content: researchResults,
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
  }, [subscribe, emit]);

  useEffect(() => {
    setTask("");
    setResearch("");
  }, [resetSignal]);

  return (
    <AgentPanel title="Research Agent" collapsed={collapsed} setCollapsed={setCollapsed} icon={<SearchIcon />} color={AGENT_COLOR} state={isLoading ? 'loading' : research ? 'done' : 'idle'} sx={props.sx}>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CollapsibleText text={research || "Waiting for task..."} />
      )}
    </AgentPanel>
  );
}
