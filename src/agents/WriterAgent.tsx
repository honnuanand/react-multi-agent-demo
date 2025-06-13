import React, { useEffect, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import CreateIcon from "@mui/icons-material/Create";
import { callOpenAI, AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';

// Color and state indicator for future UI enhancements
const AGENT_COLOR = '#7b1fa2'; // purple for Writer

export function WriterAgent(props: { sx?: object }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { emit, subscribe } = useAgentBus();
  const { resetSignal } = useReset();

  // Listen for researchReady to write initial content
  useEffect(() => {
    const unsub = subscribe("researchReady", async (msg) => {
      setIsLoading(true);
      try {
        const messages: AgentMessage[] = [
          { role: 'system', content: AGENT_PROMPTS.writer },
          { role: 'user', content: `Create content based on this research: ${msg.content}` }
        ];
        const generatedContent = await callOpenAI(messages);
        setContent(generatedContent);
        emit("draftReady", {
          sender: "WriterAgent",
          receiver: "ReviewerAgent",
          type: "draft",
          content: generatedContent,
          timestamp: new Date().toISOString()
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
        const revisedContent = await callOpenAI(messages);
        setContent(revisedContent);
        emit("rewriteComplete", {
          sender: "WriterAgent",
          receiver: "ReviewerAgent",
          type: "draft",
          content: revisedContent,
          timestamp: new Date().toISOString()
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
    <AgentPanel title="Writer Agent" collapsed={collapsed} setCollapsed={setCollapsed} icon={<CreateIcon />} color={AGENT_COLOR} state={isLoading ? 'loading' : content ? 'done' : 'idle'} sx={props.sx}>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CollapsibleText text={content || "Waiting for research..."} />
      )}
    </AgentPanel>
  );
}
