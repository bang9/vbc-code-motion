import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@code-hike/lighter';

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
  fontFamily: 'JetBrains Mono',
  fontSize: 16,
  currentStep: 0,
};

export const useRemotionConfig = create<RemotionConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
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
    }
  )
); 