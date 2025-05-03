"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Editor from "@/components/Editor"
import Preview from "@/components/Preview"
import Toolbar from "@/components/Toolbar"
import { useStepsStore } from "@/stores/steps-store"
import { useRecorderStore } from "@/stores/recorder-store"
import { useSettingsStore } from "@/stores/settings-store"
import RecordingProgress from "@/components/RecordingProgress"
import DownloadPanel from "@/components/DownloadPanel"

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("editor")
  const { isRecording, isProcessing, outputFile } = useRecorderStore()
  const { steps } = useStepsStore()
  const { canvasSize } = useSettingsStore()

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto p-4 flex-1 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Code Steps Recorder</h1>

        <Toolbar />

        <div className="flex-1 flex flex-col mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 flex">
              <Editor />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 flex flex-col">
              <div
                className="flex-1 flex justify-center items-center bg-muted/30 rounded-md p-4 overflow-hidden"
                style={{
                  minHeight: `${canvasSize.height + 40}px`,
                }}
              >
                <Preview />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {(isRecording || isProcessing) && <RecordingProgress />}

        {outputFile && !isRecording && !isProcessing && <DownloadPanel />}
      </div>
    </main>
  )
}
