import { Composition, registerRoot, getInputProps } from 'remotion';
import { CodeSteps } from '../components/CodeSteps';
import { RemotionConfig } from '../stores/remotion-config';

registerRoot(() => {
  const inputProps = getInputProps() as unknown as RemotionConfig;
  
  return (
    <Composition
      id="code-steps"
      component={CodeSteps as any}
      durationInFrames={inputProps.steps.length * 60}
      fps={inputProps.fps}
      width={inputProps.width}
      height={inputProps.height}
      defaultProps={{
        steps: inputProps.steps,
        theme: inputProps.theme,
        language: inputProps.language,
        fontFamily: inputProps.fontFamily,
        fontSize: inputProps.fontSize
      }}
    />
  );
});
