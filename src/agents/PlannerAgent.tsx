import React, { useState } from "react";
import { TextField, Button, Typography, CircularProgress } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { callOpenAI, AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';

const AGENT_COLOR = '#1976d2'; // blue for Planner

export function PlannerAgent() {
  const [input, setInput] = useState("Build a product demo");
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { emit } = useAgentBus();
  const { resetSignal } = useReset();
  const [plan, setPlan] = useState("");

  const handlePlan = async () => {
    setIsLoading(true);
    try {
      const messages: AgentMessage[] = [
        { role: 'system', content: AGENT_PROMPTS.planner },
        { role: 'user', content: input }
      ];

      const plan = await callOpenAI(messages);
      
      const message = {
        sender: "PlannerAgent",
        receiver: "ResearchAgent",
        type: "task",
        content: plan,
        timestamp: new Date().toISOString()
      };
      
      emit("planReady", message);
    } catch (error) {
      console.error("Planning error:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    setInput("Build a product demo");
  }, [resetSignal]);

  return (
    <AgentPanel title="Planner Agent" collapsed={collapsed} setCollapsed={setCollapsed} icon={<AssignmentIcon />} color={AGENT_COLOR} state={isLoading ? 'loading' : plan ? 'done' : 'idle'}>
      <TextField
        label="Goal"
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button 
        variant="contained" 
        fullWidth 
        onClick={handlePlan}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : "Create Plan"}
      </Button>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CollapsibleText text={plan || "Waiting for goal..."} />
      )}
    </AgentPanel>
  );
}
