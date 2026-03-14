import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { ComponentShape, ComponentPin } from '../../config/schemas';
import { useEditorStore } from '../../store/useEditorStore';
import { getComponentBounds } from '../../utils/componentBounds';

export default function CustomNode({ id, data, selected }: NodeProps<{ shapes: ComponentShape[]; pins: ComponentPin[]; rotation?: number }>) {
  const interactionMode = useEditorStore(state => state.interactionMode);
  const startDrawing = useEditorStore(state => state.startDrawing);
  const finishDrawing = useEditorStore(state => state.finishDrawing);
  const drawingState = useEditorStore(state => state.drawingState);
  const { screenToFlowPosition } = useReactFlow();

  const { minX, minY, maxX, maxY, width, height } = getComponentBounds(data.shapes, data.pins);

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
      className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`} 
      style={{ 
        width, 
        height, 
        transform: `rotate(${data.rotation || 0}deg)`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-in-out'
      }}
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
            case 'text':
              return <text key={i} x={shape.x} y={shape.y} fill={shape.fill} fontSize={shape.fontSize} fontFamily={shape.fontFamily} fontWeight={shape.fontWeight} textAnchor={shape.textAnchor as any}>{shape.text}</text>;
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
            isConnectable={interactionMode !== 'draw'}
            onClick={(e) => onHandleClick(e, pin.id)}
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
