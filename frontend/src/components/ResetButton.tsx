import React from "react";
import { Button } from "@mui/material";
import { useReset } from "../context/ResetContext";

export function ResetButton() {
  const { triggerReset } = useReset();
  return (
    <Button variant="contained" color="secondary" onClick={triggerReset} sx={{ mt: 2, mb: 2 }}>
      Reset All Agent States
    </Button>
  );
} 