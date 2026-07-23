import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';
import { Bone, GitMerge, RotateCcw } from 'lucide-react';

export function SkeletonPanel() {
  const { skeleton, selectedBone, setSelectedBone, currentMode } = useEditorStore();

  if (!skeleton && currentMode !== 'rig') {
    return (
      <div className="flex flex-col h-full bg-sidebar border-l border-border p-4 text-sm text-muted-foreground items-center justify-center text-center">
        <Bone className="w-8 h-8 mb-2 opacity-50" />
        No skeleton active. Import a model first.
      </div>
    );
  }

  const renderBoneNode = (bone: THREE.Bone, depth = 0) => {
    const isSelected = selectedBone === bone;
    return (
      <div key={bone.uuid} className="w-full">
        <div 
          className={`flex items-center py-1 px-2 text-sm cursor-pointer rounded-sm ${isSelected ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-sidebar-accent'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setSelectedBone(bone)}
        >
          <GitMerge className="w-3 h-3 mr-2 opacity-70" />
          {bone.name || 'Bone'}
        </div>
        {bone.children.map(child => {
          if ((child as THREE.Bone).isBone) {
            return renderBoneNode(child as THREE.Bone, depth + 1);
          }
          return null;
        })}
      </div>
    );
  };

  const handleResetPose = () => {
    if (!skeleton) return;
    skeleton.pose();
    // Force re-render of viewport handles
    setSelectedBone(selectedBone);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-l border-border text-sidebar-foreground">
      <div className="p-4 border-b border-border font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="w-5 h-5 text-primary" />
          <span>Hierarchy</span>
        </div>
        {skeleton && (
          <button onClick={handleResetPose} className="p-1 hover:bg-sidebar-accent rounded-md" title="Reset Pose">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {skeleton && skeleton.bones.length > 0 && renderBoneNode(skeleton.bones[0])}
      </div>

      {selectedBone && (
        <div className="h-48 border-t border-border p-4 bg-sidebar">
          <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Properties</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-mono">{selectedBone.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Position</span>
              <span className="font-mono text-xs">
                {selectedBone.position.x.toFixed(2)}, {selectedBone.position.y.toFixed(2)}, {selectedBone.position.z.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rotation</span>
              <span className="font-mono text-xs">
                {selectedBone.rotation.x.toFixed(2)}, {selectedBone.rotation.y.toFixed(2)}, {selectedBone.rotation.z.toFixed(2)}
              </span>
            </div>
            {currentMode === 'animate' && (
              <div className="pt-2 border-t border-border mt-2">
                <div className="text-[10px] text-muted-foreground flex flex-col gap-1 font-mono">
                  <div>[R] Rotate Bone</div>
                  <div>[G] Translate Bone</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
