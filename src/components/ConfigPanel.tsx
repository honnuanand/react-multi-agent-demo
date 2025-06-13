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

export function ConfigPanel() {
  const { openaiApiKey, setOpenaiApiKey } = useConfig();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(openaiApiKey);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      initializeOpenAI(tempKey);
      setOpenaiApiKey(tempKey);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize OpenAI client');
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
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
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
          disabled={tempKey === openaiApiKey}
        >
          Save Configuration
        </Button>
      </Box>
    </Paper>
  );
}
