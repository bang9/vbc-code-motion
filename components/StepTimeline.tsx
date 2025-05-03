"use client"

import { useStepsStore } from "@/stores/steps-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function StepTimeline() {
  const { steps, currentStep, setCurrentStep } = useStepsStore()

  if (steps.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No steps found. Separate your code with --- to create steps.</div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Steps Timeline</h3>
      <div className="flex flex-col gap-1">
        {steps.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={cn("justify-start h-8 px-2", currentStep === index && "bg-primary/10 text-primary")}
            onClick={() => setCurrentStep(index)}
          >
            Step {index + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}
