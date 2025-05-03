"use client"

import { create } from "zustand"

interface CanvasSize {
  width: number
  height: number
}

interface EditorSettings {
  theme: string
  language: string
  fontFamily: string
  fontSize: number
}

interface SettingsState {
  canvasSize: CanvasSize
  fps: number
  editorSettings: EditorSettings
  setCanvasSize: (size: CanvasSize) => void
  setFps: (fps: number) => void
  setEditorSettings: (settings: EditorSettings) => void
}

const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: 800,
  height: 450,
}

const DEFAULT_FPS = 30

const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: "github-dark",
  language: "javascript",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 16,
}

export const useSettingsStore = create<SettingsState>((set) => ({
  canvasSize: DEFAULT_CANVAS_SIZE,
  fps: DEFAULT_FPS,
  editorSettings: DEFAULT_EDITOR_SETTINGS,
  setCanvasSize: (size) => set({ canvasSize: size }),
  setFps: (fps) => set({ fps }),
  setEditorSettings: (settings) => set({ editorSettings: settings }),
}))
