'use client';

import React, { useTransition } from 'react';
import { useEffect, useRef, useState, useMemo, useDeferredValue, useCallback, memo } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { CodePreview } from '@/components/preview/CodePreview';
import { useRemotionConfig } from '@/stores/remotion-config';
import { useStepsStore } from '@/stores/steps-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { CODE_CONTAINER_PADDING_INLINE, CODE_CONTAINER_PADDING_BLOCK } from '@/lib/constants';
import { getOptimalCanvasSize } from '@/lib/utils';

export const PreviewPlayer = memo(function PreviewPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const { config, setConfig } = useRemotionConfig();
  const [_, startTransition] = useTransition();
  const steps = useStepsStore((s) => s.steps);
  const deferredSteps = useDeferredValue(steps);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });

  // 클라이언트에서만 동적으로 width/height 계산
  useEffect(() => {
    if (steps && steps.length > 0) {
      startTransition(() => {
        let maxWidth = 0;
        let maxHeight = 0;
        for (const code of steps) {
          const { width, height } = getOptimalCanvasSize(
            code,
            config.fontSize,
            config.fontFamily,
            CODE_CONTAINER_PADDING_INLINE,
            CODE_CONTAINER_PADDING_BLOCK,
          );
          if (width > maxWidth) maxWidth = width;
          if (height > maxHeight) maxHeight = height;
        }
        setCanvasSize({ width: Math.round(maxWidth), height: Math.round(maxHeight) });
      });
    } else {
      setCanvasSize({ width: 800, height: 450 });
    }
  }, [currentStep, steps?.[currentStep], config.fontSize, config.fontFamily]);

  // width/height가 바뀔 때 store에도 항상 반영
  useEffect(() => {
    if (config.width !== canvasSize.width || config.height !== canvasSize.height) {
      setConfig({ width: canvasSize.width, height: canvasSize.height });
    }
  }, [canvasSize.width, canvasSize.height, config.width, config.height, setConfig]);

  const handlePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }
  }, [isPlaying]);

  const handlePrevStep = () => {
    setCurrentStep((prev) => {
      if (prev > 0) {
        if (playerRef.current) {
          playerRef.current.seekTo(Math.max(0, (prev - 1) * 60));
        }
        return prev - 1;
      }
      return prev;
    });
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => {
      if (prev < (steps?.length ?? 0) - 1) {
        if (playerRef.current) {
          playerRef.current.seekTo((prev + 1) * 60);
        }
        return prev + 1;
      }
      return prev;
    });
  };

  useEffect(() => {
    return () => {
      setIsPlaying(false);
    };
  }, []);

  if (!steps?.length) {
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
          acknowledgeRemotionLicense
          ref={playerRef}
          component={CodePreview}
          durationInFrames={steps.length * 60}
          fps={config.fps}
          compositionWidth={canvasSize.width}
          compositionHeight={canvasSize.height}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
            overflow: 'hidden',
          }}
          loop
          autoPlay={false}
          inputProps={{
            steps: deferredSteps,
            theme: config.theme,
            language: config.language,
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
          }}
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
            value={[config.fps]}
            min={1}
            max={60}
            step={1}
            onValueChange={(value) => setConfig({ fps: value[0] })}
            className="w-32"
          />
          <span className="text-sm">{config.fps}</span>
        </div>
      </div>
    </div>
  );
});
