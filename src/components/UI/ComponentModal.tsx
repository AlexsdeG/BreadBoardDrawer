import React, { useMemo, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useEditorStore } from '../../store/useEditorStore';
import { HardwareComponent } from '../../config/schemas';
import { X } from 'lucide-react';
import { getComponentBounds } from '../../utils/componentBounds';

const CATEGORY_LABELS: Record<HardwareComponent['category'], string> = {
  passive: 'Passive',
  'diode-led': 'Diode & LED',
  ic: 'IC',
  transistor: 'Transistor',
  switch: 'Switch',
  power: 'Power',
  microcontroller: 'Microcontroller',
};

export default function ComponentModal() {
  const { isComponentModalOpen, setComponentModalOpen, library, addNode } = useEditorStore();
  const { screenToFlowPosition } = useReactFlow();
  const [selectedCategory, setSelectedCategory] = useState<'all' | HardwareComponent['category']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = useMemo(() => {
    const uniqueCategories = Array.from(new Set(library.map((component) => component.category)));
    return ['all', ...uniqueCategories] as Array<'all' | HardwareComponent['category']>;
  }, [library]);

  const filteredComponents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return library.filter((component) => {
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      const matchesSearch = term.length === 0 || component.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [library, searchTerm, selectedCategory]);

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
        componentId: component.id,
        shapes: component.shapes,
        pins: component.pins,
        rotation: 0,
      },
    };

    addNode(newNode);
    setComponentModalOpen(false);
  };

  const renderPreview = (component: HardwareComponent) => {
    const { minX, minY, width, height } = getComponentBounds(component.shapes, component.pins);

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`${minX} ${minY} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
      >
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
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${selectedCategory === tab ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'}`}
                >
                  {tab === 'all' ? 'All' : CATEGORY_LABELS[tab]}
                </button>
              ))}
            </div>
            <div className="w-full md:w-64 md:ml-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search components..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredComponents.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No components found for this category and search.
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredComponents.map((component) => (
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
