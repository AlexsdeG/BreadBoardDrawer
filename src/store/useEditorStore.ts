import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { HardwareComponent } from '../config/schemas';
import { defaultParts } from '../config/defaultParts';

export type InteractionMode = 'select' | 'draw';

export interface DrawSettings {
  snapToGrid: boolean;
  orthogonal: boolean;
  snapToRotate: boolean;
}

export interface DrawingState {
  isDrawing: boolean;
  sourceNodeId: string | null;
  sourceHandleId: string | null;
  sourcePos: { x: number, y: number } | null;
  waypoints: { x: number, y: number }[];
}

export interface EditorState {
  nodes: Node[];
  edges: Edge[];
  library: HardwareComponent[];

  appMode: 'editor' | 'builder';
  setAppMode: (mode: 'editor' | 'builder') => void;
  
  isComponentModalOpen: boolean;
  setComponentModalOpen: (isOpen: boolean) => void;
  
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  
  drawSettings: DrawSettings;
  setDrawSettings: (settings: Partial<DrawSettings>) => void;
  
  drawingState: DrawingState;
  startDrawing: (nodeId: string, handleId: string, pos: { x: number, y: number }) => void;
  addWaypoint: (pos: { x: number, y: number }) => void;
  finishDrawing: (targetNodeId: string, targetHandleId: string) => void;
  cancelDrawing: () => void;
  
  selectedWaypoint: { edgeId: string, index: number } | null;
  setSelectedWaypoint: (waypoint: { edgeId: string, index: number } | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
  
  updateEdgeData: (edgeId: string, data: any) => void;
  updateNodeData: (nodeId: string, customValues: Record<string, any>) => void;

  getCanvasState: () => { nodes: Node[], edges: Edge[] };
  loadCanvasState: (state: { nodes: Node[], edges: Edge[] }) => void;

  addNode: (node: Node) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  rotateNode: (id: string, direction?: 'left' | 'right') => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addToLibrary: (component: HardwareComponent) => void;
}

function loadCustomComponents(): HardwareComponent[] {
  try {
    const stored = localStorage.getItem('customComponents');
    return stored ? (JSON.parse(stored) as HardwareComponent[]) : [];
  } catch {
    return [];
  }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  library: [...defaultParts, ...loadCustomComponents().filter((c) => !defaultParts.some((d) => d.id === c.id))],

  appMode: 'editor',
  setAppMode: (mode) => set({ appMode: mode }),
  
  isComponentModalOpen: false,
  setComponentModalOpen: (isOpen) => set({ isComponentModalOpen: isOpen }),
  
  interactionMode: 'select',
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  
  drawSettings: {
    snapToGrid: true,
    orthogonal: false,
    snapToRotate: true,
  },
  setDrawSettings: (settings) => set({ drawSettings: { ...get().drawSettings, ...settings } }),
  
  drawingState: {
    isDrawing: false,
    sourceNodeId: null,
    sourceHandleId: null,
    sourcePos: null,
    waypoints: [],
  },
  startDrawing: (nodeId, handleId, pos) => set({
    drawingState: { isDrawing: true, sourceNodeId: nodeId, sourceHandleId: handleId, sourcePos: pos, waypoints: [] }
  }),
  addWaypoint: (pos) => {
    const { drawingState, drawSettings } = get();
    if (!drawingState.isDrawing) return;
    
    let newPos = { ...pos };
    if (drawSettings.snapToGrid) {
      newPos.x = Math.round(newPos.x / 20) * 20;
      newPos.y = Math.round(newPos.y / 20) * 20;
    }
    
    set({
      drawingState: { ...drawingState, waypoints: [...drawingState.waypoints, newPos] }
    });
  },
  finishDrawing: (targetNodeId, targetHandleId) => {
    const { drawingState, drawSettings, edges } = get();
    if (!drawingState.sourceNodeId || !drawingState.sourceHandleId) return;
    if (drawingState.sourceNodeId === targetNodeId) return; // Prevent self-connection
    
    const newEdge = {
      id: `e${drawingState.sourceNodeId}-${targetNodeId}-${Date.now()}`,
      source: drawingState.sourceNodeId,
      sourceHandle: drawingState.sourceHandleId,
      target: targetNodeId,
      targetHandle: targetHandleId,
      type: 'advancedEdge',
      data: {
        waypoints: drawingState.waypoints,
        orthogonal: drawSettings.orthogonal,
      },
    };
    
    set({
      edges: [...edges, newEdge],
      drawingState: { isDrawing: false, sourceNodeId: null, sourceHandleId: null, sourcePos: null, waypoints: [] }
    });
  },
  cancelDrawing: () => set({
    drawingState: { isDrawing: false, sourceNodeId: null, sourceHandleId: null, sourcePos: null, waypoints: [] }
  }),
  
  selectedWaypoint: null,
  setSelectedWaypoint: (waypoint) => set({ selectedWaypoint: waypoint }),
  selectedNodeId: null,
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  
  updateEdgeData: (edgeId, data) => set({
    edges: get().edges.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, ...data } } : e)
  }),
  updateNodeData: (nodeId, customValues) => set({
    nodes: get().nodes.map((n) =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, customValues: { ...n.data?.customValues, ...customValues } } }
        : n
    ),
  }),

  getCanvasState: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  loadCanvasState: (state) => set({
    nodes: state.nodes || [],
    edges: state.edges || [],
    selectedNodeId: null,
    selectedWaypoint: null,
    drawingState: { isDrawing: false, sourceNodeId: null, sourceHandleId: null, sourcePos: null, waypoints: [] }
  }),

  addNode: (node: Node) => set({ nodes: [...get().nodes, node] }),
  updateNodePosition: (id: string, position: { x: number; y: number }) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, position } : n
      ),
    }),
  rotateNode: (id: string, direction: 'left' | 'right' = 'right') =>
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === id) {
          const step = get().drawSettings.snapToRotate ? 90 : 15;
          const delta = direction === 'left' ? -step : step;
          const currentRotation = n.data.rotation || 0;
          const nextRotation = ((currentRotation + delta) % 360 + 360) % 360;
          return { ...n, data: { ...n.data, rotation: nextRotation } };
        }
        return n;
      }),
    }),
  onNodesChange: (changes: NodeChange[]) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    }),
  onEdgesChange: (changes: EdgeChange[]) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
    }),
  addToLibrary: (component) => {
    let updated: HardwareComponent[] = [component];
    try {
      const stored = localStorage.getItem('customComponents');
      const existing: HardwareComponent[] = stored ? (JSON.parse(stored) as HardwareComponent[]) : [];
      updated = [...existing.filter((c) => c.id !== component.id), component];
      localStorage.setItem('customComponents', JSON.stringify(updated));
    } catch { /* ignore persistence failure */ }
    set({
      library: [
        ...defaultParts,
        ...updated.filter((c) => !defaultParts.some((d) => d.id === c.id)),
      ],
    });
  },
  onConnect: (connection: Connection) => {
    const { drawSettings } = get();
    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}-${Date.now()}`,
      type: 'advancedEdge',
      data: {
        waypoints: [],
        orthogonal: drawSettings.orthogonal,
      },
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },
}));
