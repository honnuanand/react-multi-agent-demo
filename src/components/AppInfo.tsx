import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Single LLM Mode Content
const SINGLE_LLM_PURPOSE_1 = `This system helps you write a detailed, high-quality article on any topic. Just enter your needs or topic in the Goal section, and our AI agents will plan, research, write, and review the article for you—automatically!`;
const SINGLE_LLM_PURPOSE_2 = `This demo showcases a true multi-agent system: each agent (Planner, Researcher, Writer, Reviewer) is a real, independent process connected to a large language model (LLM). Agents communicate and coordinate by sending messages through a shared event bus, just like in modern distributed AI architectures.`;

const SINGLE_LLM_INSTRUCTIONS = [
  'Enter your OpenAI API key in the Configuration panel.',
  'Type your article topic or requirements in the Goal section (e.g., "How AI is transforming healthcare").',
  'Click "Generate Article Plan" to start the workflow.',
  'Watch as the agents collaborate in real-time, with their LLM interactions visible in the right panel.',
  'Use the Reset button to clear the workflow and start over.'
];

const SINGLE_LLM_FEATURES = [
  { label: 'Multi-Agent System', description: 'Four specialized agents working together to create content' },
  { label: 'Real-time Flow', description: 'Visualize agent interactions and message flow in real-time' },
  { label: 'LLM Monitoring', description: 'View all LLM prompts and responses in the right panel' },
  { label: 'Error Logging', description: 'Global error logging for easy debugging and monitoring' }
];

// Multi-LLM Mode Content
const MULTI_LLM_PURPOSE_1 = `This advanced mode allows you to leverage multiple LLM providers simultaneously. Each agent can use a different LLM (OpenAI, Anthropic, Databricks) with its own API key and model, enabling you to combine the strengths of different AI systems.`;
const MULTI_LLM_PURPOSE_2 = `The system maintains the same collaborative workflow but with enhanced flexibility: choose the best LLM for each task. For example, use Claude for research, GPT-4 for planning, and DBRX for writing. All interactions are still visible in real-time through the message bus and visualization tools.`;

const MULTI_LLM_INSTRUCTIONS = [
  'Configure your LLM providers in the Configuration panel (OpenAI, Anthropic, Databricks).',
  'Assign different LLMs to each agent based on their strengths.',
  'Type your article topic or requirements in the Goal section.',
  'Click "Generate Article Plan" to start the workflow.',
  'Monitor LLM interactions in the right panel to see which provider is being used.',
  'Use the Reset button to clear the workflow and start over.',
  'Optional: Generate HTML and PDF outputs using the respective agents.'
];

const MULTI_LLM_FEATURES = [
  { label: 'Multi-LLM Support', description: 'Use different LLM providers with per-agent configuration' },
  { label: 'Provider Flexibility', description: 'Mix and match OpenAI, Anthropic, and Databricks models' },
  { label: 'Real-time Monitoring', description: 'Track which LLM is being used by each agent' },
  { label: 'HTML/PDF Output', description: 'Generate formatted HTML and PDF outputs' },
  { label: 'Advanced Debugging', description: 'Detailed error logging and LLM interaction tracking' }
];

interface AppInfoProps {
  mode: 'single' | 'multi';
}

export function AppInfo({ mode }: AppInfoProps) {
  const isMultiLLM = mode === 'multi';
  
  const purpose1 = isMultiLLM ? MULTI_LLM_PURPOSE_1 : SINGLE_LLM_PURPOSE_1;
  const purpose2 = isMultiLLM ? MULTI_LLM_PURPOSE_2 : SINGLE_LLM_PURPOSE_2;
  const instructions = isMultiLLM ? MULTI_LLM_INSTRUCTIONS : SINGLE_LLM_INSTRUCTIONS;
  const features = isMultiLLM ? MULTI_LLM_FEATURES : SINGLE_LLM_FEATURES;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mb: 4,
        background: 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)',
        borderRadius: 3,
        boxShadow: '0 4px 24px 0 #1976d233',
        position: 'relative',
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <InfoOutlinedIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {isMultiLLM ? 'Multi-LLM Agent Flow' : 'Single LLM Agent'}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.dark' }}>
        🚀 Business Purpose
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, fontSize: 18, color: 'text.primary' }}>
        {purpose1}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, fontSize: 18, color: 'text.primary' }}>
        {purpose2}
      </Typography>

      <Box display="flex" alignItems="center" mb={1}>
        <HelpOutlineIcon color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>
      </Box>

      <List dense sx={{ pl: 2 }}>
        {instructions.map((item, idx) => (
          <ListItem key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip
              label={idx + 1}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, mr: 2, fontSize: 16 }}
            />
            <ArrowForwardIosIcon sx={{ fontSize: 16, color: 'primary.light', mr: 1 }} />
            <ListItemText
              primary={item}
              primaryTypographyProps={{ sx: { fontSize: 16, color: 'text.secondary', fontWeight: 500 } }}
            />
          </ListItem>
        ))}
      </List>

      <Box display="flex" alignItems="center" mb={1} mt={3}>
        <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Key Features
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {features.map((feature, index) => (
          <Chip
            key={index}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {feature.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {feature.description}
                </Typography>
              </Box>
            }
            sx={{
              height: 'auto',
              minWidth: 200,
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              border: '1px solid rgba(25, 118, 210, 0.12)',
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                padding: '8px 12px'
              }
            }}
          />
        ))}
      </Box>
    </Paper>
  );
} 