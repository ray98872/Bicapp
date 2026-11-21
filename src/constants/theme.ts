import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#10241C',
    background: '#F6F4EE',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E7E4DA',
    textSecondary: '#5B6D65',
    border: '#E2DED3',
    accent: '#1F6B4F',
    accentText: '#FFFFFF',
    accentSoft: '#DDEFE6',
    success: '#2F9E6B',
    successSoft: '#D5F2E3',
    danger: '#B4483A',
    warmup: '#C58B22',
  },
  dark: {
    text: '#F4F8F5',
    background: '#111A16',
    backgroundElement: '#1B2721',
    backgroundSelected: '#24342C',
    textSecondary: '#A3B5AD',
    border: '#2A3A32',
    accent: '#4FC291',
    accentText: '#0D1F17',
    accentSoft: '#1F3A2E',
    success: '#4FC291',
    successSoft: '#1E3D2F',
    danger: '#E07A6C',
    warmup: '#E5B04A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = { [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const MaxContentWidth = 720;
