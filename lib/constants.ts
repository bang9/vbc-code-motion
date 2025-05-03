export const BUILTIN_THEMES = [
  'dark-plus',
  'dracula-soft',
  'dracula',
  'github-dark',
  'github-dark-dimmed',
  //   'github-light',
  //   'light-plus',
  'material-darker',
  'material-default',
  'material-lighter',
  'material-ocean',
  'material-palenight',
  'min-dark',
  //   'min-light',
  'monokai',
  'nord',
  'one-dark-pro',
  'poimandres',
  'slack-dark',
  'slack-ochin',
  'solarized-dark',
  //   'solarized-light',
  'github-from-css',
  'material-from-css',
];

export const FONT_SIZES = [
  { value: 12, label: '12' },
  { value: 14, label: '14' },
  { value: 16, label: '16', recommended: true },
  { value: 18, label: '18' },
];

// export const FONTS = [
//   { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono', recommended: true },
//   { value: "'Source Code Pro', monospace", label: 'Source Code Pro' },
//   { value: "'Fira Code', monospace", label: 'Fira Code' },
//   { value: "'IBM Plex Mono', monospace", label: 'IBM Plex Mono' },
//   { value: 'Menlo, monospace', label: 'Menlo' },
//   { value: 'Consolas, monospace', label: 'Consolas' },
// ];

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
] as const;

export const FORMAT_OPTIONS = [
  { value: 'video', label: 'MP4' },
  { value: 'gif', label: 'GIF' },
  { value: 'webm', label: 'WebM' },
];

export const CODE_BLOCK_HEADER_HEIGHT = 28;
export const CODE_CONTAINER_PADDING_INLINE = 16;
export const CODE_CONTAINER_PADDING_BLOCK = 16;
