'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import { useTheme } from 'next-themes';

interface StepTimelineProps {
  steps: string[];
  currentStep: number;
  handleAddStepAction: () => void;
  handleRemoveStepAction: (idx: number) => void;
  handleSetCurrentStepAction: (idx: number) => void;
}

export function StepTimeline({
  steps,
  currentStep,
  handleAddStepAction,
  handleRemoveStepAction,
  handleSetCurrentStepAction,
}: StepTimelineProps) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <div className="col-span-3 lg:col-span-2">
      <div className={cn('rounded-lg p-4', darkMode ? 'bg-gray-800' : 'bg-gray-100')}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={cn('font-medium', darkMode ? 'text-white' : 'text-gray-900')}>Steps Timeline</h3>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 flex flex-col">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between p-2 rounded-md transition-colors min-h-10 h-10',
                currentStep === index
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border',
              )}
              onClick={() => handleSetCurrentStepAction(index)}
            >
              <span className="font-medium">Step {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-6 w-6',
                  currentStep === index
                    ? darkMode
                      ? 'text-white hover:bg-blue-700'
                      : 'text-blue-800 hover:bg-blue-200'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-600'
                      : 'text-gray-500 hover:bg-gray-100',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveStepAction(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddStepAction}
            className={cn(
              'w-full min-h-10 h-10 flex items-center justify-center mt-2 backdrop-blur bg-white/30 dark:bg-gray-700/30 border border-dashed border-gray-300 dark:border-gray-600',
              'hover:bg-white/60 dark:hover:bg-gray-700/60',
              'transition',
              'rounded-md',
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-primary',
            )}
            aria-label="Step 추가"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
