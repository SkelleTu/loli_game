import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Box, Circle, Cylinder, Square, Trash2 } from 'lucide-react';

export function EnvironmentPanel() {
  const { sceneObjects, addSceneObject, selectedObjectId, setSelectedObject, removeSceneObject, updateSceneObject } = useEditorStore();

  const selectedObj = sceneObjects.find(o => o.id === selectedObjectId);

  return (
    <div className="flex flex-col h-full bg-sidebar border-l border-border text-sidebar-foreground">
      <div className="p-4 border-b border-border font-semibold flex items-center gap-2">
        <Box className="w-5 h-5 text-primary" />
        <span>Environment</span>
      </div>

      <div className="p-4 border-b border-border grid grid-cols-4 gap-2">
        <button onClick={() => addSceneObject('box')} className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-sidebar-accent border border-transparent hover:border-border transition-colors">
          <Box className="w-5 h-5 mb-1 text-muted-foreground" />
          <span className="text-[10px]">Box</span>
        </button>
        <button onClick={() => addSceneObject('sphere')} className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-sidebar-accent border border-transparent hover:border-border transition-colors">
          <Circle className="w-5 h-5 mb-1 text-muted-foreground" />
          <span className="text-[10px]">Sphere</span>
        </button>
        <button onClick={() => addSceneObject('cylinder')} className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-sidebar-accent border border-transparent hover:border-border transition-colors">
          <Cylinder className="w-5 h-5 mb-1 text-muted-foreground" />
          <span className="text-[10px]">Cylinder</span>
        </button>
        <button onClick={() => addSceneObject('plane')} className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-sidebar-accent border border-transparent hover:border-border transition-colors">
          <Square className="w-5 h-5 mb-1 text-muted-foreground" />
          <span className="text-[10px]">Plane</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {sceneObjects.map(obj => (
          <div 
            key={obj.id}
            className={`flex items-center justify-between p-2 text-sm cursor-pointer rounded-sm mb-1 ${selectedObjectId === obj.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-sidebar-accent'}`}
            onClick={() => setSelectedObject(obj.id)}
          >
            <span className="capitalize">{obj.type}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); removeSceneObject(obj.id); }}
              className={`p-1 rounded-sm ${selectedObjectId === obj.id ? 'hover:bg-black/20' : 'hover:bg-destructive text-muted-foreground hover:text-destructive-foreground'}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {selectedObj && (
        <div className="border-t border-border p-4 bg-sidebar">
          <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Properties</div>
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-muted-foreground block mb-1 text-xs">Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={selectedObj.color} 
                  onChange={(e) => updateSceneObject(selectedObj.id, { color: e.target.value })}
                  className="w-full h-8 rounded-sm bg-transparent cursor-pointer"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedObj.wireframe}
                onChange={(e) => updateSceneObject(selectedObj.id, { wireframe: e.target.checked })}
                className="rounded-sm border-border bg-input text-primary accent-primary"
              />
              <span>Wireframe</span>
            </label>
            <div className="pt-2 border-t border-border mt-2">
              <div className="text-[10px] text-muted-foreground flex flex-col gap-1 font-mono">
                <div>[G] Translate</div>
                <div>[R] Rotate</div>
                <div>[S] Scale</div>
                <div>[Del] Remove</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
