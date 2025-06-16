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
  // Find the last review message from Reviewer to Writer
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.sender === 'ReviewerAgent' && msg.receiver === 'WriterAgent' && msg.type === 'review') {
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

export function AgentFlowGraph({ advancedMode = false }: { advancedMode?: boolean }) {
  const { messages, activeAgent } = useAgentBus();
  const { resetSignal } = useReset();

  // Show all messages in the flow, not just the last 5
  const allMessages = useMemo(() => {
    if (resetSignal > 0) return [];
    return messages;
  }, [messages, resetSignal]);
  const isWriterLoading = useMemo(() => getWriterLoading(messages), [messages]);

  // Always include HtmlAgent and PdfAgent nodes in advanced mode
  const nodes = useMemo(() => {
    if (!advancedMode) return agentNodes.slice(0, 4).map((n) => ({
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
    // In advanced mode, always include all 6 nodes
    return agentNodes.map((n) => ({
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
  }, [advancedMode, activeAgent]);

  // Create edges based on message flow
  const edges = useMemo(() => {
    const edgeMap = new Map<string, any>();
    
    allMessages.forEach((msg, idx) => {
      // Skip LLM messages
      if (msg.type === 'llm_request' || msg.type === 'llm_response') return;
      
      // Skip HtmlAgent and PdfAgent messages unless in advanced mode
      if (!advancedMode && (msg.receiver === 'HtmlAgent' || msg.receiver === 'PdfAgent')) return;
      
      const edgeId = `${msg.sender}-${msg.receiver}`;
      const isReviewEdge = msg.sender === 'ReviewerAgent' && msg.receiver === 'WriterAgent' && msg.type === 'review';
      const isLast = idx === allMessages.length - 1;
      
      edgeMap.set(edgeId, {
        id: edgeId,
        source: msg.sender,
        target: msg.receiver,
        animated: isReviewEdge && isLast && isWriterLoading,
        style: { 
          stroke: isReviewEdge ? '#1976d2' : '#bbb', 
          strokeWidth: 2, 
          strokeDasharray: isReviewEdge && isLast && isWriterLoading ? '6 4' : 'none' 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isReviewEdge ? '#1976d2' : '#bbb',
        },
        label: msg.type,
        labelBgPadding: [6, 2] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#fff', color: '#1976d2', fillOpacity: 0.8 },
      });
    });
    
    return Array.from(edgeMap.values());
  }, [allMessages, advancedMode, isWriterLoading]);

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