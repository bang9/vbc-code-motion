import { create } from 'zustand';

interface StepsState {
  steps: string[];
  setSteps: (steps: string[]) => void;
  updateStep: (idx: number, code: string) => void;
  addStep: () => void;
  removeStep: (idx: number) => void;
}

export const useStepsStore = create<StepsState>((set) => ({
  steps: [
    "function greeting() {\n  console.log('Hello');\n}",
    "function greeting() {\n  console.log('Hello, world!');\n}",
  ],
  setSteps: (steps) => set({ steps }),
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
