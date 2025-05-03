import { RemotionConfig } from "@/stores/remotion-config"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function requestGenerateVideo(config: RemotionConfig, format?: 'video' | 'gif' | 'webm') {
  const payload = format ? { ...config, format } : config;
  return fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
