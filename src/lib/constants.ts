export const BUILTIN_THEMES = [
  'dark-plus',
  'dracula-soft',
  'dracula',
  'github-dark',
  'github-dark-dimmed',
  'material-darker',
  'material-default',
  'material-lighter',
  'material-ocean',
  'material-palenight',
  'min-dark',
  'monokai',
  'nord',
  'one-dark-pro',
  'poimandres',
  'slack-dark',
  'slack-ochin',
  'solarized-dark',
  'github-from-css',
  'material-from-css',
];

export const FONT_SIZES = [
  { value: 12, label: '12' },
  { value: 14, label: '14' },
  { value: 16, label: '16', recommended: true },
  { value: 18, label: '18' },
];

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'dart', label: 'Dart' },
] as const;

export const FORMAT_OPTIONS = [
  { value: 'video', label: 'MP4' },
  { value: 'gif', label: 'GIF' },
  { value: 'webm', label: 'WebM' },
];

export const CODE_BLOCK_HEADER_HEIGHT = 28;
export const CODE_CONTAINER_PADDING_INLINE = 16;
export const CODE_CONTAINER_PADDING_BLOCK = 16;
