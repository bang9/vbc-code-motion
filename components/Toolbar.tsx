'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import { Play, Download, Loader2 } from 'lucide-react';
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

const FORMAT_OPTIONS = [
  { value: 'video', label: 'MP4' },
  { value: 'gif', label: 'GIF' },
  { value: 'webm', label: 'WebM' },
];

export default function Toolbar() {
  const { config, setConfig } = useRemotionConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState<'video' | 'gif' | 'webm'>('video');
  const [hovered, setHovered] = useState(false);

  const handleSettingChange = <K extends keyof typeof config>(key: K, value: typeof config[K]) => {
    setConfig({ [key]: value });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await requestGenerateVideo({ ...config }, format);
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
        <div className="flex items-center relative">
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || config.steps.length === 0}
              className={`flex items-center gap-2 h-10 transition-all duration-200 overflow-hidden rounded-l-md rounded-r-none relative ${hovered ? 'w-32 px-4' : 'w-10 justify-center'} bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-[hsl(var(--primary-foreground))]`}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, minWidth: hovered ? undefined : 40 }}
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </span>
              <span
                className={`ml-8 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'} whitespace-nowrap`}
              >Generate</span>
            </Button>
          </div>
          <Select
            value={format}
            onValueChange={v => setFormat(v as 'video' | 'gif' | 'webm')}
            disabled={isGenerating}
          >
            <SelectTrigger
              className={`h-10 w-20 rounded-r-md rounded-l-none border-l border-white/10 transition-all duration-200 opacity-100 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-[hsl(var(--primary-foreground))]`}
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
