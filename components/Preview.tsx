'use client';

import { useEffect, useRef, useState, useMemo, useDeferredValue } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { CodeSteps } from '@/components/CodeSteps';
import { useRemotionConfig } from '@/stores/remotion-config';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { CODE_CONTAINER_PADDING } from '@/components/CodeContainer';

function getOptimalCanvasSize(
  code: string,
  fontSize = 16,
  fontFamily = 'monospace',
  padding = 64
) {
  if (typeof window === 'undefined') return { width: 800, height: 450 };
  const lines = code.split('\n');
  const maxLineLength = Math.max(...lines.map(line => line.length));
  const lineCount = lines.length;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const charWidth = ctx.measureText('M').width;
  const contentWidth = charWidth * maxLineLength;
  const contentHeight = fontSize * 1.7 * lineCount;
  const width = Math.max(400, Math.min(contentWidth + padding * 2, 1920));
  const height = Math.max(200, Math.min(contentHeight + padding * 2, 1080));
  return { width, height };
}

export default function Preview() {
  const playerRef = useRef<PlayerRef>(null);
  const { config, setConfig } = useRemotionConfig();
  const deferredSteps = useDeferredValue(config.steps);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 코드 콘텐츠에 맞는 최적 크기 계산
  const { width, height } = useMemo(() => {
    if (!config.steps || config.steps.length === 0) {
      return { width: 800, height: 450 };
    }
    let maxWidth = 0;
    let maxHeight = 0;
    for (const code of config.steps) {
      const { width, height } = getOptimalCanvasSize(
        code,
        config.fontSize,
        config.fontFamily,
        CODE_CONTAINER_PADDING
      );
      if (width > maxWidth) maxWidth = width;
      if (height > maxHeight) maxHeight = height;
    }
    return { width: Math.round(maxWidth), height: Math.round(maxHeight) };
  }, [config.steps, config.fontSize, config.fontFamily]);

  // width/height가 바뀔 때 store에도 항상 반영
  useEffect(() => {
    if (config.width !== width || config.height !== height) {
      setConfig({ width, height });
    }
  }, [width, height, config.width, config.height, setConfig]);

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
    if (currentStep < (config?.steps?.length ?? 0) - 1) {
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

  if (!config?.steps?.length) {
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
          width,
          height,
        }}
      >
        <Player
          acknowledgeRemotionLicense
          ref={playerRef}
          component={CodeSteps}
          durationInFrames={config.steps.length * 60}
          fps={config.fps}
          compositionWidth={width}
          compositionHeight={height}
          style={{
            width: '100%',
            height: '100%',
          }}
          loop
          autoPlay={false}
          inputProps={{
            steps: deferredSteps,
            theme: config.theme,
            language: config.language,
            fontFamily: config.fontFamily,
            fontSize: config.fontSize
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

        <Button variant="outline" size="icon" onClick={handleNextStep} disabled={currentStep === config.steps.length - 1}>
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
}
