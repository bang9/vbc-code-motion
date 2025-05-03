import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@code-hike/lighter';
import { shallow } from 'zustand/shallow';

export interface RemotionConfig {
  steps: string[];
  fps: number;
  width: number;
  height: number;
  theme: Theme;
  language: string;
  fontFamily: string;
  fontSize: number;
  currentStep: number;
}

interface RemotionConfigState {
  config: RemotionConfig;
  setConfig: (config: Partial<RemotionConfig>) => void;
  setSteps: (steps: string[]) => void;
  setCurrentStep: (step: number) => void;
}

const DEFAULT_CONFIG: RemotionConfig = {
  steps: [],
  fps: 30,
  width: 1280,
  height: 720,
  theme: 'dark-plus' as Theme,
  language: 'typescript',
  fontFamily: "'JetBrains Mono', monospace, 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Menlo', 'Consolas'",
  fontSize: 16,
  currentStep: 0,
};

const toEven = (n: number | undefined) => (typeof n === 'number' ? (n % 2 === 0 ? n : n - 1) : undefined);

const useRemotionConfigBase = create(
  persist<RemotionConfigState>(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      setConfig: (newConfig) =>
        set((state) => {
          const width = 'width' in newConfig ? (toEven(newConfig.width) ?? state.config.width) : state.config.width;
          const height =
            'height' in newConfig ? (toEven(newConfig.height) ?? state.config.height) : state.config.height;
          return {
            config: {
              ...state.config,
              ...newConfig,
              width,
              height,
            },
          };
        }),
      setSteps: (steps) =>
        set((state) => ({
          config: { ...state.config, steps },
        })),
      setCurrentStep: (step) =>
        set((state) => ({
          config: { ...state.config, currentStep: step },
        })),
    }),
    {
      name: 'remotion-config',
    },
  ),
);

function useRemotionConfig(selector = (state: RemotionConfigState) => state) {
  return useRemotionConfigBase(selector);
}

export { useRemotionConfig };
