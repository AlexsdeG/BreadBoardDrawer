import React, { useState, useCallback } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, useReactFlow } from 'reactflow';
import { useEditorStore } from '../../store/useEditorStore';

function distToSegment(p: {x:number, y:number}, v: {x:number, y:number}, w: {x:number, y:number}) {
  const l2 = (w.x - v.x)**2 + (w.y - v.y)**2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const waypoints = data?.waypoints || [];
  const updateEdgeData = useEditorStore(state => state.updateEdgeData);
  const { screenToFlowPosition } = useReactFlow();

  let path = `M ${sourceX} ${sourceY} `;
  if (waypoints.length === 0) {
    if (data?.orthogonal) {
       const [p] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
       path = p;
    } else {
       path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    }
  } else {
    const pts = [{x: sourceX, y: sourceY}, ...waypoints, {x: targetX, y: targetY}];
    path = `M ${pts[0].x} ${pts[0].y} `;
    for (let i = 1; i < pts.length; i++) {
      if (data?.orthogonal) {
        path += `L ${pts[i].x} ${pts[i-1].y} L ${pts[i].x} ${pts[i].y} `;
      } else {
        path += `L ${pts[i].x} ${pts[i].y} `;
      }
    }
  }

  const onEdgeClick = (evt: React.MouseEvent) => {
    if (!selected) return;
    evt.stopPropagation();
    const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
    
    let minDistance = Infinity;
    let insertIndex = waypoints.length;
    
    const pts = [{x: sourceX, y: sourceY}, ...waypoints, {x: targetX, y: targetY}];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i+1];
      const dist = distToSegment(pos, p1, p2);
      if (dist < minDistance) {
        minDistance = dist;
        insertIndex = i;
      }
    }
    
    const newWaypoints = [...waypoints];
    newWaypoints.splice(insertIndex, 0, pos);
    updateEdgeData(id, { waypoints: newWaypoints });
  };

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onClick={onEdgeClick}
        className="react-flow__edge-interaction"
        style={{ cursor: selected ? 'crosshair' : 'pointer' }}
      />
      <BaseEdge path={path} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 3 : 2, stroke: selected ? '#3b82f6' : '#64748b' }} />
      {selected && waypoints.map((wp: any, index: number) => (
        <WaypointCircle key={index} edgeId={id} index={index} x={wp.x} y={wp.y} waypoints={waypoints} />
      ))}
    </>
  );
}

function WaypointCircle({ edgeId, index, x, y, waypoints }: any) {
  const updateEdgeData = useEditorStore(state => state.updateEdgeData);
  const drawSettings = useEditorStore(state => state.drawSettings);
  const { screenToFlowPosition } = useReactFlow();

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
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

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    updateEdgeData(edgeId, { waypoints: newWaypoints });
  };

  return (
    <circle
      cx={x}
      cy={y}
      r={6}
      fill="#fff"
      stroke="#3b82f6"
      strokeWidth={2}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'grab' }}
    />
  );
}
