import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { useConfig } from '../context/ConfigContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { initializeOpenAI } from '../services/openai';
import { useErrorLog } from '../App';

export function ConfigPanel() {
  const { apiKey, setApiKey } = useConfig();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const logError = useErrorLog();

  const handleSave = () => {
    try {
      initializeOpenAI(tempKey);
      setApiKey(tempKey);
    } catch (err) {
      logError(err instanceof Error ? err.message : 'Failed to initialize OpenAI client');
    }
  };

  const handleToggleVisibility = () => {
    setShowKey(!showKey);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Configuration
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="OpenAI API Key"
          type={showKey ? 'text' : 'password'}
          value={tempKey}
          onChange={(e) => setTempKey(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleToggleVisibility}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={tempKey === apiKey}
        >
          Save Configuration
        </Button>
      </Box>
    </Paper>
  );
}
