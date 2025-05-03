"use client"

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"

// Create a singleton instance
let ffmpeg: any = null

async function getFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({
      log: true,
      corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
    })
  }

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load()
  }

  return ffmpeg
}

export async function convertToGif(videoBlob: Blob, onProgress: (progress: number) => void): Promise<Blob> {
  try {
    onProgress(10) // Initial progress

    const ffmpeg = await getFFmpeg()
    onProgress(20)

    // Write the video file to memory
    ffmpeg.FS("writeFile", "input.webm", await fetchFile(videoBlob))
    onProgress(40)

    // Run the FFmpeg command
    await ffmpeg.run(
      "-i",
      "input.webm",
      "-vf",
      "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      "-loop",
      "0",
      "output.gif",
    )
    onProgress(80)

    // Read the result
    const data = ffmpeg.FS("readFile", "output.gif")
    onProgress(90)

    // Create a blob from the data
    const gifBlob = new Blob([data.buffer], { type: "image/gif" })
    onProgress(100)

    return gifBlob
  } catch (error) {
    console.error("Error converting to GIF:", error)
    throw error
  }
}

export async function convertToMp4(videoBlob: Blob, onProgress: (progress: number) => void): Promise<Blob> {
  try {
    onProgress(10) // Initial progress

    const ffmpeg = await getFFmpeg()
    onProgress(20)

    // Write the video file to memory
    ffmpeg.FS("writeFile", "input.webm", await fetchFile(videoBlob))
    onProgress(40)

    // Run the FFmpeg command
    await ffmpeg.run(
      "-i",
      "input.webm",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-vf",
      "fps=30,scale=960:-1",
      "-pix_fmt",
      "yuv420p",
      "output.mp4",
    )
    onProgress(80)

    // Read the result
    const data = ffmpeg.FS("readFile", "output.mp4")
    onProgress(90)

    // Create a blob from the data
    const mp4Blob = new Blob([data.buffer], { type: "video/mp4" })
    onProgress(100)

    return mp4Blob
  } catch (error) {
    console.error("Error converting to MP4:", error)
    throw error
  }
}

// iOS Safari fallback using gif.js
export async function createGifWithGifJs(frames: ImageData[], onProgress: (progress: number) => void): Promise<Blob> {
  // This is a placeholder for gif.js implementation
  // In a real implementation, you would use the gif.js library
  // to create a GIF from the frames

  // For now, we'll just return a dummy blob
  return new Blob([], { type: "image/gif" })
}
