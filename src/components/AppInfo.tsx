import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slide } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<InfoOutlinedIcon />}
        sx={{ mb: 2, fontWeight: 600, borderRadius: 2 }}
        onClick={() => setOpen(true)}
      >
        What does this app do?
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={props => <Slide {...props} direction='down' />}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: 24 }}>
          <InfoOutlinedIcon color="primary" />
          Multi-Agent Collaboration Demo
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
            🚀 Business Purpose
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            {BUSINESS_PURPOSE}
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <HelpOutlineIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              How to Use
            </Typography>
          </Box>
          <List dense>
            {INSTRUCTIONS.map((item, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={`${idx + 1}. ${item}`} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained" color="primary" sx={{ borderRadius: 2 }}>
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 