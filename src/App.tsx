import { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { useEditorStore } from './store/useEditorStore';
import EditorCanvas from './components/Canvas/EditorCanvas';
import PropertyPanel from './components/UI/PropertyPanel';
import BuilderCanvas from './components/Builder/BuilderCanvas';
import BuilderSidebar from './components/Builder/BuilderSidebar';
import { defaultParts } from './config/defaultParts';
import { ComponentShape, HardwareComponent } from './config/schemas';
import { PinNodeData, PrimitiveNodeData, TextNodeData } from './components/Builder/BuilderCanvas';

const BUILDER_EMPTY_COMPONENT: Pick<HardwareComponent, 'id' | 'name' | 'category'> = {
  id: 'my-component',
  name: 'My Component',
  category: 'passive',
};

function isTransparentBoundsRect(shape: ComponentShape) {
  return shape.type === 'rect' && shape.fill === 'transparent' && shape.stroke === 'none' && shape.strokeWidth === 0;
}

function parsePolygonPoints(points?: string) {
  if (!points) return [] as Array<{ x: number; y: number }>;
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number))
    .filter(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y))
    .map(([x, y]) => ({ x, y }));
}

function componentToBuilderNodes(component: HardwareComponent): Node[] {
  const builderNodes: Node[] = [];
  let layer = 0;

  component.shapes
    .filter((shape) => !isTransparentBoundsRect(shape))
    .forEach((shape, index) => {
      const commonId = `${component.id}-shape-${index}`;

      if (shape.type === 'text') {
        builderNodes.push({
          id: commonId,
          type: 'builderText',
          position: { x: shape.x ?? 0, y: (shape.y ?? 0) - (shape.fontSize ?? 12) },
          data: {
            text: shape.text ?? 'Label',
            fontSize: shape.fontSize ?? 12,
            fontWeight: (shape.fontWeight === 700 || shape.fontWeight === 'bold') ? 'bold' : 'normal',
            fill: shape.fill ?? '#111827',
            layer: layer++,
          } satisfies TextNodeData,
        });
        return;
      }

      if (shape.type === 'rect') {
        builderNodes.push({
          id: commonId,
          type: 'builderPrimitive',
          position: { x: shape.x ?? 0, y: shape.y ?? 0 },
          data: {
            primitiveType: shape.rx || shape.ry ? 'rounded-rect' : 'rect',
            width: shape.width ?? 40,
            height: shape.height ?? 20,
            rx: shape.rx,
            ry: shape.ry,
            fill: shape.fill ?? '#d6b37a',
            stroke: shape.stroke ?? '#6b4f2a',
            strokeWidth: shape.strokeWidth ?? 2,
            layer: layer++,
          } satisfies PrimitiveNodeData,
        });
        return;
      }

      if (shape.type === 'circle') {
        builderNodes.push({
          id: commonId,
          type: 'builderPrimitive',
          position: { x: (shape.cx ?? 0) - (shape.r ?? 0), y: (shape.cy ?? 0) - (shape.r ?? 0) },
          data: {
            primitiveType: 'circle',
            r: shape.r ?? 12,
            fill: shape.fill ?? '#d6b37a',
            stroke: shape.stroke ?? '#6b4f2a',
            strokeWidth: shape.strokeWidth ?? 2,
            layer: layer++,
          } satisfies PrimitiveNodeData,
        });
        return;
      }

      if (shape.type === 'ellipse') {
        builderNodes.push({
          id: commonId,
          type: 'builderPrimitive',
          position: { x: (shape.cx ?? 0) - (shape.rx ?? 0), y: (shape.cy ?? 0) - (shape.ry ?? 0) },
          data: {
            primitiveType: 'ellipse',
            rx: shape.rx ?? 24,
            ry: shape.ry ?? 14,
            fill: shape.fill ?? '#d6b37a',
            stroke: shape.stroke ?? '#6b4f2a',
            strokeWidth: shape.strokeWidth ?? 2,
            layer: layer++,
          } satisfies PrimitiveNodeData,
        });
        return;
      }

      if (shape.type === 'polygon') {
        const parsed = parsePolygonPoints(shape.points);
        if (parsed.length >= 3) {
          const xs = parsed.map((point) => point.x);
          const ys = parsed.map((point) => point.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const width = Math.max(...xs) - minX;
          const height = Math.max(...ys) - minY;
          builderNodes.push({
            id: commonId,
            type: 'builderPrimitive',
            position: { x: minX, y: minY },
            data: {
              primitiveType: parsed.length === 3 ? 'triangle' : 'diamond',
              width: width || 40,
              height: height || 30,
              fill: shape.fill ?? '#d6b37a',
              stroke: shape.stroke ?? '#6b4f2a',
              strokeWidth: shape.strokeWidth ?? 2,
              layer: layer++,
            } satisfies PrimitiveNodeData,
          });
        }
      }
    });

  component.pins.forEach((pin, index) => {
    builderNodes.push({
      id: `${component.id}-pin-${index}`,
      type: 'builderPin',
      position: { x: pin.x - 12, y: pin.y - 12 },
      data: {
        pinId: pin.id,
        signalType: pin.signalType,
      } satisfies PinNodeData,
    });
  });

  return builderNodes;
}

export default function App() {
  const addNode = useEditorStore((state) => state.addNode);
  const nodes = useEditorStore((state) => state.nodes);
  const appMode = useEditorStore((state) => state.appMode);
  const setAppMode = useEditorStore((state) => state.setAppMode);
  const addToLibrary = useEditorStore((state) => state.addToLibrary);
  const library = useEditorStore((state) => state.library);

  const [builderNodes, setBuilderNodes] = useState<Node[]>([]);
  const [builderComponentName, setBuilderComponentName] = useState(BUILDER_EMPTY_COMPONENT.name);
  const [builderComponentId, setBuilderComponentId] = useState(BUILDER_EMPTY_COMPONENT.id);
  const [builderCategory, setBuilderCategory] = useState(BUILDER_EMPTY_COMPONENT.category);
  const [selectedBuilderComponentId, setSelectedBuilderComponentId] = useState<string | null>(null);

  useEffect(() => {
    const defaultComponent = defaultParts.find((component) => component.id === 'arduino-uno') ?? defaultParts[0];

    if (nodes.length === 0 && defaultComponent) {
      addNode({
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          componentId: defaultComponent.id,
          shapes: defaultComponent.shapes,
          pins: defaultComponent.pins,
        }
      });
    }
  }, [addNode, nodes.length]);

  const handleAddPrimitive = (type: PrimitiveNodeData['primitiveType']) => {
    setBuilderNodes((prev) => {
      const offset = (prev.length % 8) * 20;
      const defaults: Omit<PrimitiveNodeData, 'primitiveType' | 'layer'> = { fill: '#d6b37a', stroke: '#6b4f2a', strokeWidth: 2 };
      const extra: Partial<PrimitiveNodeData> =
        type === 'circle'      ? { r: 14 }
        : type === 'ellipse'   ? { rx: 24, ry: 14 }
        : type === 'rounded-rect' ? { width: 50, height: 26, rx: 8 }
        : type === 'triangle'  ? { width: 40, height: 34, fill: '#60a5fa', stroke: '#1d4ed8' }
        : type === 'diamond'   ? { width: 36, height: 36, fill: '#a78bfa', stroke: '#5b21b6' }
        : { width: 50, height: 24 };
      return [
        ...prev,
        {
          id: `builder-${type}-${Date.now()}`,
          type: 'builderPrimitive',
          position: { x: 80 + offset, y: 80 + offset },
          data: { ...defaults, ...extra, primitiveType: type, layer: prev.filter(n => n.type === 'builderPrimitive').length },
        },
      ];
    });
  };

  const handleAddText = () => {
    setBuilderNodes((prev) => [
      ...prev,
      {
        id: `builder-text-${Date.now()}`,
        type: 'builderText',
        position: { x: 80 + (prev.length % 8) * 20, y: 60 },
        data: { text: 'Label', fontSize: 12, fontWeight: 'normal' as const, fill: '#111827', layer: prev.filter(n => n.type !== 'builderPin').length },
      },
    ]);
  };

  const handleAddPin = () => {
    setBuilderNodes((prev) => {
      const pinIndex = prev.filter((n) => n.type === 'builderPin').length + 1;
      return [
        ...prev,
        {
          id: `builder-pin-${Date.now()}`,
          type: 'builderPin',
          position: { x: 60 + (prev.length % 8) * 20, y: 50 },
          data: { pinId: `pin${pinIndex}`, signalType: 'default' as const },
        },
      ];
    });
  };

  const handleUpdateBuilderNode = (id: string, dataUpdates: Record<string, unknown>, position?: { x: number; y: number }) => {
    setBuilderNodes((prev) =>
      prev.map((n) =>
        n.id !== id ? n : {
          ...n,
          ...(position ? { position } : {}),
          data: { ...n.data, ...dataUpdates },
        }
      )
    );
  };

  const handleDeleteSelectedBuilderNodes = () => {
    setBuilderNodes((prev) => prev.filter((n) => !n.selected));
  };

  const handleCreateNewBuilderComponent = () => {
    setSelectedBuilderComponentId(null);
    setBuilderComponentName(BUILDER_EMPTY_COMPONENT.name);
    setBuilderComponentId(BUILDER_EMPTY_COMPONENT.id);
    setBuilderCategory(BUILDER_EMPTY_COMPONENT.category);
    setBuilderNodes([]);
  };

  const handleLoadBuilderComponent = (componentId: string) => {
    const component = library.find((item) => item.id === componentId);
    if (!component) return;

    setSelectedBuilderComponentId(component.id);
    setBuilderComponentName(component.name);
    setBuilderComponentId(component.id);
    setBuilderCategory(component.category);
    setBuilderNodes(componentToBuilderNodes(component));
  };

  const handleSaveComponent = (component: HardwareComponent) => {
    addToLibrary(component);
    setSelectedBuilderComponentId(component.id);
    setBuilderNodes([]);
    setAppMode('editor');
  };

  if (appMode === 'builder') {
    return (
      <div className="w-screen h-screen flex">
        <BuilderSidebar
          library={library}
          selectedLibraryComponentId={selectedBuilderComponentId}
          componentName={builderComponentName}
          componentId={builderComponentId}
          category={builderCategory}
          onSelectComponent={handleLoadBuilderComponent}
          onCreateNew={handleCreateNewBuilderComponent}
          onComponentNameChange={setBuilderComponentName}
          onComponentIdChange={setBuilderComponentId}
          onCategoryChange={setBuilderCategory}
          nodes={builderNodes}
          onAddPrimitive={handleAddPrimitive}
          onAddText={handleAddText}
          onAddPin={handleAddPin}
          onUpdateNode={handleUpdateBuilderNode}
          onDeleteSelected={handleDeleteSelectedBuilderNodes}
          onSave={handleSaveComponent}
          onCancel={() => setAppMode('editor')}
        />
        <div className="flex-1 h-full">
          <BuilderCanvas nodes={builderNodes} onNodesChange={setBuilderNodes} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex relative">
      <div className="flex-1">
        <EditorCanvas />
      </div>
      <PropertyPanel />
      <button
        onClick={() => setAppMode('builder')}
        className="absolute bottom-4 left-4 z-[1200] rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-gray-700"
      >
        Component Builder
      </button>
    </div>
  );
}
