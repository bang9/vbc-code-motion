"use client"

import { useRecorderStore } from "@/stores/recorder-store"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function RecordingProgress() {
  const { isRecording, isProcessing, progress, cancelRecording } = useRecorderStore()

  let statusText = "Initializing..."
  if (isRecording) {
    statusText = "Recording preview..."
  } else if (isProcessing) {
    statusText = `Converting ${progress < 100 ? `(${Math.round(progress)}%)` : ""}...`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{statusText}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <Button variant="outline" size="icon" onClick={cancelRecording}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
