import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, TransformControls } from '@react-three/drei';
import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';
import { applyAutoRig } from '../../lib/AutoRig';
import { useFrame } from '@react-three/fiber';

export function ModelViewer() {
  const { importedModelUrl, setSkeleton, skeleton, isRigging, setIsRigging, selectedBone, currentMode, transformMode } = useEditorStore();
  
  const gltf = useGLTF(importedModelUrl!);

  
  const [riggedMesh, setRiggedMesh] = useState<THREE.SkinnedMesh | null>(null);
  
  useEffect(() => {
    if (!importedModelUrl || !gltf.scene) return;
    
    // Find the first mesh in the loaded scene
    let targetMesh: THREE.Mesh | null = null;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !targetMesh) {
        targetMesh = child as THREE.Mesh;
      }
    });

    if (targetMesh) {
      setIsRigging(true);
      // Run rig async to allow UI to show loader
      setTimeout(() => {
        try {
          const { skinnedMesh, skeleton: newSkeleton } = applyAutoRig(targetMesh!);
          skinnedMesh.castShadow = true;
          skinnedMesh.receiveShadow = true;
          setRiggedMesh(skinnedMesh);
          setSkeleton(newSkeleton);
        } catch (e) {
          console.error('Failed to auto-rig', e);
        } finally {
          setIsRigging(false);
        }
      }, 100);
    }
  }, [importedModelUrl, gltf.scene, setIsRigging, setSkeleton]);

  // Handle TransformControls for bones in Animate/Pose mode
  const transformRef = useRef<any>(null);

  useEffect(() => {
    if (transformRef.current && selectedBone && currentMode === 'animate') {
      const controls = transformRef.current;
      controls.attach(selectedBone);
      return () => controls.detach();
    }
  }, [selectedBone, currentMode]);

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [gltf.scene]);

  if (isRigging) {
    return null; // maybe show 3D text "Rigging..."? handled in UI overlay
  }

  if (riggedMesh) {
    return (
      <group>
        <primitive object={riggedMesh} />
        {currentMode === 'animate' && selectedBone && (
          <TransformControls
            ref={transformRef}
            mode={transformMode}
            size={0.5}
            space="local"
          />
        )}
      </group>
    );
  }

  return <primitive object={gltf.scene} />;
}
