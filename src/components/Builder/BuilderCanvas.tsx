import React from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Node,
  NodeProps,
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

export type PrimitiveNodeData = {
  primitiveType: 'rect' | 'circle';
  width?: number;
  height?: number;
  r?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

export type PinNodeData = {
  pinId: string;
  signalType: 'digital' | 'analog' | 'pwm' | 'power' | 'gnd' | 'default';
};

function PrimitiveNode({ data, selected }: NodeProps<PrimitiveNodeData>) {
  const r = data.r ?? 10;
  const w = data.primitiveType === 'circle' ? r * 2 : (data.width ?? 40);
  const h = data.primitiveType === 'circle' ? r * 2 : (data.height ?? 20);

  return (
    <div
      style={{
        width: w,
        height: h,
        outline: selected ? '2px dashed #3b82f6' : 'none',
        outlineOffset: '2px',
      }}
    >
      <svg width={w} height={h} style={{ display: 'block' }}>
        {data.primitiveType === 'rect' ? (
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill={data.fill}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
          />
        ) : (
          <circle
            cx={r}
            cy={r}
            r={Math.max(1, r - data.strokeWidth)}
            fill={data.fill}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
          />
        )}
      </svg>
    </div>
  );
}

function PinNode({ data, selected }: NodeProps<PinNodeData>) {
  return (
    <div style={{ width: 20, height: 28 }}>
      <svg
        width={20}
        height={20}
        style={{ display: 'block', outline: selected ? '2px dashed #3b82f6' : 'none' }}
      >
        <circle cx={10} cy={10} r={7} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={1.5} />
      </svg>
      <div
        style={{
          fontSize: 8,
          textAlign: 'center',
          color: '#374151',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        {data.pinId}
      </div>
    </div>
  );
}

const nodeTypes = {
  builderPrimitive: PrimitiveNode,
  builderPin: PinNode,
};

interface BuilderCanvasProps {
  nodes: Node[];
  onNodesChange: (nodes: Node[]) => void;
}

export default function BuilderCanvas({ nodes, onNodesChange }: BuilderCanvasProps) {
  const handleChange = (changes: NodeChange[]) => {
    onNodesChange(applyNodeChanges(changes, nodes));
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={handleChange}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[10, 10]}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        deleteKeyCode="Delete"
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={10} size={1} color="#d1d5db" />
      </ReactFlow>
    </div>
  );
}
