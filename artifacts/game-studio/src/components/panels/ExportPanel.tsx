import { Download } from 'lucide-react';
import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export function ExportPanel() {
  const { skeleton, sceneObjects } = useEditorStore();

  const handleExportGLB = () => {
    // We would gather the current scene or rigged mesh and export
    // Mock for now, but functional structure:
    const exporter = new GLTFExporter();
    const scene = new THREE.Scene();
    
    // Add dummy mesh to export if nothing else
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    scene.add(mesh);

    exporter.parse(
      scene,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'model.glb';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('An error happened during export:', error);
      },
      { binary: true }
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-l border-border text-sidebar-foreground">
      <div className="p-4 border-b border-border font-semibold flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        <span>Export</span>
      </div>
      <div className="p-4 space-y-4">
        <button 
          onClick={handleExportGLB}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Export Model (.glb)
        </button>
        <button 
          className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Export Animation (.glb)
        </button>
      </div>
    </div>
  );
}
