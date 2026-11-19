import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  phase?: string;
};

export function EmptyState({ icon, title, message, phase }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceMuted }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.surface }]}>
        <Ionicons name={icon} size={26} color={theme.textTertiary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {phase && (
        <View style={[styles.phase, { borderColor: theme.border }]}>
          <Text style={[styles.phaseText, { color: theme.textTertiary }]}>{phase}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700' },
  message: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  phase: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseText: { fontSize: 11, fontWeight: '600' },
});
