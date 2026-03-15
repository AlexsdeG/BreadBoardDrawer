import { useEffect } from 'react';
import { useEditorStore } from './store/useEditorStore';
import EditorCanvas from './components/Canvas/EditorCanvas';
import { defaultParts } from './config/defaultParts';

export default function App() {
  const addNode = useEditorStore((state) => state.addNode);
  const nodes = useEditorStore((state) => state.nodes);

  useEffect(() => {
    const defaultComponent = defaultParts.find((component) => component.id === 'arduino-uno') ?? defaultParts[0];

    if (nodes.length === 0 && defaultComponent) {
      addNode({
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          shapes: defaultComponent.shapes,
          pins: defaultComponent.pins,
        }
      });
    }
  }, [addNode, nodes.length]);

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-1">
        <EditorCanvas />
      </div>
    </div>
  );
}
