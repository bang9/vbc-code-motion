import { useCallback } from 'react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ModeToggle } from './ModeToggle';
import { useStepsStore } from '@/stores/steps-store';
import { useRemotionConfig } from '@/stores/remotion-config';
import { requestGenerateVideo } from '@/lib/utils';
import { Loader2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FORMAT_OPTIONS } from '@/lib/constants';

export const SystemBar = () => {
  const { config } = useRemotionConfig();

  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState<'video' | 'gif' | 'webm'>('video');
  const [hovered, setHovered] = useState(false);
  const handleGenerate = useCallback(async () => {
    const steps = useStepsStore.getState().steps;
    if (steps.length === 0) {
      alert('최소 한 개 이상의 스텝이 필요합니다.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await requestGenerateVideo({ ...config, steps }, format);
      if (!res.ok) throw new Error('Render failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-steps-${Date.now()}.${format === 'gif' ? 'gif' : format === 'webm' ? 'webm' : 'mp4'}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }, [config, format]);

  return (
    <div className="flex items-center gap-2 ml-auto">
      <ModeToggle />
      <div className="flex items-center relative">
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 h-10 transition-all duration-200 overflow-hidden rounded-l-md rounded-r-none relative ${hovered ? 'w-32 px-4' : 'w-10 justify-center'} bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-[hsl(var(--primary-foreground))]`}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, minWidth: hovered ? undefined : 40 }}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            </span>
            <span
              className={`ml-8 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'} whitespace-nowrap`}
            >
              Generate
            </span>
          </Button>
        </div>
        <Select value={format} onValueChange={(v) => setFormat(v as 'video' | 'gif' | 'webm')} disabled={isGenerating}>
          <SelectTrigger
            className={`h-10 w-20 rounded-r-md rounded-l-none border-l border-white/10 transition-all duration-200 opacity-100 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-[hsl(var(--primary-foreground))]`}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMAT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
