import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';

interface CollapsibleTextProps {
  text: string;
  previewLength?: number;
}

export function CollapsibleText({ text, previewLength = 200 }: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > previewLength;
  const preview = isLong ? text.slice(0, previewLength) + '...' : text;

  return (
    <>
      <Typography variant="body2" whiteSpace="pre-line">
        {expanded || !isLong ? text : preview}
      </Typography>
      {isLong && (
        <Button size="small" onClick={() => setExpanded(e => !e)} sx={{ mt: 1 }}>
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </>
  );
} 