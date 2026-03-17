import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { ComponentShape, ComponentPin } from '../../config/schemas';
import { useEditorStore } from '../../store/useEditorStore';
import { getComponentBounds } from '../../utils/componentBounds';

type CustomNodeData = {
  componentId?: string;
  shapes: ComponentShape[];
  pins: ComponentPin[];
  rotation?: number;
  customValues?: Record<string, any>;
};

export default function CustomNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  const interactionMode = useEditorStore(state => state.interactionMode);
  const startDrawing = useEditorStore(state => state.startDrawing);
  const finishDrawing = useEditorStore(state => state.finishDrawing);
  const drawingState = useEditorStore(state => state.drawingState);
  const library = useEditorStore(state => state.library);
  const edges = useEditorStore(state => state.edges);
  const setHoverInfo = useEditorStore(state => state.setHoverInfo);
  const hoverInfoLocked = useEditorStore(state => state.hoverInfoLocked);
  const setHoverSourceActive = useEditorStore(state => state.setHoverSourceActive);
  const { screenToFlowPosition } = useReactFlow();
  const [hoveredPinId, setHoveredPinId] = React.useState<string | null>(null);

  const { minX, minY, maxX, maxY, width, height } = getComponentBounds(data.shapes, data.pins);

  const componentDef = React.useMemo(() => {
    if (data.componentId) {
      return library.find((component) => component.id === data.componentId);
    }
    return library.find((component) => component.shapes === data.shapes && component.pins === data.pins);
  }, [data.componentId, data.pins, data.shapes, library]);

  const resolveShapeText = (text?: string) => {
    if (!text) return { resolvedText: '', key: undefined as string | undefined };

    const match = text.match(/{{\s*([^{}\s]+)\s*}}/);
    if (!match) return { resolvedText: text, key: undefined as string | undefined };

    const key = match[1];
    const customValue = data.customValues?.[key];
    const defaultValue = componentDef?.properties?.find((property) => property.id === key)?.default;
    const value = customValue ?? defaultValue ?? '';

    return {
      resolvedText: text.replace(match[0], String(value)),
      key,
    };
  };

  const getComponentTooltipLines = React.useMemo(() => {
    return (componentDef?.properties ?? [])
      .map((property) => {
        const value = data.customValues?.[property.id] ?? property.default;
        if (value === undefined || value === null || value === '') return null;
        return `${property.label}: ${String(value)}`;
      })
      .filter((line): line is string => Boolean(line));
  }, [componentDef?.properties, data.customValues]);

  const componentPins = React.useMemo(() => {
    return data.pins.map((pin) => ({
      id: pin.id,
      signalType: pin.signalType,
      pinType: pin.type,
      connected: edges.some(
        (edge) =>
          (edge.source === id && edge.sourceHandle === pin.id) ||
          (edge.target === id && edge.targetHandle === pin.id),
      ),
    }));
  }, [data.pins, edges, id]);

  const showComponentTooltip = () => {
    if (hoveredPinId) return;
    setHoverSourceActive(true);
    setHoverInfo({
      title: componentDef?.name ?? 'Component',
      subtitle: componentDef?.category ?? 'custom',
      description: componentDef?.description ?? `${componentDef?.name ?? 'This component'} component`,
      lines: getComponentTooltipLines,
      pins: componentPins,
    });
  };

  const hideTooltip = () => {
    setHoverSourceActive(false);
    if (!hoverInfoLocked) {
      setHoverInfo(null);
    }
    setHoveredPinId(null);
  };

  const onHandleClick = (e: React.MouseEvent, pinId: string) => {
    if (interactionMode !== 'draw') return;
    e.stopPropagation();
    
    if (!drawingState.isDrawing) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const pos = screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      startDrawing(id, pinId, pos);
    } else {
      finishDrawing(id, pinId);
    }
  };

  return (
    <div 
      className={`relative ${selected && interactionMode === 'draw' ? 'ring-2 ring-blue-500' : ''}`} 
      style={{ 
        width, 
        height, 
        transform: `rotate(${data.rotation || 0}deg)`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-in-out'
      }}
      onMouseEnter={showComponentTooltip}
      onMouseMove={showComponentTooltip}
      onMouseLeave={hideTooltip}
    >
      <svg width="100%" height="100%" viewBox={`${minX} ${minY} ${width} ${height}`}>
        {data.shapes?.map((shape, i) => {
          switch (shape.type) {
            case 'rect':
              return <rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} ry={shape.ry} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'circle':
              return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'path':
              return <path key={i} d={shape.d} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'ellipse':
              return <ellipse key={i} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'polygon':
              return <polygon key={i} points={shape.points} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />;
            case 'text': {
              const { resolvedText, key } = resolveShapeText(shape.text);
              const textTitle = key ? String(data.customValues?.[key] ?? componentDef?.properties?.find((property) => property.id === key)?.default ?? '') : shape.text;

              return (
                <text
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  fill={shape.fill}
                  fontSize={shape.fontSize}
                  fontFamily={shape.fontFamily}
                  fontWeight={shape.fontWeight}
                  textAnchor={shape.textAnchor as any}
                >
                  {resolvedText}
                </text>
              );
            }
            default:
              return null;
          }
        })}
      </svg>
      {data.pins?.map((pin) => {
        const relativeX = pin.x - minX;
        const relativeY = pin.y - minY;
        const distLeft = relativeX;
        const distRight = width - relativeX;
        const distTop = relativeY;
        const distBottom = height - relativeY;

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);
        let pos = Position.Left;
        if (minDist === distRight) pos = Position.Right;
        else if (minDist === distTop) pos = Position.Top;
        else if (minDist === distBottom) pos = Position.Bottom;

        return (
          <Handle
            key={pin.id}
            type={pin.type === 'input' ? 'target' : 'source'}
            position={pos}
            id={pin.id}
            isConnectable={true}
            onClick={(e) => onHandleClick(e, pin.id)}
            onMouseEnter={() => {
              setHoverSourceActive(true);
              setHoveredPinId(pin.id);
              setHoverInfo({
                title: pin.id,
                subtitle: `${pin.signalType} • ${pin.type}`,
                description: componentDef?.description ?? `${componentDef?.name ?? 'Component'} pin`,
                lines: componentDef ? [componentDef.name] : undefined,
              });
            }}
            onMouseMove={() => {
              setHoverSourceActive(true);
              setHoveredPinId(pin.id);
              setHoverInfo({
                title: pin.id,
                subtitle: `${pin.signalType} • ${pin.type}`,
                description: componentDef?.description ?? `${componentDef?.name ?? 'Component'} pin`,
                lines: componentDef ? [componentDef.name] : undefined,
              });
            }}
            onMouseLeave={() => {
              setHoverSourceActive(false);
              setHoveredPinId(null);
              if (hoverInfoLocked) {
                return;
              }
              showComponentTooltip();
            }}
            style={{
              left: relativeX,
              top: relativeY,
              position: 'absolute',
              background: '#555',
              width: 10,
              height: 10,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              cursor: interactionMode === 'draw' ? 'crosshair' : 'crosshair',
            }}
          />
        );
      })}
    </div>
  );
}
