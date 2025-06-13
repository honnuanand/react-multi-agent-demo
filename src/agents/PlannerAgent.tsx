import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, CircularProgress, Box } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { callOpenAI, AGENT_PROMPTS, AgentMessage, initializeOpenAI } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';
import { useErrorLog } from '../App';
import { useConfig } from '../context/ConfigContext';

const AGENT_COLOR = '#1976d2'; // blue for Planner

export function PlannerAgent(props: { sx?: object }) {
  const [input, setInput] = useState("How AI is transforming healthcare");
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { emit } = useAgentBus();
  const { resetSignal } = useReset();
  const [plan, setPlan] = useState("");
  const logError = useErrorLog();
  const { llms } = useConfig();

  // Reset all state when reset signal changes
  useEffect(() => {
    setInput("How AI is transforming healthcare");
    setPlan("");
    setIsLoading(false);
    setCollapsed(false);
  }, [resetSignal]);

  const handlePlan = async () => {
    setIsLoading(true);
    try {
      // Initialize OpenAI client with the API key from config
      initializeOpenAI(llms.openai.apiKey);

      const messages: AgentMessage[] = [
        { role: 'system', content: AGENT_PROMPTS.planner },
        { role: 'user', content: input }
      ];

      // Emit LLM request event
      emit("llm_request", {
        sender: "PlannerAgent",
        receiver: "LLM",
        type: "llm_request",
        content: '',
        timestamp: new Date().toISOString(),
        prompt: messages,
      });

      const plan = await callOpenAI(messages);

      // Emit LLM response event
      emit("llm_response", {
        sender: "PlannerAgent",
        receiver: "LLM",
        type: "llm_response",
        content: plan,
        timestamp: new Date().toISOString(),
        prompt: messages,
      });
      
      setPlan(plan);
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
      // Log error to global error log panel
      logError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgentPanel title="Planner Agent" collapsed={collapsed} setCollapsed={setCollapsed} icon={<AssignmentIcon />} color={AGENT_COLOR} state={isLoading ? 'loading' : plan ? 'done' : 'idle'} sx={props.sx}>
      {!collapsed && (
        <>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your topic or requirements..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handlePlan}
            disabled={isLoading || !input.trim()}
            fullWidth
          >
            {isLoading ? <CircularProgress size={24} /> : "Generate Article Plan"}
          </Button>
          {plan && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Generated Plan:
              </Typography>
              <CollapsibleText text={plan} />
            </Box>
          )}
        </>
      )}
    </AgentPanel>
  );
}
