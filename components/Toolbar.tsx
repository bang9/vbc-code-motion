'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import { Play } from 'lucide-react';
import { FONT_SIZES, FONTS } from './presets';
import { BUILTIN_THEMES } from './themes';
import { useRemotionConfig } from '../stores/remotion-config';
import { Theme } from '@code-hike/lighter';
import { requestGenerateVideo } from '@/lib/utils';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
] as const;

export default function Toolbar() {
  const { config, setConfig } = useRemotionConfig();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSettingChange = <K extends keyof typeof config>(key: K, value: typeof config[K]) => {
    setConfig({ [key]: value });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await requestGenerateVideo(config);
      if (!res.ok) throw new Error('Render failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-steps-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="toolbar flex flex-wrap gap-4 p-4 bg-muted/30 rounded-md items-center">
      <div className="flex items-center gap-2 border-r pr-4 min-w-[320px]">
        <Label className="mr-1">Theme</Label>
        <Select onValueChange={v => handleSettingChange('theme', v as Theme)} value={config.theme as string}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {BUILTIN_THEMES.map(theme => (
              <SelectItem key={theme} value={theme}>{theme}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label className="ml-2 mr-1">Language</Label>
        <Select onValueChange={v => handleSettingChange('language', v)} value={config.language}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label className="ml-2 mr-1">Font</Label>
        <Select onValueChange={v => handleSettingChange('fontFamily', v)} value={config.fontFamily}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONTS.map(font => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
                {font.recommended && <span className="ml-1 text-xs text-blue-500">추천</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label className="ml-2 mr-1">Size</Label>
        <Select onValueChange={v => handleSettingChange('fontSize', Number(v))} value={config.fontSize.toString()}>
          <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map(size => (
              <SelectItem key={size.value} value={size.value.toString()}>
                {size.label}
                {size.recommended && <span className="ml-1 text-xs text-blue-500">추천</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <ModeToggle />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || config.steps.length === 0}
          className="gap-2"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Generate Video</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
