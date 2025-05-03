"use client"

import { useRemotionConfig } from '@/stores/remotion-config'
import Editor from "@/components/Editor"
import Preview from "@/components/Preview"
import Toolbar from "@/components/Toolbar"

export default function Home() {
  const { config } = useRemotionConfig()

  return (
    <main className="flex min-h-screen flex-col p-8 gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Code Steps Recorder</h1>
        <p className="text-muted-foreground">
          Record your code steps and generate a video.
        </p>
      </div>
      <Toolbar />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <Editor />
        <Preview />
      </div>
    </main>
  )
}
