'use client';

import { useEffect, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { useStepsStore } from '@/stores/steps-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { CodeSteps } from '@/components/CodeSteps';

export default function Preview() {
  const playerRef = useRef<PlayerRef>(null);

  const { steps, currentStep, setCurrentStep } = useStepsStore();
  const { canvasSize, fps, setFps } = useSettingsStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (playerRef.current) {
        playerRef.current.seekTo(Math.max(0, (currentStep - 1) * 60));
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (playerRef.current) {
        playerRef.current.seekTo((currentStep + 1) * 60);
      }
    }
  };

  useEffect(() => {
    return () => {
      setIsPlaying(false);
    };
  }, []);

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No code steps to preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-background rounded-md shadow-md overflow-hidden"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      >
        <Player
          ref={playerRef}
          component={CodeSteps}
          durationInFrames={steps.length * 60}
          fps={fps}
          compositionWidth={canvasSize.width}
          compositionHeight={canvasSize.height}
          style={{
            width: '100%',
            height: '100%',
          }}
          loop
          autoPlay={false}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          inputProps={{ steps }}
        />
      </div>

      <div className="flex items-center gap-2 mt-4 w-full max-w-md">
        <Button variant="outline" size="icon" onClick={handlePrevStep} disabled={currentStep === 0}>
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={handleNextStep} disabled={currentStep === steps.length - 1}>
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="ml-4 flex items-center gap-2 flex-1">
          <span className="text-sm text-muted-foreground">FPS:</span>
          <Slider
            value={[fps]}
            min={1}
            max={60}
            step={1}
            onValueChange={(value) => setFps(value[0])}
            className="w-32"
          />
          <span className="text-sm">{fps}</span>
        </div>
      </div>
    </div>
  );
}
