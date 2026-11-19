import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  progress: number;
  label?: string;
  height?: number;
};

export function ProgressBar({ progress, label, height = 8 }: Props) {
  const theme = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        style={[styles.track, { backgroundColor: theme.surfaceMuted, height }]}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.primary,
              width: `${Math.round(clamped * 100)}%` as `${number}%`,
            },
          ]}
        />
      </View>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  track: { borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  label: { fontSize: 11, fontWeight: '600' },
});
