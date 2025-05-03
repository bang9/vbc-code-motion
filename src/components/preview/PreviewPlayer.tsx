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
import { cn, getOptimalCanvasSize } from '@/lib/utils';
import { useTheme } from 'next-themes';

export const PreviewPlayer = memo(function PreviewPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const { config, setConfig } = useRemotionConfig();
  const [_, startTransition] = useTransition();
  const { steps, currentStep, setCurrentStep } = useStepsStore();
  const deferredSteps = useDeferredValue(steps);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });
  const darkMode = useTheme().theme === 'dark';
  const totalDurationSec = config.totalDurationSec;

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
    }
  }, [isPlaying]);

  const seekToStep = (step: number) => {
    if (playerRef.current) {
      const seceneStartFrame = Math.round(step * ((config.fps * totalDurationSec) / steps.length));
      playerRef.current.seekTo(seceneStartFrame);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < (steps?.length ?? 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    seekToStep(currentStep);
  }, [currentStep, config.fps, totalDurationSec]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => {
      setIsPlaying(true);
    };
    const onEnded = () => {
      setIsPlaying(false);
    };
    player.addEventListener('play', onPlay);
    player.addEventListener('resume', onPlay);
    player.addEventListener('pause', onEnded);
    player.addEventListener('ended', onEnded);
    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('resume', onPlay);
      player.removeEventListener('pause', onEnded);
      player.removeEventListener('ended', onEnded);
    };
  }, [playerRef.current]);

  if (!steps?.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No code steps to preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
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
          durationInFrames={Math.round(config.fps * totalDurationSec)}
          fps={config.fps}
          compositionWidth={canvasSize.width}
          compositionHeight={canvasSize.height}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
            overflow: 'hidden',
          }}
          loop={false}
          autoPlay={false}
          inputProps={{
            steps: deferredSteps,
            theme: config.theme,
            language: config.language,
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
            durationInFrames: Math.round(config.fps * totalDurationSec),
            fps: config.fps,
          }}
          renderPoster={() => null}
          showPosterWhenUnplayed
        />
      </div>

      <div
        className={cn(
          'w-full max-w-md mt-4 bg-card border border-border rounded-xl px-6 py-1 flex flex-col items-center justify-between',
          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700',
        )}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-8 h-8" onClick={handlePrevStep} disabled={currentStep === 0}>
            <SkipBack className="h-2 w-2" />
          </Button>

          <Button variant="outline" className="w-8 h-8" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            className="w-8 h-8"
            onClick={handleNextStep}
            disabled={currentStep === steps.length - 1}
          >
            <SkipForward className="w-2 h-2" />
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'w-full max-w-md bg-card border border rounded-xl px-4 py-2 flex gap-2 flex-col',
          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">FPS:</span>
          <Slider
            value={[config.fps]}
            min={30}
            max={60}
            step={5}
            onValueChange={(value) => setConfig({ fps: value[0] })}
            className="w-24"
          />
          <span className="text-sm text-foreground">{config.fps}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Duration:</span>
          <Slider
            value={[totalDurationSec]}
            min={steps.length * 0.5}
            max={steps.length * 2}
            step={0.5}
            onValueChange={([v]) => setConfig({ totalDurationSec: v })}
            className="w-24"
          />
          <span className="text-sm text-foreground">{totalDurationSec.toFixed(2)}s</span>
        </div>
      </div>
    </div>
  );
});
