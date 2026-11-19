# HOMEFIT AI

> « Ton corps, ton rythme, ton évolution. »

Application mobile de musculation intelligente, personnalisée et évolutive —
React Native + Expo + TypeScript, orientée local-first.

## État du projet

| Phase | Contenu | État |
|---|---|---|
| 1 | Identité visuelle, design system, navigation 6 onglets | ✅ |
| 2 | Questionnaire initial (10 questions) + profil persistant (SQLite) | ✅ |
| 3 | Bibliothèque 105 exercices + générateur de séances (8 formats) | ✅ |
| 4 | Statistiques, calendrier, avatar, XP/niveaux/badges | ✅ |
| 5 | Coach IA vidéo : pipeline réel caméra→frames→pose→notes /20 et /100 | ✅ (pose native requise — voir limitation honnête) |
| 6 | Nutrition : scanner repas, Open Food Facts, journal 4 repas | ✅ |
| 7 | Scanner QR + QR internes `homefitai://` | ✅ |
| 8 | Coach conversationnel (regex FR sur données réelles) | ✅ |
| 9 | Tests unitaires (jest, 28 tests), tsc et lint à 0 erreur | ✅ |
| 10 | Préparation App Store (eas.json, métadonnées, permissions FR) | ✅ (build final sur Mac + compte Apple requis) |

L'architecture cible complète est décrite dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Démarrer

```bash
npm install
npx expo start --ios
```

TypeScript : `npx tsc --noEmit` — Lint : `npx expo lint` — Tests : `npm test`.

## Principes produit

- **Aucune donnée factice** : les statistiques proviennent uniquement de séances réellement enregistrées.
- **Aucune analyse IA simulée** : si le traitement n'est pas possible (qualité vidéo, angle, luminosité), l'app l'explique et n'affiche aucune note trompeuse.
- **Bienveillance santé** : pas d'objectif de perte de poids imposé, pas de restriction, récupération respectée, douleur = arrêt + avis médical.
- **Confidentialité** : 100 % local, aucun compte requis, vidéos jamais conservées, suppression totale possible.

## Structure

```
src/app/          # Écrans & navigation (expo-router)
  (tabs)/         # Accueil, Entraînements, Coach IA, Nutrition, Progression, Profil
src/components/   # Design system (Card, PrimaryButton, EmptyState…)
src/constants/    # Design tokens (couleurs clair/sombre, typographie, spacing)
src/hooks/        # Hooks (useTheme…)
docs/             # Architecture & documentation produit
scripts/          # Génération des assets (icônes, splash)
```
