import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeColorName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

type CardProps = {
  title?: string;
  subtitle?: string;
  icon?: IconName;
  iconColorName?: Exclude<ThemeColorName, 'shadow' | 'onPrimary'>;
  badge?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function Card({
  title,
  subtitle,
  icon,
  iconColorName = 'primary',
  badge,
  onPress,
  children,
}: CardProps) {
  const theme = useTheme();
  const iconColor = theme[iconColorName];
  const iconBackgroundColor =
    iconColorName === 'success' ? theme.successMuted : theme.primaryMuted;

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}>
      {(icon || badge) && (
        <View style={styles.row}>
          {icon && (
            <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
          )}
          {badge && (
            <View style={[styles.badge, { backgroundColor: theme.successMuted }]}>
              <Text style={[styles.badgeText, { color: theme.success }]}>{badge}</Text>
            </View>
          )}
        </View>
      )}
      {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={title}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  pressable: { borderRadius: 20 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  subtitle: { fontSize: 13, lineHeight: 18 },
});
