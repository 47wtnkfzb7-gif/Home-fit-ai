// Questionnaire initial HOMEFIT AI — quiz en 10 étapes avec barre de progression.
// Réponses modifiables à tout moment depuis l&apos;onglet Profil.

import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar, PrimaryButton } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import {
  EQUIPMENT_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  LOCATION_LABELS,
  MUSCLE_LABELS,
  TYPE_LABELS,
} from '@/features/profile/labels';
import { useProfile } from '@/features/profile/profile-context';
import { emptyProfile, isMinor, type UserProfile } from '@/features/profile/types';
import {
  QUESTIONS,
  applyAnswer,
  getInitialAnswer,
  type Option,
  type Question,
} from '@/features/quiz/questions';
import { useTheme } from '@/hooks/use-theme';

const INTRO_STEP = -1;
const RECAP_STEP = QUESTIONS.length;

export default function QuizScreen() {
  const theme = useTheme();
  const { save, profile } = useProfile();
  const [step, setStep] = useState<number>(INTRO_STEP);
  // Brouillon de réponses : départ du profil existant (mode édition)
  // ou profil vierge.
  const [draft, setDraft] = useState<UserProfile>(() => profile ?? emptyProfile());
  const [textValue, setTextValue] = useState<string>(
    profile?.avoidances ?? '',
  );

  const onboarding = getInitialOnboardingState(draft);

  const currentQuestion = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null;

  function updateDraft(answer: unknown) {
    if (!currentQuestion) return;
    setDraft((prev) => applyAnswer({ ...prev, hasOnboarded: prev.hasOnboarded }, currentQuestion, answer));
  }

  function canContinue(): boolean {
    if (currentQuestion === null) return step === RECAP_STEP ? true : false;
    const q = currentQuestion;
    switch (q.kind) {
      case 'number':
        return (
          typeof draft.age === 'number' &&
          draft.age >= (q.minNumber ?? 0) &&
          draft.age <= (q.maxNumber ?? 0)
        );
      case 'single':
        return (
          draft.level !== null ||
          draft.location !== null ||
          draft.sessionsPerWeek !== null ||
          draft.sessionMinutes !== null
        );
      case 'multi': {
        const list = getMultiValue(draft, currentQuestion.id);
        return Array.isArray(list) && list.length >= (currentQuestion.minSelections ?? 1);
      }
      case 'text':
        return true;
    }
  }

  function finish() {
    save({
      ...draft,
      avoidances: textValue,
      hasOnboarded: true,
    });
    router.replace('/(tabs)');
  }

  const progress =
    step < 0 ? 0 : Math.min(1, (step + 1) / (QUESTIONS.length + 1));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <Text style={[styles.brand, { color: theme.primary }]}>HOMEFIT AI</Text>
        {step > INTRO_STEP && step < RECAP_STEP && (
          <Text style={[styles.stepLabel, { color: theme.textSecondary }]}>
            Question {step + 1} / {QUESTIONS.length}
          </Text>
        )}
      </View>

      {step !== INTRO_STEP && (
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} height={6} />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          {step === INTRO_STEP && (
            <QuizIntro onStart={() => setStep(0)} theme={theme} />
          )}

          {currentQuestion && (
            <QuestionView
              question={currentQuestion}
              draft={draft}
              textValue={textValue}
              onTextValue={setTextValue}
              onSingle={(value) => updateDraft(value)}
              onMulti={(question) => (value: string) => {
                const list = getMultiValue(draft, question.id);
                if (Array.isArray(list)) {
                  const has = list.includes(value);
                  updateDraft(has ? list.filter((v) => v !== value) : [...list, value]);
                }
              }}
              onNumber={(value) => {
                const n = value === '' ? null : parseInt(value, 10);
                updateDraft(Number.isFinite(n) ? n : null);
              }}
              theme={theme}
              isMinorProfile={isMinor(draft)}
            />
          )}

          {step === RECAP_STEP && (
            <QuizRecap draft={draft} textValue={textValue} onboarding={onboarding} theme={theme} />
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          {step > INTRO_STEP ? (
            <Pressable accessibilityRole="button" onPress={() => setStep((s) => Math.max(INTRO_STEP, s - 1))}>
              <Text style={[styles.backLabel, { color: theme.textSecondary }]}>Retour</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => router.back()}>
              <Text style={[styles.backLabel, { color: theme.textTertiary }]}>Annuler</Text>
            </Pressable>
          )}

          {step < RECAP_STEP ? (
            <PrimaryButton
              label={step === QUESTIONS.length - 1 ? 'Voir le récapitulatif' : 'Continuer'}
              disabled={!canContinue()}
              onPress={() => setStep((s) => s + 1)}
            />
          ) : (
            <PrimaryButton label="Terminer la configuration" icon="checkmark" onPress={finish} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getInitialOnboardingState(profile: UserProfile): boolean {
  return profile.hasOnboarded;
}

function getMultiValue(draft: UserProfile, id: string): string[] | null {
  switch (id) {
    case 'goals':
      return draft.goals;
    case 'equipment':
      return draft.equipment;
    case 'muscleGroups':
      return draft.muscleGroups;
    case 'workoutTypes':
      return draft.workoutTypes;
    default:
      return null;
  }
}

function QuizIntro({ theme, onStart }: { theme: ReturnType<typeof useTheme>; onStart: () => void }) {
  return (
    <View style={styles.intro}>
      <View style={[styles.introIcon, { backgroundColor: theme.primaryMuted }]}>
        <Ionicons name="sparkles" size={34} color={theme.primary} />
      </View>
      <Text style={[styles.introTitle, { color: theme.text }]}>
        Construisons ton profil
      </Text>
      <Text style={[styles.introText, { color: theme.textSecondary }]}>
        10 questions, 2 minutes. Tes réponses pilotent la génération de tes séances :
        ton niveau, ton matériel, ton temps disponible et ta récupération.
      </Text>
      <Text style={[styles.introNote, { color: theme.textTertiary }]}>
        Ton profil reste sur cet appareil, sans compte. Tu pourras tout modifier
        à tout moment depuis l&apos;onglet Profil.
      </Text>
      <PrimaryButton label="Commencer" icon="arrow-forward" onPress={onStart} />
    </View>
  );
}

function QuestionView({
  question,
  draft,
  textValue,
  onTextValue,
  onSingle,
  onMulti,
  onNumber,
  theme,
  isMinorProfile,
}: {
  question: Question;
  draft: UserProfile;
  textValue: string;
  onTextValue: (value: string) => void;
  onSingle: (value: string) => void;
  onMulti: (question: Question) => (value: string) => void;
  onNumber: (value: string) => void;
  theme: ReturnType<typeof useTheme>;
  isMinorProfile: boolean;
}) {
  return (
    <View style={styles.questionWrap}>
      <Text style={[styles.questionTitle, { color: theme.text }]}>{question.title}</Text>
      {question.subtitle && (
        <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
          {question.subtitle}
        </Text>
      )}

      {question.kind === 'single' && question.options && (
        <View style={styles.options}>
          {question.options.map((option) => {
            const selected = isSingleSelected(question, draft, option);
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => onSingle(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: selected ? theme.primaryMuted : theme.surface,
                    borderColor: selected ? theme.primary : theme.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={selected ? theme.primary : theme.textSecondary}
                  />
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    { color: selected ? theme.primary : theme.text },
                  ]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.kind === 'multi' && question.options && (
        <View style={styles.options}>
          {question.options.map((option) => {
            const list = getMultiValue(draft, question.id) ?? [];
            const selected = list.includes(option.value);
            return (
              <Pressable
                key={option.value}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => onMulti(question)(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: selected ? theme.primaryMuted : theme.surface,
                    borderColor: selected ? theme.primary : theme.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}>
                {option.icon && (
                  <Ionicons
                    name={selected ? 'checkmark-circle' : (option.icon ?? 'ellipse-outline')}
                    size={20}
                    color={selected ? theme.primary : theme.textSecondary}
                  />
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    { color: selected ? theme.primary : theme.text },
                  ]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.kind === 'number' && (
        <View style={styles.numberWrap}>
          <TextInput
            accessibilityLabel={question.title}
            keyboardType="number-pad"
            value={draft.age !== null ? String(draft.age) : ''}
            onChangeText={onNumber}
            maxLength={2}
            placeholder="00"
            placeholderTextColor={theme.textTertiary}
            style={[
              styles.numberInput,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
              },
            ]}
          />
          <Text style={[styles.numberUnit, { color: theme.textTertiary }]}>ans</Text>
        </View>
      )}

      {question.kind === 'text' && (
        <View style={styles.textWrap}>
          <TextInput
            accessibilityLabel={question.title}
            multiline
            value={textValue}
            onChangeText={onTextValue}
            placeholder={question.placeholder}
            placeholderTextColor={theme.textTertiary}
            style={[
              styles.textInput,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
              },
            ]}
          />
        </View>
      )}

      {question.id === 'age' && isMinorProfile && draft.age !== null && (
        <Text style={[styles.minorNote, { color: theme.success }]}>
          Recommandations adaptées aux moins de 18 ans : aucun objectif de régime,
          aucune restriction, intensité maîtrisée. 💪
        </Text>
      )}
    </View>
  );
}

function isSingleSelected(question: Question, draft: UserProfile, option: Option): boolean {
  switch (question.id) {
    case 'level':
      return draft.level === option.value;
    case 'location':
      return draft.location === option.value;
    case 'sessionsPerWeek':
      return String(draft.sessionsPerWeek) === option.value;
    case 'sessionMinutes':
      return String(draft.sessionMinutes) === option.value;
    default:
      return false;
  }
}

function QuizRecap({
  draft,
  textValue,
  onboarding,
  theme,
}: {
  draft: UserProfile;
  textValue: string;
  onboarding: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  const rows: { label: string; value: string }[] = [
    {
      label: 'Âge',
      value: draft.age !== null ? `${draft.age} ans` : '—',
    },
    {
      label: 'Niveau',
      value: draft.level ? LEVEL_LABELS[draft.level] : '—',
    },
    {
      label: 'Objectifs',
      value: draft.goals.length
        ? draft.goals.map((g) => GOAL_LABELS[g]).join(', ')
        : '—',
    },
    {
      label: 'Lieu',
      value: draft.location ? LOCATION_LABELS[draft.location] : '—',
    },
    {
      label: 'Matériel',
      value: draft.equipment.length
        ? draft.equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ')
        : '—',
    },
    {
      label: 'Fréquence',
      value: draft.sessionsPerWeek !== null ? `${draft.sessionsPerWeek} séances/semaine` : '—',
    },
    {
      label: 'Durée',
      value: draft.sessionMinutes !== null ? `${draft.sessionMinutes} minutes` : '—',
    },
    {
      label: 'Groupes musculaires',
      value: draft.muscleGroups.length
        ? draft.muscleGroups.map((m) => MUSCLE_LABELS[m]).join(', ')
        : '—',
    },
    {
      label: 'Types',
      value: draft.workoutTypes.length
        ? draft.workoutTypes.map((t) => TYPE_LABELS[t]).join(', ')
        : '—',
    },
    { label: 'Contraintes', value: textValue === '' ? 'Aucune' : textValue },
  ];

  return (
    <View style={styles.recap}>
      <Text style={[styles.questionTitle, { color: theme.text }]}>Ton profil</Text>
      <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
        {onboarding
          ? 'Tu peux modifier chaque réponse via le questionnaire ou directement ci-dessous à tout moment.'
          : 'Vérifie tes informations, puis enregistre.'}
      </Text>
      <View style={[styles.recapCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {rows.map((row) => (
          <View key={row.label} style={styles.recapRow}>
            <Text style={[styles.recapLabel, { color: theme.textTertiary }]}>{row.label}</Text>
            <Text style={[styles.recapValue, { color: theme.text }]}>{row.value}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.recapSafety, { color: theme.textTertiary }]}>
        Rappelez-vous : en cas de douleur, arrêtez l&apos;exercice et demandez un avis médical.
        HOMEFIT AI ne remplace pas un professionnel de santé.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  brand: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  stepLabel: { fontSize: 12, fontWeight: '600' },
  progressWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  backLabel: { fontSize: 14, fontWeight: '600' },
  intro: { alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing.xxxl },
  introIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  introText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  introNote: { fontSize: 12, lineHeight: 17, textAlign: 'center' },
  questionWrap: { gap: Spacing.md },
  questionTitle: { fontSize: 23, fontWeight: '800', lineHeight: 29 },
  questionSubtitle: { fontSize: 14, lineHeight: 20 },
  options: { gap: Spacing.md },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  numberWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.md,
  },
  numberInput: {
    width: 110,
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center' as const,
    paddingVertical: 12,
  },
  numberUnit: { fontSize: 16, fontWeight: '600' },
  textWrap: {},
  textInput: {
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 110,
    padding: 14,
    textAlignVertical: 'top' as const,
  },
  minorNote: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  recap: { gap: Spacing.md },
  recapCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 8,
  },
  recapRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  recapLabel: { fontSize: 12, fontWeight: '600' },
  recapValue: { fontSize: 13, fontWeight: '600', textAlign: 'right' as const, flexShrink: 1 },
  recapSafety: { fontSize: 11, lineHeight: 16 },
});
