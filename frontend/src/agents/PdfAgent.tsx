import React, { useState } from 'react';
import { AgentPanel } from '../components/AgentPanel';
import { useAgentBus } from '../context/AgentBusContext';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import { v4 as uuidv4 } from 'uuid';

export function PdfAgent(props: { sx?: object }) {
  const { messages, emit } = useAgentBus();
  const [pdfContent, setPdfContent] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the latest article content from WriterAgent
  const latestDraft = messages
    .filter(m => m.sender === 'WriterAgent' && m.type === 'draft')
    .slice(-1)[0]?.content || '';

  const handleGenerate = async () => {
    setIsLoading(true);
    // Simulate LLM call (replace with actual LLM call logic)
    const prompt = `Transform the following article into a well-structured markdown document optimized for PDF output. Follow these guidelines:

1. Use proper markdown heading hierarchy (# for title, ## for sections, ### for subsections)
2. Add a brief executive summary at the beginning
3. Include a table of contents with proper markdown links
4. Format lists with proper markdown syntax (- for bullet points, 1. for numbered lists)
5. Use bold (**) and italic (*) for emphasis where appropriate
6. Add horizontal rules (---) between major sections
7. Include proper spacing between sections
8. Use blockquotes (>) for important quotes or highlights
9. Add a conclusion section at the end
10. Include a "Generated on [date]" footer

Here's the content to transform:

${latestDraft}`;

    // For now, just use the draft as the PDF content
    const generatedMarkdown = latestDraft;
    setPdfContent(generatedMarkdown);
    emit("pdfReady", {
      id: uuidv4(),
      sender: "PdfAgent",
      receiver: "User",
      type: "pdf",
      content: generatedMarkdown,
      timestamp: new Date().toISOString(),
      prompt: undefined,
      provider: undefined,
      model: undefined,
      usage: undefined,
    });
    setIsLoading(false);
  };

  const handleDownload = async () => {
    // Convert markdown to HTML
    const html = marked(pdfContent);
    
    // Create a styled HTML document
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            h1 {
              color: #1976d2;
              border-bottom: 2px solid #e3f2fd;
              padding-bottom: 0.5rem;
              margin-top: 2rem;
            }
            h2 {
              color: #0288d1;
              margin-top: 2rem;
            }
            h3 {
              color: #039be5;
            }
            ul, ol {
              padding-left: 2rem;
            }
            li {
              margin: 0.5rem 0;
            }
            blockquote {
              border-left: 4px solid #1976d2;
              margin: 1rem 0;
              padding: 0.5rem 1rem;
              background: #f5f5f5;
            }
            hr {
              border: none;
              border-top: 2px solid #e3f2fd;
              margin: 2rem 0;
            }
            .toc {
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 4px;
              margin: 1rem 0;
            }
            .footer {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #e3f2fd;
              color: #666;
              font-size: 0.9rem;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${html}
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;

    // Configure PDF options
    const opt = {
      margin: [20, 20, 20, 20],
      filename: 'article.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate and download PDF
    try {
      await html2pdf().set(opt).from(styledHtml).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <AgentPanel
      title="PDF Agent"
      collapsed={false}
      setCollapsed={() => {}}
      icon={<PictureAsPdfIcon />}
      color="#e53935"
      state={pdfContent ? 'done' : isLoading ? 'loading' : 'idle'}
      sx={props.sx}
      agentKey="PdfAgent"
    >
      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={isLoading || !latestDraft}
        sx={{ mb: 2 }}
        fullWidth
      >
        {isLoading ? 'Generating...' : 'Generate PDF'}
      </Button>
      {pdfContent && (
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
            Download PDF
          </Button>
          <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Markdown Preview</DialogTitle>
            <DialogContent>
              <pre style={{ 
                background: '#fafafa', 
                padding: 16, 
                borderRadius: 8, 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {pdfContent}
              </pre>
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