import React, { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Upload, Box } from 'lucide-react';

export function ImportPanel() {
  const { setImportedModelUrl, isRigging } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImportedModelUrl(url);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-border text-sidebar-foreground">
      <div className="p-4 border-b border-border font-semibold flex items-center gap-2">
        <Box className="w-5 h-5 text-primary" />
        <span>Asset Library</span>
      </div>
      
      <div className="p-4 flex-1">
        <div 
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-sidebar-accent transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Upload 3D Model</p>
          <p className="text-xs text-muted-foreground">.glb, .gltf supported</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".glb,.gltf"
            onChange={handleFileChange} 
          />
        </div>

        {isRigging && (
          <div className="mt-6 p-4 bg-secondary rounded-lg border border-border flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            <div className="text-sm">
              <div className="font-medium">Auto-rigging active</div>
              <div className="text-muted-foreground text-xs">Computing skin weights...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
