import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { useEditorStore } from '../../store/editorStore';
import { ModelViewer } from './ModelViewer';
import { SkeletonOverlay } from './SkeletonOverlay';
import { EnvironmentBuilder } from './EnvironmentBuilder';

export function Viewport() {
  const importedModelUrl = useEditorStore(state => state.importedModelUrl);

  return (
    <div className="w-full h-full bg-background relative border-l border-r border-border">
      <Canvas camera={{ position: [2, 2, 4], fov: 50 }} shadows>
        <color attach="background" args={['#0f0f0f']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        <Grid infiniteGrid fadeDistance={20} sectionColor="#333" cellColor="#222" />

        <Suspense fallback={null}>
          {importedModelUrl && <ModelViewer />}
        </Suspense>
        
        <SkeletonOverlay />
        <EnvironmentBuilder />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
