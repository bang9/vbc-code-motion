'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import { useSettingsStore } from '@/stores/settings-store';
import { useRecorderStore } from '@/stores/recorder-store';
import { Video } from 'lucide-react';
import { useStepsStore } from '@/stores/steps-store';
import { CANVAS_PRESETS, FONT_SIZES, FONTS } from './presets';

interface CanvasSize {
  width: number;
  height: number;
}

const THEMES = [
  { value: 'github-light', label: 'Light' },
  { value: 'github-dark', label: 'Dark' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'monokai', label: 'Monokai' },
] as const;

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
  const { steps } = useStepsStore();
  const { fps, canvasSize, setCanvasSize, editorSettings, setEditorSettings } = useSettingsStore();
  const { isGenerating, setIsGenerating } = useRecorderStore();

  const [selectedPresetKey, setSelectedPresetKey] = useState(() => {
    const found = CANVAS_PRESETS.find(
      p => p.width === canvasSize.width && p.height === canvasSize.height
    );
    return found ? found.key : 'custom';
  });
  const [customWidth, setCustomWidth] = useState(canvasSize.width.toString());
  const [customHeight, setCustomHeight] = useState(canvasSize.height.toString());

  const handleCanvasPreset = (key: string) => {
    setSelectedPresetKey(key);
    const preset = CANVAS_PRESETS.find(p => p.key === key);
    if (preset && preset.key !== 'custom') {
      setCanvasSize({ width: preset.width, height: preset.height });
      setCustomWidth(preset.width.toString());
      setCustomHeight(preset.height.toString());
    }
  };

  const handleCustomSizeChange = () => {
    const width = Number.parseInt(customWidth);
    const height = Number.parseInt(customHeight);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      setCanvasSize({ width, height });
    }
  };

  const handleEditorSettingChange = (key: keyof typeof editorSettings, value: string | number) => {
    setEditorSettings({ ...editorSettings, [key]: value });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
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
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="toolbar flex flex-wrap gap-4 p-4 bg-muted/30 rounded-md items-center">
      <div className="flex items-center gap-2 border-r pr-4 min-w-[320px]">
        <Label className="mr-1">Canvas</Label>
        <Select onValueChange={handleCanvasPreset} value={selectedPresetKey}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CANVAS_PRESETS.map(preset => (
              <SelectItem key={preset.key} value={preset.key}>
                {preset.label}
                {preset.recommended && <span className="ml-1 text-xs text-blue-500">추천</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPresetKey === 'custom' && (
          <>
            <Input type="number" value={customWidth} onChange={e => setCustomWidth(e.target.value)} className="w-16" min="1" />
            <span>×</span>
            <Input type="number" value={customHeight} onChange={e => setCustomHeight(e.target.value)} className="w-16" min="1" />
            <Button variant="outline" size="sm" onClick={handleCustomSizeChange}>Apply</Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 border-r pr-4 min-w-[320px]">
        <Label className="mr-1">Theme</Label>
        <Select onValueChange={v => handleEditorSettingChange('theme', v)} defaultValue={editorSettings.theme}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="github-light">Light</SelectItem>
            <SelectItem value="github-dark">Dark</SelectItem>
            <SelectItem value="dracula">Dracula</SelectItem>
            <SelectItem value="monokai">Monokai</SelectItem>
          </SelectContent>
        </Select>
        <Label className="ml-2 mr-1">Language</Label>
        <Select onValueChange={v => handleEditorSettingChange('language', v)} defaultValue={editorSettings.language}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="c">C</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>
        <Label className="ml-2 mr-1">Font</Label>
        <Select onValueChange={v => handleEditorSettingChange('fontFamily', v)} defaultValue={editorSettings.fontFamily}>
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
        <Select onValueChange={v => handleEditorSettingChange('fontSize', Number(v))} value={editorSettings.fontSize.toString()}>
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
        <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
          <Video className="h-4 w-4" />
          Generate
        </Button>
      </div>
    </div>
  );
}
