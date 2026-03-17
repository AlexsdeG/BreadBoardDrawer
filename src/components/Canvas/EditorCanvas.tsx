import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, useReactFlow, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '../../store/useEditorStore';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import AdvancedEdge from './AdvancedEdge';
import Toolbar from '../UI/Toolbar';
import ComponentModal from '../UI/ComponentModal';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
  advancedEdge: AdvancedEdge,
};

function DrawingOverlay({ mousePos }: { mousePos: { x: number, y: number } | null }) {
  const drawingState = useEditorStore(state => state.drawingState);
  const drawSettings = useEditorStore(state => state.drawSettings);
  const { getViewport } = useReactFlow();
  const { x, y, zoom } = getViewport();

  if (!drawingState.isDrawing || !drawingState.sourcePos || !mousePos) return null;

  const pts = [drawingState.sourcePos, ...drawingState.waypoints, mousePos];
  
  let path = `M ${pts[0].x} ${pts[0].y} `;
  for (let i = 1; i < pts.length; i++) {
    if (drawSettings.orthogonal) {
      path += `L ${pts[i].x} ${pts[i-1].y} L ${pts[i].x} ${pts[i].y} `;
    } else {
      path += `L ${pts[i].x} ${pts[i].y} `;
    }
  }

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,5" />
        {drawingState.waypoints.map((wp, i) => (
          <circle key={i} cx={wp.x} cy={wp.y} r={4} fill="#3b82f6" />
        ))}
      </g>
    </svg>
  );
}

function EditorCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, interactionMode, drawingState, addWaypoint, cancelDrawing, drawSettings, rotateNode, selectedNodeId, setSelectedNodeId } = useEditorStore();
  const { screenToFlowPosition } = useReactFlow();
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);

  const onPaneClick = useCallback((e: React.MouseEvent) => {
    if (drawingState.isDrawing) {
      let pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addWaypoint(pos);
    } else {
      useEditorStore.getState().setSelectedWaypoint(null);
    }
  }, [drawingState.isDrawing, addWaypoint, screenToFlowPosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (drawingState.isDrawing) {
      let pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      if (drawSettings.snapToGrid) {
        pos.x = Math.round(pos.x / 20) * 20;
        pos.y = Math.round(pos.y / 20) * 20;
      }
      setMousePos(pos);
    }
  }, [drawingState.isDrawing, screenToFlowPosition, drawSettings.snapToGrid]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelDrawing();
      if (e.key === 'r' || e.key === 'R') {
        if (selectedNodeId) {
          rotateNode(selectedNodeId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelDrawing, rotateNode, selectedNodeId]);

  const onEdgeClick = useCallback((e: React.MouseEvent, edge: any) => {
    useEditorStore.getState().setSelectedWaypoint(null);
  }, []);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: { id: string }[]; edges: unknown[] }) => {
    setSelectedNodeId(selectedNodes.length === 1 ? selectedNodes[0].id : null);
  }, [setSelectedNodeId]);

  return (
    <div 
      className="w-full h-full bg-slate-50 relative" 
      ref={reactFlowWrapper}
      onPointerMove={onPointerMove}
    >
      <Toolbar />
      <ComponentModal />
      <DrawingOverlay mousePos={mousePos} />
      <ReactFlow
        className={`editor-flow mode-${interactionMode}`}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        onSelectionChange={onSelectionChange}
        defaultEdgeOptions={{ type: 'advancedEdge' }}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={interactionMode === 'draw'}
        nodesConnectable={interactionMode === 'draw'}
        elementsSelectable={interactionMode === 'draw'}
        selectionOnDrag={interactionMode === 'draw'}
        snapToGrid={drawSettings.snapToGrid}
        snapGrid={[20, 20]}
        fitView
      >
        <Background gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default function EditorCanvas() {
  return (
    <ReactFlowProvider>
      <EditorCanvasInner />
    </ReactFlowProvider>
  );
}
