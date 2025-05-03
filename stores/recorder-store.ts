'use client';

import { create } from 'zustand';
import { startRecording as startMediaRecording } from '@/lib/recorder';

interface OutputFile {
  url: string;
  filename: string;
  type: string;
}

interface RecorderState {
  isGenerating: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  progress: number;
  outputFile: OutputFile | null;
  startRecording: () => void;
  cancelRecording: () => void;
  resetRecorder: () => void;
  setProgress: (progress: number) => void;
  setOutputFile: (file: OutputFile) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

const DEFAULT_STATE = {
  isGenerating: false,
  isRecording: false,
  isProcessing: false,
  progress: 0,
  outputFile: null,
} as const;

export const useRecorderStore = create<RecorderState>((set, get) => ({
  ...DEFAULT_STATE,
  setIsGenerating: (value: boolean) => {
    set({ isGenerating: value });
  },
  startRecording: async () => {
    set({ isRecording: true, progress: 0, outputFile: null });

    try {
      const playerElement = document.querySelector('.__remotion-player');
      if (!playerElement) {
        throw new Error('Player element not found');
      }

      const blob = await startMediaRecording(playerElement as HTMLElement);
      set({ isRecording: false, isProcessing: true });

      // TODO: Implement video conversion logic
      // const outputFile = await convertVideo(blob, (progress) => {
      //   set({ progress });
      // });
      // set({ outputFile, isProcessing: false, progress: 100 });
    } catch (error) {
      set({ isRecording: false, isProcessing: false });
    }
  },

  cancelRecording: () => {
    set({ isRecording: false, isProcessing: false, progress: 0 });
  },

  resetRecorder: () => {
    if (get().outputFile?.url) {
      URL.revokeObjectURL(get().outputFile.url);
    }
    set({ outputFile: null, progress: 0 });
  },

  setProgress: (progress) => set({ progress }),

  setOutputFile: (file) => set({ outputFile: file }),
}));
