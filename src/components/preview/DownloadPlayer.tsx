import { Composition, registerRoot, getInputProps } from 'remotion';
import { CodePreview } from './CodePreview';
import { GenerateVideoConfig } from '../../lib/utils';

const DEFAULTS: GenerateVideoConfig = {
  fps: 60,
  width: 1280,
  height: 720,
  theme: 'dark-plus',
  language: 'typescript',
  fontFamily: 'JetBrains Mono',
  fontSize: 16,
  currentStep: 0,
  totalDurationSec: 2,
  steps: [],
  scheme: 'light',
};

registerRoot(() => {
  const inputProps = { ...DEFAULTS, ...getInputProps() } as GenerateVideoConfig;
  const { steps, scheme, totalDurationSec, fps, width, height, theme, language, fontFamily, fontSize } = inputProps;

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
        scheme,
      }}
    />
  );
});
