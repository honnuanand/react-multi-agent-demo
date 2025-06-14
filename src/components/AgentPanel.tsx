import React, { ReactNode } from "react";
import { Paper, Typography, IconButton, Collapse, Box, TextField, MenuItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useConfig, LLMProvider } from '../context/ConfigContext';

const STATE_COLORS: Record<string, string> = {
  idle: '#bdbdbd',
  loading: '#1976d2',
  done: '#43a047',
  error: '#e53935',
};

export function AgentPanel({ title, collapsed, setCollapsed, children, icon, color = '#1976d2', state = 'idle', sx, agentKey }: {
  title: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  children: ReactNode;
  icon: ReactNode;
  color?: string;
  state?: 'idle' | 'loading' | 'done' | 'error' | string;
  sx?: object;
  agentKey: string;
}) {
  const { configuredLLMs, agentLLMs, setAgentLLM } = useConfig();
  const PROVIDERS: { key: LLMProvider; label: string }[] = [
    { key: 'openai', label: 'OpenAI' },
    { key: 'anthropic', label: 'Anthropic' },
    { key: 'databricks', label: 'Databricks' },
  ];
  const configuredProviderKeys = Object.entries(configuredLLMs).filter(([k, v]) => v).map(([k]) => k as LLMProvider);
  const configuredProviders = PROVIDERS.filter(p => configuredProviderKeys.includes(p.key));
  const agentValue = configuredProviderKeys.includes(agentLLMs[agentKey as keyof typeof agentLLMs])
    ? agentLLMs[agentKey as keyof typeof agentLLMs]
    : '';

  return (
    <Paper elevation={3} sx={{ width: 350, p: 2, borderTop: `6px solid ${color}`, ...sx }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setCollapsed(!collapsed)}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: STATE_COLORS[state] || STATE_COLORS.idle,
            border: '2px solid #fff',
            marginRight: 6,
          }} />
          <Typography variant="h6">
            {icon} {title}
          </Typography>
        </Box>
        <IconButton size="small">
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      <Collapse in={!collapsed}>
        <Box mt={2}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
}
