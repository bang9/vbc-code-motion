'use client';

import { useRecorderStore } from '@/stores/recorder-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Download, Share2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStepsStore } from '@/stores/steps-store';

export default function DownloadPanel() {
  const { steps } = useStepsStore();
  const { outputFile, resetRecorder } = useRecorderStore();
  const { canvasSize, fps } = useSettingsStore();
  const [canShare, setCanShare] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare);
  }, []);

  const handleDownload = async () => {
    if (!steps || steps.length === 0) return;

    try {
      setIsDownloading(true);

      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps,
          fps,
          width: canvasSize.width,
          height: canvasSize.height,
        }),
      });

      if (!res.ok) throw new Error('Render failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `code-steps-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!outputFile || !canShare) return;

    try {
      const file = await fetch(outputFile.url).then((r) => r.blob());
      const fileToShare = new File([file], outputFile.filename, { type: outputFile.type });

      if (navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          title: 'Code Steps Recording',
          files: [fileToShare],
        });
      } else {
        console.error("System doesn't support sharing this file");
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!outputFile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex items-center gap-4">
      <div className="flex-1">
        <h3 className="font-medium">Recording Complete!</h3>
        <p className="text-sm text-muted-foreground">
          Your {outputFile.type === 'image/gif' ? 'GIF' : 'MP4'} is ready to download or share.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetRecorder} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          New Recording
        </Button>

        <Button onClick={handleDownload} className="gap-2" disabled={isDownloading}>
          <Download className="h-4 w-4" />
          {isDownloading ? 'Rendering...' : 'Download'}
        </Button>

        {canShare && (
          <Button variant="secondary" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
