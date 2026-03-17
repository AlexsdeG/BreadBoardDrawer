import React from 'react';
import { Node } from 'reactflow';
import { useRef, useEffect } from 'react';
import { HardwareComponent, ComponentShape, ComponentPin } from '../../config/schemas';
import { PrimitiveNodeData, TextNodeData, PinNodeData } from './BuilderCanvas';

type Category = HardwareComponent['category'];
type SignalType = PinNodeData['signalType'];
type PrimitiveType = PrimitiveNodeData['primitiveType'];

const CATEGORIES: Category[] = ['passive', 'diode-led', 'ic', 'transistor', 'switch', 'power', 'microcontroller'];
const SIGNAL_TYPES: SignalType[] = ['default', 'digital', 'analog', 'pwm', 'power', '5v', '3v3', 'gnd'];
const PRIMITIVE_TYPES: PrimitiveType[] = ['rect', 'rounded-rect', 'circle', 'ellipse', 'triangle', 'diamond'];

const CLS = {
  label: 'block text-xs font-medium text-gray-600 mb-0.5',
  input: 'w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500',
  row2: 'grid grid-cols-2 gap-2',
};

function getNodeBounds(node: Node): { x1: number; y1: number; x2: number; y2: number } {
  const { x, y } = node.position;
  if (node.type === 'builderPin') return { x1: x, y1: y, x2: x + 24, y2: y + 32 };
  if (node.type === 'builderText') {
    const td = node.data as TextNodeData;
    return { x1: x, y1: y, x2: x + td.text.length * td.fontSize * 0.62, y2: y + td.fontSize * 1.5 };
  }
  const pd = node.data as PrimitiveNodeData;
  if (pd.primitiveType === 'circle') { const r = pd.r ?? 12; return { x1: x, y1: y, x2: x + r * 2, y2: y + r * 2 }; }
  if (pd.primitiveType === 'ellipse') { return { x1: x, y1: y, x2: x + (pd.rx ?? 24) * 2, y2: y + (pd.ry ?? 14) * 2 }; }
  return { x1: x, y1: y, x2: x + (pd.width ?? 40), y2: y + (pd.height ?? 20) };
}

// ─── Properties Panel ────────────────────────────────────────────────────────

interface PropertiesPanelProps {
  node: Node;
  onUpdate: (dataUpdates: Record<string, unknown>, position?: { x: number; y: number }) => void;
}

function PropertiesPanel({ node, onUpdate }: PropertiesPanelProps) {
  const [posX, setPosX] = React.useState(String(Math.round(node.position.x)));
  const [posY, setPosY] = React.useState(String(Math.round(node.position.y)));
  const prevId = useRef(node.id);

  useEffect(() => {
    // Sync position display when a different node is selected
    if (node.id !== prevId.current) {
      prevId.current = node.id;
      setPosX(String(Math.round(node.position.x)));
      setPosY(String(Math.round(node.position.y)));
    }
  }, [node.id, node.position.x, node.position.y]);

  const commitPos = () => {
    const x = parseFloat(posX), y = parseFloat(posY);
    if (!isNaN(x) && !isNaN(y)) onUpdate({}, { x, y });
  };

  const d = node.data as Record<string, unknown>;
  const type = node.type;

  return (
    <div className="space-y-3">
      {/* Position */}
      <div>
        <p className={CLS.label}>Position</p>
        <div className={CLS.row2}>
          <div>
            <span className="text-[10px] text-gray-400">X</span>
            <input type="number" className={CLS.input} value={posX}
              onChange={(e) => setPosX(e.target.value)} onBlur={commitPos}
              onKeyDown={(e) => e.key === 'Enter' && commitPos()} />
          </div>
          <div>
            <span className="text-[10px] text-gray-400">Y</span>
            <input type="number" className={CLS.input} value={posY}
              onChange={(e) => setPosY(e.target.value)} onBlur={commitPos}
              onKeyDown={(e) => e.key === 'Enter' && commitPos()} />
          </div>
        </div>
      </div>

      {/* Layer */}
      {type !== 'builderPin' && (
        <div>
          <p className={CLS.label}>Layer (z-order)</p>
          <input type="number" className={CLS.input} value={String(d.layer ?? 0)}
            onChange={(e) => onUpdate({ layer: parseInt(e.target.value) || 0 })} />
        </div>
      )}

      {/* Primitive shape fields */}
      {type === 'builderPrimitive' && (() => {
        const pd = d as PrimitiveNodeData;
        return (
          <>
            <div>
              <p className={CLS.label}>Shape Type</p>
              <select className={CLS.input} value={pd.primitiveType}
                onChange={(e) => onUpdate({ primitiveType: e.target.value as PrimitiveType })}>
                {PRIMITIVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Dimensions */}
            {(pd.primitiveType === 'rect' || pd.primitiveType === 'rounded-rect' || pd.primitiveType === 'triangle' || pd.primitiveType === 'diamond') && (
              <div>
                <p className={CLS.label}>Size</p>
                <div className={CLS.row2}>
                  <div>
                    <span className="text-[10px] text-gray-400">W</span>
                    <input type="number" min={1} className={CLS.input} value={String(pd.width ?? 40)}
                      onChange={(e) => onUpdate({ width: Math.max(1, parseInt(e.target.value) || 1) })} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">H</span>
                    <input type="number" min={1} className={CLS.input} value={String(pd.height ?? 20)}
                      onChange={(e) => onUpdate({ height: Math.max(1, parseInt(e.target.value) || 1) })} />
                  </div>
                </div>
              </div>
            )}
            {pd.primitiveType === 'rounded-rect' && (
              <div>
                <p className={CLS.label}>Corner Radius</p>
                <input type="number" min={0} className={CLS.input} value={String(pd.rx ?? 6)}
                  onChange={(e) => onUpdate({ rx: Math.max(0, parseInt(e.target.value) || 0) })} />
              </div>
            )}
            {pd.primitiveType === 'circle' && (
              <div>
                <p className={CLS.label}>Radius</p>
                <input type="number" min={1} className={CLS.input} value={String(pd.r ?? 12)}
                  onChange={(e) => onUpdate({ r: Math.max(1, parseInt(e.target.value) || 1) })} />
              </div>
            )}
            {pd.primitiveType === 'ellipse' && (
              <div>
                <p className={CLS.label}>Radii</p>
                <div className={CLS.row2}>
                  <div>
                    <span className="text-[10px] text-gray-400">rX</span>
                    <input type="number" min={1} className={CLS.input} value={String(pd.rx ?? 24)}
                      onChange={(e) => onUpdate({ rx: Math.max(1, parseInt(e.target.value) || 1) })} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">rY</span>
                    <input type="number" min={1} className={CLS.input} value={String(pd.ry ?? 14)}
                      onChange={(e) => onUpdate({ ry: Math.max(1, parseInt(e.target.value) || 1) })} />
                  </div>
                </div>
              </div>
            )}

            {/* Fill + Stroke */}
            <div>
              <p className={CLS.label}>Colors</p>
              <div className={CLS.row2}>
                <div>
                  <span className="text-[10px] text-gray-400">Fill</span>
                  <input type="color" className="w-full h-7 rounded border border-gray-300 cursor-pointer" value={pd.fill === 'transparent' ? '#ffffff' : pd.fill}
                    onChange={(e) => onUpdate({ fill: e.target.value })} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Stroke</span>
                  <input type="color" className="w-full h-7 rounded border border-gray-300 cursor-pointer" value={pd.stroke === 'none' ? '#000000' : pd.stroke}
                    onChange={(e) => onUpdate({ stroke: e.target.value })} />
                </div>
              </div>
            </div>
            <div>
              <p className={CLS.label}>Stroke Width</p>
              <input type="number" min={0} step={0.5} className={CLS.input} value={String(pd.strokeWidth)}
                onChange={(e) => onUpdate({ strokeWidth: Math.max(0, parseFloat(e.target.value) || 0) })} />
            </div>
          </>
        );
      })()}

      {/* Text node fields */}
      {type === 'builderText' && (() => {
        const td = d as TextNodeData;
        return (
          <>
            <div>
              <p className={CLS.label}>Text Content</p>
              <input className={CLS.input} value={td.text}
                onChange={(e) => onUpdate({ text: e.target.value })} />
            </div>
            <div className={CLS.row2}>
              <div>
                <p className={CLS.label}>Font Size</p>
                <input type="number" min={4} max={120} className={CLS.input} value={String(td.fontSize)}
                  onChange={(e) => onUpdate({ fontSize: Math.max(4, parseInt(e.target.value) || 12) })} />
              </div>
              <div>
                <p className={CLS.label}>Weight</p>
                <select className={CLS.input} value={td.fontWeight}
                  onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}>
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
            <div>
              <p className={CLS.label}>Color</p>
              <input type="color" className="w-full h-7 rounded border border-gray-300 cursor-pointer" value={td.fill}
                onChange={(e) => onUpdate({ fill: e.target.value })} />
            </div>
          </>
        );
      })()}

      {/* Pin node fields */}
      {type === 'builderPin' && (() => {
        const pd = d as PinNodeData;
        return (
          <>
            <div>
              <p className={CLS.label}>Pin ID</p>
              <input className={CLS.input} value={pd.pinId}
                onChange={(e) => onUpdate({ pinId: e.target.value.replace(/\s+/g, '-') || 'pin' })} />
            </div>
            <div>
              <p className={CLS.label}>Signal Type</p>
              <select className={CLS.input} value={pd.signalType}
                onChange={(e) => onUpdate({ signalType: e.target.value as SignalType })}>
                {SIGNAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ─── Shape Palette ────────────────────────────────────────────────────────────

interface PaletteButtonProps { label: string; onClick: () => void; accent?: boolean; }
function PaletteBtn({ label, onClick, accent }: PaletteButtonProps) {
  return (
    <button onClick={onClick}
      className={`rounded px-2 py-1.5 text-xs font-medium transition-colors text-left ${
        accent ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}>
      {label}
    </button>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export interface BuilderSidebarProps {
  library: HardwareComponent[];
  selectedLibraryComponentId: string | null;
  componentName: string;
  componentId: string;
  description: string;
  category: Category;
  onSelectComponent: (componentId: string) => void;
  onCreateNew: () => void;
  onComponentNameChange: (value: string) => void;
  onComponentIdChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  nodes: Node[];
  onAddPrimitive: (type: PrimitiveType) => void;
  onAddText: () => void;
  onAddPin: () => void;
  onUpdateNode: (id: string, dataUpdates: Record<string, unknown>, position?: { x: number; y: number }) => void;
  onDeleteSelected: () => void;
  onSave: (component: HardwareComponent) => void;
  onCancel: () => void;
}

export default function BuilderSidebar({
  library,
  selectedLibraryComponentId,
  componentName,
  componentId,
  description,
  category,
  onSelectComponent,
  onCreateNew,
  onComponentNameChange,
  onComponentIdChange,
  onDescriptionChange,
  onCategoryChange,
  nodes, onAddPrimitive, onAddText, onAddPin,
  onUpdateNode, onDeleteSelected, onSave, onCancel,
}: BuilderSidebarProps) {
  const selectedNodes = nodes.filter((n) => n.selected);
  const singleSelected = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const handleSave = () => {
    if (nodes.length === 0 || !componentId.trim() || !componentName.trim()) return;

    const allBounds = nodes.map(getNodeBounds);
    const minX = Math.min(...allBounds.map((b) => b.x1));
    const minY = Math.min(...allBounds.map((b) => b.y1));
    const maxX = Math.max(...allBounds.map((b) => b.x2));
    const maxY = Math.max(...allBounds.map((b) => b.y2));
    const totalW = maxX - minX;
    const totalH = maxY - minY;

    // Sort shape nodes by layer so z-order is respected in the rendered component
    const shapeNodes = nodes
      .filter((n) => n.type === 'builderPrimitive' || n.type === 'builderText')
      .sort((a, b) => ((a.data.layer as number) ?? 0) - ((b.data.layer as number) ?? 0));

    const shapes: ComponentShape[] = [
      { type: 'rect', x: 0, y: 0, width: totalW, height: totalH, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
    ];

    for (const node of shapeNodes) {
      const nx = node.position.x - minX;
      const ny = node.position.y - minY;

      if (node.type === 'builderText') {
        const td = node.data as TextNodeData;
        shapes.push({ type: 'text', x: nx, y: ny + td.fontSize, text: td.text, fontSize: td.fontSize, fontWeight: td.fontWeight, fill: td.fill });
        continue;
      }

      const pd = node.data as PrimitiveNodeData;
      const f = pd.fill, s = pd.stroke, sw = pd.strokeWidth;
      switch (pd.primitiveType) {
        case 'rect':         shapes.push({ type: 'rect', x: nx, y: ny, width: pd.width ?? 40, height: pd.height ?? 20, fill: f, stroke: s, strokeWidth: sw }); break;
        case 'rounded-rect': shapes.push({ type: 'rect', x: nx, y: ny, width: pd.width ?? 40, height: pd.height ?? 20, rx: pd.rx ?? 6, ry: pd.rx ?? 6, fill: f, stroke: s, strokeWidth: sw }); break;
        case 'circle': { const r = pd.r ?? 12; shapes.push({ type: 'circle', cx: nx + r, cy: ny + r, r, fill: f, stroke: s, strokeWidth: sw }); break; }
        case 'ellipse': { const rx = pd.rx ?? 24, ry = pd.ry ?? 14; shapes.push({ type: 'ellipse', cx: nx + rx, cy: ny + ry, rx, ry, fill: f, stroke: s, strokeWidth: sw }); break; }
        case 'triangle': { const w = pd.width ?? 40, h = pd.height ?? 30; shapes.push({ type: 'polygon', points: `${nx+w/2},${ny} ${nx+w},${ny+h} ${nx},${ny+h}`, fill: f, stroke: s, strokeWidth: sw }); break; }
        case 'diamond': { const w = pd.width ?? 40, h = pd.height ?? 30; shapes.push({ type: 'polygon', points: `${nx+w/2},${ny} ${nx+w},${ny+h/2} ${nx+w/2},${ny+h} ${nx},${ny+h/2}`, fill: f, stroke: s, strokeWidth: sw }); break; }
      }
    }

    const pins: ComponentPin[] = nodes
      .filter((n) => n.type === 'builderPin')
      .map((node) => {
        const pd = node.data as PinNodeData;
        return { id: pd.pinId, x: node.position.x - minX + 12, y: node.position.y - minY + 12, type: 'inout' as const, signalType: pd.signalType };
      });

    onSave({ id: componentId, name: componentName, category, shapes, pins });
  };

  const shapeCount = nodes.filter((n) => n.type === 'builderPrimitive' || n.type === 'builderText').length;
  const pinCount = nodes.filter((n) => n.type === 'builderPin').length;
  const canSave = nodes.length > 0 && componentId.trim().length > 0 && componentName.trim().length > 0;

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Component Builder</h2>
        <p className="text-[10px] text-gray-400 mt-0.5">Left-drag to pan · Shift+drag to select · Del to delete</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <section className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Load Component</p>
          <label className="block">
            <span className={CLS.label}>Existing Components</span>
            <select
              className={CLS.input}
              value={selectedLibraryComponentId ?? ''}
              onChange={(e) => e.target.value && onSelectComponent(e.target.value)}
            >
              <option value="">Select a component…</option>
              {library.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={onCreateNew}
            className="w-full rounded bg-emerald-50 px-3 py-2 text-left text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            + Create New Component
          </button>
        </section>

        {/* Metadata */}
        <section className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Component Info</p>
          <label className="block">
            <span className={CLS.label}>Name</span>
            <input className={CLS.input} value={componentName} onChange={(e) => onComponentNameChange(e.target.value)} />
          </label>
          <label className="block">
            <span className={CLS.label}>ID (unique)</span>
            <input className={CLS.input} value={componentId}
              onChange={(e) => onComponentIdChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} />
          </label>
          <label className="block">
            <span className={CLS.label}>Description</span>
            <textarea
              className={`${CLS.input} min-h-[70px] resize-y`}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Short description shown in the editor info card"
            />
          </label>
          <label className="block">
            <span className={CLS.label}>Category</span>
            <select className={CLS.input} value={category} onChange={(e) => onCategoryChange(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </section>

        {/* Shape palette */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Add Shapes</p>
          <div className="grid grid-cols-2 gap-1.5">
            <PaletteBtn label="▭ Rect"        onClick={() => onAddPrimitive('rect')} />
            <PaletteBtn label="▢ Round Rect"  onClick={() => onAddPrimitive('rounded-rect')} />
            <PaletteBtn label="○ Circle"      onClick={() => onAddPrimitive('circle')} />
            <PaletteBtn label="⬭ Oval"        onClick={() => onAddPrimitive('ellipse')} />
            <PaletteBtn label="△ Triangle"    onClick={() => onAddPrimitive('triangle')} />
            <PaletteBtn label="◇ Diamond"     onClick={() => onAddPrimitive('diamond')} />
            <PaletteBtn label="T Text"        onClick={onAddText} />
            <PaletteBtn label="⬤ Pin"         onClick={onAddPin} accent />
          </div>
        </section>

        {/* Divider or selection hint */}
        {selectedNodes.length === 0 && (
          <p className="text-[10px] text-gray-400 italic">Click a node to edit its properties.</p>
        )}

        {/* Multi-select actions */}
        {selectedNodes.length > 1 && (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Selection</p>
            <p className="text-xs text-gray-600 mb-2">{selectedNodes.length} nodes selected</p>
            <button onClick={onDeleteSelected}
              className="w-full rounded bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
              🗑 Delete Selected
            </button>
          </section>
        )}

        {/* Single node properties */}
        {singleSelected && (
          <section>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Properties</p>
              <button onClick={onDeleteSelected}
                className="text-[10px] text-red-500 hover:text-red-700 transition-colors">
                🗑 Delete
              </button>
            </div>
            <PropertiesPanel
              node={singleSelected}
              onUpdate={(dataUpdates, pos) => onUpdateNode(singleSelected.id, dataUpdates, pos)}
            />
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-200 space-y-2">
        <p className="text-[10px] text-gray-400">
          {shapeCount} shape{shapeCount !== 1 ? 's' : ''} · {pinCount} pin{pinCount !== 1 ? 's' : ''}
        </p>
        <button onClick={handleSave} disabled={!canSave}
          className="w-full rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
          Save Component
        </button>
        <button onClick={onCancel}
          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-center text-xs text-gray-700 transition-colors hover:bg-gray-50">
          ← Back to Editor
        </button>
      </div>
    </aside>
  );
}
