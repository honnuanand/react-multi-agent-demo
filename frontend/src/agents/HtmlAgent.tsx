import React, { useState } from 'react';
import { AgentPanel } from '../components/AgentPanel';
import { useAgentBus } from '../context/AgentBusContext';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { v4 as uuidv4 } from 'uuid';

export function HtmlAgent(props: { sx?: object }) {
  const { messages, emit } = useAgentBus();
  const [html, setHtml] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the latest article content from WriterAgent
  const latestDraft = messages
    .filter(m => m.sender === 'WriterAgent' && m.type === 'draft')
    .slice(-1)[0]?.content || '';

  const handleGenerate = async () => {
    setIsLoading(true);
    // Simulate LLM call (replace with actual LLM call logic)
    const prompt = `Convert the following article into a well-structured, semantic HTML document with modern styling:

1. Use proper HTML5 semantic tags (article, section, header, etc.)
2. Add appropriate heading hierarchy (h1, h2, h3, etc.)
3. Format lists properly (ul, ol, li)
4. Add CSS classes for styling
5. Include proper spacing and typography
6. Make it responsive and mobile-friendly
7. Add a clean, modern design

Here's the content to convert:

${latestDraft}`;

    // For now, just wrap in article with basic styling
    const generatedHtml = `
      <article class="modern-article">
        <style>
          .modern-article {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          .modern-article h1 {
            font-size: 2.5rem;
            color: #1976d2;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid #e3f2fd;
            padding-bottom: 0.5rem;
          }
          .modern-article h2 {
            font-size: 1.8rem;
            color: #0288d1;
            margin: 2rem 0 1rem;
          }
          .modern-article h3 {
            font-size: 1.4rem;
            color: #039be5;
            margin: 1.5rem 0 1rem;
          }
          .modern-article p {
            margin: 1rem 0;
          }
          .modern-article ul, .modern-article ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          .modern-article li {
            margin: 0.5rem 0;
          }
          .modern-article strong {
            color: #1976d2;
          }
          @media (max-width: 600px) {
            .modern-article {
              padding: 1rem;
            }
            .modern-article h1 {
              font-size: 2rem;
            }
            .modern-article h2 {
              font-size: 1.5rem;
            }
            .modern-article h3 {
              font-size: 1.2rem;
            }
          }
        </style>
        ${latestDraft.split('\n').map(line => {
          if (line.startsWith('### ')) {
            return `<h3>${line.replace('### ', '')}</h3>`;
          } else if (line.startsWith('## ')) {
            return `<h2>${line.replace('## ', '')}</h2>`;
          } else if (line.startsWith('# ')) {
            return `<h1>${line.replace('# ', '')}</h1>`;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            return `<li>${line.replace(/^[-*]\s*/, '')}</li>`;
          } else if (line.match(/^\d+\./)) {
            return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
          } else if (line.trim() === '') {
            return '<br>';
          } else {
            return `<p>${line}</p>`;
          }
        }).join('\n')}
      </article>
    `;
    setHtml(generatedHtml);
    emit("htmlReady", {
      id: uuidv4(),
      sender: "HtmlAgent",
      receiver: "User",
      type: "html",
      content: generatedHtml,
      timestamp: new Date().toISOString(),
      prompt: undefined,
      provider: undefined,
      model: undefined,
      usage: undefined,
    });
    setIsLoading(false);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AgentPanel
      title="HTML Agent"
      collapsed={false}
      setCollapsed={() => {}}
      icon={<CodeIcon />}
      color="#ff9800"
      state={html ? 'done' : isLoading ? 'loading' : 'idle'}
      sx={props.sx}
      agentKey="HtmlAgent"
    >
      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={isLoading || !latestDraft}
        sx={{ mb: 2 }}
        fullWidth
      >
        {isLoading ? 'Generating...' : 'Generate HTML'}
      </Button>
      {html && (
        <>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => setPreviewOpen(true)}
            sx={{ mr: 1, mb: 1 }}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ mb: 1 }}
          >
            Download HTML
          </Button>
          <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>HTML Preview</DialogTitle>
            <DialogContent>
              <div dangerouslySetInnerHTML={{ __html: html }} style={{ background: '#fafafa', padding: 16, borderRadius: 8 }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </AgentPanel>
  );
} 