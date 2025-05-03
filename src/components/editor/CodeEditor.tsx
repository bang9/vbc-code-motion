'use client';

import { useEffect, useState, memo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { StepTimeline } from '@/components/editor/StepTimeline';
import dynamic from 'next/dynamic';
import { useStepsStore } from '@/stores/steps-store';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';
import { editor } from 'monaco-editor';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export const CodeEditor = memo(function CodeEditor() {
  const { theme } = useTheme();

  const { steps, currentStep, setCurrentStep, updateStep, addStep, removeStep } = useStepsStore();

  const [localCode, setLocalCode] = useState(steps[currentStep] || '');
  const [_, startTransition] = useTransition();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  useEffect(() => {
    setLocalCode(steps[currentStep] || '');
  }, [currentStep]);

  function handleStepCodeChange(value: string | undefined) {
    if (value !== undefined) {
      setLocalCode(value);
      startTransition(() => {
        updateStep(currentStep, value);
      });
    }
  }

  function handleSetCurrentStep(idx: number) {
    updateStep(currentStep, localCode);
    setCurrentStep(idx);
  }

  function handleAddStep() {
    addStep();
    setCurrentStep(steps.length);
  }

  function handleRemoveStep(idx: number) {
    removeStep(idx);

    if (currentStep === idx) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep > idx) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep < idx) {
      setCurrentStep(currentStep);
    } else {
      setCurrentStep(0);
    }
  }

  const darkMode = theme === 'dark';

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,280px)_1fr] gap-6 w-full max-w-6xl mx-auto">
      <div className="min-w-[220px] max-w-[280px] w-full">
        <StepTimeline
          steps={steps}
          currentStep={currentStep}
          handleAddStepAction={handleAddStep}
          handleRemoveStepAction={handleRemoveStep}
          handleSetCurrentStepAction={handleSetCurrentStep}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn('rounded-lg overflow-hidden border', darkMode ? 'border-gray-700' : 'border-gray-200')}>
          <div
            className={cn(
              'px-4 py-2 text-sm font-medium',
              darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700',
            )}
          >
            Code Editor
          </div>
          <div
            className={cn('p-4 font-mono text-sm', darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800')}
          >
            <MonacoEditor
              height="300px"
              defaultLanguage="javascript"
              onMount={handleEditorDidMount}
              value={localCode}
              onChange={handleStepCodeChange}
              theme={darkMode ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                lineNumbers: 'off',
                fontSize: 14,
                fontFamily: "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              }}
            />
          </div>
          <div
            className={cn('px-4 py-2 text-xs', darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}
          >
            Step {currentStep + 1} / {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
});
