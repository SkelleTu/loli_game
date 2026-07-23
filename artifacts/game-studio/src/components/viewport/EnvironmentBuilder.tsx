import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

export function EnvironmentBuilder() {
  const { sceneObjects, currentMode, selectedObjectId, setSelectedObject, transformMode } = useEditorStore();

  if (currentMode !== 'environment' && sceneObjects.length === 0) return null;

  return (
    <group>
      {sceneObjects.map(obj => (
        <ScenePrimitive 
          key={obj.id} 
          object={obj} 
          isSelected={selectedObjectId === obj.id} 
          onSelect={() => setSelectedObject(obj.id)} 
          isEnvMode={currentMode === 'environment'} 
          transformMode={transformMode}
        />
      ))}
    </group>
  );
}

function ScenePrimitive({ object, isSelected, onSelect, isEnvMode, transformMode }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);

  useEffect(() => {
    if (transformRef.current && isSelected && isEnvMode) {
      transformRef.current.attach(ref.current);
      return () => transformRef.current.detach();
    }
  }, [isSelected, isEnvMode]);

  const { type, position, rotation, scale, color, wireframe } = object;

  const Geometry = () => {
    switch (type) {
      case 'box': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'plane': return <planeGeometry args={[5, 5]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <group>
      <mesh
        ref={ref}
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
        onClick={(e) => {
          if (isEnvMode) {
            e.stopPropagation();
            onSelect();
          }
        }}
      >
        <Geometry />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      {isSelected && isEnvMode && (
        <TransformControls ref={transformRef} mode={transformMode} space="world" />
      )}
    </group>
  );
}
