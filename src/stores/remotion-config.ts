import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@code-hike/lighter';

export interface RemotionConfig {
  fps: number;
  width: number;
  height: number;
  theme: Theme;
  language: string;
  fontFamily: string;
  fontSize: number;
  currentStep: number;
  totalDurationSec: number;
}

interface RemotionConfigState {
  config: RemotionConfig;
  setConfig: (config: Partial<RemotionConfig>) => void;
}

const DEFAULT_CONFIG: RemotionConfig = {
  width: 1280,
  height: 720,
  theme: 'dark-plus' as Theme,
  language: 'typescript',
  fontFamily: "'JetBrains Mono', monospace, 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Menlo', 'Consolas'",
  fontSize: 16,
  currentStep: 0,
  fps: 60,
  totalDurationSec: 2,
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
