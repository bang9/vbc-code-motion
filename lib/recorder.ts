"use client"

export async function startRecording(element: HTMLElement): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      let stream: MediaStream

      // Check if captureStream is available (not available in iOS Safari)
      // if ("captureStream" in HTMLCanvasElement.prototype) {
      //   // Get the canvas from the player
      //   const canvas = element.querySelector("canvas")
      //   if (!canvas) {
      //     throw new Error("Canvas element not found")
      //   }
      //
      //   // @ts-ignore - TypeScript doesn't know about captureStream
      //   stream = canvas.captureStream(60)
      // } else {
        // Fallback for iOS Safari - use getDisplayMedia
        // Note: This requires user interaction and permissions
        // @ts-ignore - Some TypeScript environments don't have getDisplayMedia typed
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "never",
            displaySurface: "browser",
          },
          audio: false,
        })

        // Show instructions for the user to select the correct window
        alert("Please select the browser tab/window containing the preview")
      // }

      if (!stream) {
        throw new Error("Failed to create media stream")
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000, // 5 Mbps
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Create blob from chunks
        const blob = new Blob(chunks, { type: "video/webm" })
        resolve(blob)
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms

      // Record for 5 seconds (adjust as needed)
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop()
        }
      }, 5000)
    } catch (error) {
      reject(error)
    }
  })
}
