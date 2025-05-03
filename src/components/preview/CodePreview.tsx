'use client';

import React, { useEffect, useState, memo, useLayoutEffect } from 'react';
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
import {
  calculateTransitions,
  getStartingSnapshot,
  TokenTransition,
  TokenTransitionsSnapshot,
} from 'codehike/utils/token-transitions';
import { CodeBlock } from './CodeBlock';
import { CODE_CONTAINER_PADDING_BLOCK, CODE_CONTAINER_PADDING_INLINE } from '../../lib/constants';
import { Theme } from '@code-hike/lighter';
import { getOptimalCanvasSize } from '../../lib/utils';

const MARK_BACKGROUND_COLOR = '#F2CC6044';
const MARK_DURATION = 10;

export interface CodePreviewsProps {
  steps: string[];
  durationInFrames: number;
  theme?: Theme;
  language?: string;
  fontFamily?: string;
  fontSize?: number;
  highlightedSteps?: HighlightedCode[];
  scheme?: 'light' | 'dark';
}

export const CodePreview = memo(function CodePreview({
  steps,
  durationInFrames,
  scheme = 'light',
  theme = 'dark-plus',
  language = 'typescript',
  fontFamily = 'monospace',
  fontSize = 16,
  highlightedSteps = [],
}: CodePreviewsProps) {
  const [ready, setReady] = useState(highlightedSteps.length > 0);
  const [codes, setCodes] = useState<HighlightedCode[]>(highlightedSteps);
  const [maxBoxSize, setMaxBoxSize] = useState({ width: 800, height: 450 });

  useLayoutEffect(() => {
    const init = async () => {
      let highlighted = highlightedSteps;
      if (highlightedSteps.length === 0) {
        highlighted = await Promise.all(steps.map((v) => highlight({ lang: language, value: v, meta: '' }, theme)));
        setCodes(highlighted);
        setReady(true);
      }

      if (typeof window !== 'undefined') {
        let maxWidth = 0;
        let maxHeight = 0;
        for (const code of highlighted) {
          const { width, height } = getOptimalCanvasSize(
            code.value,
            fontSize,
            fontFamily,
            CODE_CONTAINER_PADDING_INLINE,
            CODE_CONTAINER_PADDING_BLOCK,
          );
          if (width > maxWidth) maxWidth = width;
          if (height > maxHeight) maxHeight = height;
        }
        setMaxBoxSize({ width: maxWidth, height: maxHeight });
      }
    };

    init();
  }, [steps, language, fontSize, fontFamily, theme]);

  const sequenceDurationInFrames = Math.round(durationInFrames / steps.length);

  if (!ready) {
    return (
      <Sequence durationInFrames={sequenceDurationInFrames} layout="none">
        <CodeBlock scheme={scheme} width={maxBoxSize.width} height={maxBoxSize.height} theme={theme}>
          {null}
        </CodeBlock>
      </Sequence>
    );
  }

  return codes.map((code, i) => (
    <Sequence key={i} from={sequenceDurationInFrames * i} durationInFrames={sequenceDurationInFrames} layout="none">
      <AbsoluteFill
        style={{
          background: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <CodeBlock scheme={scheme} width={maxBoxSize.width} height={maxBoxSize.height} theme={theme}>
          <Code
            oldCode={i === 0 ? undefined : codes[i - 1]}
            newCode={code}
            fontFamily={fontFamily}
            fontSize={fontSize}
            durationInFrames={sequenceDurationInFrames}
          />
        </CodeBlock>
      </AbsoluteFill>
    </Sequence>
  ));
});

interface CodeProps {
  oldCode: HighlightedCode | undefined;
  newCode: HighlightedCode;
  fontFamily: string;
  fontSize: number;
  durationInFrames: number;
}

function Code({ oldCode, newCode, fontFamily, fontSize, durationInFrames }: CodeProps) {
  const { code, ref } = useTokenTransitions(oldCode, newCode, durationInFrames);
  return (
    <Pre
      ref={ref}
      code={code}
      handlers={[mark, tokenTransitions]}
      style={{
        fontFamily,
        fontSize,
        background: 'transparent',
        boxShadow: 'none',
        margin: 0,
        padding: 0,
      }}
    />
  );
}

const mark = {
  name: 'mark',
  Line: (props: any) => <InnerLine merge={props} style={{ padding: '0 4px' }} />,
  Block: ({ children, annotation }: any) => {
    const delay = +(annotation.query || 0);
    const frame = useCurrentFrame();
    const background = interpolateColors(frame, [delay, delay + MARK_DURATION], ['#0000', MARK_BACKGROUND_COLOR]);

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
