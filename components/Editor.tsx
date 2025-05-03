"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Editor as MonacoEditor } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useRemotionConfig } from "@/stores/remotion-config"
import StepTimeline from "@/components/StepTimeline"

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

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
  const { config, setConfig } = useRemotionConfig()
  const [code, setCode] = useState(DEFAULT_CODE)
  const [steps, setSteps] = useState(() => DEFAULT_CODE.split('---').map(s => s.trim()))
  const [isPending, startTransition] = useTransition()
  const editorRef = useRef<any>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        startTransition(() => {
          const newSteps = value.split('---').map(s => s.trim())
          setSteps(newSteps)
          setConfig({ steps: newSteps })
        })
      }, 300)
    }
  }

  useEffect(() => {
    // mount 시 초기화
    const initialSteps = code.split('---').map(s => s.trim())
    setSteps(initialSteps)
    setConfig({ steps: initialSteps })
    // eslint-disable-next-line
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleCodeChange(e.target.value)
  }

  const handleSave = () => {
    const newSteps = code.split('---').map(s => s.trim())
    setSteps(newSteps)
    setConfig({ steps: newSteps })
  }

  return (
    <div className="flex-1 flex gap-4 h-full">
      <div className="w-48 bg-muted/30 rounded-md p-2 overflow-y-auto">
        <StepTimeline />
      </div>
      <div className="flex-1 border rounded-md overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Code Editor</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={code === config.steps.join("\n---\n")}
          >
            Save Changes
          </Button>
        </div>
        <Textarea
          value={code}
          onChange={handleChange}
          className="min-h-[400px] font-mono"
          placeholder="Enter your code here. Separate steps with ---"
        />
        {isPending && (
          <div className="text-xs text-muted-foreground mt-2">렌더링 중...</div>
        )}
      </div>
    </div>
  )
}
