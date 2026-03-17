import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, useReactFlow, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '../../store/useEditorStore';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import AdvancedEdge from './AdvancedEdge';
import Toolbar from '../UI/Toolbar';
import ComponentModal from '../UI/ComponentModal';

function getSignalTypeClass(signalType?: string) {
  switch (signalType) {
    case 'analog':
      return 'text-amber-600';
    case 'pwm':
      return 'text-violet-600';
    case 'digital':
      return 'text-blue-600';
    case 'power':
    case '5v':
    case '3v3':
      return 'text-red-600';
    case 'gnd':
    case 'grnd':
      return 'text-slate-700';
    default:
      return 'text-slate-500';
  }
}

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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, interactionMode, drawingState, addWaypoint, cancelDrawing, drawSettings, rotateNode, selectedNodeId, setSelectedNodeId, hoverInfo, library, setHoverInfo, hoverInfoLocked, setHoverInfoLocked, hoverSourceActive, setHoverSourceActive } = useEditorStore();
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
      if (e.key === 'Shift') {
        setHoverInfoLocked(true);
      }
      if (e.key === 'r' || e.key === 'R') {
        if (selectedNodeId) {
          rotateNode(selectedNodeId);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setHoverInfoLocked(false);
        if (!hoverSourceActive) {
          setHoverInfo(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [cancelDrawing, hoverSourceActive, rotateNode, selectedNodeId, setHoverInfo, setHoverInfoLocked]);

  const onEdgeClick = useCallback((e: React.MouseEvent, edge: any) => {
    useEditorStore.getState().setSelectedWaypoint(null);
  }, []);

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: { id: string }[]; edges: unknown[] }) => {
    setSelectedNodeId(selectedNodes.length === 1 ? selectedNodes[0].id : null);
  }, [setSelectedNodeId]);

  const onNodeMouseEnter = useCallback((_event: React.MouseEvent, node: any) => {
    setHoverSourceActive(true);
    const componentDef = library.find((component) => component.id === node.data?.componentId)
      ?? library.find((component) => component.shapes === node.data?.shapes && component.pins === node.data?.pins);

    const lines = (componentDef?.properties ?? [])
      .map((property) => {
        const value = node.data?.customValues?.[property.id] ?? property.default;
        if (value === undefined || value === null || value === '') return null;
        return `${property.label}: ${String(value)}`;
      })
      .filter(Boolean) as string[];

    const pins = (node.data?.pins ?? []).map((pin: any) => ({
      id: pin.id,
      signalType: pin.signalType,
      pinType: pin.type,
      connected: edges.some(
        (edge) =>
          (edge.source === node.id && edge.sourceHandle === pin.id) ||
          (edge.target === node.id && edge.targetHandle === pin.id),
      ),
    }));

    setHoverInfo({
      title: componentDef?.name ?? 'Component',
      subtitle: componentDef?.category ?? 'custom',
      description: componentDef?.description ?? `${componentDef?.name ?? 'This component'} component`,
      lines,
      pins,
    });
  }, [edges, library, setHoverInfo, setHoverSourceActive]);

  const onNodeMouseMove = useCallback((_event: React.MouseEvent, node: any) => {
    setHoverSourceActive(true);
    const componentDef = library.find((component) => component.id === node.data?.componentId)
      ?? library.find((component) => component.shapes === node.data?.shapes && component.pins === node.data?.pins);

    const lines = (componentDef?.properties ?? [])
      .map((property) => {
        const value = node.data?.customValues?.[property.id] ?? property.default;
        if (value === undefined || value === null || value === '') return null;
        return `${property.label}: ${String(value)}`;
      })
      .filter(Boolean) as string[];

    const pins = (node.data?.pins ?? []).map((pin: any) => ({
      id: pin.id,
      signalType: pin.signalType,
      pinType: pin.type,
      connected: edges.some(
        (edge) =>
          (edge.source === node.id && edge.sourceHandle === pin.id) ||
          (edge.target === node.id && edge.targetHandle === pin.id),
      ),
    }));

    setHoverInfo({
      title: componentDef?.name ?? 'Component',
      subtitle: componentDef?.category ?? 'custom',
      description: componentDef?.description ?? `${componentDef?.name ?? 'This component'} component`,
      lines,
      pins,
    });
  }, [edges, library, setHoverInfo, setHoverSourceActive]);

  const onNodeMouseLeave = useCallback(() => {
    setHoverSourceActive(false);
    if (!hoverInfoLocked) {
      setHoverInfo(null);
    }
  }, [hoverInfoLocked, setHoverInfo, setHoverSourceActive]);

  return (
    <div 
      className="w-full h-full bg-slate-50 relative" 
      ref={reactFlowWrapper}
      onPointerMove={onPointerMove}
    >
      <Toolbar />
      <ComponentModal />
      {hoverInfo ? (
        <div className={`${hoverInfoLocked ? 'pointer-events-auto' : 'pointer-events-none'} absolute right-4 top-4 z-[1600] w-[340px] max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm`}>
          <div className="text-sm font-semibold text-slate-800">{hoverInfo.title}</div>
          {hoverInfoLocked ? (
            <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-blue-500">Shift held • card pinned</div>
          ) : null}
          {hoverInfo.subtitle ? (
            <div className="mt-0.5 text-xs capitalize text-slate-500">{hoverInfo.subtitle}</div>
          ) : null}
          {hoverInfo.description ? (
            <div className="mt-2 text-xs leading-5 text-slate-600">{hoverInfo.description}</div>
          ) : null}
          {hoverInfo.lines?.length ? (
            <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-600">
              {hoverInfo.lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          ) : null}
          {hoverInfo.pins?.length ? (
            <div className="mt-3 border-t border-slate-100 pt-2">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Pins
              </div>
              <div className="grid max-h-52 grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto pr-1 text-xs">
                {hoverInfo.pins.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-700">{pin.id}</div>
                      <div className={`truncate capitalize ${getSignalTypeClass(pin.signalType)}`}>
                        {pin.signalType}
                      </div>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${pin.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                      <span>{pin.connected ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
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
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseMove={onNodeMouseMove}
        onNodeMouseLeave={onNodeMouseLeave}
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
