import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export function AppInfo() {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h1">
          Multi-Agent Collaboration Demo
        </Typography>
      </Box>
      <Typography variant="body1" mb={2}>
        This app demonstrates a collaborative workflow between multiple AI agents (Planner, Researcher, Writer, Reviewer) using message-based communication. Each agent performs a specialized role, passing information and tasks to the next agent in the flow. The app visualizes the process and allows you to interact with and reset the system.
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <HelpOutlineIcon color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          How to Use
        </Typography>
      </Box>
      <List dense>
        <ListItem>
          <ListItemText primary="1. Enter your OpenAI API key in the Configuration box." />
        </ListItem>
        <ListItem>
          <ListItemText primary="2. Select a workflow tier from the navigation drawer (left sidebar)." />
        </ListItem>
        <ListItem>
          <ListItemText primary="3. The Planner agent will break down the task, the Researcher will gather information, the Writer will generate content, and the Reviewer will provide feedback." />
        </ListItem>
        <ListItem>
          <ListItemText primary="4. Watch the timeline and flow graph update as agents communicate." />
        </ListItem>
        <ListItem>
          <ListItemText primary="5. Use the Reset button to clear the workflow and start over." />
        </ListItem>
      </List>
    </Paper>
  );
} 