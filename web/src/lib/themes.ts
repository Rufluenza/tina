// src/lib/themes.ts

export interface Theme {
  '--background': string;
  '--foreground': string;
  '--sidebar-bg': string;
  '--chat-header-bg': string;
  '--bubble-user-bg': string;
  '--bubble-user-text': string;
  '--bubble-other-bg': string;
  '--bubble-other-text': string;
  '--border-color': string;
  '--input-bg': string;
  '--button-bg': string;
  '--button-hover-bg': string;
}

export const themes: { [key: string]: Theme } = {
  dark: {
    '--background': '#1e1e1e',
    '--foreground': '#ffffff',
    '--sidebar-bg': '#2d2d2d',
    '--chat-header-bg': '#2d2d2d',
    '--bubble-user-bg': '#428aff',
    '--bubble-user-text': '#ffffff',
    '--bubble-other-bg': '#3a3b3c',
    '--bubble-other-text': '#e4e6eb',
    '--border-color': '#4a4a4a',
    '--input-bg': '#3a3b3c',
    '--button-bg': '#4a4a4a',
    '--button-hover-bg': '#5a5a5a',
  },
  light: {
    '--background': '#ffffff',
    '--foreground': '#000000',
    '--sidebar-bg': '#f0f2f5',
    '--chat-header-bg': '#f0f2f5',
    '--bubble-user-bg': '#0084ff',
    '--bubble-user-text': '#ffffff',
    '--bubble-other-bg': '#e4e6eb',
    '--bubble-other-text': '#050505',
    '--border-color': '#ced0d4',
    '--input-bg': '#e4e6eb',
    '--button-bg': '#e4e6eb',
    '--button-hover-bg': '#dcdfe2',
  },
};
