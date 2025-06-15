
import React from "react";
import { Paper, Typography } from "@mui/material";

export function AgentGraph() {
  return (
    <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
      <Typography variant="subtitle1">Agent Graph</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        (Future Enhancement) Visual representation of agent communication.
      </Typography>
    </Paper>
  );
}
