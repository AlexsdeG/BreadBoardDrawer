import { useMemo } from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export default function PropertyPanel() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const nodes = useEditorStore((state) => state.nodes);
  const library = useEditorStore((state) => state.library);
  const updateNodeData = useEditorStore((state) => state.updateNodeData);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [nodes, selectedNodeId]);

  const componentDef = useMemo(() => {
    if (!selectedNode) return null;

    const componentId = selectedNode.data?.componentId as string | undefined;
    if (componentId) {
      return library.find((component) => component.id === componentId) ?? null;
    }

    return library.find(
      (component) => component.shapes === selectedNode.data?.shapes && component.pins === selectedNode.data?.pins,
    ) ?? null;
  }, [library, selectedNode]);

  const properties = componentDef?.properties ?? [];

  if (!selectedNode || properties.length === 0) return null;

  return (
    <aside className="absolute right-4 top-4 z-[1200] w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Properties</h3>
      <div className="space-y-3">
        {properties.map((prop) => {
          if (prop.type !== 'select') return null;

          const currentValue = selectedNode.data?.customValues?.[prop.id] ?? prop.default;

          return (
            <label key={prop.id} className="block text-sm text-gray-700">
              <span className="mb-1 block font-medium">{prop.label}</span>
              <select
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                value={String(currentValue ?? '')}
                onChange={(event) => updateNodeData(selectedNode.id, { [prop.id]: event.target.value })}
              >
                {(prop.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
