"use client"

import { useEffect, useRef, useState } from "react"
import { Editor as MonacoEditor } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useStepsStore } from "@/stores/steps-store"
import StepTimeline from "@/components/StepTimeline"
import { useSettingsStore } from "@/stores/settings-store"

const DEFAULT_CODE = `// Welcome to Code Steps Recorder!
// Separate your steps with --- lines

function greeting() {
  console.log("Hello");
}

---

function greeting() {
  console.log("Hello, world!");
}

---

function greeting() {
  // Add a comment
  console.log("Hello, world!");
  return true;
}
`

export default function Editor() {
  const { theme } = useTheme()
  const { setSteps } = useStepsStore()
  const { editorSettings } = useSettingsStore()
  const [code, setCode] = useState(DEFAULT_CODE)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      parseSteps(value)
    }
  }

  const parseSteps = (code: string) => {
    const steps = code.split("---").map((step) => step.trim())
    setSteps(steps)
  }

  useEffect(() => {
    parseSteps(code)
  }, [])

  return (
    <div className="flex-1 flex gap-4 h-full">
      <div className="w-48 bg-muted/30 rounded-md p-2 overflow-y-auto">
        <StepTimeline />
      </div>
      <div className="flex-1 border rounded-md overflow-hidden">
        <MonacoEditor
          height="100%"
          language={editorSettings.language}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: editorSettings.fontSize,
            fontFamily: editorSettings.fontFamily,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
