import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export type ThemePalette = { [K in keyof typeof Colors.light]: string };

export type Theme = ThemePalette & {
  paletteName: 'light' | 'dark';
  fonts: typeof Fonts;
  radius: typeof Radius;
  spacing: typeof Spacing;
  typography: typeof Typography;
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const paletteName = scheme === 'dark' ? 'dark' : 'light';
  return {
    ...Colors[paletteName],
    paletteName,
    fonts: Fonts,
    radius: Radius,
    spacing: Spacing,
    typography: Typography,
  };
}
