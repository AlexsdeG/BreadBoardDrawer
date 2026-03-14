import { useEffect } from 'react';
import { useEditorStore } from './store/useEditorStore';
import EditorCanvas from './components/Canvas/EditorCanvas';

export default function App() {
  const addNode = useEditorStore((state) => state.addNode);
  const nodes = useEditorStore((state) => state.nodes);

  useEffect(() => {
    if (nodes.length === 0) {
      addNode({
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          shapes: [
            { type: 'rect', x: 0, y: 0, width: 60, height: 40, fill: 'white', stroke: 'black', strokeWidth: 2 }
          ],
          pins: [
            { id: 'p1', x: -5, y: 20, type: 'input' },
            { id: 'p2', x: 65, y: 20, type: 'output' }
          ]
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
