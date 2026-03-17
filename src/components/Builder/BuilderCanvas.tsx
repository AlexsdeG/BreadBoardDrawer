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
  primitiveType: 'rect' | 'rounded-rect' | 'circle' | 'ellipse' | 'triangle' | 'diamond';
  width?: number;
  height?: number;
  r?: number;
  rx?: number;
  ry?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  layer: number;
};

export type TextNodeData = {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fill: string;
  layer: number;
};

export type PinNodeData = {
  pinId: string;
  signalType: 'digital' | 'analog' | 'pwm' | 'power' | 'gnd' | 'default';
};

const SIGNAL_COLORS: Record<string, string> = {
  digital: '#3b82f6',
  analog: '#f59e0b',
  pwm: '#8b5cf6',
  power: '#ef4444',
  gnd: '#374151',
  default: '#6b7280',
};

function PrimitiveNode({ data, selected }: NodeProps<PrimitiveNodeData>) {
  const pd = data;
  let w: number, h: number;
  if (pd.primitiveType === 'circle') {
    const r = pd.r ?? 12;
    w = r * 2; h = r * 2;
  } else if (pd.primitiveType === 'ellipse') {
    w = (pd.rx ?? 24) * 2; h = (pd.ry ?? 14) * 2;
  } else {
    w = pd.width ?? 40; h = pd.height ?? 20;
  }

  const renderShape = () => {
    const f = pd.fill, s = pd.stroke, sw = pd.strokeWidth;
    switch (pd.primitiveType) {
      case 'rect':
        return <rect x={0} y={0} width={w} height={h} fill={f} stroke={s} strokeWidth={sw} />;
      case 'rounded-rect':
        return <rect x={0} y={0} width={w} height={h} rx={pd.rx ?? 6} ry={pd.rx ?? 6} fill={f} stroke={s} strokeWidth={sw} />;
      case 'circle': {
        const r = pd.r ?? 12;
        return <circle cx={r} cy={r} r={Math.max(1, r - sw / 2)} fill={f} stroke={s} strokeWidth={sw} />;
      }
      case 'ellipse': {
        const rx = pd.rx ?? 24, ry = pd.ry ?? 14;
        return <ellipse cx={rx} cy={ry} rx={Math.max(1, rx - sw / 2)} ry={Math.max(1, ry - sw / 2)} fill={f} stroke={s} strokeWidth={sw} />;
      }
      case 'triangle':
        return <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} fill={f} stroke={s} strokeWidth={sw} />;
      case 'diamond':
        return <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} fill={f} stroke={s} strokeWidth={sw} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: w, height: h, outline: selected ? '2px dashed #3b82f6' : 'none', outlineOffset: 2 }}>
      <svg width={w} height={h} style={{ display: 'block' }}>
        {renderShape()}
      </svg>
    </div>
  );
}

function TextNode({ data, selected }: NodeProps<TextNodeData>) {
  const estW = Math.max(30, data.text.length * data.fontSize * 0.62);
  const estH = data.fontSize * 1.5;
  return (
    <div style={{ minWidth: 30, outline: selected ? '2px dashed #3b82f6' : '1px dashed #d1d5db', outlineOffset: 2, padding: '0 2px' }}>
      <svg width={estW} height={estH} style={{ display: 'block', overflow: 'visible' }}>
        <text x={0} y={data.fontSize} fill={data.fill} fontSize={data.fontSize} fontWeight={data.fontWeight} fontFamily="sans-serif">
          {data.text}
        </text>
      </svg>
    </div>
  );
}

function PinNode({ data, selected }: NodeProps<PinNodeData>) {
  const color = SIGNAL_COLORS[data.signalType] ?? '#6b7280';
  return (
    <div style={{ width: 24, height: 32 }}>
      <svg width={24} height={24} style={{ display: 'block', outline: selected ? '2px dashed #3b82f6' : 'none' }}>
        <circle cx={12} cy={12} r={8} fill={color} stroke="#fff" strokeWidth={1.5} />
      </svg>
      <div style={{ fontSize: 8, textAlign: 'center', color: '#374151', fontFamily: 'monospace', whiteSpace: 'nowrap', lineHeight: 1 }}>
        {data.pinId}
      </div>
    </div>
  );
}

const nodeTypes = {
  builderPrimitive: PrimitiveNode,
  builderText: TextNode,
  builderPin: PinNode,
};

interface BuilderCanvasProps {
  nodes: Node[];
  onNodesChange: (nodes: Node[]) => void;
}

export default function BuilderCanvas({ nodes, onNodesChange }: BuilderCanvasProps) {
  const visualNodes = React.useMemo(
    () =>
      [...nodes]
        .map((node) => {
          const layer = node.type === 'builderPin' ? 10_000 : Number((node.data as { layer?: number })?.layer ?? 0);
          return {
            ...node,
            zIndex: layer,
            data: {
              ...node.data,
              layer,
            },
          };
        })
        .sort((a, b) => {
          const layerDiff = (a.zIndex ?? 0) - (b.zIndex ?? 0);
          if (layerDiff !== 0) return layerDiff;
          return a.id.localeCompare(b.id);
        }),
    [nodes],
  );

  const handleChange = (changes: NodeChange[]) => {
    onNodesChange(applyNodeChanges(changes, nodes));
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={visualNodes}
        edges={[]}
        onNodesChange={handleChange}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[10, 10]}
        deleteKeyCode="Delete"
        nodesConnectable={false}
        multiSelectionKeyCode="Shift"
        selectionOnDrag
        panOnDrag={[2]}
      >
        <Background variant={BackgroundVariant.Dots} gap={10} size={1} color="#d1d5db" />
      </ReactFlow>
    </div>
  );
}
