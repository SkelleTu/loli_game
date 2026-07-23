import * as THREE from 'three';

export function createHumanoidSkeleton(boundingBox: THREE.Box3, center: THREE.Vector3): THREE.Skeleton {
  const height = boundingBox.max.y - boundingBox.min.y;
  const width = boundingBox.max.x - boundingBox.min.x;
  
  // Base scales relative to height
  const y = boundingBox.min.y;
  const legLen = height * 0.45;
  const spineLen = height * 0.35;
  const neckLen = height * 0.05;
  const armLen = height * 0.4;
  
  const hwidth = Math.min(width * 0.25, height * 0.1); // half shoulder width

  const bones: THREE.Bone[] = [];

  const createBone = (name: string, parent: THREE.Bone | null, pos: THREE.Vector3): THREE.Bone => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.copy(pos);
    if (parent) {
      parent.add(bone);
    }
    bones.push(bone);
    return bone;
  };

  // Root / Hips
  const hips = createBone('Hips', null, new THREE.Vector3(0, y + legLen, 0));
  
  // Spine -> Chest -> Neck -> Head
  const spine = createBone('Spine', hips, new THREE.Vector3(0, spineLen * 0.3, 0));
  const chest = createBone('Chest', spine, new THREE.Vector3(0, spineLen * 0.4, 0));
  const neck = createBone('Neck', chest, new THREE.Vector3(0, spineLen * 0.3, 0));
  const head = createBone('Head', neck, new THREE.Vector3(0, neckLen, 0));
  createBone('HeadTop', head, new THREE.Vector3(0, height * 0.15, 0)); // tip

  // Legs
  const lUpLeg = createBone('LeftUpLeg', hips, new THREE.Vector3(hwidth * 0.6, 0, 0));
  const lLeg = createBone('LeftLeg', lUpLeg, new THREE.Vector3(0, -legLen * 0.5, 0));
  const lFoot = createBone('LeftFoot', lLeg, new THREE.Vector3(0, -legLen * 0.5, 0));
  createBone('LeftToe', lFoot, new THREE.Vector3(0, 0, height * 0.1));

  const rUpLeg = createBone('RightUpLeg', hips, new THREE.Vector3(-hwidth * 0.6, 0, 0));
  const rLeg = createBone('RightLeg', rUpLeg, new THREE.Vector3(0, -legLen * 0.5, 0));
  const rFoot = createBone('RightFoot', rLeg, new THREE.Vector3(0, -legLen * 0.5, 0));
  createBone('RightToe', rFoot, new THREE.Vector3(0, 0, height * 0.1));

  // Arms
  const lShoulder = createBone('LeftShoulder', chest, new THREE.Vector3(hwidth, 0, 0));
  const lArm = createBone('LeftArm', lShoulder, new THREE.Vector3(hwidth * 0.5, 0, 0));
  const lForeArm = createBone('LeftForeArm', lArm, new THREE.Vector3(armLen * 0.5, 0, 0));
  const lHand = createBone('LeftHand', lForeArm, new THREE.Vector3(armLen * 0.5, 0, 0));
  createBone('LeftHandTip', lHand, new THREE.Vector3(height * 0.1, 0, 0));

  const rShoulder = createBone('RightShoulder', chest, new THREE.Vector3(-hwidth, 0, 0));
  const rArm = createBone('RightArm', rShoulder, new THREE.Vector3(-hwidth * 0.5, 0, 0));
  const rForeArm = createBone('RightForeArm', rArm, new THREE.Vector3(-armLen * 0.5, 0, 0));
  const rHand = createBone('RightHand', rForeArm, new THREE.Vector3(-armLen * 0.5, 0, 0));
  createBone('RightHandTip', rHand, new THREE.Vector3(-height * 0.1, 0, 0));

  hips.updateMatrixWorld(true);
  return new THREE.Skeleton(bones);
}

export function applyAutoRig(originalMesh: THREE.Mesh): { skinnedMesh: THREE.SkinnedMesh, skeleton: THREE.Skeleton } {
  const geometry = originalMesh.geometry.clone();
  geometry.computeBoundingBox();
  
  if (!geometry.boundingBox) throw new Error("Bounding box missing");
  
  const box = geometry.boundingBox;
  const center = new THREE.Vector3();
  box.getCenter(center);
  
  // 1. Create Skeleton
  const skeleton = createHumanoidSkeleton(box, center);
  
  // 2. Compute Skin Weights (Distance-based procedural weighting)
  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;
  
  const skinIndices = [];
  const skinWeights = [];
  
  const vertex = new THREE.Vector3();
  const bones = skeleton.bones;
  const boneWorldPositions = bones.map(b => {
    const pos = new THREE.Vector3();
    b.getWorldPosition(pos);
    return pos;
  });

  for (let i = 0; i < vertexCount; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);
    // Transform vertex to world space if the original mesh had transforms
    vertex.applyMatrix4(originalMesh.matrixWorld);

    // Find 4 closest bones
    const distances = bones.map((bone, index) => {
      // Approximate line segment distance or point distance. 
      // Using point distance to bone world position for simplicity in this procedural version
      const dist = vertex.distanceTo(boneWorldPositions[index]);
      return { index, dist };
    });

    distances.sort((a, b) => a.dist - b.dist);
    
    // Take top 4
    const top4 = distances.slice(0, 4);
    
    // Inverse distance weighting
    let sumWeight = 0;
    const weights = top4.map(d => {
      // prevent division by zero
      const w = 1.0 / Math.pow(Math.max(d.dist, 0.001), 2);
      sumWeight += w;
      return w;
    });

    const normalizedWeights = weights.map(w => w / sumWeight);

    skinIndices.push(top4[0].index, top4[1].index, top4[2].index, top4[3].index);
    skinWeights.push(normalizedWeights[0], normalizedWeights[1], normalizedWeights[2], normalizedWeights[3]);
  }

  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  const material = originalMesh.material instanceof Array 
    ? originalMesh.material[0].clone() 
    : (originalMesh.material as THREE.Material).clone();
  
  const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
  skinnedMesh.add(skeleton.bones[0]); // add root bone to mesh
  skinnedMesh.bind(skeleton);
  
  return { skinnedMesh, skeleton };
}
