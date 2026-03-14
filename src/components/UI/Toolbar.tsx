import { Download, MousePointer2, PenLine, Grid, MoveHorizontal, Plus, PlusCircle, Trash2, RotateCw, Save, Upload } from 'lucide-react';
import { exportCanvasToPng } from '../../utils/exportUtils';
import { useEditorStore } from '../../store/useEditorStore';
import { useReactFlow } from 'reactflow';
import { useRef, type ChangeEvent } from 'react';

export default function Toolbar() {
  const interactionMode = useEditorStore(state => state.interactionMode);
  const setInteractionMode = useEditorStore(state => state.setInteractionMode);
  const drawSettings = useEditorStore(state => state.drawSettings);
  const setDrawSettings = useEditorStore(state => state.setDrawSettings);
  const setComponentModalOpen = useEditorStore(state => state.setComponentModalOpen);
  const selectedWaypoint = useEditorStore(state => state.selectedWaypoint);
  const setSelectedWaypoint = useEditorStore(state => state.setSelectedWaypoint);
  const updateEdgeData = useEditorStore(state => state.updateEdgeData);
  const getCanvasState = useEditorStore(state => state.getCanvasState);
  const loadCanvasState = useEditorStore(state => state.loadCanvasState);
  const { getEdges, getEdge } = useReactFlow();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEdges = getEdges().filter(e => e.selected);
  const isSingleEdgeSelected = selectedEdges.length === 1;
  const isWaypointSelectedOnCurrentEdge = selectedWaypoint && isSingleEdgeSelected && selectedWaypoint.edgeId === selectedEdges[0].id;

  const handleAddBend = () => {
    if (!isSingleEdgeSelected) return;
    const edge = selectedEdges[0];
    const waypoints = edge.data?.waypoints || [];
    
    const newWaypoints = [...waypoints];
    newWaypoints.push({ x: 0, y: 0, isNewFromToolbar: true });
    updateEdgeData(edge.id, { waypoints: newWaypoints });
  };

  const handleRemoveBend = () => {
    if (!selectedWaypoint) return;
    const edge = getEdge(selectedWaypoint.edgeId);
    if (!edge) return;
    
    const waypoints = [...(edge.data?.waypoints || [])];
    waypoints.splice(selectedWaypoint.index, 1);
    updateEdgeData(selectedWaypoint.edgeId, { waypoints });
    setSelectedWaypoint(null);
  };

  const handleSave = () => {
    const state = getCanvasState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schematic.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        loadCanvasState(json);
      } catch (err) {
        console.error("Failed to parse JSON", err);
        alert("Invalid schematic file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-lg border border-slate-200">
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />
      
      {/* Add Component */}
      <button
        onClick={() => setComponentModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors rounded-lg"
        title="Add Component"
      >
        <Plus size={18} />
        <span className="text-sm">Add</span>
      </button>

      <div className="w-px h-8 bg-slate-200 mx-1" />

      {/* Interaction Modes */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setInteractionMode('select')}
          className={`p-2 rounded-lg transition-colors ${interactionMode === 'select' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
          title="Select Mode (V)"
        >
          <MousePointer2 size={18} />
        </button>
        <button
          onClick={() => setInteractionMode('draw')}
          className={`p-2 rounded-lg transition-colors ${interactionMode === 'draw' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
          title="Draw Mode (W)"
        >
          <PenLine size={18} />
        </button>
      </div>

      <div className="w-px h-8 bg-slate-200 mx-1" />

      {/* Toggles (Always Shown) */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setDrawSettings({ snapToGrid: !drawSettings.snapToGrid })}
          className={`p-2 rounded-lg transition-colors ${drawSettings.snapToGrid ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
          title="Snap to Grid"
        >
          <Grid size={18} />
        </button>
        <button
          onClick={() => setDrawSettings({ snapToRotate: !drawSettings.snapToRotate })}
          className={`p-2 rounded-lg transition-colors ${drawSettings.snapToRotate ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
          title="Snap to Rotate (90°)"
        >
          <RotateCw size={18} />
        </button>
        <button
          onClick={() => setDrawSettings({ orthogonal: !drawSettings.orthogonal })}
          className={`p-2 rounded-lg transition-colors ${drawSettings.orthogonal ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-600'}`}
          title="Orthogonal Routing"
        >
          <MoveHorizontal size={18} />
        </button>
      </div>

      {/* Contextual Actions (Wire/Bend Selected) */}
      {isSingleEdgeSelected && (
        <>
          <div className="w-px h-8 bg-slate-200 mx-1" />
          <div className="flex items-center gap-1">
            {!isWaypointSelectedOnCurrentEdge && (
              <button
                onClick={handleAddBend}
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-100 text-slate-700 font-medium transition-colors rounded-lg text-sm"
                title="Add Bend to Wire"
              >
                <PlusCircle size={16} />
                <span>Add Bend</span>
              </button>
            )}
            {isWaypointSelectedOnCurrentEdge && (
              <button
                onClick={handleRemoveBend}
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-red-50 text-red-600 font-medium transition-colors rounded-lg text-sm"
                title="Remove Selected Bend"
              >
                <Trash2 size={16} />
                <span>Remove Bend</span>
              </button>
            )}
          </div>
        </>
      )}

      <div className="w-px h-8 bg-slate-200 mx-1" />

      {/* Save / Load / Export */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleLoadClick}
          className="p-2 hover:bg-slate-100 text-slate-600 transition-colors rounded-lg"
          title="Load Schematic"
        >
          <Upload size={18} />
        </button>
        <button
          onClick={handleSave}
          className="p-2 hover:bg-slate-100 text-slate-600 transition-colors rounded-lg"
          title="Save Schematic"
        >
          <Save size={18} />
        </button>
        <button
          onClick={exportCanvasToPng}
          className="p-2 hover:bg-slate-100 text-slate-600 transition-colors rounded-lg"
          title="Export PNG"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}
