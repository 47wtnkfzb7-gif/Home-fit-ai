import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceMuted: '#EFF1F4',
    text: '#16181D',
    textSecondary: '#858A94',
    textTertiary: '#A9AEB8',
    primary: '#FF6A00',
    onPrimary: '#FFFFFF',
    primaryMuted: 'rgba(255, 106, 0, 0.10)',
    success: '#35B875',
    successMuted: 'rgba(53, 184, 117, 0.12)',
    border: 'rgba(22, 24, 29, 0.06)',
    shadow: 'rgba(22, 24, 29, 0.08)',
  },
  dark: {
    background: '#101114',
    surface: '#1A1C21',
    surfaceMuted: '#23262C',
    text: '#F7F8FA',
    textSecondary: '#858A94',
    textTertiary: '#6C717B',
    primary: '#FF6A00',
    onPrimary: '#FFFFFF',
    primaryMuted: 'rgba(255, 106, 0, 0.16)',
    success: '#35B875',
    successMuted: 'rgba(53, 184, 117, 0.16)',
    border: 'rgba(247, 248, 250, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export type ThemePalette = (typeof Colors)['light'];
export type ThemeColorName = keyof ThemePalette;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
}) as { sans: string; serif: string; rounded: string; mono: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const Typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export const BottomTabInset = Platform.select({ ios: 40, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
