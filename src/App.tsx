import { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { useEditorStore } from './store/useEditorStore';
import EditorCanvas from './components/Canvas/EditorCanvas';
import PropertyPanel from './components/UI/PropertyPanel';
import BuilderCanvas from './components/Builder/BuilderCanvas';
import BuilderSidebar from './components/Builder/BuilderSidebar';
import { defaultParts } from './config/defaultParts';
import { HardwareComponent } from './config/schemas';

export default function App() {
  const addNode = useEditorStore((state) => state.addNode);
  const nodes = useEditorStore((state) => state.nodes);
  const appMode = useEditorStore((state) => state.appMode);
  const setAppMode = useEditorStore((state) => state.setAppMode);
  const addToLibrary = useEditorStore((state) => state.addToLibrary);

  const [builderNodes, setBuilderNodes] = useState<Node[]>([]);

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

  const handleAddRect = () => {
    setBuilderNodes((prev) => [
      ...prev,
      {
        id: `builder-rect-${Date.now()}`,
        type: 'builderPrimitive',
        position: { x: 80 + prev.length * 15, y: 80 },
        data: { primitiveType: 'rect', width: 40, height: 20, fill: '#d6b37a', stroke: '#6b4f2a', strokeWidth: 2 },
      },
    ]);
  };

  const handleAddCircle = () => {
    setBuilderNodes((prev) => [
      ...prev,
      {
        id: `builder-circle-${Date.now()}`,
        type: 'builderPrimitive',
        position: { x: 100 + prev.length * 15, y: 80 },
        data: { primitiveType: 'circle', r: 12, fill: '#ef4444', stroke: '#991b1b', strokeWidth: 2 },
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
          position: { x: 60 + prev.length * 15, y: 50 },
          data: { pinId: `pin${pinIndex}`, signalType: 'default' as const },
        },
      ];
    });
  };

  const handleSaveComponent = (component: HardwareComponent) => {
    addToLibrary(component);
    setBuilderNodes([]);
    setAppMode('editor');
  };

  if (appMode === 'builder') {
    return (
      <div className="w-screen h-screen flex">
        <BuilderSidebar
          nodes={builderNodes}
          onAddRect={handleAddRect}
          onAddCircle={handleAddCircle}
          onAddPin={handleAddPin}
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
