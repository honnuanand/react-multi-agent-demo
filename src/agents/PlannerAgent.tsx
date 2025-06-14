import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, CircularProgress, Box } from "@mui/material";
import { useAgentBus } from "../context/AgentBusContext";
import { useReset } from "../context/ResetContext";
import { AgentPanel } from "../components/AgentPanel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { callLLM } from '../services/llm';
import { AGENT_PROMPTS, AgentMessage } from "../services/openai";
import { CollapsibleText } from '../components/CollapsibleText';
import { useErrorLog } from '../context/ErrorLogContext';
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
  const { llms, agentLLMs, setGlobalLLMProvider } = useConfig();

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
      const messages: AgentMessage[] = [
        { role: 'system', content: AGENT_PROMPTS.planner },
        { role: 'user', content: input }
      ];
      // Use the global provider for all agents in single LLM mode
      const validProviders = ['openai', 'anthropic', 'databricks'] as const;
      const provider: typeof validProviders[number] = validProviders.includes(agentLLMs.PlannerAgent as any)
        ? (agentLLMs.PlannerAgent as typeof validProviders[number])
        : 'openai';
      // console.log('PlannerAgent LLM provider:', provider);

      // Emit LLM request event
      emit("llm_request", {
        sender: "PlannerAgent",
        receiver: "LLM",
        type: "llm_request",
        content: '',
        timestamp: new Date().toISOString(),
        prompt: messages,
        provider,
        model: llms[provider].model || '',
      });

      const response = await callLLM({
        provider,
        messages: messages,
        model: llms[provider].model || '',
        apiUrl: llms[provider].apiUrl || '',
      });

      const plan = response.content;

      // Emit LLM response event
      const usageRaw = response.usage as any;
      const usage = usageRaw
        ? {
            prompt_tokens: usageRaw.prompt_tokens ?? usageRaw.promptTokens,
            completion_tokens: usageRaw.completion_tokens ?? usageRaw.completionTokens,
            total_tokens: usageRaw.total_tokens ?? usageRaw.totalTokens,
            input_tokens: usageRaw.input_tokens,
            output_tokens: usageRaw.output_tokens,
          }
        : undefined;
      emit("llm_response", {
        sender: "PlannerAgent",
        receiver: "LLM",
        type: "llm_response",
        content: plan,
        timestamp: new Date().toISOString(),
        prompt: messages,
        provider,
        model: llms[provider].model || '',
        usage,
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
    <AgentPanel
      title="Planner Agent"
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      icon={<AssignmentIcon />}
      color={AGENT_COLOR}
      state={isLoading ? 'loading' : plan ? 'done' : 'idle'}
      sx={props.sx}
      agentKey="PlannerAgent"
    >
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
