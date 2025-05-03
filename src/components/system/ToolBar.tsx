'use client';

import { useCallback, memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FONT_SIZES, BUILTIN_THEMES, LANGUAGES } from '@/lib/constants';
import { useRemotionConfig } from '@/stores/remotion-config';
import { Theme } from '@code-hike/lighter';

export const ToolBar = memo(function EditorToolbar() {
  const { config, setConfig } = useRemotionConfig();

  const handleSettingChange = useCallback(
    <K extends keyof typeof config>(key: K, value: (typeof config)[K]) => {
      setConfig({ [key]: value });
    },
    [setConfig, config],
  );

  return (
    <div className="w-full flex items-center justify-between py-3 mb-6">
      <div className="grid grid-cols-4 gap-6 w-full">
        <div className="flex flex-col">
          <Label className="mb-1 text-xs text-gray-500 dark:text-gray-300 font-semibold">Theme</Label>
          <Select onValueChange={(v) => handleSettingChange('theme', v as Theme)} value={config.theme as string}>
            <SelectTrigger className="w-full h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUILTIN_THEMES.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <Label className="mb-1 text-xs text-gray-500 dark:text-gray-300 font-semibold">Language</Label>
          <Select onValueChange={(v) => handleSettingChange('language', v)} value={config.language}>
            <SelectTrigger className="w-full h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <Label className="mb-1 text-xs text-gray-500 dark:text-gray-300 font-semibold">Size</Label>
          <Select onValueChange={(v) => handleSettingChange('fontSize', Number(v))} value={config.fontSize.toString()}>
            <SelectTrigger className="w-full h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value.toString()}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});
