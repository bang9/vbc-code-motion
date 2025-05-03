"use client"

import { useRemotionConfig } from "@/stores/remotion-config"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function StepTimeline() {
  const { config } = useRemotionConfig()

  if (config.steps.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No steps found. Separate your code with --- to create steps.</div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Steps Timeline</h3>
      <div className="flex flex-col gap-1">
        {config.steps.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={cn("justify-start h-8 px-2", config.currentStep === index && "bg-primary/10 text-primary")}
            onClick={() => config.setCurrentStep(index)}
          >
            Step {index + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}
