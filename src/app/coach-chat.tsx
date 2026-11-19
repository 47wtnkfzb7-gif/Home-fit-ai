// Coach IA conversationnel — écran. Moteur regex FR sans LLM ni cloud :
// chaque réponse est construite à partir du profil, de la bibliothèque et des
// statistiques réelles. Une séance proposée peut être lancée directement.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { coachReply } from '@/features/coach/coach-engine';
import { useProfile } from '@/features/profile/profile-context';
import { setPendingPlan } from '@/features/workout/session-store';
import { useTheme } from '@/hooks/use-theme';

interface ChatMessage {
  id: number;
  from: 'user' | 'coach';
  text: string;
  hasPlan?: boolean;
}

let nextId = 1;

const SUGGESTIONS = [
  'Propose-moi une séance de 30 minutes sans matériel.',
  'Comment faire des pompes correctement ?',
  'Remplace le curl, je n’ai pas d’haltères.',
  'Analyse ma progression.',
];

export default function CoachChatScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId++,
      from: 'coach',
      text:
        'Salut ! Je suis ton coach HOMEFIT AI. Je m’appuie sur ton profil et ton historique — uniquement des données locales, sans compte ni serveur.\n\nEssaie par exemple : « propose-moi une séance de 30 minutes sans matériel ».',
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollViewInstance | null>(null);

  function send(raw?: string) {
    const content = (raw ?? input).trim();
    if (!content) return;
    const userMsg: ChatMessage = { id: nextId++, from: 'user', text: content };
    const reply = coachReply(content, profile);
    const coachMsg: ChatMessage = {
      id: nextId++,
      from: 'coach',
      text: reply.text,
      hasPlan: Boolean(reply.plan),
    };
    setMessages((m) => [...m, userMsg, coachMsg]);
    setInput('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Coach IA</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chat}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.coachBubble, { backgroundColor: m.from === 'user' ? theme.primary : theme.surface }]}>
            <Text style={{ color: m.from === 'user' ? theme.onPrimary : theme.text, lineHeight: 20 }}>{m.text}</Text>
            {m.hasPlan && m.from === 'coach' && (
              <View style={{ marginTop: Spacing.md }}>
                <PrimaryButton
                  icon="play"
                  label="Lancer cette séance"
                  onPress={() => {
                    const reply = coachReply(messages[messages.indexOf(m) - 1]?.text ?? '', profile);
                    if (reply.plan) {
                      setPendingPlan(reply.plan);
                      router.push('/seance');
                    }
                  }}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} onPress={() => send(s)} style={[styles.suggestion, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={{ color: theme.primary, fontSize: 12 }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.inputRow, { backgroundColor: theme.surface }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Écris à ton coach…"
          placeholderTextColor={theme.textTertiary}
          style={[styles.input, { color: theme.text }]}
          onSubmitEditing={() => send()}
        />
        <Pressable accessibilityRole="button" onPress={() => send()} style={[styles.send, { backgroundColor: theme.primary }]}>
          <Ionicons name="send" size={18} color={theme.onPrimary} />
        </Pressable>
      </View>
      <Text style={[styles.disclaimer, { color: theme.textTertiary, backgroundColor: theme.background }]}>
        Conseils pédagogiques uniquement — ne remplace pas un professionnel de santé.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  chat: { padding: Spacing.lg, gap: Spacing.md, flexGrow: 1 },
  bubble: { maxWidth: '88%' as const, borderRadius: 18, padding: Spacing.md },
  userBubble: { alignSelf: 'flex-end' as const, borderBottomRightRadius: 6 },
  coachBubble: { alignSelf: 'flex-start' as const, borderBottomLeftRadius: 6 },
  suggestions: { paddingHorizontal: Spacing.lg, gap: 6 },
  suggestion: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start' as const },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    margin: Spacing.lg,
    marginBottom: 0,
    borderRadius: 999,
    paddingLeft: Spacing.lg,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15 },
  send: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' as const, marginRight: 6 },
  disclaimer: { fontSize: 11, textAlign: 'center', paddingVertical: Spacing.sm },
});
