import React, { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import * as THREE from 'three';

export function SkeletonOverlay() {
  const { skeleton, currentMode, selectedBone, setSelectedBone } = useEditorStore();

  const lines = useMemo(() => {
    if (!skeleton) return [];
    
    const segments: { start: THREE.Bone, end: THREE.Bone }[] = [];
    
    const traverse = (bone: THREE.Bone) => {
      bone.children.forEach(child => {
        if ((child as THREE.Bone).isBone) {
          segments.push({ start: bone, end: child as THREE.Bone });
          traverse(child as THREE.Bone);
        }
      });
    };
    
    if (skeleton.bones.length > 0) {
      traverse(skeleton.bones[0]); // assuming bones[0] is root
    }
    
    return segments;
  }, [skeleton]);

  if (!skeleton || (currentMode !== 'rig' && currentMode !== 'animate')) {
    return null;
  }

  return (
    <group>
      {lines.map((seg, i) => (
        <BoneLine key={i} start={seg.start} end={seg.end} />
      ))}
      {skeleton.bones.map((bone, i) => (
        <BoneHandle key={i} bone={bone} isSelected={selectedBone === bone} onClick={() => setSelectedBone(bone)} />
      ))}
    </group>
  );
}

function BoneLine({ start, end }: { start: THREE.Bone, end: THREE.Bone }) {
  const ref = React.useRef<THREE.Line>(null);
  
  React.useEffect(() => {
    if (!ref.current) return;
    const geometry = ref.current.geometry;
    
    const update = () => {
      const p1 = new THREE.Vector3();
      const p2 = new THREE.Vector3();
      start.getWorldPosition(p1);
      end.getWorldPosition(p2);
      
      const positions = new Float32Array([
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    };
    
    update();
    // In a real app we'd update this every frame if animated, 
    // but for pose mode, this is okay or we can use useFrame
  });

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="#00d8ff" opacity={0.6} transparent depthTest={false} />
    </line>
  );
}

function BoneHandle({ bone, isSelected, onClick }: { bone: THREE.Bone, isSelected: boolean, onClick: () => void }) {
  const p = new THREE.Vector3();
  bone.getWorldPosition(p);
  
  return (
    <mesh position={p} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color={isSelected ? "#ffb300" : "#00d8ff"} depthTest={false} transparent opacity={0.8} />
    </mesh>
  );
}
