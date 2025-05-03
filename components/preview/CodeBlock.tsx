import React from 'react';
import { Theme } from '@code-hike/lighter';
import {
  CODE_BLOCK_HEADER_HEIGHT,
  CODE_CONTAINER_PADDING_BLOCK,
  CODE_CONTAINER_PADDING_INLINE,
} from '../../lib/constants';
import { cn } from '../../lib/utils';
import { useTheme } from 'next-themes';
interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  theme?: Theme;
  children: React.ReactNode;
}

export function CodeBlock({ width, height, style, theme, children, ...rest }: CodeBlockProps) {
  const { theme: currentTheme } = useTheme();
  const darkMode = currentTheme === 'dark';
  let backgroundStyle = {};
  if (theme === 'github-from-css') {
    backgroundStyle = { background: 'var(--ch-code-bg, #fff)' };
  } else if (theme === 'material-from-css') {
    backgroundStyle = { background: 'var(--ch-code-bg, #263238)' };
  } else {
    backgroundStyle = { background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' };
  }

  return (
    <div id="code-block" style={{ borderRadius: 16, ...backgroundStyle }}>
      <div
        style={{
          height: CODE_BLOCK_HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '9999px', background: '#ef4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '9999px', background: '#f59e42' }} />
          <div style={{ width: 12, height: 12, borderRadius: '9999px', background: '#22c55e' }} />
        </div>
      </div>
      <div
        style={{
          boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
          paddingInline: CODE_CONTAINER_PADDING_INLINE,
          paddingBlock: CODE_CONTAINER_PADDING_BLOCK,
          minWidth: 400,
          maxWidth: 800,
          margin: '0 auto',
          position: 'relative',
          width,
          height: `calc(${height}px - ${CODE_BLOCK_HEADER_HEIGHT}px)`,
          display: 'flex',
          flexDirection: 'column',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}
