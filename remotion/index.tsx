import { Composition, registerRoot, getInputProps } from 'remotion';
import { CodeSteps } from '../components/CodeSteps';
import { RemotionConfig } from '../stores/remotion-config';

const DEFAULTS: RemotionConfig = {
  steps: [],
  fps: 30,
  width: 1280,
  height: 720,
  theme: 'dark-plus',
  language: 'typescript',
  fontFamily: 'JetBrains Mono',
  fontSize: 16,
  currentStep: 0,
};

registerRoot(() => {
  // 안전하게 inputProps 파싱
  const inputProps = { ...DEFAULTS, ...getInputProps() } as RemotionConfig;

  // 필수값 보장
  const {
    steps,
    fps,
    width,
    height,
    theme,
    language,
    fontFamily,
    fontSize,
  } = inputProps;

  // steps가 없거나 비어있으면 최소 1프레임 보장
  const durationInFrames = Math.max((steps?.length ?? 1) * 60, 60);

  return (
    <Composition
      id="code-steps"
      component={CodeSteps as any}
      durationInFrames={durationInFrames}
      fps={fps}
      width={width}
      height={height}
      transparent
      defaultProps={{
        steps,
        theme,
        language,
        fontFamily,
        fontSize,
      }}
    />
  );
});
