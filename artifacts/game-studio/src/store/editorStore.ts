import { create } from 'zustand';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

export type Mode = 'rig' | 'animate' | 'environment';

export interface SceneObject {
  id: string;
  type: 'box' | 'sphere' | 'cylinder' | 'plane';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  wireframe: boolean;
}

export interface AnimationClipMeta {
  id: string;
  name: string;
  duration: number;
}

interface EditorState {
  // Global Mode
  currentMode: Mode;
  setMode: (mode: Mode) => void;

  // Viewport / Selection
  selectedBone: THREE.Bone | null;
  setSelectedBone: (bone: THREE.Bone | null) => void;
  selectedObjectId: string | null;
  setSelectedObject: (id: string | null) => void;

  // Model & Rigging
  importedModelUrl: string | null;
  setImportedModelUrl: (url: string | null) => void;
  skeleton: THREE.Skeleton | null;
  setSkeleton: (skeleton: THREE.Skeleton | null) => void;
  isRigging: boolean;
  setIsRigging: (isRigging: boolean) => void;
  isMirrored: boolean;
  setIsMirrored: (isMirrored: boolean) => void;

  // Environment
  sceneObjects: SceneObject[];
  addSceneObject: (type: SceneObject['type']) => void;
  updateSceneObject: (id: string, updates: Partial<SceneObject>) => void;
  removeSceneObject: (id: string) => void;

  // Animation Timeline
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
  totalFrames: number;
  setTotalFrames: (frames: number) => void;
  isLooping: boolean;
  setIsLooping: (isLooping: boolean) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  
  clips: AnimationClipMeta[];
  addClip: (name: string, duration: number) => void;
  removeClip: (id: string) => void;
  activeClipId: string | null;
  setActiveClipId: (id: string | null) => void;

  transformMode: 'translate' | 'rotate' | 'scale';
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentMode: 'rig',
  setMode: (mode) => set({ currentMode: mode, selectedBone: null, selectedObjectId: null }),

  selectedBone: null,
  setSelectedBone: (bone) => set({ selectedBone: bone }),
  selectedObjectId: null,
  setSelectedObject: (id) => set({ selectedObjectId: id }),

  importedModelUrl: null,
  setImportedModelUrl: (url) => set({ importedModelUrl: url, skeleton: null }),
  skeleton: null,
  setSkeleton: (skeleton) => set({ skeleton }),
  isRigging: false,
  setIsRigging: (isRigging) => set({ isRigging }),
  isMirrored: false,
  setIsMirrored: (isMirrored) => set({ isMirrored }),

  sceneObjects: [],
  addSceneObject: (type) => set((state) => ({
    sceneObjects: [
      ...state.sceneObjects,
      {
        id: uuidv4(),
        type,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#888888',
        wireframe: false,
      }
    ]
  })),
  updateSceneObject: (id, updates) => set((state) => ({
    sceneObjects: state.sceneObjects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
  })),
  removeSceneObject: (id) => set((state) => ({
    sceneObjects: state.sceneObjects.filter(obj => obj.id !== id),
    selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
  })),

  currentFrame: 0,
  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  fps: 30,
  setFps: (fps) => set({ fps }),
  totalFrames: 120,
  setTotalFrames: (totalFrames) => set({ totalFrames }),
  isLooping: true,
  setIsLooping: (isLooping) => set({ isLooping }),
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),

  clips: [{ id: 'default', name: 'Default Take', duration: 120 }],
  addClip: (name, duration) => set((state) => ({
    clips: [...state.clips, { id: uuidv4(), name, duration }]
  })),
  removeClip: (id) => set((state) => ({
    clips: state.clips.filter(c => c.id !== id),
    activeClipId: state.activeClipId === id ? (state.clips.find(c => c.id !== id)?.id || null) : state.activeClipId
  })),
  activeClipId: 'default',
  setActiveClipId: (id) => set({ activeClipId: id }),

  transformMode: 'translate',
  setTransformMode: (mode) => set({ transformMode: mode }),
}));
