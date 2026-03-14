import React, { useCallback } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, useReactFlow, Position, EdgeLabelRenderer } from 'reactflow';
import { useEditorStore } from '../../store/useEditorStore';

function distToSegment(p: {x:number, y:number}, v: {x:number, y:number}, w: {x:number, y:number}) {
  const l2 = (w.x - v.x)**2 + (w.y - v.y)**2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

export default function AdvancedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const waypoints = data?.waypoints || [];
  const updateEdgeData = useEditorStore(state => state.updateEdgeData);
  const drawSettings = useEditorStore(state => state.drawSettings);
  const selectedWaypoint = useEditorStore(state => state.selectedWaypoint);
  const setSelectedWaypoint = useEditorStore(state => state.setSelectedWaypoint);
  const { screenToFlowPosition } = useReactFlow();

  let path = '';
  let labelX = 0;
  let labelY = 0;
  
  // Handle new waypoints from toolbar
  if (waypoints.length > 0 && waypoints[waypoints.length - 1].isNewFromToolbar) {
    // Calculate center of the edge
    let cx = (sourceX + targetX) / 2;
    let cy = (sourceY + targetY) / 2;
    if (waypoints.length > 1) {
      const prev = waypoints[waypoints.length - 2];
      cx = (prev.x + targetX) / 2;
      cy = (prev.y + targetY) / 2;
    }
    
    // Update the waypoint without triggering infinite loop
    setTimeout(() => {
      const newWaypoints = [...waypoints];
      newWaypoints[newWaypoints.length - 1] = { x: cx, y: cy };
      updateEdgeData(id, { waypoints: newWaypoints });
      setSelectedWaypoint({ edgeId: id, index: newWaypoints.length - 1 });
    }, 0);
  }

  const pts = [{ x: sourceX, y: sourceY }, ...waypoints, { x: targetX, y: targetY }];
  const isOrthogonal = data?.orthogonal || drawSettings.orthogonal;

  if (waypoints.length === 0) {
    if (isOrthogonal) {
      const [p, lx, ly] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
      path = p;
      labelX = lx;
      labelY = ly;
    } else {
      path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      labelX = (sourceX + targetX) / 2;
      labelY = (sourceY + targetY) / 2;
    }
  } else {
    path = `M ${pts[0].x} ${pts[0].y} `;
    for (let i = 1; i < pts.length; i++) {
      if (isOrthogonal) {
        path += `L ${pts[i].x} ${pts[i - 1].y} L ${pts[i].x} ${pts[i].y} `;
      } else {
        path += `L ${pts[i].x} ${pts[i].y} `;
      }
    }
  }

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />
      <BaseEdge path={path} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 3 : 2, stroke: selected ? '#3b82f6' : '#64748b' }} />
      
      <EdgeLabelRenderer>
        {selected && waypoints.map((wp: any, index: number) => {
          if (wp.isNewFromToolbar) return null;
          const isSelected = selectedWaypoint?.edgeId === id && selectedWaypoint?.index === index;
          return (
            <WaypointHandle 
              key={`wp-${index}`} 
              edgeId={id} 
              index={index} 
              x={wp.x} 
              y={wp.y} 
              waypoints={waypoints} 
              isSelected={isSelected}
            />
          );
        })}
      </EdgeLabelRenderer>
    </>
  );
}

function WaypointHandle({ edgeId, index, x, y, waypoints, isSelected }: any) {
  const updateEdgeData = useEditorStore(state => state.updateEdgeData);
  const drawSettings = useEditorStore(state => state.drawSettings);
  const setSelectedWaypoint = useEditorStore(state => state.setSelectedWaypoint);
  const { screenToFlowPosition } = useReactFlow();

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedWaypoint({ edgeId, index });
    
    const target = e.target as Element;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      let pos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      if (drawSettings.snapToGrid) {
        pos.x = Math.round(pos.x / 20) * 20;
        pos.y = Math.round(pos.y / 20) * 20;
      }
      const newWaypoints = [...waypoints];
      newWaypoints[index] = pos;
      updateEdgeData(edgeId, { waypoints: newWaypoints });
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  if (isNaN(x) || isNaN(y)) return null;

  return (
    <div
      className="nodrag nopan"
      style={{
        position: 'absolute',
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
        pointerEvents: 'all',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: '#fff',
        border: `2px solid ${isSelected ? '#ef4444' : '#3b82f6'}`,
        cursor: 'grab',
        zIndex: 1000,
        boxShadow: isSelected ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none',
      }}
      onPointerDown={onPointerDown}
      title="Drag to move, select to delete via toolbar"
    />
  );
}
