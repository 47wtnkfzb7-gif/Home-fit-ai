import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  action?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, action, onActionPress }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {action && onActionPress && (
        <Text
          onPress={onActionPress}
          accessibilityRole="button"
          style={[styles.action, { color: theme.primary }]}>
          {action}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  title: { fontSize: 18, fontWeight: '800' },
  action: { fontSize: 13, fontWeight: '600' },
});
