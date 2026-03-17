import React, { useState } from 'react';
import { Node } from 'reactflow';
import { HardwareComponent, ComponentShape, ComponentPin } from '../../config/schemas';
import { PrimitiveNodeData, PinNodeData } from './BuilderCanvas';

type Category = HardwareComponent['category'];

const CATEGORIES: Category[] = [
  'passive',
  'diode-led',
  'ic',
  'transistor',
  'switch',
  'power',
  'microcontroller',
];

function getNodeBounds(node: Node): { x1: number; y1: number; x2: number; y2: number } {
  const { x, y } = node.position;
  if (node.type === 'builderPin') {
    return { x1: x, y1: y, x2: x + 20, y2: y + 20 };
  }
  const pd = node.data as PrimitiveNodeData;
  if (pd.primitiveType === 'circle') {
    const r = pd.r ?? 10;
    return { x1: x, y1: y, x2: x + r * 2, y2: y + r * 2 };
  }
  return { x1: x, y1: y, x2: x + (pd.width ?? 40), y2: y + (pd.height ?? 20) };
}

interface BuilderSidebarProps {
  nodes: Node[];
  onAddRect: () => void;
  onAddCircle: () => void;
  onAddPin: () => void;
  onSave: (component: HardwareComponent) => void;
  onCancel: () => void;
}

export default function BuilderSidebar({
  nodes,
  onAddRect,
  onAddCircle,
  onAddPin,
  onSave,
  onCancel,
}: BuilderSidebarProps) {
  const [name, setName] = useState('My Component');
  const [componentId, setComponentId] = useState('my-component');
  const [category, setCategory] = useState<Category>('passive');

  const handleSave = () => {
    if (nodes.length === 0 || !componentId.trim() || !name.trim()) return;

    const allBounds = nodes.map(getNodeBounds);
    const minX = Math.min(...allBounds.map((b) => b.x1));
    const minY = Math.min(...allBounds.map((b) => b.y1));
    const maxX = Math.max(...allBounds.map((b) => b.x2));
    const maxY = Math.max(...allBounds.map((b) => b.y2));
    const totalW = maxX - minX;
    const totalH = maxY - minY;

    // Transparent bounding rect as the first shape (provides a click/selection hit area)
    const shapes: ComponentShape[] = [
      { type: 'rect', x: 0, y: 0, width: totalW, height: totalH, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
    ];

    for (const node of nodes) {
      if (node.type !== 'builderPrimitive') continue;
      const pd = node.data as PrimitiveNodeData;
      const nx = node.position.x - minX;
      const ny = node.position.y - minY;

      if (pd.primitiveType === 'rect') {
        shapes.push({
          type: 'rect',
          x: nx,
          y: ny,
          width: pd.width ?? 40,
          height: pd.height ?? 20,
          fill: pd.fill,
          stroke: pd.stroke,
          strokeWidth: pd.strokeWidth,
        });
      } else {
        const r = pd.r ?? 10;
        shapes.push({
          type: 'circle',
          cx: nx + r,
          cy: ny + r,
          r,
          fill: pd.fill,
          stroke: pd.stroke,
          strokeWidth: pd.strokeWidth,
        });
      }
    }

    const pins: ComponentPin[] = nodes
      .filter((n) => n.type === 'builderPin')
      .map((node) => {
        const pd = node.data as PinNodeData;
        return {
          id: pd.pinId,
          x: node.position.x - minX + 10,
          y: node.position.y - minY + 10,
          type: 'inout' as const,
          signalType: pd.signalType,
        };
      });

    onSave({ id: componentId, name, category, shapes, pins });
  };

  const shapeCount = nodes.filter((n) => n.type === 'builderPrimitive').length;
  const pinCount = nodes.filter((n) => n.type === 'builderPin').length;
  const canSave = nodes.length > 0 && componentId.trim().length > 0 && name.trim().length > 0;

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col p-4 gap-4 overflow-y-auto shrink-0">
      <h2 className="text-base font-semibold text-gray-800">Component Builder</h2>

      <div className="space-y-2">
        <label className="block text-sm text-gray-700">
          <span className="mb-1 block font-medium">Name</span>
          <input
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm text-gray-700">
          <span className="mb-1 block font-medium">ID (unique)</span>
          <input
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={componentId}
            onChange={(e) =>
              setComponentId(
                e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, ''),
              )
            }
          />
        </label>
        <label className="block text-sm text-gray-700">
          <span className="mb-1 block font-medium">Category</span>
          <select
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add Shapes</p>
        <button
          onClick={onAddRect}
          className="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          + Add Rect
        </button>
        <button
          onClick={onAddCircle}
          className="w-full rounded bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          + Add Circle
        </button>
        <button
          onClick={onAddPin}
          className="w-full rounded bg-blue-50 px-3 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100"
        >
          + Add Pin
        </button>
      </div>

      <p className="text-xs text-gray-400">
        {shapeCount} shape{shapeCount !== 1 ? 's' : ''} · {pinCount} pin{pinCount !== 1 ? 's' : ''}
        <br />
        Select a node and press Delete to remove it.
      </p>

      <div className="mt-auto space-y-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Save Component
        </button>
        <button
          onClick={onCancel}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          ← Back to Editor
        </button>
      </div>
    </aside>
  );
}
