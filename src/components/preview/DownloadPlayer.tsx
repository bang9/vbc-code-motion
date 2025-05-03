import { Composition, registerRoot, getInputProps } from 'remotion';
import { CodePreview } from './CodePreview';
import { RemotionConfig } from '../../stores/remotion-config';

const DEFAULTS: RemotionConfig = {
  fps: 60,
  width: 1280,
  height: 720,
  theme: 'dark-plus',
  language: 'typescript',
  fontFamily: 'JetBrains Mono',
  fontSize: 16,
  currentStep: 0,
  totalDurationSec: 2,
};

registerRoot(() => {
  const inputProps = { ...DEFAULTS, ...getInputProps() } as RemotionConfig & { steps: string[] };
  const { steps = [], totalDurationSec, fps, width, height, theme, language, fontFamily, fontSize } = inputProps;

  console.log('[DownloadPlayer] durationInFrames:', Math.round(fps * totalDurationSec));

  return (
    <Composition
      id="code-steps"
      component={CodePreview as any}
      durationInFrames={Math.round(fps * totalDurationSec)}
      fps={fps}
      width={width}
      height={height}
      defaultProps={{
        steps,
        theme,
        language,
        fontFamily,
        fontSize,
        fps,
        durationInFrames: Math.round(fps * totalDurationSec),
      }}
    />
  );
});
