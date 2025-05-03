'use client';

import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  getRemotionEnvironment,
  interpolate,
  interpolateColors,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import { AnnotationHandler, highlight, HighlightedCode, InnerLine, InnerPre, InnerToken, Pre } from 'codehike/code';
import { useSettingsStore } from '../stores/settings-store';
import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransition,
  TokenTransitionsSnapshot,
} from 'codehike/utils/token-transitions';

interface CodeStepsProps {
  steps: string[];
}

interface CodeProps {
  oldCode: HighlightedCode | undefined;
  newCode: HighlightedCode;
}

interface CanvasSize {
  width: number;
  height: number;
}

const STEP_FRAMES = 60;
const BACKGROUND_COLOR = '#0D1117';
const MARK_BACKGROUND_COLOR = '#F2CC6044';
const MARK_DURATION = 10;

export function CodeSteps({ steps }: CodeStepsProps) {
  const { editorSettings } = useSettingsStore();
  const [ready, setReady] = useState(false);
  const [codes, setCodes] = useState<HighlightedCode[]>([]);

  useEffect(() => {
    const highlightSteps = async () => {
      const highlighted = await Promise.all(
        steps.map((v) => highlight({ lang: editorSettings.language, value: v, meta: '' })),
      );
      setCodes(highlighted);
      setReady(true);
    };

    highlightSteps();
  }, [steps, editorSettings.language]);

  if (!ready) return null;

  return (
    <AbsoluteFill style={{ background: '#eceff1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {codes.map((code, i) => (
        <Sequence key={i} from={STEP_FRAMES * i} durationInFrames={STEP_FRAMES} layout="none">
          <Code oldCode={i === 0 ? undefined : codes[i - 1]} newCode={code} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function Code({ oldCode, newCode }: CodeProps) {
  const { editorSettings } = useSettingsStore();
  const { code, ref } = useTokenTransitions(oldCode, newCode, STEP_FRAMES);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
          borderRadius: 16,
          boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
          padding: 32,
          minWidth: 400,
          maxWidth: 800,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* macOS 스타일 버튼 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#fc625d', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#fdbc40', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#35cd4b', display: 'inline-block' }} />
        </div>
        <Pre
          ref={ref}
          code={code}
          handlers={[mark, tokenTransitions]}
          style={{
            fontFamily: editorSettings.fontFamily,
            fontSize: editorSettings.fontSize,
            background: 'transparent',
            boxShadow: 'none',
            margin: 0,
            padding: 0,
          }}
          theme={editorSettings.theme}
        />
      </div>
    </div>
  );
}

const mark = {
  name: 'mark',
  Line: (props) => <InnerLine merge={props} style={{ padding: '0 4px' }} />,
  Block: ({ children, annotation }: any) => {
    const delay = +(annotation.query || 0);
    const frame = useCurrentFrame();
    const background = interpolateColors(frame, [delay, delay + MARK_DURATION], ['#0000', MARK_BACKGROUND_COLOR], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return <div style={{ background }}>{children}</div>;
  },
};

export function useTokenTransitions(
  oldCode: HighlightedCode | undefined,
  newCode: HighlightedCode,
  durationInFrames: number,
) {
  const frame = useCurrentFrame();
  const ref = React.useRef<HTMLPreElement>(null);
  const { isRendering } = getRemotionEnvironment();
  const [handle] = useState(() => (isRendering ? null : delayRender()));
  const [snapshot, setSnapshot] = useState<TokenTransitionsSnapshot>();
  const prevCode = oldCode || { ...newCode, tokens: [], annotations: [] };

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      handle && continueRender(handle);
      return;
    }

    if (!snapshot) {
      try {
        setSnapshot(getStartingSnapshot(el));
      } finally {
        handle && continueRender(handle);
      }
      return;
    }

    try {
      const transitions = calculateTransitions(el, snapshot);
      transitions.forEach(({ element, keyframes, options }) => {
        interpolateStyle(
          element,
          keyframes,
          frame,
          durationInFrames * options.delay,
          durationInFrames * options.duration,
        );
      });
    } finally {
      handle && continueRender(handle);
    }
  }, [frame, snapshot, handle, durationInFrames]);

  return { code: snapshot ? newCode : prevCode, ref };
}

export const tokenTransitions: AnnotationHandler = {
  name: 'token-transitions',
  Pre: (props) => <InnerPre merge={props} style={{ position: 'relative' }} />,
  Token: (props) => <InnerToken merge={props} style={{ display: 'inline-block' }} />,
};

function interpolateStyle(
  element: HTMLElement,
  keyframes: TokenTransition['keyframes'],
  frame: number,
  delay: number,
  duration: number,
) {
  const { translateX, translateY, color, opacity } = keyframes;
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  if (opacity) {
    element.style.opacity = interpolate(progress, [0, 1], opacity).toString();
  }
  if (color) {
    element.style.color = interpolateColors(progress, [0, 1], color);
  }
  if (translateX || translateY) {
    const x = interpolate(progress, [0, 1], translateX!);
    const y = interpolate(progress, [0, 1], translateY!);
    element.style.translate = `${x}px ${y}px`;
  }
}
