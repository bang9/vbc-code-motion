export const CANVAS_PRESETS = [
  { key: 'sns', label: 'SNS (1280×720)', width: 1280, height: 720, recommended: true },
  { key: 'blog', label: 'Blog (1024×512)', width: 1024, height: 512 },
  { key: 'slack', label: 'Slack (800×450)', width: 800, height: 450 },
  { key: 'custom', label: 'Custom', width: 0, height: 0 }
];

export const FONT_SIZES = [
  { value: 12, label: '12' },
  { value: 14, label: '14' },
  { value: 16, label: '16', recommended: true },
  { value: 18, label: '18' }
];

export const FONTS = [
  { value: "'Fira Code', monospace", label: 'Fira Code', recommended: true },
  { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
  { value: "'Source Code Pro', monospace", label: 'Source Code Pro' }
]; 