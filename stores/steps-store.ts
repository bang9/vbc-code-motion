"use client"

import { create } from "zustand"

interface StepsState {
  steps: string[]
  currentStep: number
  setSteps: (steps: string[]) => void
  setCurrentStep: (step: number) => void
}

const DEFAULT_STATE = {
  steps: [],
  currentStep: 0,
} as const;

export const useStepsStore = create<StepsState>((set) => ({
  ...DEFAULT_STATE,
  setSteps: (steps) => set({ steps }),
  setCurrentStep: (step) => set({ currentStep: step }),
}))
