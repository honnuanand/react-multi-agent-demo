import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const BUSINESS_PURPOSE = `
This system helps you write a detailed, high-quality article on any topic. Just enter your needs or topic in the Goal section, and our AI agents will plan, research, write, and review the article for you—automatically!`;

const INSTRUCTIONS = [
  'Enter your OpenAI API key in the Configuration box.',
  'Type your article topic or requirements in the Goal section (e.g., "How AI is transforming healthcare").',
  'Click "Generate Article Plan" to start the workflow.',
  'Watch as the Planner, Researcher, Writer, and Reviewer agents collaborate to create your article.',
  'See the timeline and flow graph update in real time.',
  'Use the Reset button to clear the workflow and start over.'
];

export function AppInfo() {
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
          Multi-Agent Collaboration Demo
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.dark' }}>
        🚀 Business Purpose
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, fontSize: 18, color: 'text.primary' }}>
        {BUSINESS_PURPOSE}
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <HelpOutlineIcon color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          How to Use
        </Typography>
      </Box>
      <List dense sx={{ pl: 2 }}>
        {INSTRUCTIONS.map((item, idx) => (
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
    </Paper>
  );
} 