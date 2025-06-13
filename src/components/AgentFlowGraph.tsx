import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useAgentBus } from '../context/AgentBusContext';
import type { Message } from '../context/AgentBusContext';
import { useReset } from '../context/ResetContext';

const agentNodes = [
  { id: 'PlannerAgent', label: 'Planner', position: { x: 0, y: 0 } },
  { id: 'ResearchAgent', label: 'Researcher', position: { x: 300, y: 0 } },
  { id: 'WriterAgent', label: 'Writer', position: { x: 0, y: 200 } },
  { id: 'ReviewerAgent', label: 'Reviewer', position: { x: 300, y: 200 } },
  { id: 'HtmlAgent', label: 'HTML', position: { x: 0, y: 400 } },
  { id: 'PdfAgent', label: 'PDF', position: { x: 300, y: 400 } }
];

// Helper to get WriterAgent state from the message log
function getWriterLoading(messages: Message[]) {
  // Find the last feedback message from Reviewer to Writer
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.sender === 'ReviewerAgent' && msg.receiver === 'WriterAgent' && msg.type === 'feedback') {
      // If there is no newer message from Writer to Reviewer, Writer is loading
      for (let j = i + 1; j < messages.length; j++) {
        if (messages[j].sender === 'WriterAgent' && messages[j].receiver === 'ReviewerAgent') {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}

export function AgentFlowGraph() {
  const { messages, activeAgent } = useAgentBus();
  const { resetSignal } = useReset();

  // Only show the last 5 message flows for clarity, reset to empty on resetSignal
  const recentMessages = useMemo(() => {
    if (resetSignal > 0) return [];
    return messages.slice(-5);
  }, [messages, resetSignal]);
  const isWriterLoading = useMemo(() => getWriterLoading(messages), [messages]);

  // Only show HtmlAgent and PdfAgent in advanced mode
  // Assume a prop or context: advancedMode (boolean)
  // For now, show all nodes if messages include htmlReady or pdfReady
  const hasHtml = messages.some(m => m.sender === 'HtmlAgent');
  const hasPdf = messages.some(m => m.sender === 'PdfAgent');
  const showAdvanced = hasHtml || hasPdf || true; // TODO: replace with real advanced mode check

  const nodes = (showAdvanced ? agentNodes : agentNodes.slice(0, 4)).map((n) => ({
    id: n.id,
    data: { label: n.label },
    position: n.position,
    style: {
      border: n.id === activeAgent ? '3px solid #1976d2' : '1px solid #bbb',
      background: n.id === activeAgent ? '#e3f2fd' : '#fff',
      borderRadius: 8,
      width: 120,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: 16,
    },
  }));

  // Determine if the WriterAgent has produced a draft
  const writerDone = messages.some(
    m => m.sender === 'WriterAgent' && m.type === 'draft'
  );

  let edges = recentMessages.map((msg, idx) => {
    const isFeedbackEdge = msg.sender === 'ReviewerAgent' && msg.receiver === 'WriterAgent';
    const isLast = idx === recentMessages.length - 1;
    return {
      id: `e${msg.sender}-${msg.receiver}-${idx}`,
      source: msg.sender,
      target: msg.receiver,
      animated: isFeedbackEdge && isLast && isWriterLoading,
      style: { stroke: isFeedbackEdge ? '#1976d2' : '#bbb', strokeWidth: 2, strokeDasharray: isFeedbackEdge && isLast && isWriterLoading ? '6 4' : 'none' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isFeedbackEdge ? '#1976d2' : '#bbb',
      },
      label: msg.type,
      labelBgPadding: [6, 2] as [number, number],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#fff', color: '#1976d2', fillOpacity: 0.8 },
    };
  });

  if (showAdvanced) {
    edges = [
      ...edges,
      ...(writerDone ? [
        {
          id: 'eWriter-Html',
          source: 'WriterAgent',
          target: 'HtmlAgent',
          animated: true,
          style: { stroke: '#43a047', strokeWidth: 2, strokeDasharray: '4 2' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#43a047' },
          label: 'content',
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#fff', color: '#43a047', fillOpacity: 0.8 },
        },
        {
          id: 'eWriter-Pdf',
          source: 'WriterAgent',
          target: 'PdfAgent',
          animated: true,
          style: { stroke: '#e53935', strokeWidth: 2, strokeDasharray: '4 2' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#e53935' },
          label: 'content',
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#fff', color: '#e53935', fillOpacity: 0.8 },
        }
      ] : [])
    ];
  }

  return (
    <div style={{ width: '100%', height: 320, margin: '32px 0' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <MiniMap />
        <Controls showInteractive={false} />
        <Background gap={16} color="#eee" />
      </ReactFlow>
    </div>
  );
} 