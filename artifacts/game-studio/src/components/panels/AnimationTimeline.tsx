import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Play, Pause, Square, Circle, Repeat, Video } from 'lucide-react';

export function AnimationTimeline() {
  const { 
    currentFrame, setCurrentFrame, totalFrames, isPlaying, setIsPlaying,
    isLooping, setIsLooping, isRecording, setIsRecording, fps
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);

  // Simple playback loop mock
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    const frameMs = 1000 / fps;

    const loop = (time: number) => {
      if (isPlaying) {
        const delta = time - lastTime;
        if (delta >= frameMs) {
          lastTime = time - (delta % frameMs);
          setCurrentFrame((prev) => {
            if (prev >= totalFrames) return isLooping ? 0 : prev;
            return prev + 1;
          });
        }
      }
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, fps, isLooping, totalFrames, setCurrentFrame]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const frame = Math.round(percent * totalFrames);
    setCurrentFrame(frame);
  };

  return (
    <div className="h-full bg-sidebar border-t border-border flex flex-col select-none text-sidebar-foreground">
      <div className="h-10 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <button 
            className={`p-1.5 rounded-sm hover:bg-sidebar-accent ${isRecording ? 'text-destructive' : 'text-muted-foreground'}`}
            onClick={() => setIsRecording(!isRecording)}
            title="Auto-keyframe on modification"
          >
            <Circle className="w-4 h-4 fill-current" />
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <button 
            className="p-1.5 rounded-sm hover:bg-sidebar-accent text-muted-foreground"
            onClick={() => { setIsPlaying(false); setCurrentFrame(0); }}
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
          <button 
            className="p-1.5 rounded-sm hover:bg-sidebar-accent text-primary"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <button 
            className={`p-1.5 rounded-sm hover:bg-sidebar-accent ${isLooping ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setIsLooping(!isLooping)}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <div>{String(currentFrame).padStart(3, '0')} / {totalFrames}</div>
          <div className="w-px h-4 bg-border"></div>
          <div>{fps} FPS</div>
        </div>
      </div>

      <div className="flex-1 relative bg-background overflow-hidden flex flex-col">
        {/* Timeline ruler */}
        <div 
          className="h-6 w-full border-b border-border relative cursor-pointer"
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleTimelineClick(e);
          }}
        >
          {Array.from({ length: totalFrames / 10 + 1 }).map((_, i) => {
            const frame = i * 10;
            const left = `${(frame / totalFrames) * 100}%`;
            return (
              <div key={i} className="absolute top-0 bottom-0 pointer-events-none" style={{ left }}>
                <div className={`timeline-tick ${frame % 30 === 0 ? 'major' : 'minor'}`} />
                {frame % 30 === 0 && (
                  <span className="absolute bottom-2 -translate-x-1/2 text-[10px] text-muted-foreground font-mono">
                    {frame}
                  </span>
                )}
              </div>
            );
          })}
          
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none transition-all duration-75"
            style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          >
            <div className="w-3 h-3 bg-primary absolute top-0 -translate-x-1/2 rounded-b-sm" />
          </div>
        </div>

        {/* Tracks area (mockup) */}
        <div className="flex-1 w-full bg-sidebar/50 p-2">
          {isRecording && (
             <div className="absolute inset-0 border-2 border-destructive/20 pointer-events-none"></div>
          )}
          <div className="flex items-center text-xs text-muted-foreground font-mono">
            <Video className="w-3 h-3 mr-2" /> Track 1
          </div>
        </div>
      </div>
    </div>
  );
}
