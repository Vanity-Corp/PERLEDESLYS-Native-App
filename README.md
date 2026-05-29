# PERLEDESLYS Native App

Application mobile Expo / Expo Router centrée sur l’expérience membre PERLEDESLYS. Le dashboard admin est volontairement hors périmètre.

## Architecture

- `src/app` : routes Expo Router avec groupes `(auth)`, `(tabs)`, `(protected)` et `modal`.
- `src/services` : couche service unique pour remplacer facilement les mocks par des endpoints réels.
- `src/mocks` : backend simulé avec latence, erreurs, pagination, refresh/session et données réalistes.
- `src/store` : stores légers inspirés Zustand pour auth, UI et contenus.
- `src/components` : composants UI, formulaires, cards, listes et éléments partagés.
- `src/features` : emplacement prévu pour modules métier plus larges.

## Identifiants mock

- Email/password : `premium@perledelys.app` / `password`
- Code privé : `LYS-PRIVE-2026`

## Commandes

```bash
npx tsc --noEmit
npx expo export --platform web --output-dir /tmp/perledelys-export
pnpm lint
```

> `pnpm lint` peut nécessiter le réseau au premier lancement car Expo tente de configurer ESLint automatiquement.
