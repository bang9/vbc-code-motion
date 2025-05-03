import { RemotionConfig } from '@/stores/remotion-config';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CODE_CONTAINER_PADDING_BLOCK, CODE_CONTAINER_PADDING_INLINE } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GenerateVideoConfig extends RemotionConfig {
  steps: string[];
}

export function requestGenerateVideo(config: GenerateVideoConfig, format?: 'video' | 'gif' | 'webm') {
  const payload = format ? { ...config, format } : config;
  return fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function getOptimalCanvasSize(
  code: string,
  fontSize = 16,
  fontFamily = 'monospace',
  paddingInline = CODE_CONTAINER_PADDING_INLINE,
  paddingBlock = CODE_CONTAINER_PADDING_BLOCK,
) {
  if (typeof window === 'undefined') return { width: 800, height: 450 };
  const lines = code.split('\n');
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const lineCount = lines.length;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const charWidth = ctx.measureText('M').width;
  const contentWidth = charWidth * maxLineLength;
  const contentHeight = fontSize * 1.7 * lineCount;
  const width = Math.ceil(contentWidth + paddingInline * 2);
  const height = Math.ceil(contentHeight + paddingBlock * 2);
  return {
    width: Math.round(Math.max(400, Math.min(width, 1920))),
    height: Math.round(Math.max(200, Math.min(height, 1080))),
  };
}
