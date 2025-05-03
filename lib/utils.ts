import { RemotionConfig } from "@/stores/remotion-config"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function requestGenerateVideo(config: RemotionConfig) {
  return fetch('/api/render', {
    method: 'POST',
    body: JSON.stringify(config),
  })
}
