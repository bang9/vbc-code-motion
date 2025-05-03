import { create } from 'zustand';

interface StepsState {
  steps: string[];
  currentStep: number;
  setSteps: (steps: string[]) => void;
  setCurrentStep: (step: number) => void;
  updateStep: (idx: number, code: string) => void;
  addStep: () => void;
  removeStep: (idx: number) => void;
}

export const useStepsStore = create<StepsState>((set) => ({
  steps: [
    "function greeting() {\n  console.log('Hello');\n}",
    "function greeting() {\n  console.log('Hello, world!');\n}",
  ],
  currentStep: 0,
  setSteps: (steps) => set({ steps }),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateStep: (idx, code) =>
    set((state) => {
      const newSteps = [...state.steps];
      newSteps[idx] = code;
      return { steps: newSteps };
    }),
  addStep: () =>
    set((state) => {
      const prev = state.steps;
      const last = prev.length > 0 ? prev[prev.length - 1] : '';
      return { steps: [...prev, last] };
    }),
  removeStep: (idx) =>
    set((state) => {
      const newSteps = state.steps.filter((_, i) => i !== idx);
      return { steps: newSteps };
    }),
}));
