# HOMEFIT AI — Architecture complète du projet

> « Ton corps, ton rythme, ton évolution. »
> Application iOS de musculation intelligente, personnalisée et évolutive.

## 1. Vue d'ensemble

HOMEFIT AI est une application mobile **React Native + Expo + TypeScript**, orientée
**local-first** : toutes les fonctionnalités principales (séances, profil, historique,
avatar, journal alimentaire) fonctionnent **sans compte** et **hors connexion**.
Les fonctions nécessitant un service externe (analyse sémantique de repas) sont
isolées derrière des modules de service clairement identifiés, avec un mode dégradé
honnête : **jamais de résultat simulé**.

### Principes non négociables

1. **Aucune donnée factice** : chaque score/statistique affiché provient de données réellement enregistrées.
2. **Aucune analyse IA simulée** : si le traitement n'est pas possible (angle caméra, luminosité, qualité), l'app l'explique et n'affiche aucune note trompeuse.
3. **Bienveillance santé** : pas d'objectif de perte de poids imposé, pas de restriction alimentaire, récupération respectée, douleur = arrêt + avis médical.
4. **Minimisation des données** : stockage local, suppression totale possible, vidéos jamais conservées après analyse.

## 2. Stack technique

| Domaine | Choix | Justification |
|---|---|---|
| Framework | React Native (New Architecture) | UI native fluide, écosystème mature |
| Productivité | **Expo SDK 58** (managed workflow, CNG) | Builds EAS, updates OTA, pas de Xcode requis |
| Langage | TypeScript strict | Fiabilité des modèles |
| Navigation | **expo-router** + `NativeTabs` (file-based) | Navigation typée, deep links natifs (QR) |
| Base locale | **expo-sqlite** (schema versionné) | Vraie base relationnelle pour stats et historique |
| État | Contextes React légers + hooks | Simplicité, évolutive (sync cloud possible plus tard) |
| Thème | `useColorScheme` natif + design tokens | Mode clair/sombre système |
| Icônes | SF Symbols (iOS) via `NativeTabs.Trigger.Icon sf`, Ionicons dans l'UI | Icônes natives gratuites |
| Pose estimation | Abstraction `PoseAnalyzer` : MediaPipe Pose Landmarker (33 landmarks) ou ML Kit Pose, exécution **100 % sur l'appareil** | Vision par ordinateur réelle, privée |
| Caméra | `expo-camera` + `expo-video` | Capture + galerie |
| Codes-barres | `expo-camera` scanner + API **Open Food Facts** (gratuite, sans clé) | Scanner produits |
| QR | `expo-camera` + `expo-linking` | QR internes HOMEFIT ; QR externes → jamais ouverts automatiquement |
| Notifications | `expo-notifications` (opt-in) | Rappels facultatifs |
| Sauvegarde | Export/import JSON local | Sauvegarde/restauration sans serveur |
| i18n | Couche `fr` par défaut, hook `useTranslation` prévu | FR natif, EN prêt |

Aucune clé API secrète dans le client. Les fonctions IA distantes (si ajoutées plus
tard) passeraient par un backend sécurisé avec quotas transparents.

## 3. Design system (implémenté)

- `src/constants/theme.ts` : palette spec (fond clair `#F7F8FA`, sombre `#101114`,
  orange `#FF6A00`, vert `#35B875`, gris `#858A94`), échelle d'espacement 4 pts,
  rayons 12–28, échelle typographique.
- `src/hooks/use-theme.ts` : thème réactif clair/sombre.
- `src/components/ui/` : `Card`, `PrimaryButton`, `ProgressBar`, `EmptyState`,
  `Screen`, `ScreenHeader`, `SectionHeader`.
- Assets (icône, splash, icônes Android) générés par `scripts/generate-icons.mjs`
  (dumbbell géométrique orange, anti-aliasé par suréchantillonnage).

## 4. Navigation (implémentée)

Root `Stack` → groupe `(tabs)` avec 6 onglets natifs iOS :
`Accueil`, `Entraînements`, `Coach IA`, `Nutrition`, `Progression`, `Profil`,
plus un écran `confidentialite` (texte complet de politique de confidentialité).

## 5. Générateur de séances (implémenté — `src/features/engine/engine.ts`, bibliothèque `src/features/library/exercises.ts` : 105 exercices vérifiés)

### Bibliothèque d'exercices (SQLite, ≥ 100)

```
exercises(id, slug, name, category, primary_muscles[], secondary_muscles[],
          equipment[], difficulty 1-5, type{strength,mobility,warmup,core,cardio},
          cues[], common_mistakes[], easier_variant_id, harder_variant_id,
          is_home_safe, is_gym_only)
```

### Moteur `WorkoutEngine` (TypeScript pur, testable sans UI)

Entrées : profil (niveau, matériel, objectifs, groupes musculaires, contraintes,
âge), temps disponible, format (classique / circuit / full body / haut / bas /
sans matériel / court / récupération), historique (exercices récents, fatigue,
notes obtenues).

Sortie : séance **échauffement → principaux → complémentaires → retour au calme**,
séries/reps/repos calculés (double progression), anti-répétitivité via score de
récence, **remplacement automatique si matériel manquant**, plafonds de sécurité
selon l'âge et le niveau, exclusions des exercices à éviter.

## 6. Coach IA vidéo (implémenté —`src/features/pose/`)

```
Caméra/galerie → PoseLandmarker (33 landmarks × N frames)
→ Analyseur par exercice (pompes, squats, fentes, gainage, curl, développé,
   tractions, hip thrust, crunch, burpees)
→ { score /20, score /100, points positifs, erreurs, conseils, confidence }
```

- Critères uniquement **géométriquement observables** : angles (coude, tronc,
  hanche, genou), amplitude lockout→lockout, stabilité, régularité. Un critère
  non visible est marqué `not_measured` et sort du calcul — jamais pénalisé.
- `confidence` dépend du % de frames avec pose détectée, de la luminosité et de
  la stabilité caméra ; sous le seuil → aucune note certaine affichée, conseil
  de refilmer.
- Notation : `score100` exactement proportionnel à `score20` (score20 × 5).
- Bilan de fin de séance : moyenne pondérée sur les exercices **réellement
  évalués** uniquement (méthode transparente affichée).
- Vidéos supprimées immédiatement après calcul ; consentement explicite.

## 7. Nutrition (implémentée — `src/features/nutrition/foods.ts`, écrans scanner-repas / scanner-produits / journal)

- **Scanner repas** : la reconnaissance fiable d'une photo exige un modèle
  multimodal. Au lancement : capture + **saisie guidée** (bibliothèque d'aliments
  FR locale). Un backend optionnel pourra la proposer plus tard, avec incertitudes
  affichées et corrections manuelles. Jamais d'estimation inventée.
- **Scanner produits** : Open Food Facts v2 (gratuit, sans clé), cache local,
  saisie manuelle si produit absent.
- **Journal** : 4 repas + résumé protéines estimées, fourchettes indicatives,
  pas de quota imposé, pas d'objectif calorique, pas de compléments poussés.

## 8. Gamification (implémentée — `src/features/gamification/xp.ts`, écran avatar avec déblocages réels par XP)

- `xp_events` ; progression positive uniquement, **aucune régression crapulative** lors des pauses.
- Avatar vectoriel 5 slots (coiffure, tenue, couleurs, accessoires, apparence) avec débloquages cosmétiques.
- Badges, séries, défis personnels facultatifs, bilan hebdomadaire automatique.

## 9. Confidentialité & conformité App Store

- Permissions caméra/galerie avec textes explicites (déjà configurés dans `app.json`).
- Consentements révocables ; « Supprimer toutes mes données » = wipe complet.
- Aucun tracking, aucun compte, aucun partage automatique.
- Mode mineurs : recommandations adaptées, pas de restriction alimentaire.
- Publication : EAS build + `expo submit`, métadonnées FR, captures d'écran,
  politique de confidentialité hébergée, tests sur appareils cibles.
  Aucune prétention de publication tant que la soumission Apple n'a pas lieu.

## 10. Décisions assumées / limites

- Analyse de repas par IA visuelle : bloquée tant qu'aucun service non simulé n'est disponible ; l'app l'indique clairement et propose la saisie manuelle.
- Pose estimation : abstraction `PoseAnalyzer` pour choisir entre ML Kit Pose (rapide à intégrer) et MediaPipe Pose Landmarker (plus complet).
- i18n EN : couche prévue, implémentée à la Phase 2 avec le questionnaire.


## 11. État final de l'implémentation

- **Phases 1 à 8 complètes**, chaque bouton branché sur une fonction réelle (SQLite, moteur, Open Food Facts, caméra).
- **Tests** : `__tests__/` — 28 tests unitaires (moteur, pose/analyzers, bibliothèque, nutrition, XP) ; `npm test`.
- **Analyse vidéo** : pipeline complet (consentement → capture/import → extraction de frames → `PoseProvider` → `analyzeExercise` → persistance `video_analyses` → suppression vidéo/frames). Le fournisseur de pose natif (ML Kit / MediaPipe) exige un development build iOS ; tant qu'il n'est pas lié, l'app affiche un état indisponible explicite — jamais d'analyse simulée. Brancher un fournisseur réel ne demande que d'implémenter `PoseProvider` (`src/features/pose/provider.ts`).
- **Reconnaissance d'aliments** : aucun modèle embarqué dans ce build ; le scanner de repas est un guide honnête (photo = aide-mémoire, sélection + quantités + correction manuelle). Un futur modèle on-device (ou un backend sécurisé, sans clé dans le client) peut être branché sans changer l'UI.
- **App Store** : `eas.json` prêt (development/preview/production), permissions iOS expliquées en français dans `app.json`, politique de confidentialité in-app (`/confidentialite`), langue initiale FR avec libellés centralisés prêts pour la traduction EN.
- **Reste humain** : compte Apple Developer, build/submit EAS depuis un Mac, captures d'écran App Store, révision Apple.
