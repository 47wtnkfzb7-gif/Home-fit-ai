// Avatar évolutif — personnalisation cosmétique; les éléments se débloquent
// avec les XP réellement accumulés. Jamais de régression sur les acquis.

import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { Card, SectionHeader } from '@/components/ui';
import { levelFromXp, totalXp } from '@/features/gamification/xp';
import { getJson, setJson } from '@/services/db';
import { useTheme } from '@/hooks/use-theme';

type AvatarConfig = {
  skin: number;
  hair: 'short' | 'long' | 'curly';
  hairColor: number;
  outfit: number;
  accessory: 'none' | 'headband' | 'glasses' | 'cap';
};

const SKIN_COLORS = ['#F1C7A5', '#D99A66', '#8E5A33'];
const HAIR_COLORS = ['#2B2620', '#6B4A2B', '#C69C6D', '#DDDDDD', '#B03A2E', '#3E5C9A'];
const OUTFIT_COLORS = ['#FF6A00', '#35B875', '#3E5C9A', '#101114', '#B03A2E', '#C69C6D'];

// Éléments à débloquer : seuils d'XP réels (pas d'achat, pas de détection simulée).
const UNLOCKS: { accessory: AvatarConfig['accessory']; xpRequired: number; label: string }[] = [
  { accessory: 'none', xpRequired: 0, label: 'Aucun accessoire' },
  { accessory: 'headband', xpRequired: 150, label: 'Bandana (150 XP)' },
  { accessory: 'glasses', xpRequired: 400, label: 'Lunettes (400 XP)' },
  { accessory: 'cap', xpRequired: 800, label: 'Casquette (800 XP)' },
];

export default function AvatarScreen() {
  const theme = useTheme();
  const [config, setConfig] = useState<AvatarConfig>(() => {
    return (
      getJson<AvatarConfig>('avatar_config') ?? {
        skin: 0,
        hair: 'short',
        hairColor: 0,
        outfit: 0,
        accessory: 'none',
      }
    );
  });
  const [xp, setXp] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setXp(totalXp());
    }, []),
  );

  useEffect(() => {
    setJson('avatar_config', config);
  }, [config]);

  const level = levelFromXp(xp);

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      <Card title={`Niveau ${level.level}`} subtitle="Ton avatar évolue uniquement par la progression — jamais de régression.">
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <AvatarSvg config={config} bg={theme.surfaceMuted} accent={theme.primary} />
        </View>
      </Card>

      <SectionHeader title="Peau" />
      <Row>
        {SKIN_COLORS.map((c, i) => (
          <Swatch key={c} color={c} selected={config.skin === i} onPress={() => setConfig((p) => ({ ...p, skin: i }))} />
        ))}
      </Row>

      <SectionHeader title="Coupe de cheveux" />
      <Row>
        {(['short', 'long', 'curly'] as const).map((h) => (
          <Chip key={h} label={{ short: 'Courte', long: 'Longue', curly: 'Bouclée' }[h]} selected={config.hair === h} onPress={() => setConfig((p) => ({ ...p, hair: h }))} />
        ))}
      </Row>

      <SectionHeader title="Couleur de cheveux" />
      <Row>
        {HAIR_COLORS.map((c, i) => (
          <Swatch key={c} color={c} selected={config.hairColor === i} onPress={() => setConfig((p) => ({ ...p, hairColor: i }))} />
        ))}
      </Row>

      <SectionHeader title="Tenue" />
      <Row>
        {OUTFIT_COLORS.map((c, i) => (
          <Swatch key={c} color={c} selected={config.outfit === i} onPress={() => setConfig((p) => ({ ...p, outfit: i }))} />
        ))}
      </Row>

      <SectionHeader title="Accessoires (à débloquer)" />
      <Row>
        {UNLOCKS.map((u) => (
          <Chip
            key={u.accessory}
            label={u.label}
            selected={config.accessory === u.accessory}
            disabled={xp < u.xpRequired}
            onPress={() => setConfig((p) => ({ ...p, accessory: u.accessory }))}
          />
        ))}
      </Row>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>;
}

function Chip({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}>
      <Text style={{ color: selected ? theme.onPrimary : theme.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

function Swatch({ color, selected, onPress }: { color: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Couleur ${color}`}
      onPress={onPress}
      style={[
        styles.swatch,
        { backgroundColor: color, borderColor: selected ? theme.primary : theme.border, borderWidth: selected ? 3 : 1 },
      ]}
    />
  );
}

function AvatarSvg({ config, bg, accent }: { config: AvatarConfig; bg: string; accent: string }) {
  const skin = SKIN_COLORS[config.skin];
  const hairColor = HAIR_COLORS[config.hairColor];
  const outfit = OUTFIT_COLORS[config.outfit];
  return (
    <Svg width={180} height={200} viewBox="0 0 100 110">
      <Rect x={0} y={0} width={100} height={110} rx={14} fill={bg} />
      {/* corps / tenue */}
      <Path d="M50 62 C 32 62, 22 78, 22 104 L 78 104 C 78 78, 68 62, 50 62 Z" fill={outfit} />
      {/* cou */}
      <Rect x={44} y={52} width={12} height={12} rx={5} fill={skin} />
      {/* tête */}
      <Circle cx={50} cy={38} r={16} fill={skin} />
      {/* yeux */}
      <Circle cx={44} cy={36} r={1.6} fill="#16181D" />
      <Circle cx={56} cy={36} r={1.6} fill="#16181D" />
      {/* bouche */}
      <Path d="M45 43 Q 50 47 55 43" stroke="#16181D" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* cheveux */}
      {config.hair === 'short' && <Path d="M34 32 Q 50 18 66 32 Q 60 24 50 24 Q 40 24 34 32 Z" fill={hairColor} />}
      {config.hair === 'long' && (
        <>
          <Path d="M34 34 Q 50 16 66 34 Q 60 24 50 24 Q 40 24 34 34 Z" fill={hairColor} />
          <Path d="M34 34 Q 30 52 34 60 L 40 60 Q 36 48 38 34 Z" fill={hairColor} />
          <Path d="M66 34 Q 70 52 66 60 L 60 60 Q 64 48 62 34 Z" fill={hairColor} />
        </>
      )}
      {config.hair === 'curly' && (
        <>
          <Circle cx={38} cy={28} r={6} fill={hairColor} />
          <Circle cx={45} cy={24} r={6} fill={hairColor} />
          <Circle cx={55} cy={24} r={6} fill={hairColor} />
          <Circle cx={62} cy={28} r={6} fill={hairColor} />
        </>
      )}
      {/* accessoires */}
      {config.accessory === 'headband' && <Rect x={36} y={26} width={28} height={5} rx={2.5} fill={accent} />}
      {config.accessory === 'glasses' && (
        <>
          <Circle cx={44} cy={36} r={5} stroke="#16181D" strokeWidth={1.4} fill="none" />
          <Circle cx={56} cy={36} r={5} stroke="#16181D" strokeWidth={1.4} fill="none" />
          <Rect x={46} y={35.5} width={8} height={1} fill="#16181D" />
        </>
      )}
      {config.accessory === 'cap' && (
        <>
          <Path d="M34 30 Q 50 16 66 30 L 66 33 L 34 33 Z" fill={accent} />
          <Rect x={62} y={28} width={14} height={5} rx={2.5} fill={accent} />
        </>
      )}
      {/* bras */}
      <Ellipse cx={22} cy={86} rx={6} ry={13} fill={skin} />
      <Ellipse cx={78} cy={86} rx={6} ry={13} fill={skin} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
});
