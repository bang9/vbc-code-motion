import { Composition, registerRoot } from 'remotion';
import { CodeSteps } from '../components/CodeSteps';

registerRoot(() => (
  <Composition
    id="code-steps"
    component={CodeSteps}
    durationInFrames={60 * 4}
    fps={30}
    width={1280}
    height={720}
    defaultProps={{
      steps: [`function hello() {\n  console.log("hi");\n}`, `function hello() {\n  console.log("hello world");\n}`],
    }}
  />
));
