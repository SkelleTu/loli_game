import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Viewport } from './components/viewport/Viewport';
import { ImportPanel } from './components/panels/ImportPanel';
import { SkeletonPanel } from './components/panels/SkeletonPanel';
import { AnimationTimeline } from './components/panels/AnimationTimeline';
import { EnvironmentPanel } from './components/panels/EnvironmentPanel';
import { ExportPanel } from './components/panels/ExportPanel';
import { useEditorStore } from './store/editorStore';
import { FileBox, Activity, Mountain, Hammer, ChevronRight, ChevronLeft } from 'lucide-react';

function App() {
  const { currentMode, setMode } = useEditorStore();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const LeftPanel = () => {
    switch (currentMode) {
      case 'rig': return <ImportPanel />;
      case 'environment': return <EnvironmentPanel />;
      case 'animate': return <ExportPanel />; // Just to show different panels
      default: return <ImportPanel />;
    }
  };

  const RightPanel = () => {
    return <SkeletonPanel />;
  };

  useEffect(() => {
    if (currentMode === 'animate') {
      setTimelineOpen(true);
    }
  }, [currentMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          useEditorStore.getState().setIsPlaying(!useEditorStore.getState().isPlaying);
          break;
        case 'g':
          useEditorStore.getState().setTransformMode('translate');
          break;
        case 'r':
          useEditorStore.getState().setTransformMode('rotate');
          break;
        case 's':
          useEditorStore.getState().setTransformMode('scale');
          break;
        case 'delete':
        case 'backspace':
          const state = useEditorStore.getState();
          if (state.selectedObjectId) {
            state.removeSceneObject(state.selectedObjectId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-12 bg-sidebar border-b border-border flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-primary-foreground">
              <Hammer className="w-4 h-4" />
            </div>
            GAMEFORGE<span className="text-primary">.STUDIO</span>
          </div>
          
          <div className="h-6 w-px bg-border mx-2"></div>
          
          <nav className="flex space-x-1">
            <button 
              onClick={() => setMode('rig')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentMode === 'rig' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'}`}
            >
              <FileBox className="w-4 h-4" /> Rig
            </button>
            <button 
              onClick={() => setMode('animate')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentMode === 'animate' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'}`}
            >
              <Activity className="w-4 h-4" /> Animate
            </button>
            <button 
              onClick={() => setMode('environment')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${currentMode === 'environment' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'}`}
            >
              <Mountain className="w-4 h-4" /> Environment
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className={`p-1.5 rounded-md transition-colors ${timelineOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-sidebar-accent'}`}
            onClick={() => setTimelineOpen(!timelineOpen)}
            title="Toggle Timeline"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <PanelGroup direction="horizontal">
          {/* Left Sidebar */}
          {leftSidebarOpen && (
            <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar">
              <LeftPanel />
            </Panel>
          )}
          {leftSidebarOpen && (
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" />
          )}

          {/* Center Viewport */}
          <Panel className="relative">
            <Viewport />
            
            {/* Collapse Toggles for Sidebars */}
            <button 
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-sidebar border border-border border-l-0 p-1 rounded-r-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent z-10"
            >
              {leftSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-sidebar border border-border border-r-0 p-1 rounded-l-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent z-10"
            >
              {rightSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </Panel>

          {/* Right Sidebar */}
          {rightSidebarOpen && (
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" />
          )}
          {rightSidebarOpen && (
            <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar">
              <RightPanel />
            </Panel>
          )}
        </PanelGroup>
      </div>

      {/* Bottom Timeline */}
      {timelineOpen && (
        <div className="h-48 shrink-0 border-t border-border">
          <AnimationTimeline />
        </div>
      )}
    </div>
  );
}

export default App;
