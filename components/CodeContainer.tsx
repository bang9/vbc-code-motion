import React from 'react';
import { Theme } from '@code-hike/lighter';

export const CODE_CONTAINER_PADDING = 32;

interface CodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  theme?: Theme;
  children: React.ReactNode;
}

export function CodeContainer({
  width,
  height,
  style,
  theme,
  children,
  ...rest
}: CodeContainerProps) {
  // CSS Light/Dark themes 적용
  let backgroundStyle = {};
  if (theme === 'github-from-css') {
    backgroundStyle = { background: 'var(--ch-code-bg, #fff)' };
  } else if (theme === 'material-from-css') {
    backgroundStyle = { background: 'var(--ch-code-bg, #263238)' };
  } else {
    backgroundStyle = { background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' };
  }

  return (
    <div
      style={{
        ...backgroundStyle,
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
        padding: CODE_CONTAINER_PADDING,
        minWidth: 400,
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...rest}
    >
      {/* macOS 스타일 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#fc625d', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#fdbc40', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: 6, background: '#35cd4b', display: 'inline-block' }} />
      </div>
      {children}
    </div>
  );
} 