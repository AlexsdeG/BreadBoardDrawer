import React from 'react';
import { useReactFlow } from 'reactflow';
import { useEditorStore } from '../../store/useEditorStore';
import { HardwareComponent } from '../../config/schemas';
import { X } from 'lucide-react';

export default function ComponentModal() {
  const { isComponentModalOpen, setComponentModalOpen, library, addNode } = useEditorStore();
  const { screenToFlowPosition } = useReactFlow();

  if (!isComponentModalOpen) return null;

  const handleAddComponent = (component: HardwareComponent) => {
    // Calculate the center of the screen
    const centerPos = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode = {
      id: `${component.id}-${Date.now()}`,
      type: 'custom',
      position: centerPos,
      data: {
        shapes: component.shapes,
        pins: component.pins,
        rotation: 0,
      },
    };

    addNode(newNode);
    setComponentModalOpen(false);
  };

  const renderPreview = (component: HardwareComponent) => {
    let minX = 0, minY = 0, maxX = 100, maxY = 100;
    
    if (component.shapes && component.shapes.length > 0) {
      minX = Math.min(...component.shapes.map(s => s.x ?? s.cx ?? 0));
      minY = Math.min(...component.shapes.map(s => s.y ?? s.cy ?? 0));
      maxX = Math.max(...component.shapes.map(s => (s.x ?? s.cx ?? 0) + (s.width ?? s.r ?? 0)));
      maxY = Math.max(...component.shapes.map(s => (s.y ?? s.cy ?? 0) + (s.height ?? s.r ?? 0)));
    }

    const width = Math.max(maxX - minX + 20, 50);
    const height = Math.max(maxY - minY + 20, 50);

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        {component.shapes?.map((shape, i) => {
          switch (shape.type) {
            case 'rect':
              return <rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} ry={shape.ry} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'circle':
              return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'path':
              return <path key={i} d={shape.d} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'text':
              return <text key={i} x={shape.x} y={shape.y} fill={shape.fill} fontSize={shape.fontSize} fontFamily={shape.fontFamily} fontWeight={shape.fontWeight} textAnchor={shape.textAnchor as any}>{shape.text}</text>;
            default:
              return null;
          }
        })}
        {component.pins?.map((pin) => (
          <circle key={pin.id} cx={pin.x} cy={pin.y} r={3} fill="#555" />
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Add Component</h2>
          <button 
            onClick={() => setComponentModalOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {library.map((component) => (
              <button
                key={component.id}
                onClick={() => handleAddComponent(component)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all bg-gray-50 hover:bg-white group"
              >
                <div className="w-20 h-20 mb-3 flex items-center justify-center">
                  {renderPreview(component)}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {component.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
