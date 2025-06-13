import React, { useEffect, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { callOpenAI, AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';

const AGENT_COLOR = '#43a047'; // green for Reviewer

export function ReviewerAgent(props: { sx?: object }) {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { emit, subscribe } = useAgentBus();
  const { resetSignal } = useReset();

  useEffect(() => {
    const unsub = subscribe("draftReady", async (msg) => {
      setIsLoading(true);
      try {
        const messages: AgentMessage[] = [
          { role: 'system', content: AGENT_PROMPTS.reviewer },
          { role: 'user', content: `Review this content: ${msg.content}` }
        ];

        const reviewFeedback = await callOpenAI(messages);
        setFeedback(reviewFeedback);
        
        emit("reviewComplete", {
          sender: "ReviewerAgent",
          receiver: "WriterAgent",
          type: "feedback",
          content: reviewFeedback,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Review error:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [subscribe, emit]);

  useEffect(() => {
    setFeedback("");
  }, [resetSignal]);

  return (
    <AgentPanel title="Reviewer Agent" collapsed={collapsed} setCollapsed={setCollapsed} icon={<RateReviewIcon />} color={AGENT_COLOR} state={isLoading ? 'loading' : feedback ? 'done' : 'idle'} sx={props.sx}>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CollapsibleText text={feedback || "Waiting for content to review..."} />
      )}
    </AgentPanel>
  );
}
