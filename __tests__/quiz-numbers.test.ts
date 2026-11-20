// Régression : les questions à choix simple numériques (séances/semaine,
// durée des séances) recevaient des chaînes et étaient écrasées en null.

import { applyAnswer, QUESTIONS } from '@/features/quiz/questions';
import { emptyProfile } from '@/features/profile/types';

describe('Quiz — questions numériques à choix simple', () => {
  const sessions = QUESTIONS.find((q) => q.id === 'sessionsPerWeek')!;
  const minutes = QUESTIONS.find((q) => q.id === 'sessionMinutes')!;

  it('séances/semaine : la valeur de l\'option devient un nombre', () => {
    const next = applyAnswer(emptyProfile(), sessions, '3');
    expect(next.sessionsPerWeek).toBe(3);
  });

  it('séances/semaine : un nombre direct passe inchangé', () => {
    const next = applyAnswer(emptyProfile(), sessions, 5);
    expect(next.sessionsPerWeek).toBe(5);
  });

  it('séances/semaine : une valeur invalide donne null (jamais faux)', () => {
    expect(applyAnswer(emptyProfile(), sessions, 'beaucoup').sessionsPerWeek).toBeNull();
    expect(applyAnswer(emptyProfile(), sessions, '').sessionsPerWeek).toBeNull();
  });

  it('durée des séances : la valeur de l\'option devient un nombre', () => {
    const next = applyAnswer(emptyProfile(), minutes, '45');
    expect(next.sessionMinutes).toBe(45);
  });

  it('durée des séances : une valeur invalide donne null', () => {
    expect(applyAnswer(emptyProfile(), minutes, 'abc').sessionMinutes).toBeNull();
  });

  it('les questions à choix simples textuelles restent inchangées', () => {
    const level = QUESTIONS.find((q) => q.id === 'level')!;
    expect(applyAnswer(emptyProfile(), level, 'beginner').level).toBe('beginner');
  });
});
