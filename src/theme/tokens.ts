import { Colors, Fonts, Radius as radiusTokens, Spacing as spacingTokens, Typography } from '@/constants/theme';

const tokens = {
  colors: {
    lightBackground: Colors.light.background,
    darkBackground: Colors.dark.background,
    primary: Colors.light.primary,
    success: Colors.light.success,
    secondary: Colors.light.textSecondary,
  },
  radius: radiusTokens,
  spacing: spacingTokens,
  fonts: Fonts,
  typography: Typography,
} as const;

export default tokens;
