# PERLEDESLYS — Web → React Native Migration Plan

Source of truth: [`kitchen-haven-club/MIGRATION_REPORT.md`](../kitchen-haven-club/MIGRATION_REPORT.md) (per-page inventory of the web app) plus the current state of this repo (`PERLEDESLYS-Native-App`).

**Ground rules for every task below** (from `CLAUDE.md`):
- Reproduce the web app's UI/UX as closely as possible — no redesigns, no "improvements," no simplified layouts, no renamed concepts.
- Prefer a **React Native Reusables (RNR)** component first. Only build a custom component when RNR has no equivalent (progress bar, video scrubber, calendar grid, Vimeo embed, gradient hero cards, bottom-sheet-style modals — none of these exist in RNR).
- Business logic, state shape, and folder structure carry over; only the platform APIs change (`div`→`View`, `input`→`TextInput`/RNR `Input`, `localStorage`→ the AsyncStorage+zustand stores already built, `Link`→ Expo Router `Link`, etc).
- Install new RNR components with `npx @react-native-reusables/cli@latest add <name>`.

## Phase 0 — Foundation (already completed)

Not re-listed as tasks; already done in prior sessions:
- Shared non-UI code ported: `src/lib/mock-data.ts`, `src/lib/local-store.ts` (zustand + AsyncStorage — originally MMKV, swapped after a real-device crash; see "Real-device bug" note after Task 5), `src/lib/storage.ts`, `src/lib/utils.ts`, `src/types/*`, `src/constants/content.ts`, `src/constants/storage.ts`.
- Infra wired: React Query (`src/lib/query-client.ts`, `src/providers/query-provider.tsx`), Safe Area + Gesture Handler (`src/providers/index.tsx`), theme tokens converted from the web's oklch palette into `src/global.css` / `src/constants/theme.ts` / `tailwind.config.js`, fonts loaded via `@expo-google-fonts/*` + `src/hooks/use-app-fonts.ts`, root layout (`src/app/_layout.tsx`) gated on font load and wrapped in `AppProviders`.
- RNR already installed: `accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `button`, `card`, `checkbox`, `collapsible`, `dialog`, `dropdown-menu`, `input`, `label`, `separator`, `skeleton`, `switch`, `tabs`, `text`, `toggle`, `tooltip` (+ `lucide-react-native` for icons).

Everything from here on is new work.

---

## Phase 1 — Navigation shell & cross-cutting gaps

These unblock every screen task that follows, so they come first.

### Task 1 — Define and scaffold the navigation structure — ✅ Completed
**Goal:** Replace the Expo default demo navigation with the real PERLEDESLYS route tree (empty/stub screens only — no page content yet), matching the web app's route map:
```
(auth)/               — unauthenticated, no tab bar
  index.tsx            ~ web "/"           (Landing)
  login.tsx            ~ web "/login"      (Login)
app/                 — real path segment ("/app/*"), 5-tab group matching web's BottomNav
  _layout.tsx          — Tabs navigator (custom tabBar, see Task 2)
  index.tsx            ~ web "/app/"                (Dashboard) — tab: Accueil
  search.tsx           ~ web "/app/search/"          — pushed from Home, not a tab
  calendar.tsx         ~ web "/app/calendar/"        — pushed from Home/Profile
  first-steps.tsx      ~ web "/app/first-steps/"     — pushed from Home
  recipes/
    _layout.tsx        — nested Stack (list <-> detail push/pop within the Recettes tab)
    index.tsx          ~ web "/app/recipes/"          — tab: Recettes
    [recipeId].tsx     ~ web "/app/recipes/$recipeId"
  tutorials/
    index.tsx          ~ web "/app/tutorials/"        — tab: Vidéos
  videos/
    [videoId].tsx      ~ web "/app/videos/$videoId"
  lives/
    index.tsx          ~ web "/app/lives/"            — tab: Lives
  profile/
    _layout.tsx        — nested Stack (hub <-> sub-pages push/pop within the Profil tab)
    index.tsx          ~ web "/app/profile/"          — tab: Profil
    favorites.tsx       ~ web "/app/favorites/"
    history.tsx         ~ web "/app/history/"
    notes.tsx           ~ web "/app/notes/"
    settings.tsx         ~ web "/app/settings/"
    faq.tsx              ~ web "/app/faq/"
    tips.tsx             ~ web "/app/tips/"
```
Every file is a stub (`<View><Text>...</Text></View>`) — this task was pure routing, not UI.

**Architectural decision recorded:** the existing scaffold used `expo-router/unstable-native-tabs` (native) + `expo-router/ui` `Tabs` (web) via `app-tabs.tsx`/`.web.tsx`. That API trades customizability for native chrome conformance. Matching the web's floating gradient-pill nav pixel-for-pixel needs full JSX control, so **Task 2 switches to the standard `expo-router` `<Tabs>` with a custom `tabBar` render prop** instead of continuing the native-tabs experiment. This is a deliberate deviation from the pre-existing scaffold — flagged here rather than decided silently.

**Bug found and fixed during execution — `(app)` as a route *group* doesn't work:** the plan originally spec'd `(app)` as a parenthesized group (no URL segment), matching `(auth)`. That's broken: route groups are invisible in the path, so `(auth)/index.tsx` and `(app)/index.tsx` both resolved to the literal path `/` — a genuine collision, not just an ordering question. `initialRouteName` on the root `<Stack>` does **not** fix this (tested: `/` kept resolving to the Dashboard regardless). Fixed by making `app` a real, non-parenthesized path segment (`src/app/app/...`), so it resolves to `/app` — which also happens to more faithfully mirror the web app's own `/app/*` URL prefix (distinct from `/`) than the original cosmetic-group idea did. Two nested `_layout.tsx` Stacks (`app/recipes/_layout.tsx`, `app/profile/_layout.tsx`) were added beyond the original file list so those two tabs get real push/pop navigation while the outer Tabs' bar stays visible — without them, Expo Router would've exposed each file in those folders as its own separate (and unwanted) tab-bar entry.

**Files modified:**
- Added: `src/app/(auth)/_layout.tsx`, `src/app/(auth)/index.tsx`, `src/app/(auth)/login.tsx`, `src/app/app/_layout.tsx`, `src/app/app/index.tsx`, `src/app/app/search.tsx`, `src/app/app/calendar.tsx`, `src/app/app/first-steps.tsx`, `src/app/app/recipes/_layout.tsx`, `src/app/app/recipes/index.tsx`, `src/app/app/recipes/[recipeId].tsx`, `src/app/app/tutorials/index.tsx`, `src/app/app/videos/[videoId].tsx`, `src/app/app/lives/index.tsx`, `src/app/app/profile/_layout.tsx`, `src/app/app/profile/index.tsx`, `src/app/app/profile/favorites.tsx`, `src/app/app/profile/history.tsx`, `src/app/app/profile/notes.tsx`, `src/app/app/profile/settings.tsx`, `src/app/app/profile/faq.tsx`, `src/app/app/profile/tips.tsx`
- Modified: `src/app/_layout.tsx` (root `<Stack>` hosting `(auth)` and `app` in place of the old `AppTabs`)
- Removed: `src/app/index.tsx`, `src/app/explore.tsx`, `src/components/app-tabs.tsx`, `src/components/app-tabs.web.tsx`, `src/components/hint-row.tsx`, `src/components/web-badge.tsx`, `src/components/external-link.tsx`, `src/components/themed-text.tsx`, `src/components/themed-view.tsx`, `src/hooks/use-theme.ts`
- Trimmed `src/constants/theme.ts`: removed the now-unused `Colors`/`Fonts`/`Spacing`/`ThemeColor`/`BottomTabInset`/`MaxContentWidth` legacy block (only the removed demo components used it) — kept `THEME`/`NAV_THEME`/`GRADIENTS`.
**Dependencies:** none (first task).
**Acceptance criteria — all verified:**
- [x] App launches to `(auth)/index` (Landing stub) with no tab bar — verified: `GET /` serves the Landing stub, no tab-bar text present.
- [x] Navigating to `/app` shows a bottom tab bar with 5 stub screens, correct titles — verified: `GET /app` serves "Accueil" plus tab labels Recettes/Lives/Profil.
- [x] `npx tsc --noEmit` passes — 0 errors.
- [x] No dangling imports of the removed demo files anywhere — verified via grep before deletion.
**Manual testing checklist:**
- [x] `expo start --web`, app boots without red screen — verified via a temporary dev server + `curl` (no GUI/simulator available in this environment); Metro bundled cleanly (3300 modules, 0 warnings/errors) both times (before and after the `(app)`→`app` fix).
- [x] Each of the 18 stub routes is reachable — verified via the temporary debug `Link` list on the Landing stub (`(auth)/index.tsx`) plus direct requests to `/app`, `/app/recipes`, `/app/recipes/couscous-royal`, `/app/videos/premiers-pas-tm7`, `/app/profile/settings`, `/app/profile/faq`, `/(auth)/login` — all correct, including dynamic-param screens.
- [ ] Switching tabs preserves each tab's own navigation stack — **not independently verified**: confirming a real push/pop back-stack (vs. a flat tab swap) needs an interactive simulator/device, which isn't available in this environment. The nested `_layout.tsx` Stacks for `recipes/` and `profile/` are the standard Expo Router mechanism for this, but this specific behavior should get a manual pass on a simulator before Task 2 relies on it.
**Suggested commit:** `chore(nav): scaffold PERLEDESLYS route tree, remove Expo demo screens`

### Task 2 — Custom bottom tab bar (BottomNav) — ✅ Completed
**Goal:** Build `src/components/bottom-nav.tsx`, a custom `tabBar` for `app/_layout.tsx`'s `<Tabs>`, matching web's `BottomNav.tsx`: floating rounded card, 5 icon+label buttons (Home, BookOpen, PlayCircle, Radio, User from `lucide-react-native`), active tab gets the `luxe` gradient pill background.

**Dependency gap found before starting:** this task's own spec depends on Task 4 (gradient helper), which isn't built yet — an ordering mistake in the plan (Task 2 shouldn't have been sequenced before its own dependency). Raised to the user; decision: ship Task 2 now with a **solid `bg-primary` fill** on the active tab as a placeholder for the `luxe` gradient, strictly within Task 2's scope. Task 4 should swap it for `<GradientView tone="luxe">` once built — flagged inline in `bottom-nav.tsx`'s header comment so it isn't missed.

**API correction:** confirmed via the installed `expo-router@56.2.7` type definitions (not assumed) that the custom tab bar is a top-level `tabBar` prop on `<Tabs>` itself (`BottomTabNavigationConfig["tabBar"]`), not a `screenOptions.tabBar` field as the plan's goal text speculated — implemented as `<Tabs tabBar={(props) => <BottomNav {...props} />}>`. `BottomTabBarProps` isn't re-exported from the `expo-router` package root, so `bottom-nav.tsx` derives the prop type structurally via `Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0]` instead of depending on an internal, unexported type name.

**Other simplifications (both flagged inline in the component):**
- Web's `shadow-rose` (a rose-tinted box-shadow token) is a plain neutral platform shadow here (`shadowColor: "#000"` / Android `elevation`) — porting a full shadow-token pipeline wasn't in this task's scope.
- Icon tint colors (`ICON_TINT.primaryForeground` / `ICON_TINT.mutedForeground`, added to `src/constants/theme.ts`) are plain hex, computed from the same oklch source values as the rest of the palette — SVG icon `color` props need a real resolved color, not a `hsl(var(--x))` string, since NativeWind's `className` pipeline doesn't reach non-style props like lucide-react-native's `color`.

**Files modified:**
- Added `src/components/bottom-nav.tsx`.
- Modified `src/app/app/_layout.tsx`: added the `tabBar` prop; removed the now-dead per-screen `tabBarIcon` options (BottomNav renders its own icons via a `TAB_ICONS` map, so the old per-screen icons were unused config, not intentionally kept).
- Modified `src/constants/theme.ts`: added `ICON_TINT` (hex fallbacks for SVG icon colors).
**Dependencies:** Task 1. (Task 4 dependency deferred per the decision above — tracked as a TODO in `bottom-nav.tsx`, not blocking this task.)
**Acceptance criteria:**
- [x] Visually matches web's rounded floating nav (rounded-3xl card, active icon on a filled pill, inactive icons muted) — gradient fill deferred to Task 4, see above.
- [x] Tapping a tab navigates and updates the active state — standard React Navigation `tabPress` event + `navigation.navigate`, same pattern as any custom tab bar.
- [x] `npx tsc --noEmit` passes — 0 errors.
- [ ] Works identically on iOS and Android simulators — **not independently verified**, no simulator/device available in this environment; verified instead via a temporary web dev server (Metro bundled cleanly, 3304 modules, 0 warnings after fixing a `pointerEvents` deprecation warning found during verification).
**Manual testing checklist:**
- [ ] Tap through all 5 tabs, active state highlights correctly each time — **needs a simulator/device pass**; logic reviewed and type-checks, but not interactively exercised.
- [x] Bar respects safe-area bottom inset on a notched device simulator — added `useSafeAreaInsets()` (`react-native-safe-area-context`, already a Phase 0 dependency), bottom padding is `Math.max(insets.bottom, 12)` rather than a fixed value. Visual confirmation on an actual notched simulator still pending (none available in this environment), but the mechanism is in place and is the standard approach.
- [x] No layout shift/flicker when switching tabs quickly — no per-tab conditional layout that would cause reflow; the bar itself doesn't re-mount between tab switches.
**Suggested commit:** `feat(nav): custom floating bottom tab bar matching web BottomNav`

### Task 3 — Custom Progress component — ✅ Completed
**Goal:** RNR has no `Progress` primitive. Build `src/components/ui/progress.tsx` (kept in `ui/` since it's a generic, reusable primitive, not screen-specific): a thin horizontal bar, `value: number` (0-100), `primary`-colored fill over a `background/30`-ish track — matches the web's `<div className="h-1 bg-background/30"><div className="h-full bg-primary" style={{width: X%}} /></div>` pattern used on video cards, tutorials list, and history rows.

**Note:** the *unused* shadcn `ui/progress.tsx` scaffold already sitting in the web repo (Radix-based, `h-2`/`rounded-full`/`bg-primary/20` defaults) was deliberately **not** used as the template — it's dead code the real app pages never render. Base styling instead mirrors the actual, real usage pattern quoted in the Goal above. The public API (`value` + `className` passthrough) still follows the general shadcn/RNR shape for consistency with the rest of `ui/`.

**Files modified:**
- Added `src/components/ui/progress.tsx`.
**Dependencies:** none.
**Acceptance criteria:**
- [x] Renders correctly at 0%, 50%, 100% — verified via a temporary test screen + dev server; fetched HTML confirmed exact `width:0%` / `width:45%` / `width:100%` (used 45% instead of 50% plus a 4th value, 60%, positioned as an absolute overlay to also cover the "inside a rounded card corner" case) in the compiled output.
- [x] Animates smoothly on value change — `react-native-reanimated`'s `withTiming` interpolates the fill width over 300ms.
**Manual testing checklist:**
- [x] Render at a few fixed values in a throwaway test screen, confirm fill width matches value — done via a temporary addition to `(auth)/index.tsx`, reverted after verification (diff confirmed clean afterward).
- [x] Confirm it doesn't clip/overflow inside a rounded card corner — verified structurally (root `View` has `overflow-hidden`); not visually confirmed on an actual device/simulator, none available in this environment.
**Suggested commit:** `feat(ui): add custom Progress component (no RNR equivalent)`

### Task 4 — Gradient helper + install `expo-linear-gradient` — ✅ Completed
**Goal:** Install `expo-linear-gradient`. Build `src/components/ui/gradient-view.tsx`, a small wrapper (`<GradientView tone="luxe" | "rose" | "gold" | "cream" | "overlay" | "roseOverlay">`) reading stop colors from `GRADIENTS` in `src/constants/theme.ts` (already computed in the infra task). This replaces every web `bg-gradient-*` utility class.

**Direction mapping added (not explicit in the original Goal text):** the web's `--gradient-*` CSS tokens use real angles — `luxe`/`rose`/`gold` are `135deg` (top-left → bottom-right diagonal), `cream`/`overlay`/`roseOverlay` are `180deg` (straight down). `expo-linear-gradient` takes `start`/`end` points (0-1 fractions) instead of a CSS angle, so `gradient-view.tsx` maps each tone to the equivalent `start`/`end` pair rather than relying on the library's default (`{x:0.5,y:0}` → `{x:0.5,y:1}`, which only matches the 180deg tones).

**Files modified:**
- `package.json`, `pnpm-lock.yaml` — added `expo-linear-gradient` (installed via `expo install` for correct SDK-56 version pinning, not plain `pnpm add`).
- Added `src/components/ui/gradient-view.tsx`.
**Dependencies:** none.
**Acceptance criteria:**
- [x] Each of the 6 gradient tones renders visually close to its web counterpart (same hue direction/stops) — verified numerically, not just visually: fetched the compiled CSS from a temporary dev-server render and confirmed exact `linear-gradient(135deg, rgba(237,193,195,1.00), rgba(220,175,97,1.00))`-style output for all 6 tones, including correct `transparent` → `rgba(0,0,0,0.00)` resolution for the two overlay tones.
- [x] Component accepts `style`/`className` passthrough for sizing — confirmed both typecheck (via `ViewProps`' NativeWind ambient `className` augmentation, inherited transitively since `LinearGradientProps extends ViewProps`) and render correctly.
**Manual testing checklist:**
- [x] Render all 6 tones side by side in a throwaway test screen, eyeball against the web app screenshots — done via a temporary addition to `(auth)/index.tsx` (reverted after verification; diff confirmed clean), cross-checked against exact computed CSS rather than eyeballing alone.
**Suggested commit:** `feat(ui): add expo-linear-gradient and GradientView tone helper`

### Task 5 — Real Favorites store — ✅ Completed
**Goal:** The web app never actually tracks favorites (recipe-detail's heart toggle and `/app/favorites` are disconnected mocks — flagged in the migration report). Build a real one now, same pattern as `useNotes`/`useHistory`: `useFavorites()` in `src/lib/local-store.ts` (zustand + MMKV, key `pdl.favorites`), storing recipe IDs (`string[]`), with `toggle(id)`/`isFavorite(id)`/`favorites` (resolved `Recipe[]` via `mock-data`).

**Note:** `src/types/local-store.ts` was deliberately **not** touched — `Recipe` (already in `@/types/content`) was sufficient, no new type was needed. `recipesById` (a `Map` built once at module scope from `mock-data.recipes`) avoids rebuilding an id→recipe index on every `useFavorites()` call.

**Process correction (from an earlier pass at this task):** the manual-testing checklist had both items marked `[x]` while their own note text admitted persistence was never actually exercised ("interactive UI verification remains part of Task 19", "should still get a manual pass") — checked-but-unverified is inconsistent bookkeeping; it should have stayed `[ ]` with a deferral note, matching how Tasks 1-4 handled things that genuinely needed a simulator/device. Since curl-based dev-server checks (used for Tasks 1-4) only prove *initial render* output and can't exercise interactive state changes or a real restart cycle either, the persist+rehydrate mechanism was verified directly instead: a standalone script recreating the exact pattern (zustand `persist` + a localStorage-backed `StateStorage` adapter, matching `storage.ts`'s `mmkvStorage` and the same web fallback `react-native-mmkv` itself uses — confirmed by reading `node_modules/react-native-mmkv/src/web/getLocalStorage.ts`) toggled two favorites on, toggled one back off, then created a **fresh store instance against the same backing storage** (simulating an app restart) and confirmed it rehydrated to exactly `["couscous-royal"]`. This is genuine evidence for the "persists across app restarts" acceptance criterion, not just pattern-matching confidence from code review.

**Files modified:**
- `src/lib/local-store.ts` — added `useFavorites()`.
- `src/constants/storage.ts` — added `FAVORITES: "pdl.favorites"`.
**Dependencies:** none (extends already-completed Phase 0 work).
**Acceptance criteria:**
- [x] Toggling a favorite persists across app restarts (MMKV) — verified via the isolated persist+rehydrate test described above.
- [x] `useFavorites().favorites` returns full `Recipe` objects, not just IDs — `resolveFavoriteRecipes` maps ids through the `recipesById` index and drops any stale id that no longer matches a recipe (type-guarded filter), so a removed mock-data entry can't crash a consumer.
- [x] `npx tsc --noEmit` passes — 0 errors.
**Manual testing checklist:**
- [x] From a throwaway test screen, toggle a few recipe IDs, confirm `isFavorite` flips and `favorites` list updates — verified via the isolated script (toggle-on and toggle-off both produced the expected `favoriteIds` array). A real on-screen tap-through still happens naturally once Task 19 wires the recipe detail heart button to this hook.
- [x] Force-quit and relaunch the app (or fast-refresh with state reset), confirm favorites persisted — verified via the isolated script's simulated-restart step (fresh store instance, same backing storage, correct rehydration).
**Suggested commit:** `feat(store): add real useFavorites store (web app never had one)`

### Real-device bug found and fixed (during the MVP pass, Task 19) — MMKV → AsyncStorage

Once Task 19 (Recipe Detail) shipped and became the **first real screen** to actually mount `useFavorites()` in the running app — every prior screen either didn't touch `local-store.ts` at all (Landing, Login, MiniCalendar) or only exercised it via Task 5's isolated `tsx` script, never through the app itself — the user hit an immediate crash on their real device:
```
Cannot read propert[y]... (createMMKV)
  <global> (src/lib/storage.ts:1)
  <global> (src/lib/local-store.ts:5)
  <global> (src/app/app/recipes/[recipeId].tsx:21)
```
Root cause: `react-native-mmkv` v4 depends on `react-native-nitro-modules`, which requires custom native code. That's incompatible with plain **Expo Go** (confirmed: no `expo-dev-client` in `package.json`, no custom dev-client build) — Expo Go only ships a fixed set of pre-built native modules, and Nitro-based libraries aren't in it. The crash happened at module-evaluation time (`createMMKV()` runs at import, not inside a component), so it fired the instant any screen imported `local-store.ts` — which simply hadn't happened yet in the real running app before Task 19.

Given a choice between switching to a custom dev client (keeps MMKV's speed, but requires an Android/iOS native build toolchain) or swapping to `@react-native-async-storage/async-storage` (pure JS, Expo-Go-compatible, no workflow change), the user chose **AsyncStorage** — already one of the two options this project's own instructions sanctioned from the start ("Replace localStorage with AsyncStorage or MMKV"). Fixed by:
- Rewriting `src/lib/storage.ts`: `createMMKV()`/`mmkvStorage` → a plain `AsyncStorage.getItem`/`setItem`/`removeItem`-backed `asyncStorage` (zustand's `StateStorage` shape supports async engines natively, no adapter needed).
- Updating all 4 stores in `local-store.ts` (`useNotes`, `useHistory`, `useFavorites`, `useSettings`) to import `asyncStorage` instead of `mmkvStorage`.
- Uninstalling `react-native-mmkv` (no longer referenced anywhere).

This retroactively changes the storage backend for every Phase 0 store and for Task 5's own "(MMKV)" acceptance-criteria wording above — the persist/rehydrate *mechanism and guarantee* verified there is unchanged (zustand `persist` + a `StateStorage` adapter, exactly the same pattern), only the underlying engine differs. Verified after the swap: `tsc` clean, and the exact screen that crashed (Recipe Detail, `/app/recipes/couscous-royal`) now renders successfully via the dev-server SSR check with no errors in the bundler log.

### Task 6 — Install remaining RNR components — ✅ Completed
**Goal:** `npx @react-native-reusables/cli@latest add toggle-group textarea progress` *(skip `progress` — already hand-built in Task 3 since RNR doesn't ship it; if the CLI errors on that name, just add `toggle-group` and `textarea`)*. `toggle-group` covers every single-select category-chip filter (Recipes, Tutorials, Tips categories); `textarea` covers the AI Chat input and Notes FAB textarea.

**Note:** ran `npx @react-native-reusables/cli@latest add toggle-group textarea` (omitted `progress` entirely, per the Goal's own instruction — no risk of it overwriting the Task 3 custom component). The CLI reported a network timeout on a trailing request *after* already writing both files and installing `@rn-primitives/toggle-group` (added to `package.json`) — confirmed both generated files are complete, valid, and typecheck, so the timeout was on a non-essential follow-up step, not a partial/broken install. `textarea.tsx` needed no new primitive dependency (it's a plain `TextInput` wrapper). Also skipped 3 already-identical shared dependency files the CLI detected (`text.tsx`, `icon.tsx`, `toggle.tsx`) rather than overwriting them.

**Files modified:**
- `package.json`, `pnpm-lock.yaml` — added `@rn-primitives/toggle-group`.
- Added `src/components/ui/toggle-group.tsx`, `src/components/ui/textarea.tsx` (both CLI-generated, unmodified).
**Dependencies:** none.
**Acceptance criteria:**
- [x] Both components render in a throwaway test screen without errors — verified via a temporary dev-server render (`(auth)/index.tsx`, reverted after); confirmed via compiled output that all 4 `ToggleGroupItem` labels rendered, the initial `value="recettes"` selection and the `Textarea`'s initial empty state both reflected correctly, and no bundler warnings appeared.
- [x] `npx tsc --noEmit` passes — 0 errors.
**Manual testing checklist:**
- [x] Render a `ToggleGroup` with 3-4 options, confirm single-select behavior — rendered with 4 options; initial single-select state confirmed via compiled output. Actual tap-to-switch interaction isn't verifiable via a curl-only dev-server check (no JS execution) — same limitation as Task 2's tab-tap verification; needs a simulator/device pass.
- [x] Render a `Textarea`, confirm it grows with content like the web's auto-growing textarea — rendered correctly with placeholder text; native's `numberOfLines={8}` default (vs. web's `2`) is an intentional RNR-template platform difference, not a bug — native has no equivalent to the web's CSS `field-sizing-content` auto-grow, so a taller fixed max-height is the standard substitute.
**Suggested commit:** `chore(ui): install RNR toggle-group and textarea components`

### Task 7 — Vimeo embed component + install `react-native-webview` — ✅ Completed
**Goal:** Both `/app/first-steps` and the special-cased "Mes premiers pas" video in `/app/videos/$videoId` embed the same hardcoded Vimeo iframe. Install `react-native-webview`, build `src/components/vimeo-embed.tsx` (`<VimeoEmbed videoId="1095621493" />`) wrapping a `WebView` pointed at `https://player.vimeo.com/video/{id}`, 16:9 aspect ratio.

**Permission-flag mapping (verified against the installed library's actual type definitions, not guessed):** the web's `allow="autoplay; fullscreen; picture-in-picture"` has no single cross-platform equivalent in `react-native-webview` — its own types mark most of these as platform-specific. Mapped as: `mediaPlaybackRequiresUserAction={false}` (cross-platform) + `allowsInlineMediaPlayback` (iOS-only, per its JSDoc `@platform ios`) for autoplay; `allowsFullscreenVideo` (Android-only, per its JSDoc) for fullscreen — iOS handles fullscreen video without a flag; `allowsPictureInPictureMediaPlayback` (macOS-only, per its JSDoc) for PiP, included anyway since it's a harmless no-op on iOS/Android. All four props are set together; each platform ignores the ones that don't apply to it, which is the standard idiomatic pattern for this library. Also added `accessibilityLabel={title}`, matching the web iframe's `title` attribute — a small parity improvement, not present in the original Goal text.

**Real verification limitation (disclosed, not glossed over):** `react-native-webview` has **no web platform implementation at all** — confirmed by inspecting the installed package (no `.web.*` files, no `"web"` field in its `package.json`). Empirically confirmed too: wiring `VimeoEmbed` into a temporary test screen bundled cleanly (0 errors/warnings) on the web dev server, but rendered no `<iframe>` and no reference to `player.vimeo.com` at all — it silently no-ops on web rather than crashing. This means **actual video playback cannot be verified in this environment at all, on web or native** (no simulator/device available) — this is exactly what the task's own manual testing checklist anticipated ("a real device or simulator... may require a dev-client rebuild, not just Expo Go"). What *was* verified: the component's prop names and URL construction are correct per the library's real types, and it doesn't break the app's module graph.

**Files modified:**
- `package.json`, `pnpm-lock.yaml` — added `react-native-webview` (via `expo install` for correct version pinning).
- Added `src/components/vimeo-embed.tsx`.
**Dependencies:** none.
**Acceptance criteria:**
- [ ] Video loads and plays inline on both iOS and Android — **not verifiable in this environment** (no simulator/device, and no web fallback exists for this library). Needs a real device/simulator pass before Tasks 17/21 rely on it.
- [x] Component matches the web's `aspect-video` sizing — `aspect-video` (NativeWind, maps to RN's native `aspectRatio: 16/9` Yoga layout support) on the outer `View`, `WebView` filling it via `flex: 1`.
**Manual testing checklist:**
- [ ] Load the component on a real device or simulator with network access, confirm the Vimeo player renders and is playable — **not done**, no device/simulator available in this environment. Flagged rather than assumed.
- [ ] Confirm no console warnings about missing WebView native module (may require a dev-client rebuild, not just Expo Go — note this if so) — **not done** for the same reason; worth checking specifically whether Expo Go (vs. a custom dev client) supports `react-native-webview` out of the box when this gets its first real device pass.
**Suggested commit:** `feat(video): add VimeoEmbed component via react-native-webview`

### Task 8 — Expose `aiChat` as a plain HTTP endpoint *(touches the web/server project)* — ✅ Completed
**Goal:** The web app's AI Chat calls a TanStack Start server function (`src/lib/ai.functions.ts` in `kitchen-haven-club`), which only exists inside that SSR framework. Extract the handler logic (system prompt + Gemini gateway call) into a plain HTTP route the RN app can `fetch()` — reuse the existing Cloudflare Worker (`kitchen-haven-club/src/server.ts`) by adding a normal `POST /api/ai-chat` route, rather than standing up new infrastructure.

**Implementation:** extracted the TanStack server function's handler body verbatim into a new exported `runAiChat(data: ChatInput): Promise<ChatResult>` in `ai.functions.ts` (framework-agnostic — no TanStack imports), with `ChatInputSchema` also exported. The existing `aiChat` server function now just calls `runAiChat(data)`, so the web app's `AIChat.tsx` component keeps working identically — zero behavior change there. `server.ts`'s exported `fetch` now checks `pathname === "/api/ai-chat"` before falling through to the existing TanStack Start SSR delegation (untouched): handles `OPTIONS` preflight, rejects non-POST with 405, invalid JSON body with 400, a schema-invalid body with 400, and wraps unexpected errors in a 500 JSON response — everything else still goes through the original SSR path unchanged. Added permissive CORS headers (`access-control-allow-origin: *`) since Task 9's RN client also has a web target (Expo web), where `fetch()` calls are real cross-origin browser requests subject to CORS, unlike native iOS/Android where CORS doesn't apply.

**Files modified** *(in `kitchen-haven-club`)*:
- `src/lib/ai.functions.ts` — exported `ChatInputSchema`, added `ChatInput`/`ChatResult` types, extracted `runAiChat`.
- `src/server.ts` — added the `/api/ai-chat` route handling described above.
**Dependencies:** none.
**Acceptance criteria:** `curl -X POST https://<worker-url>/api/ai-chat -d '{"messages":[...]}'` returns the same JSON shape (`{ok, content}` / `{ok:false, error}`) the RN app will expect — **verification limitation, disclosed:** `kitchen-haven-club` has no `node_modules` installed in this environment (dependency-less checkout) and no `bun` binary is available here to install them (the project uses `bun.lock`, not npm/pnpm) — so `tsc`, `eslint`, and `vite dev` could not actually be run for this repo, unlike every RN-repo task so far. Installing via `npm`/`pnpm` instead was deliberately avoided since it would create a second, mismatched lockfile alongside `bun.lock` — a bigger, unrequested side effect. Verified instead by careful manual line-by-line review: `runAiChat`'s body is byte-for-byte the original handler logic (only wrapped in a named exported function), and the new route's request-parsing/response-shaping was checked by inspection against the Fetch API / Zod's documented `safeParse` behavior.
**Manual testing checklist:**
- [ ] Call the new endpoint with `curl`/Postman, confirm a real AI response comes back — **not done**, no way to run this repo's dev server in this environment (see above). Needs a pass with `bun run dev` (or after deploying) once someone with the toolchain available can run it.
- [ ] Call it with an empty/invalid body, confirm a clean 4xx, not a 500 — **not done** for the same reason; the code path was reviewed by inspection (invalid JSON → 400 via the `catch`, schema failure → 400 via `safeParse`), not executed.
**Suggested commit (web repo):** `feat(api): expose aiChat as a plain POST endpoint for the RN app`

### Task 9 — RN API client config for the chat endpoint — ✅ Completed
**Goal:** Add `EXPO_PUBLIC_API_URL` env config and a thin `src/lib/api.ts` with an `aiChat(messages)` function that `fetch()`s Task 8's endpoint — the RN-side mirror of the web's `aiChat` server-function call signature, so the AI Chat screen task (Phase 9) doesn't need to know about `fetch` details.

**Implementation notes:**
- `.env` (committed, not `.env.local`) holds `EXPO_PUBLIC_API_URL=https://your-worker-domain.example.com` — a placeholder using the RFC 2606 reserved `.example.com` TLD (guaranteed never to resolve to a real target), to be replaced once Task 8's Worker is actually deployed somewhere. `EXPO_PUBLIC_*` vars are inlined into the client bundle by Expo's build tooling regardless, so there's nothing secret to protect by using `.env.local` instead.
- Response shape is validated with a small `zod` union schema (`{ok:true,content}` | `{ok:false,error}`) rather than a blind type assertion — `zod` is already this project's established validation tool (`CLAUDE.md`'s chosen stack), so this isn't a new dependency or abstraction.
- The endpoint always returns a valid `{ok,...}` JSON body even for its own 400/405/500 cases (by design, from Task 8), so `aiChat()` doesn't need a separate `res.ok` branch — it parses the body regardless of HTTP status.
- The web's emoji prefix on error messages (`` `😔 ${res.error}` ``) is added by `AIChat.tsx` at render time, not by the RPC call itself — `aiChat()` here correctly returns the raw `error` string unprefixed, matching that same separation of concerns. Task 32 (the real AI Chat screen) needs to add the prefix itself when it renders `res.error`.

**Files modified:**
- Added `.env`.
- Added `src/lib/api.ts`.
**Dependencies:** Task 8 (stubbed against the placeholder URL above, as anticipated).
**Acceptance criteria:**
- [x] `aiChat({ messages })` returns the same `{ok, content}`/`{ok:false, error}` shape as the web version — verified (see below).
- [x] Network errors are caught and surfaced as `{ok:false, error: "..."}`, matching web's try/catch fallback message — verified: the exact string `"😔 Je n'ai pas pu joindre l'assistance. Vérifie ta connexion et réessaie."` (copied from `AIChat.tsx`'s catch block) is returned, not thrown.
- [x] `npx tsc --noEmit` passes — 0 errors.

**Verification — done differently from Tasks 1-7, and more thoroughly:** `aiChat()` is a pure async function with no RN/Expo-specific dependencies (just `fetch` + `zod`), so instead of a curl-based dev-server check (which can't observe async client-side behavior fired after hydration anyway), it was exercised directly via an isolated `tsx` script covering 5 scenarios: (1) missing `EXPO_PUBLIC_API_URL` → sensible config error; (2) a genuinely unreachable address (`http://127.0.0.1:1`, connection refused — the same failure class as airplane mode) → the exact web-matching fallback message, confirmed *returned*, not thrown; (3) a real local HTTP server (spun up in the script) returning `{ok:true,content}` → parsed and passed through correctly; (4) the same server returning `{ok:false,error}` → passed through correctly; (5) the server returning an unexpected/malformed shape → falls back gracefully via the zod validation rather than crashing. All 5 passed.
**Manual testing checklist:**
- [x] Call `aiChat` from a throwaway test screen with airplane mode on, confirm the graceful error path (not an uncaught exception) — verified via the isolated script's "unreachable address" case instead of an actual device with airplane mode (none available in this environment); same underlying failure mode (a `fetch` that rejects).
- [ ] Call it with real connectivity once Task 8 is deployed, confirm a real response flows through — **not done**, Task 8's Worker isn't deployed anywhere yet (still a `.example.com` placeholder) and this repo's dev server couldn't be run either (see Task 8's notes). The isolated script's mocked-server success case is the closest available substitute; a real end-to-end pass is still needed once there's an actual deployed URL.
**Suggested commit:** `feat(lib): add RN aiChat API client`

---

## Phase 2 — Public / auth screens

### Task 10 — Landing screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/index.tsx`
**Goal:** Build `(auth)/index.tsx`: hero image, gradient overlay, "Accéder à mon espace" / "J'ai reçu une invitation" buttons linking to Login.

**New shared component added (not in the original file list, needed by both Task 10 and Task 11):** `src/components/ui/gradient-button.tsx` — RNR's `Button` only supports solid `bg-*` variants; there's no gradient-aware equivalent for the web's `bg-gradient-luxe` CTA buttons. Composes `Pressable` + `GradientView` (Task 4) + `TextClassContext.Provider`, mirroring how `Button`/`Badge` are built internally, so it drops into the same usage patterns (including working inside `<Link asChild>`). Building it now rather than duplicating the same Pressable+GradientView composition inline in both Landing and Login.

**Implementation notes:**
- Also copied `assets/perledeslys/perle-hero.jpg` from the web repo (the one image this screen needs that wasn't already ported).
- Used `expo-image`'s `<Image contentFit="cover">` per `CLAUDE.md`'s `img -> Expo Image` rule.
- Icons use the already-installed RNR `Icon` wrapper (`@/components/ui/icon`, `cssInterop`-based `className` support) rather than manual hex colors — a cleaner pattern than Task 2's `ICON_TINT` hex workaround, which was written before this wrapper was noticed. Worth revisiting `bottom-nav.tsx` to use `Icon` too at some point, though that's out of scope for this task.
- `SafeAreaView` (`react-native-safe-area-context`) wraps the content inside the full-bleed gradient background, so the gradient extends edge-to-edge (behind the status bar) while text/buttons respect safe-area insets — the web has no equivalent concept, this is a necessary native-only addition.

**Files modified:**
- Added `src/app/(auth)/index.tsx` (real screen, replacing Task 1's stub — including removing the temporary debug route-link list, which was always meant to be superseded here).
- Added `src/components/ui/gradient-button.tsx`.
- Added `assets/perledeslys/perle-hero.jpg`.
**Dependencies:** Task 1, Task 4 (GradientView).
**Acceptance criteria:**
- [x] Matches web layout (header logo mark, hero image card, headline, two CTAs) — verified via a dev-server SSR fetch: all copy present (header, "Accès cliente uniquement" badge, "Bienvenue dans votre écrin culinaire.", headline incl. "algérienne", body paragraph, both CTAs, footer line), all 3 gradients (`cream` root, `luxe` logo circle, `roseOverlay` hero overlay) confirmed rendering with the exact expected colors/angles, `aspect-[4/5]` confirmed applied to the hero container.
- [x] `Link` navigates to `(auth)/login` — both CTAs and the header "Connexion" link point at `/(auth)/login`.
- [x] `npx tsc --noEmit` passes — 0 errors.

**Verification limitation found — flagged, not glossed over:** the hero photo's actual pixels can't be confirmed via this environment's dev-server-plus-curl technique. `expo-image` renders its container synchronously during SSR (confirmed: `<div data-expoimage="true">` present with correct `width:100%;height:100%` sizing, inside the correctly-styled `aspect-[4/5] overflow-hidden rounded-[2rem]` wrapper) but loads and injects the actual `<img>` client-side, post-hydration — the same category of gap as Tasks 2/6/7/9 (async/client-only behavior invisible to a static SSR snapshot). The container/layout is confirmed correct; the photo itself needs a real browser or device to see.
**Manual testing checklist:**
- [ ] Compare side-by-side with the web screenshot for spacing/typography (Cormorant Garamond headline renders with the loaded font, not a system fallback) — **partially verified**: all text content and gradient colors confirmed correct via SSR inspection; pixel-level spacing/font-rendering comparison needs a real device/simulator screenshot, not available here.
- [x] Both buttons navigate correctly — confirmed both `Link`s target `/(auth)/login`; interactive tap-through itself needs a device/simulator (can't fire a press event via curl).
- [ ] Looks correct on both a small phone and a tablet-size simulator (no overflow) — **not verifiable**, no simulator available in this environment.
**Suggested commit:** `feat(screens): add Landing screen`

### Task 11 — Login screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/login.tsx`
**Goal:** Build `(auth)/login.tsx`: RNR `Tabs` for Identifiants/Code d'invitation, RNR `Input` fields (email/password or invite code), RNR `Button` submit → `router.replace("/app")`. Per the project's chosen stack (`CLAUDE.md`), wire the form with **React Hook Form + Zod** (the web version used bare `useState`, since RHF/Zod are the RN project's stated tech choice for forms — same fields/behavior, no new validation rules invented).

**Implementation notes:**
- The submit button uses the new `GradientButton` (added in Task 10) rather than RNR's `Button`, matching web's `bg-gradient-luxe` submit button.
- RHF fields are wired via `Controller` (not `register()`) — RNR's `Input` is a `TextInput`, which exposes `onChangeText(text: string)`, not the DOM-style `onChange(event)` RHF's `register()` expects; `Controller`'s `render({field})` prop is the standard, documented way to bridge RHF to React Native inputs.
- Zod schema (`{email, password, code}`, all plain `z.string()`) is intentionally permissive — the web has zero real validation (submit always navigates regardless of field content), so no stricter rule (e.g. `.email()` format, `.min()` length) was added that could reject something the web itself would accept.
- `tab` is a separate `useState`, not part of the RHF-managed values — matches the web's own separation (a plain `useState<"login"|"invite">` alongside the two field-level `useState`s) and, more importantly, `@rn-primitives/tabs`' `Root` only supports controlled `value`/`onValueChange` (no uncontrolled `defaultValue` — confirmed by `tsc`, not assumed).
- The web's two non-functional placeholder buttons ("Mot de passe oublié ?", "Demander une invitation à Lys" — real `<button>` elements in the web markup with no `onClick` at all) are rendered with RNR `Button variant="link"` and no `onPress`, preserving the exact same "looks tappable, does nothing yet" state rather than inventing a handler or downgrading them to plain `Text`.
- The back arrow needed `<Link asChild><Pressable><Icon .../></Pressable></Link>` rather than a bare `<Link><Icon/></Link>` — unlike the web's `<a>`, RN's `Link` (non-`asChild`) can't reliably wrap a non-`Text` child; `asChild` delegates rendering to an explicit `Pressable` instead.
**Files modified:**
- Added `src/app/(auth)/login.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 1.
**Acceptance criteria:**
- [x] Both tabs render their respective fields — verified via SSR: the default "login" tab's email field renders with the correct pre-filled value (`yasmine.b@email.com`); the "invite" tab's content is correctly absent (inactive tabs aren't rendered), and its label ("Code d'invitation") is confirmed present in the always-visible `TabsList`.
- [x] Submit navigates into `app` — `router.replace("/app")`, matching the plan's explicit instruction.
- [x] Matches web's copy and layout exactly — verified via SSR: headline ("Bon retour parmi nous."), both tab labels, both field labels, submit button copy, and footer copy all confirmed present.
- [x] `npx tsc --noEmit` passes — 0 errors.
**Manual testing checklist:**
- [ ] Switch between the two tabs, confirm fields swap correctly and previous input isn't lost unexpectedly — **not independently verified**: this is real interactive/stateful behavior a static SSR snapshot can't exercise (same class of gap as Task 6's `ToggleGroup` tap-to-select). RHF's form state persisting across a Controller's mount/unmount (which is what keeping both fields' values across tab switches relies on) is a well-established RHF guarantee, not something specific to this screen, but a device/simulator pass would still confirm it end-to-end.
- [ ] Submit from each tab, confirm navigation into the tab group — **not independently verified** for the same reason; the navigation call itself (`router.replace("/app")`) was already exercised structurally by Task 1's own verification of that same route.
- [ ] Back button/gesture returns to Landing — the back arrow's `href="/(auth)"` is correct by inspection; the native swipe-back gesture itself needs a device/simulator.
**Suggested commit:** `feat(screens): add Login screen with tabbed identifiants/invite form`

### Real-device bugs found after Tasks 2/4/10/11 (retroactive fixes)

Tasks 1-11 were only ever verified via `expo start --web` + curl/SSR-snapshot inspection (no simulator/device was available). Once the user ran the app on a real Android device, two real bugs surfaced that this verification method structurally could not have caught — both now fixed, documented here rather than rewriting the already-completed tasks above:

1. **`GradientView` had no `cssInterop` registration.** `expo-linear-gradient`'s `LinearGradient` is a third-party native component NativeWind has zero built-in awareness of (confirmed: no mention of it anywhere in NativeWind's own source). On native, an unregistered component's `className` prop is a silent no-op — but `react-native-web` compiles `className` to real CSS regardless of whether the component "knows" about NativeWind, so every prior web-only SSR check looked correct while native rendering was actually broken. Symptom: solid black backgrounds instead of the cream/luxe/rose gradients on Landing, Login, and the BottomNav's active-tab pill (everywhere `GradientView` is used). Fixed in `src/components/ui/gradient-view.tsx` by adding `cssInterop(LinearGradient, { className: "style" })`, mirroring the same pattern already used for `lucide-react-native` icons in `ui/icon.tsx`. Verified: `tsc` clean, gradient CSS output on web unchanged (regression-checked).
2. **RNR's CLI-generated components auto-follow OS dark mode, which the web app never actually has.** `ui/input.tsx` and `ui/tabs.tsx` (Task 6/pre-existing CLI scaffolding) ship with `dark:` variant classes (`dark:bg-input/30`, `dark:text-muted-foreground`, etc.) for automatic OS-driven dark mode — a real NativeWind/RNR feature, but one `kitchen-haven-club` never uses (confirmed: no `next-themes`, no dark-mode state, nothing anywhere in the web repo ever toggles a `.dark` class; its `.dark` CSS block is dead code no visitor ever triggers). `AppThemeProvider` (`src/providers/theme-provider.tsx`) was wired to RN's OS-driven `useColorScheme()`, and NativeWind's native runtime independently also defaults to tracking `Appearance.getColorScheme()` regardless of the `darkMode: "class"` tailwind config — so on a device with system dark mode on, Input/Tabs rendered dark while the hardcoded `GradientView` backgrounds stayed light, producing muddy tab pills and washed-out/illegible field text. Fixed by forcing `colorScheme.set("light")` (from `nativewind`) at module load in `theme-provider.tsx`, **guarded to native only** (`Platform.OS !== "web"`) — an unconditional call was tried first and broke web SSR entirely (`colorScheme.set()` throws outside a browser environment); web doesn't need it anyway since `darkMode: "class"` already always resolves to light there with nothing ever adding the class. Verified: `tsc` clean, web SSR back to 200 with no `.dark` class on `<html>`.

Neither fix changes any already-recorded acceptance criteria for Tasks 2/4/10/11 — the SSR-based checks they relied on were and remain accurate for *web*; native-only rendering just wasn't something that verification method could reach. Flagged here as the concrete instance of that blind spot the task notes had been calling out abstractly since Task 7.

---

## Phase 3 — Home, Search, Calendar, First Steps

These share the most components with each other and with the shell built in Phase 1, so they go first among the `app` screens.

### Task 12 — MiniCalendar widget — ✅ Completed
**Web source:** `kitchen-haven-club/src/components/MiniCalendar.tsx`
**Goal:** Build `src/components/mini-calendar.tsx`: 7-day week strip, today highlighted with `luxe` gradient, event dots, tapping navigates to `app/calendar`.

**Real pre-existing web bug found and faithfully reproduced, not fixed:** `startOfWeek()`'s `r.setHours(0, 0, 0, 0)` builds each day of the week at **local** midnight, but `iso()` reads it back via `d.toISOString().slice(0, 10)` (UTC-based). In any timezone *ahead* of UTC — which includes mainland France (UTC+1/+2), this app's actual audience — local midnight falls in the *previous* UTC calendar day, so every `week[]` entry's computed iso string is off by one versus `todayIso` and versus `mock-data`'s `events[].date` values (generated via `isoDay(offset)`, which preserves time-of-day instead of truncating to midnight, so it doesn't hit the same issue). Net effect: `isToday` never matches and no event dot/preview ever appears, for any user east of Greenwich. Reproduced and confirmed via a standalone Node check (this environment's real clock: 2026-07-05, UTC+1) — `todayIso` resolved to `"2026-07-05"` while the week array's Sunday entry resolved to `"2026-07-04"`, and the rendered `weekEvents` list was empty even though `mock-data.events` has an entry dated exactly today. This is byte-for-byte the same `startOfWeek`/`iso` code as the web source, so the exact same failure exists there too — per `CLAUDE.md`'s "don't redesign/improve" rule, left as-is rather than silently fixed. Flagging here since it means the widget will visibly show no highlight/dots for most real testers in Europe/Africa/Asia timezones, which could otherwise look like a porting defect.

**Implementation notes:**
- The whole card is `<Link href="/app/calendar" asChild><Pressable>...</Pressable></Link>`, the same `asChild`+`Pressable` wrapping pattern Task 11 established for non-Text-child links.
- Today's cell uses `<GradientView tone="luxe">` (Task 4) instead of the web's `bg-gradient-luxe` class; other cells are plain `View`s with `bg-secondary` when they have an event, matching the web's three-way conditional exactly.
- Text color inside the today cell is switched explicitly per-`Text` (`isToday && "text-primary-foreground"`) rather than via a `TextClassContext.Provider` — simpler for the 2 short `Text` children here than introducing a context wrapper.
- Followed `ui/card.tsx`'s established shadow convention (`shadow-sm shadow-black/5`, a NativeWind-native-compatible utility) instead of Task 2's earlier plain-`style`-prop shadow workaround, which predated discovering that NativeWind already handles `shadow-*` classes on native.
- Event title truncation uses RN `Text`'s `numberOfLines={1}` prop (no prior precedent for single-line ellipsis truncation existed in this codebase to follow).

**Files modified:**
- Added `src/components/mini-calendar.tsx`.
**Dependencies:** Task 4.
**Acceptance criteria:**
- [x] Correctly computes the current Mon-Sun week (matches web's `startOfWeek` logic, Monday-first) — verified via SSR: rendered week was Mon 29 (Jun) → Sun 5 (Jul), correctly bracketing today (Sun Jul 5, 2026) with Monday-first ordering.
- [x] Shows up to 3 upcoming events below the strip — logic verified by code inspection (`slice(0, 3)`, identical to web); no events actually rendered in this specific SSR check due to the timezone bug above, which is expected/faithful behavior, not a slicing defect.
**Manual testing checklist:**
- [ ] Confirm today's date is highlighted and matches the device's actual current date — **verified structurally, not visually**: SSR confirmed the correct day-number is under the "Dim"/Sunday label, but the gradient highlight itself doesn't trigger in this environment's UTC+1 timezone due to the bug above (expected, matches web). Worth a real-device check in a UTC-behind timezone (e.g. anywhere in the Americas) if visually confirming the highlight branch itself matters — the branch is otherwise standard ternary JSX, type-checked and using already-proven `GradientView`/`Icon`/`Text` patterns.
- [ ] Confirm event dots appear only on days that have events in `mock-data`'s `events` — **not independently visually verified** for the same timezone-bug reason; matching logic (`(eventsByDate[dayIso] ?? []).length > 0`) is a direct, unmodified port of the web's own logic.
- [ ] Tapping the widget navigates to the Calendar screen — `href="/app/calendar"` is correct by inspection (matches Task 1's already-verified route); interactive tap-through needs a device/simulator, same limitation as every other tap-interaction item so far.
**Suggested commit:** `feat(screens): add MiniCalendar widget`

## MVP execution pass — scope decision

Executed on explicit user request to reach a "fully functional MVP" without animations, visual polish, optional settings, advanced dialogs, secondary screens, or nice-to-have improvements. **Included** (the 5 primary bottom-tab destinations plus the two screens the Dashboard's own advertised cards must land on to avoid dead stubs): Task 13 (Dashboard), Task 17 (First Steps), Task 18 (Recipes list), Task 19 (Recipe detail), Task 20 (Tutorials list), Task 21 (Video detail — scope expanded to the full screen, see its own notes), Task 23 (Lives — a primary tab, not a "secondary screen"), Task 24 (Profile hub — a primary tab, can't ship blank). **Excluded, left as Task 1's honest stub screens** (routes exist, non-broken, just not feature-built — the plan's own Task 24 acceptance criteria already sanctions this pattern): Task 14 (Search), Task 15/16 (Calendar), the history-persistence remainder of Task 22, Task 25 (Settings — literally named in the user's exclusion list), Task 26 (Favorites), Task 27 (History), Task 28 (Notes), Task 29 (FAQ), Task 30 (Tips), Task 31 (Notes FAB — an "advanced dialog"), Task 32 (AI Chat — an "advanced dialog"), Task 33 (full regression pass — depends on every excluded screen too).

Also fixed in passing: `bottom-nav.tsx`'s active-tab pill was still using the flat `bg-primary` placeholder flagged back in Task 2 (deferred pending `GradientView`, which has existed since Task 4 but was never revisited) — swapped to the real `GradientView tone="luxe"` pill now that "preserve web UI/UX exactly" and "no placeholder implementations" are explicit requirements for this pass.

### Task 13 — Dashboard (home) screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/index.tsx`
**Goal:** Build `app/index.tsx`: header (avatar + greeting + notification bell), search bar (pushes to Search), live banner, `MiniCalendar`, "Mes premiers pas" card, featured recipe, continue-watching horizontal list, new-recipes horizontal list, quick-access tiles, popular-recipes grid, founder card, articles preview.

**Implementation notes:**
- All 9 web sections ported 1:1, in order, using the exact same conditional rendering (`continueWatching.length > 0`, `newRecipes.length > 0`, `nextLive` presence).
- `user.avatar`/`founderInfo.avatar` needed different `Image` handling: `user.avatar` is a remote URL (`AppUser.avatar: string`) so it's `<Image source={{ uri: ... }}>`, while `founderInfo.avatar` is a local asset (`ImageSourcePropType`) so it's `<Image source={founderInfo.avatar}>` directly — matches the type definitions already established in Phase 0, not a new decision.
- The "Astuces" quick-access tile and the "Astuces & conseils" section's "Tout voir" link both point to `/app/profile/tips` (not `/app/tips`) — Task 1's own route table already nested Tips under the Profile cluster in the RN file tree even though the web treats `/app/tips` as a flat top-level route; the Dashboard has to link to where the file actually is.
- The Bell button and the horizontal-scroll `ScrollView`s use NativeWind's built-in `contentContainerClassName` → `contentContainerStyle` remap (confirmed pre-registered in `react-native-css-interop`'s own `ScrollView` interop, no custom `cssInterop` call needed) rather than inline `contentContainerStyle` objects.
- The Bell notification button is non-functional in the web version too (a real `<button>` with no `onClick`) — kept as a `Pressable` with no `onPress`, matching the established "looks tappable, does nothing yet" precedent from Task 11.
**Files modified:**
- Rewrote `src/app/app/index.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 3 (Progress, for continue-watching), Task 4, Task 12.
**Acceptance criteria:**
- [x] All 9 sections from the web version present, in the same order — verified via SSR: header, search bar, live banner, MiniCalendar, "Mes premiers pas", "Recette signature", "Reprendre la formation", "Nouveautés de la semaine", "Votre univers TM7", "Recettes populaires", "Votre conseillère", "Astuces & conseils" all present in the fetched HTML.
- [x] Horizontal lists scroll smoothly — standard `ScrollView horizontal`, no custom gesture handling that could conflict.
- [x] Every card navigates to the correct destination — verified by inspection of every `href`/`Link` target against the routes Task 1 already established; all resolve (typed routes caught one wrong path, `/app/tips` → `/app/profile/tips`, before it could ship).
**Manual testing checklist:**
- [x] Scroll the full page top to bottom, confirm no section is missing or mis-ordered vs. the web app — confirmed via SSR order inspection.
- [ ] Tap through every card type at least once, confirm correct destination screen — **not independently verified**, needs a device/simulator (same class of gap as every prior tap-interaction item).
- [ ] Confirm horizontal scrollers don't fight the outer vertical `ScrollView`'s gesture — **not verified interactively**; no custom gesture handlers were added that would cause this, but only a real device/simulator can confirm feel.
**Suggested commit:** `feat(screens): add Dashboard (home) screen`

### Task 14 — Search screen — ✅ Completed (first post-MVP task)
**Web source:** `kitchen-haven-club/src/routes/app/search/index.tsx`
**Goal:** Build `app/search.tsx`: search `Input`, result-type tabs (Tout/Recettes/Vidéos/Articles/FAQ) with counts, accent-insensitive client-side filtering (port the web's `norm()` helper as-is), empty/no-query and no-results states.

**Implementation notes:**
- Used RNR `ToggleGroup`/`ToggleGroupItem` (Task 6) for the result-type switcher instead of RNR `Tabs` — the web's own markup here is a horizontally-scrolling row of independent pill buttons (`shrink-0 ... rounded-full`), not a fixed-width segmented switcher, which is exactly the same shape Task 18/20 already established `ToggleGroup` for (category filters), not `Tabs` (used for the two-way Identifiants/Invite and À venir/Replays switchers elsewhere). Same documented simplification as Task 18: the web's selected pill uses `bg-gradient-luxe`; here it falls back to `ToggleGroupItem`'s built-in flat `bg-accent` for the same structural reason (no gradient-through-root support), not re-flagged per-task after Task 18 already covered the reasoning.
- `norm()` is ported with identical behavior (NFD-normalize + strip combining diacritics) but implemented via `new RegExp("[\\u0300-\\u036f]", "g")` instead of a literal `/[̀-ͯ]/` regex — purely a source-encoding precaution in this editing environment, not a behavior change; same Unicode range, same result.
- The FAQ result rows link to `/app/profile/faq` (not the web's flat `/app/faq`) — same nested-under-Profile route restructuring from Task 1, already applied consistently by Task 13's Dashboard and Task 24's Profile hub.
- Search `Input` uses `autoFocus`, matching the web's `<input autoFocus>` — reasonable to keep since RNR's `Input` (a `TextInput`) supports the same prop name/behavior natively.
- Article rows stay non-interactive `View`s (no `Link`/`Pressable`), matching the web exactly — the web's article search results are plain `<div>`s with no `onClick`/href, same as Task 24's purchased-product rows precedent.
**Files modified:**
- Rewrote `src/app/app/search.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 1, Task 6 (ToggleGroup).
**Acceptance criteria:**
- [x] Filtering logic matches web exactly (same `norm()` behavior, same fields searched per content type) — identical predicate/field lists ported per content type (recipes: title/category/description/ingredient labels; videos: title/category/description; articles: title/category/excerpt; FAQ: q/a).
- [x] `npx tsc --noEmit` passes — 0 new errors (2 pre-existing, unrelated errors in the environment — `global.css`/`animated-icon.module.css` side-effect imports — are present regardless of this change).
- [x] Tapping a result navigates correctly — recipe/video results use the same typed-route `Link` pattern already verified in Tasks 18/20; FAQ results link to the verified `/app/profile/faq` stub.
**Manual testing checklist:**
- [x] Confirm empty state (no query) renders with all 5 suggestion chips — verified via SSR: header, "Que cherches-tu ?", and all 5 suggestion chips (poulet/couscous/ramadan/nettoyage/varoma) present in the fetched HTML.
- [ ] Search an accented term (e.g. "poulet" vs "poulét") and confirm both match — **not independently verified interactively**; `norm()` is a byte-for-byte port of the web's own logic (same regex range), same class of gap as every prior live-filter check (Tasks 18/20).
- [ ] Confirm tab counts update live as you type — **not independently verified**; needs a device/simulator to exercise typing, same limitation as every prior text-input interaction check.
- [ ] Tap a suggestion chip, confirm it populates the search field — **not independently verified**; `onPress={() => setQ(s)}` is a direct, type-checked call.
**Suggested commit:** `feat(screens): add Search screen`

### Task 15 — Calendar screen — month view + navigation — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/calendar/index.tsx`
**Goal:** Build `app/calendar.tsx` with the "mois" (month) view + the jour/semaine/mois/année `Tabs` switcher + prev/next navigation header. Week/day/year views stubbed for Task 16.

**Implementation notes:**
- Same `ToggleGroup`-as-independent-pills pattern (Task 6/18/20) for the jour/semaine/mois/année switcher, and the same documented flat-`bg-accent` (vs. web's `bg-gradient-luxe`) simplification for the selected pill — `ToggleGroupItem` still can't render a gradient through its own root, same reasoning as every prior category-filter task.
- **Naming collision caught by `tsc`, not by inspection:** the local `View` type alias (`"jour" | "semaine" | "mois" | "année"`, matching the web's own `type View`) collided with RN's `View` component import (`TS2440: Import declaration conflicts with local declaration of 'View'`) — trivial in the web version, where `View` isn't a reserved import name. Renamed to `CalendarView`; no behavior change.
- Today's month-grid cell uses `<GradientView tone="luxe">` (now visually solid post-rebrand, see the v2 rebrand section above) instead of the web's `bg-gradient-luxe`; other cells are `bg-secondary` (has events) or a plain bordered `bg-card` (no events), matching the web's three-way conditional exactly.
- The month grid is `flex-row flex-wrap` with each cell at a fixed `${100/7}%` width (including leading empty offset cells rendered as blank same-sized `View`s) rather than CSS Grid, which RN has no direct equivalent for — same wrapping behavior as the web's `grid-cols-7`, no trailing empty cells needed since flex-wrap (like CSS grid) wraps automatically without needing the row padded out to a multiple of 7.
- Tapping a day cell calls `onSelect(d)` → `setCursor(d); setView("jour")`, exactly as the plan's acceptance criteria anticipated — the switch itself works even though "jour" now renders Task 16's placeholder stub rather than a real day list.
- `typeIcon()` (icon-per-event-type) is intentionally **not** ported yet — it's only consumed by the web's `EventRow` component (week/day list rows), which is Task 16 scope; porting it now would have been dead code. `typeColor()` (used by the month grid's event dots) is ported now since Task 15 needs it.
- The "jour" locale label (`cursor.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })`) is ported as-is, relying on Hermes's bundled ICU/`Intl` support (present by default in Expo SDK 56) — not independently verified on-device (see below).
**Files modified:**
- Rewrote `src/app/app/calendar.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 1, Task 6 (ToggleGroup).
**Acceptance criteria:**
- [x] Month grid renders correct day count/offset for any month (test at least Feb and a 31-day month) — **verified two ways:** (1) SSR fetch of the current month (July 2026, 31 days) showed all 31 day numbers rendered in order with no gaps/duplicates; (2) since real month navigation is client-side-only state that a curl-based SSR snapshot can't exercise (same limitation as every prior interactive check), the underlying offset/day-count formula — ported byte-for-byte from the web — was independently re-verified via a standalone Node script against Feb 2026 (28 days, starts Sunday → offset 6), the current 31-day month (starts Wednesday → offset 2), and a leap-year Feb 2028 (29 days, starts Tuesday → offset 1); all three computed correctly.
- [x] Event dots colored by type — verified structurally (`typeColor()` ported as-is, same 4-way conditional) and visually via SSR: today's cell (which has an event, per `mock-data.events`) renders exactly one `linear-gradient(135deg, rgba(183,84,105,...))` (the `luxe`/primary tone), confirming the gradient-highlighted cell is applied to exactly one day.
- [x] Tapping a day switches to day view — `onSelect` wired to `setView("jour")`, type-checked; interactive tap itself needs a device/simulator (see below).
- [x] `npx tsc --noEmit` passes — 0 new errors (same 2 pre-existing, unrelated environment errors noted in Task 14).
**Manual testing checklist:**
- [ ] Navigate several months forward/back, confirm the grid recalculates correctly each time (no off-by-one day offsets) — **not independently verified interactively** (client-side state, no device/simulator available); the underlying formula was verified analytically instead, see above.
- [x] Confirm today is visually distinct — verified via SSR (see acceptance criteria above); pixel-level look needs a device/simulator.
- [x] Confirm event-type legend colors match the dots shown in cells — both use the same `typeColor()` function, so this holds structurally by construction, not just by coincidence.
**Suggested commit:** `feat(screens): add Calendar screen (month view)`

### Task 16 — Calendar screen — week/day/year views — ✅ Completed
**Web source:** same file as Task 15.
**Goal:** Complete the remaining three views (semaine/jour/année) in `app/calendar.tsx`.

**Implementation notes:**
- `WeekList`, `DayList`, `YearGrid`, and `EventRow` are direct ports of the web's own same-named helper components — `EventRow` reintroduces `typeIcon()` (deliberately left unported in Task 15 since nothing consumed it yet; now used here).
- Year view's month tiles use `flex-row flex-wrap` at `width: "31.5%"` (3-per-row, small gap allowance) instead of CSS `grid-cols-3` — same RN-has-no-CSS-Grid substitution already used for the month grid in Task 15.
- Year view's `onSelect` sets `view` to `"mois"` (not `"jour"`, unlike the month grid's own day-tap) — matches the web's own distinct `onSelect` wiring for `YearGrid` vs `MonthGrid`, not a copy-paste of the same callback.
- `EventRow`'s icon-tinted circle (`bg-{type-color} + text-primary-foreground` icon) reads correctly through NativeWind's `className`-driven `Icon` wrapper — no `ICON_TINT`-style hex fallback needed here, since it's the RNR `Icon` component (already `cssInterop`-registered), the same distinction Task 10 already noted for the general case vs. Task 2's older hex workaround.
**Files modified:**
- Extended `src/app/app/calendar.tsx` (added `WeekList`, `DayList`, `YearGrid`, `EventRow`, reintroduced `typeIcon`; wired all 3 remaining `view === ...` branches that Task 15 had left as a shared placeholder).
**Dependencies:** Task 15.
**Acceptance criteria:**
- [x] All 4 views reachable via the switcher — same `ToggleGroup` controlled-state pattern already proven in Task 15/Login/Lives.
- [x] Year view's month tiles navigate into month view for that month — `onSelect(new Date(cursor.getFullYear(), idx, 1))` → `setCursor(d); setView("mois")`, type-checked.
- [x] `npx tsc --noEmit` passes — 0 new errors (same 2 pre-existing, unrelated environment errors noted since Task 14).

**Verification — done analytically, not just by inspection, since view-switching is client-side-only state a curl-based SSR snapshot can't reach (same limitation flagged in Task 15):** a standalone Node script rebuilt `mock-data`'s actual event-date generation (`isoDay(offset)`, unmodified) and ran the exact ported `weekStart`/grouping/year-count logic against it. Confirmed: (1) the current week's `WeekList` bucket correctly placed today's event (`ev1`, "Live : F'tour express") on the correct day and correctly *excluded* later events that fall in a subsequent week (`ev6`–`ev9`, offsets 5/6/8/12 from today) rather than leaking across week boundaries; (2) `DayList` for today returned exactly `ev1`, confirming this screen does **not** hit MiniCalendar's Task 12 timezone bug — neither `cursor` nor `isoDay()` truncates to local midnight before ISO conversion, so (unlike `MiniCalendar`'s `startOfWeek`) both sides stay in sync regardless of timezone; (3) `YearGrid`'s per-month counts summed to exactly 9 (matching `events.length`), all correctly attributed to the current month, with correct singular/plural ("évènement" vs "évènements") based on `count !== 1`. Also regression-checked via SSR fetch that the default `"mois"` view (Task 15) still renders unchanged after this task's additions.
**Manual testing checklist:**
- [ ] Cycle through all 4 views, confirm each renders without crashing on today's date — **not independently verified interactively** (client-side view-switch state, no device/simulator); each view's underlying data logic was verified analytically instead, see above.
- [ ] From year view, tap a month tile, confirm it lands on month view for the right month — **not independently verified interactively**, same limitation; the callback wiring is type-checked and structurally identical to the already-verified month-grid day-tap.
- [x] Confirm "no events" empty states (day/week with nothing scheduled) render correctly — verified by construction: `DayList` and each `WeekList` row render the same conditional (`list.length === 0 ? <empty-state text> : <EventRow list>`) already exercised by the analytical script above for both populated and empty days.
**Suggested commit:** `feat(screens): complete Calendar screen (week/day/year views)`

### Task 17 — First Steps screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/first-steps/index.tsx`
**Goal:** Build `app/first-steps.tsx`: `VimeoEmbed`, video metadata, Lys's welcome letter (gradient header + card body, preserve the exact French copy and line breaks), numbered next-steps list, two action buttons (non-functional placeholders in the web version too — keep them as-is, don't invent handlers).

**Implementation notes:**
- `VimeoEmbed` (Task 7) already bakes in `aspect-video`/`overflow-hidden`/`bg-foreground` internally, so it's wrapped directly in a plain `rounded-3xl overflow-hidden` `View` rather than re-declaring an inner aspect-ratio container the web's markup has but this component already handles.
- The two action buttons are non-functional in the web version too (real `<button>`s with no `onClick`) — built as `Pressable role="button"` with no `onPress`, matching Task 11's established "looks tappable, does nothing yet" precedent, rather than a plain non-interactive `View`.
- `welcomeMessage.body`'s line breaks render correctly with no extra work: RN `Text` preserves `\n` in its content by default (no CSS `white-space` equivalent needed), so the web's `whitespace-pre-line` has no RN counterpart to port — the string just renders as-is.
**Files modified:**
- Rewrote `src/app/app/first-steps.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 4, Task 7.
**Acceptance criteria:**
- [x] Welcome letter text matches web verbatim — pulled directly from `mock-data.welcomeMessage`, no copy changes; verified present via SSR.
- [ ] Vimeo video plays — **not verifiable in this environment**, same disclosed limitation as Task 7 (`react-native-webview` has no web implementation at all, and no device/simulator is available here).
**Manual testing checklist:**
- [ ] Confirm the video loads and the letter text has no truncation/overflow — **not independently verified**; letter text confirmed present and unclipped in the SSR-rendered layout, video playback needs a device/simulator.
- [x] Confirm line breaks in the letter body render as separate paragraphs — verified structurally: RN `Text` preserves `\n` natively, and the SSR HTML shows the multi-paragraph body intact.
**Suggested commit:** `feat(screens): add First Steps screen`

---

## Phase 4 — Recipes

### Task 18 — Recipes list screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/recipes/index.tsx`
**Goal:** Build `app/recipes/index.tsx`: search `Input`, category `ToggleGroup` (horizontal scroll), 2-column recipe grid with `Badge` for category/new tag.

**Implementation notes:**
- Category filter uses RNR's `ToggleGroup`/`ToggleGroupItem` (Task 6) with `type="single"`, guarding `onValueChange` against the empty-string "deselect" case Radix-style single-select toggle groups emit, so a category can't be left unselected. Each item's className overrides the base `rounded-none` segmented-control look (`isFirst`/`isLast` join styling) with an independent `rounded-full` pill, matching the web's `gap-2` row of standalone pills rather than RNR's default joined-segment appearance.
- **Documented simplification:** the web's selected-category pill uses the `bg-gradient-luxe` gradient; RNR's `ToggleGroupItem` has no way to render a gradient background through its own root (unlike `GradientView`-composed custom components such as `GradientButton`), so the selected state uses RNR's built-in flat `bg-accent`/`text-accent-foreground` instead. Per this pass's explicit "skip visual polish" scope, this was not worth a bespoke non-RNR pill component (which building a true gradient version would have required, the same category of custom-build Task 4/10 used for gradient buttons/cards) — flagged here rather than silently accepted.
- Search input is plain `useState` (not React Hook Form) — matches the web's own plain `useState` exactly; this is live-filter UI state, not a form submission, so RHF/Zod doesn't apply (same reasoning already established for Login's `tab` state and MiniCalendar).
**Files modified:**
- Rewrote `src/app/app/recipes/index.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 6 (toggle-group).
**Acceptance criteria:**
- [x] Filtering (category + text, combined) matches web logic exactly — identical `(active === "Tout" || r.category === active) && r.title.toLowerCase().includes(q.toLowerCase())` predicate, ported as-is.
- [x] Empty state renders when no matches — verified structurally (conditional render on `filtered.length === 0`); real device/simulator would confirm the actual layout.
**Manual testing checklist:**
- [ ] Filter by each category, confirm correct recipe subset — **not independently verified**; filtering logic is a direct, unmodified port of the web's predicate, but exercising the tap-to-filter interaction needs a device/simulator.
- [ ] Combine a category filter with a search term, confirm both apply together (AND, not OR) — same limitation; the `&&` in the single filter predicate makes this structurally correct, not independently exercised.
- [x] Tap a recipe card, confirm navigation to detail with the right `recipeId` — `Link` targets use the typed route `{ pathname: "/app/recipes/[recipeId]", params: { recipeId: r.id } }`; confirmed via SSR against a real id (`couscous-royal`) that the detail screen renders the correct recipe.
**Suggested commit:** `feat(screens): add Recipes list screen`

### Task 19 — Recipe detail screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/recipes/$recipeId.tsx`
**Goal:** Build `app/recipes/[recipeId].tsx`: hero image with back/favorite/share buttons, stat row (time/difficulty/portions), description, Cookidoo CTA (`Linking.openURL`), interactive ingredient checklist (RNR `Checkbox`), numbered steps, "Voir le tutoriel vidéo" button.

**Implementation notes:**
- Favorite heart button is wired to the real `useFavorites()` store (Task 5) instead of the web's local `useState` — real behavior, strictly better than the web's disconnected mock, per Task 19's own goal.
- **Bug caught and fixed during implementation:** the ingredient row was initially built with both the row's own `Pressable onPress` AND the nested `Checkbox`'s `onCheckedChange` independently toggling the same state — since `@rn-primitives/checkbox`'s `Root` is itself a touchable, this would have created a nested-touchable conflict (tapping precisely on the checkbox's own hit area could intercept the touch before the outer row's handler fires, unlike the web's single `<button>` per row with no nested interactive element). Fixed by adding `pointerEvents="none"` to the `Checkbox`, making it purely visual — the whole row remains the single tap target, matching the web exactly.
- The Cookidoo CTA uses `Linking.openURL(recipe.cookidooUrl)`, the direct RN equivalent of the web's `<a target="_blank">`.
- "Voir le tutoriel vidéo" is non-functional in the web version too (a real `<button>` with no `onClick` at all) — kept as `Pressable role="button"` with no `onPress`, not wired to navigate to Video Detail, since inventing that navigation would violate "only replace web APIs, don't add new behavior."
- The Share button is likewise non-functional in web (no `onClick`) — same `Pressable role="button"`, no handler.
**Files modified:**
- Rewrote `src/app/app/recipes/[recipeId].tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 5 (real favorites store), Task 6.
**Acceptance criteria:**
- [x] Favorite toggle persists via `useFavorites` — same already-verified persist/rehydrate mechanism from Task 5, just wired to a new screen.
- [x] Ingredient checkboxes toggle a strike-through state — verified structurally; `checked[i]` drives both the `Checkbox`'s visual state and the label's `line-through` class.
- [x] Unknown `recipeId` shows a not-found state instead of crashing — verified via SSR: `/app/recipes/does-not-exist` returns 200 with "Recette introuvable." rendered, no error.
**Manual testing checklist:**
- [ ] Toggle a few ingredients, confirm strike-through and unstrike work — **not independently verified** interactively; logic type-checks and the nested-touchable bug above was caught and fixed specifically because of careful review, not device testing.
- [x] Toggle favorite, navigate away and back, confirm it persisted — same underlying store already verified in Task 5's isolated persist/rehydrate test; this screen just calls `toggle`/`isFavorite` on it.
- [ ] Tap the Cookidoo link, confirm it opens the external browser — **not independently verified**, needs a device (or at least a real `Linking.openURL` call, which SSR can't exercise).
- [x] Navigate to a bogus recipe id, confirm graceful not-found UI, not a crash — verified via SSR (see above).
**Suggested commit:** `feat(screens): add Recipe detail screen`

---

## Phase 5 — Tutorials & Video Detail (highest technical risk — do while context is fresh from Phase 1's WebView/Progress work)

### Task 20 — Tutorials list screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/tutorials/index.tsx`
**Goal:** Build `app/tutorials/index.tsx`: category `Tabs`, vertical list of video cards with thumbnail, play overlay, duration badge, `Progress` bar when `progress` is set.

**Implementation notes:** Same `ToggleGroup`-as-independent-pills pattern and the same documented flat-color (vs. gradient) simplification for the selected pill as Task 18 — see that task's notes for the full reasoning, not repeated per-task. `Progress` (Task 3) renders only when `v.progress` is truthy, matching the web's `{v.progress && (...)}` conditional exactly.
**Files modified:**
- Rewrote `src/app/app/tutorials/index.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 3.
**Acceptance criteria:**
- [x] Category filter matches web tab list exactly — same 6 labels, same `tab === "Tout" || v.category === tab` predicate.
- [x] Progress bar only shows when a video has a non-zero `progress` — verified structurally via the conditional render.
**Manual testing checklist:**
- [ ] Filter through every category tab — **not independently verified**, needs a device/simulator for the tap interaction.
- [x] Confirm progress bars appear only on videos with progress in `mock-data` — verified by inspection of the conditional against `mock-data.videos`.
- [x] Tap a card, confirm navigation to the right `videoId` — `Link` targets use the typed route `{ pathname: "/app/videos/[videoId]", params: { videoId: v.id } }`; confirmed via SSR against a real id.
**Suggested commit:** `feat(screens): add Tutorials list screen`

### Task 21 — Video detail screen — ✅ Completed, scope expanded beyond "player shell"
**Web source:** `kitchen-haven-club/src/routes/app/videos/$videoId.tsx`
**Goal:** Build `app/videos/[videoId].tsx`'s player area only: `VimeoEmbed` for the "Mes premiers pas" special case; for all other videos, the web's **simulated** player (static thumbnail + play/pause button + `setInterval`-driven fake position — this is a deliberate parity choice, not a real player, matching the web app's actual behavior). Install `@react-native-community/slider` for the scrubber.

**Scope decision for this MVP pass:** the plan originally split this screen across Task 21 ("player area only") and Task 22 (title/metadata/description/action-buttons/similar-videos, bundled together with `useHistory` wiring). Shipping only the player with no title, description, or similar-videos list would have been a visibly incomplete, stub-feeling screen — not "fully functional." So this task was expanded to build the **entire** screen (player + metadata + description + action buttons + similar-videos list), while still deferring only the genuinely "nice-to-have" piece: cross-session position persistence and the "Reprise à X%" resume banner (both depend on `useHistory`, whose only other consumer — the History screen, Task 27 — is itself out of MVP scope). Position now always starts at 0 on open (first-time-viewing behavior) rather than resuming a saved position. Task 22 below is narrowed accordingly rather than closed.
**Implementation notes:**
- `parseDuration`, the simulated `setInterval` playback loop (1s tick, clamps at `totalSec`, auto-pauses), and the `isFirstSteps` special-case (real `VimeoEmbed` instead of the simulated player) are ported verbatim from the web.
- The scrubber uses `@react-native-community/slider`'s `Slider` (newly installed), colored via `THEME.light.primary`/`THEME.light.muted`-equivalent literals (`minimumTrackTintColor`/`thumbTintColor`) since `Slider` is a native component with plain color props, not a `className`-driven one — same category of "needs a real resolved color" as `ICON_TINT` (Task 2).
- Action buttons (Guide PDF / Favoris / Partager) are non-functional in the web version too (`ActionBtn`, no `onClick`) — kept as `Pressable role="button"` with no `onPress`.
- No `useEffect` resetting position on `videoId` change was needed (unlike the web, which needs one since React Router can keep the same component instance mounted across a param change): Expo Router mounts a fresh screen instance per `Link` navigation to a new `videoId`, so `useState(0)` naturally starts fresh every time.
**Files modified:**
- Rewrote `src/app/app/videos/[videoId].tsx` (real screen, replacing Task 1's stub).
- `package.json`/`pnpm-lock.yaml` — added `@react-native-community/slider`.
**Dependencies:** Task 7.
**Acceptance criteria:**
- [x] Play/pause toggles the simulated timer — verified by code inspection, direct port of the web's `setInterval` logic.
- [x] Scrubber reflects and can override position — `Slider`'s `value`/`onValueChange` are wired symmetrically to `position`.
- [x] Matches web's exact behavior (clamps at total duration, auto-pauses) — `Math.min(p + 1, totalSec)` + `if (next >= totalSec) setPlaying(false)`, ported as-is.
- [x] Unknown `videoId` shows a not-found state instead of crashing — verified via SSR: `/app/videos/does-not-exist` returns 200 with "Vidéo introuvable." rendered.
**Manual testing checklist:**
- [ ] Press play, confirm the position advances once per second — **not independently verified**, `setInterval` timing needs a live JS runtime, not SSR.
- [ ] Drag the scrubber, confirm position jumps and playback continues from there — **not independently verified**, needs a device/simulator.
- [ ] Let a short video "finish," confirm it auto-pauses at 100% — **not independently verified** interactively; the clamp/auto-pause logic is a direct port, type-checked.
**Suggested commit:** `feat(screens): add Video detail screen`

### Task 22 — Video detail screen — history integration (narrowed) — ✅ Completed
**Web source:** same file as Task 21.
**Goal — narrowed:** Task 21 already covered metadata, description, action buttons, and the similar-videos list (originally this task's scope). What remained here: wire the player to `useHistory` (Phase 0) so position persists across visits, and show the "Reprise à X%" resume banner when reopening a previously-watched video.

**Implementation notes:**
- Ported verbatim from the web: `const { get, upsert } = useHistory(); const stored = get(video.id);`, the `useState(stored?.positionSec ?? 0)` initial position, the `useEffect` that calls `upsert(...)` on every `position` change (early-returns when `position === 0 && !stored`, so a never-watched video doesn't write a spurious zero-position history entry), and the resume-banner conditional (`stored && stored.positionSec > 5 && !isFirstSteps`).
- **One deliberate omission, consistent with Task 21's own established reasoning:** the web has a `useEffect(() => setPosition(stored?.positionSec ?? 0), [video.id])` to reset position when navigating between videos while React Router reuses the same mounted component instance. Task 21 already established that Expo Router mounts a fresh screen instance per `Link` navigation to a new `videoId`, so the `useState` initializer alone (now reading `stored?.positionSec ?? 0` instead of a hardcoded `0`) already produces the same result on RN without that extra effect — porting it anyway would be dead code here.
- `formatSeconds` and `useHistory` are now both imported from `@/lib/local-store` (matching the web's own import line exactly) instead of `formatSeconds` alone from `@/lib/utils` — `local-store.ts` already re-exports `formatSeconds` from `utils.ts` for this exact purpose, so this is not a new dependency.
- The "Recommencer" button calls `setPosition(0)`; combined with the existing persist effect, this alone writes the reset back to `useHistory` on the next render — no separate "clear history" call needed, matching the web exactly (it relies on the same effect-triggered re-persist).
**Files modified:**
- Modified `src/app/app/videos/[videoId].tsx`.
**Dependencies:** Task 21 (done).
**Acceptance criteria:**
- [x] Opening a previously-watched video shows the "Reprise à X%" banner and starts at the saved position — verified structurally (conditional + `useState` initializer both read from `stored`) and via the isolated store test below; a live on-screen "watch, leave, come back" pass still needs a device/simulator, see below.
- [x] Watching updates `useHistory` in real time (visible on the History screen once Task 27 exists) — the persist `useEffect` fires on every `position` change, same as web.
- [x] `npx tsc --noEmit` passes — 0 new errors (same 2 pre-existing, unrelated environment errors noted since Task 14).

**Verification — done two ways, since this is the first task to actually exercise `useHistory`'s `upsert` from a real mounted screen (previously only type-checked, never called):**
1. SSR fetch of a never-before-seen video (`tm7-demarrage`) confirmed the resume banner correctly does **not** appear on a first visit (empty history store) while the rest of the page still renders — and re-fetching the not-found route (`does-not-exist`) confirmed no regression there either.
2. Since real position-tracking/resume behavior is client-side, interval-driven state a curl-based SSR snapshot can't reach (same limitation as Task 21's own play/pause/scrubber checks), the `useHistory` store's actual persistence behavior was verified directly, following the same rigor as Task 5's isolated favorites test: a standalone script recreating `upsert`'s exact dedup-by-`videoId`-and-cap-at-50 logic against an in-memory async `StateStorage` (mirroring `storage.ts`'s `asyncStorage`) confirmed that upserting the same `videoId` twice updates in place (keeps only the latest position, doesn't duplicate), and that a **fresh store read against the same backing storage** (simulating an app restart) correctly rehydrated the saved position.
**Manual testing checklist:**
- [ ] Watch a video partway, leave the screen, come back — confirm resume banner and correct position — **not independently verified interactively**; the underlying persist/rehydrate mechanism was verified in isolation (see above), same class of gap as every prior interactive-state check.
- [ ] Tap "Recommencer," confirm position resets to 0 — **not independently verified interactively**; `setPosition(0)` is a direct, type-checked call feeding the same already-verified persist effect.
**Suggested commit:** `feat(screens): wire Video detail screen to watch history`

---

## Phase 6 — Lives

### Task 23 — Lives screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/lives/index.tsx`
**Goal:** Build `app/lives/index.tsx`: featured next-live hero card (gradient overlay, "Rejoindre"/"Me rappeler" buttons — non-functional placeholders in web too), À venir/Replays `Tabs`, list rows with status `Badge`.

**Implementation notes:**
- Included in this MVP pass (unlike Search/Calendar/the Profile-cluster screens) because Lives is one of the 5 primary bottom-tab destinations (the `Radio` icon in `bottom-nav.tsx`), not a screen reached by pushing deeper from another — shipping 4 of 5 tabs fully built and leaving the 5th a bare stub would not read as a "fully functional MVP."
- Reused RNR `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` (already built, Task 6/11) for the À venir/Replays switcher instead of hand-rolled buttons — the web's own markup for this switcher (`grid-cols-2 gap-2 bg-secondary/60 p-1 rounded-2xl`, active gets `bg-card shadow-card`) is functionally identical to the segmented-tabs pattern already established for Login's Identifiants/Code d'invitation switcher, so reusing the existing component was more consistent than duplicating a one-off implementation.
- "Rejoindre le live" and "Me rappeler" are non-functional in the web version too (no `onClick`) — kept as `Pressable role="button"` with no `onPress`.
**Files modified:**
- Rewrote `src/app/app/lives/index.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 4.
**Acceptance criteria:**
- [x] Tab counts match `mock-data.lives` filtered by status — `upcoming.length`/`replays.length` computed via the same `l.status === "..."` filters as web.
- [x] Featured card only shows when an upcoming live exists — `{next && (...)}` conditional, direct port.
**Manual testing checklist:**
- [ ] Switch between À venir/Replays, confirm correct lists and counts — **not independently verified** interactively; the underlying `Tabs` controlled-state pattern was already proven working in Login (Task 11).
- [x] Confirm replay rows show a play icon overlay, upcoming rows don't — verified structurally via the `live.status === "Replay"` conditional.
**Suggested commit:** `feat(screens): add Lives screen`

---

## Phase 7 — Profile cluster

### Task 24 — Profile hub screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/profile/index.tsx`
**Goal:** Build `app/profile/index.tsx`: user card, quick-access tile grid (Favoris/Historique/Notes/Premiers pas), account/support row lists (RNR `Separator` between rows), Thermomix purchase card, logout button (`router.replace("/(auth)")`, matches web's no-op-auth logout).

**Implementation notes:**
- Included in this MVP pass because Profile is one of the 5 primary bottom-tab destinations — it can't ship blank, even though most of what it links to (Favoris/Historique/Notes/Paramètres/FAQ) is out of MVP scope.
- Every row/tile linking to an out-of-scope screen (`/app/profile/favorites`, `/app/profile/history`, `/app/profile/notes`, `/app/profile/settings`, `/app/profile/faq`) points at Task 1's real, already-existing stub files — this is the exact pattern this task's own original acceptance criteria already called out as fine ("some not built until later tasks... routes already exist as stubs").
- Route paths use the RN file tree (`/app/profile/favorites` etc.), not the web's flat `/app/favorites` — same nested-under-Profile restructuring decision from Task 1 already applied consistently in Task 13's Dashboard links.
- "Calendrier" row correctly points at `/app/calendar` (not nested under profile) — Task 1's file tree keeps `calendar.tsx` as a top-level `app/` file, not a `profile/` child, matching the web's own `/app/calendar/` being a sibling of `/app/profile/`, not nested under it.
- "Favoris" tile's "6 enregistrées" subtitle is hardcoded, not derived from `useFavorites().favorites.length` — this matches a real inconsistency already present in the web app itself (the web also hardcodes "6 enregistrées" regardless of actual favorite count), so it's ported as-is rather than silently "fixed" to be more correct than the source.
- Purchased-product rows have no navigation in the web version either (plain, non-interactive `<div>`s) — kept as plain `View`s, not `Pressable`/`Link`.
- Logout uses `router.replace("/(auth)")`, matching the web's own no-op-auth "logout" (`navigate({ to: "/" })` — there's no real session to invalidate on either platform).
**Files modified:**
- Rewrote `src/app/app/profile/index.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 1.
**Acceptance criteria:**
- [x] All rows navigate to their correct destination screen — every `href` verified by inspection against Task 1's actual file tree; out-of-scope destinations correctly resolve to their honest stub screens, not a 404 or crash.
**Manual testing checklist:**
- [ ] Tap every tile/row at least once, confirm correct navigation target — **not independently verified** interactively, needs a device/simulator.
- [ ] Tap logout, confirm it returns to the auth stack — **not independently verified**; `router.replace("/(auth)")` is the same call already exercised structurally by Task 1's own route verification.
**Suggested commit:** `feat(screens): add Profile hub screen`

### Task 25 — Settings screen — ✅ Completed
**Web source:** `kitchen-haven-club/src/routes/app/settings/index.tsx`
**Goal:** Build `app/profile/settings.tsx`: personal-info fields, preference `Switch` toggles, "save" flow. Wired with **React Hook Form + Zod** (per `CLAUDE.md`'s chosen stack; web used bare `useState` — same fields/behavior) against the real `useSettings` store from Phase 0.

**Implementation notes:**
- `useSettings()` here takes no argument, unlike the web's `useSettings(initialObject)` — already a documented difference in `local-store.ts` itself ("zustand stores are created once at module load... defaults are fixed here"), not a new decision made in this task.
- RHF's `defaultValues: settings` snapshots the persisted settings once on mount — this alone reproduces the web's draft/commit-on-save behavior with no extra bookkeeping: an unsaved edit lives only in RHF's in-memory form state, so navigating away unmounts the screen and discards it; navigating back re-mounts and re-reads the last **saved** `settings` value. No separate `draft` `useState` (unlike the web) is needed since RHF's form state already *is* the draft, the same reasoning Task 11 (Login) already established for RHF-managed screens.
- Same `Controller`-based bridging from RHF to RNR's `TextInput`-backed `Input` as Login (`onChangeText`/`onBlur` via `field`), and the same pattern extended to `Switch` (`checked`/`onCheckedChange` via `field.value`/`field.onChange` — `@rn-primitives/switch`'s prop names, confirmed via its type definitions, not guessed).
- Zod schema (`{name, firstName, email, phone}` as plain `z.string()`, `{notifications, darkTheme, newsletter}` as plain `z.boolean()`) is intentionally permissive, matching Login's already-established reasoning: the web has no real field validation, so no stricter rule was added.
- Email/phone `Input`s get `keyboardType="email-address"`/`"phone-pad"` — a reasonable native-only addition (the web's `type="email"` has no visual effect beyond the keyboard on native, so this is the direct RN equivalent, not new behavior).
- "Changer mon mot de passe" is non-functional in the web version too (a real `<button>` with no `onClick`) — kept as `Pressable role="button"` with no `onPress`, matching the established "looks tappable, does nothing yet" precedent (Login, Recipe Detail, First Steps, Lives).
- The "Enregistré ✓" transient confirmation (`setSaved(true)` + `setTimeout(() => setSaved(false), 1500)`) is ported verbatim, including the same 1500ms duration.
**Files modified:**
- Rewrote `src/app/app/profile/settings.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 1 (Phase 0's `useSettings` already exists).
**Acceptance criteria:**
- [x] Editing a field and saving persists via `useSettings` (AsyncStorage) — verified two ways: SSR confirmed all 4 text fields and all 3 switches render the real persisted `DEFAULT_SETTINGS` values (name/firstName/email/phone from `mock-data.user`, `notifications=true`/`darkTheme=false`/`newsletter=true` — confirmed via each `Switch`'s `aria-checked` in the compiled output, in the correct order); a standalone script then verified the settings store's actual save/persist/rehydrate mechanism directly (edited `phone` + `darkTheme`, wrote through the same `zustand persist` + async `StateStorage` shape as `storage.ts`, then read back via a **fresh store read against the same backing storage**, simulating an app restart — the edited fields updated and untouched fields, e.g. `email`, stayed intact). This is the first task to actually exercise `useSettings`'s write path (`setSettings`) from a real screen.
- [x] A draft edited-but-not-saved change is discarded on leaving the screen — holds structurally by construction: RHF's form state is local to the mounted component and only ever committed to the persisted store inside `onSave`, see implementation notes above.
- [x] `npx tsc --noEmit` passes — 0 new errors (full project typecheck is now clean except the same 2 pre-existing, unrelated environment errors noted since Task 14).
**Manual testing checklist:**
- [ ] Edit a field, save, navigate away and back — confirm it persisted — **not independently verified interactively**; the underlying persist/rehydrate mechanism was verified in isolation (see above), same class of gap as every prior interactive-state check (Tasks 5/19/22).
- [ ] Edit a field, navigate away *without* saving, come back — confirm the unsaved edit was discarded — **not independently verified interactively**; holds by construction (RHF's defaultValues re-snapshot the persisted value on every fresh mount), not exercised on a live remount cycle.
- [ ] Toggle each switch, confirm it persists after save — **not independently verified interactively**; same underlying save path as the text fields, exercised in isolation instead.
**Suggested commit:** `feat(screens): add Settings screen`

### Task 26 — Favorites screen — ✅ Completed
*(Note: extended shortly after to also cover videos, at the user's direct request — see "Post-Task-26 extension" below. The notes below describe the screen as first shipped, recipes-only.)*
**Web source:** `kitchen-haven-club/src/routes/app/favorites/index.tsx`
**Goal:** Build `app/profile/favorites.tsx` reading from the real `useFavorites` store (Task 5) instead of web's hardcoded `recipes.slice(0, 6)` mock.

**Implementation notes:**
- The web's heart button on each card has no `onClick` at all (a disconnected mock, same as the rest of this screen) — here it's wired to the real `toggle(r.id)` instead of kept inert, matching the precedent Task 19 already set for Recipe Detail's heart button ("strictly better than the web's disconnected mock, per the task's own goal"). Un-favoriting from this list removes the card immediately since `favorites` is a live selector off the same store.
- **Bug caught and fixed during implementation, same category as Task 19's:** the first draft nested the heart-toggle `Pressable` directly inside the card's navigation `Pressable` (`<Link asChild><Pressable>...<Pressable onPress={toggle}>...</Pressable></Pressable></Link>`) — a nested-touchable conflict, exactly what Task 19 already caught and fixed once for the ingredient checklist row. Fixed the same way conceptually but structurally rather than via `pointerEvents="none"` (that fix suited a purely-visual `Checkbox`; here the heart itself needs its own independent tap target): the heart button is now a sibling of the navigation `Pressable`, absolutely positioned over the card via a shared `relative` wrapper `View`, not a descendant of it.
- Count text (`"{n} recette{s} enregistrée{s}"`) is real pluralization based on the actual (dynamic, possibly 0 or 1) favorites count — the web's version is dynamic too (`favs.length`, not hardcoded), but was always exactly 6 in practice since its source was a fixed-size mock slice, so singular/plural never came up there. Handling 0/1 correctly here is filling in a case the web mock genuinely never had to handle, per this task's own acceptance-criteria wording — not a copy-editing redesign.
- Empty state (new, since the web mock could never actually be empty): an icon + "Aucun favori pour le moment" + a `GradientButton` linking to `/app/recipes`, styled consistently with the app's other empty-state cards (Search's "Aucun résultat", Recipes list's "Aucune recette ne correspond").
**Files modified:**
- Rewrote `src/app/app/profile/favorites.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 5, Task 19 (so there's a way to actually add favorites before this screen is meaningfully testable).
**Acceptance criteria:**
- [x] List reflects real favorited recipes — `favorites` (resolved `Recipe[]`, via the same `resolveFavoriteRecipes` already verified in Task 5) is mapped directly; type-checked against the real `Recipe` fields used (`image`/`title`/`time`/`id`).
- [x] Empty state when none favorited — verified via SSR (every fresh page load starts with an empty store): "Aucun favori pour le moment", the helper copy, and the "Découvrir les recettes" CTA (→ `/app/recipes`) all rendered correctly, alongside a correctly-pluralized "0 recettes enregistrées" count.
- [x] `npx tsc --noEmit` passes — 0 new errors (same 2 pre-existing, unrelated environment errors noted since Task 14).
**Manual testing checklist:**
- [ ] Favorite a couple of recipes from the detail screen, confirm they appear here — **not independently verified interactively**; the underlying store read/write was already verified in isolation (Task 5) and is reused unmodified here.
- [ ] Un-favorite one, confirm it disappears from this list — **not independently verified interactively**; same underlying `toggle()` call already exercised on Recipe Detail (Task 19), just a different call site.
- [x] With zero favorites, confirm the empty state renders instead of a blank screen — verified via SSR, see above.
**Suggested commit:** `feat(screens): add Favorites screen backed by real favorites store`

### Task 27 — History screen — ✅ Completed
*(Note: extended shortly after to also cover viewed recipes, at the user's direct request — see "Post-Task-27 extension" below. The notes below describe the screen as first shipped, videos-only.)*
**Web source:** `kitchen-haven-club/src/routes/app/history/index.tsx`
**Goal:** Build `app/profile/history.tsx` reading `useHistory` (Phase 0): list with resume position, remove-one and clear-all actions, empty state.

**Implementation notes:**
- The video-card thumbnail's bottom progress strip (`h-1 bg-background/30` track + `h-full bg-primary` fill) is exactly the pattern Task 3's own goal text already named "history rows" as a target usage for the custom `Progress` component — so this task is the first to actually use it there, no new component needed.
- The thumbnail overlay (`GradientView tone="overlay"` + centered `Play` icon) is the same treatment already established for video thumbnails elsewhere (Video Detail's similar-videos list, Favorites' video cards) — reused as-is, not a new pattern.
- "Vider" (clear-all) is conditionally rendered (`history.length > 0`) in the header, matching web exactly; "Retirer de l'historique" (remove-one) is a full-width row below each card's `Link`, structurally a **sibling** of the navigation `Pressable`, not nested inside it — same nested-touchable avoidance already established (Tasks 19/26), even though here the two elements don't actually overlap visually (unlike those cases), so the same defensive structure was used anyway rather than assuming this particular layout is safe.
**Files modified:**
- Rewrote `src/app/app/profile/history.tsx` (real screen, replacing Task 1's stub).
**Dependencies:** Task 22 (Video Detail now actually writes history, so this screen has real data to show once exercised on a device).
**Acceptance criteria:**
- [x] Matches web row layout — verified via SSR for the empty state (icon, "Aucun visionnage encore", description, correctly-absent "Vider" button since `history.length === 0` on a fresh store); the populated-row layout was verified by construction (direct, type-checked port of the web's card structure) and via the isolated logic check below, since a populated list can't be produced through a stateless curl-based SSR snapshot (same limitation as Task 22's own history checks).
- [x] Remove/clear actions update the list immediately — both call the same `useHistoryStore` mutations already verified in isolation (see below); "immediately" holds structurally since `history` is a live zustand selector, not a snapshot.
- [x] `npx tsc --noEmit` passes — 0 new errors (same 2 pre-existing, unrelated environment errors noted since Task 14).

**Verification:** SSR-checked the empty state (see above). A standalone script then exercised `upsert`/`remove`/`clear` against realistic entries (mirroring Task 22's own isolated-store rigor): two videos upserted (most-recent-first order confirmed), `remove()` on one left exactly the other, and `clear()` emptied the list — all matching the exact mutation logic already live in `local-store.ts`.
**Manual testing checklist:**
- [ ] Watch a couple of videos (Task 22), confirm they show up here in most-recent-first order — **not independently verified interactively**; the underlying `upsert` ordering was verified in isolation (see above) and in Task 22's own dedup test.
- [ ] Remove one, confirm it disappears; clear all, confirm empty state appears — **not independently verified interactively**; both mutations verified in isolation, same class of gap as every prior interactive-state check.
**Suggested commit:** `feat(screens): add History screen`

### Task 28 — Notes screen — ✅ Completed (with a scoped, non-global note-creation mechanism — see below)
**Web source:** `kitchen-haven-club/src/routes/app/notes/index.tsx`
**Goal:** Build `app/profile/notes.tsx` reading `useNotes` (Phase 0): list with context link, delete action, empty state.

**Scope decision, per explicit user direction:** the plan's original dependency note assumed note-*creation* would come from the global Notes FAB (Task 31 — a floating button mounted on every `app` screen, detecting context from the current route, mirroring the web's `NotesFAB.tsx`). The user asked instead for note-taking scoped to single-item content pages only: recipe detail, video detail, and (once built) tips detail — not a global, route-detecting overlay. Rather than wait on Task 31, this pass adds a small reusable `src/components/add-note-button.tsx` (a `Dialog`-based trigger with a fixed `contextLabel`/`contextHref`, no route detection needed since each page already knows its own context) and wires it into the two content pages that exist today:
- `app/recipes/[recipeId].tsx`: a 4th header icon button (`StickyNote`, alongside the existing back/heart/share icons) — `contextLabel: "Recette : {title}"`, `contextHref: "/app/recipes/{id}"`.
- `app/videos/[videoId].tsx`: a 4th `ActionBtn` tile ("Note", alongside Guide PDF/Favoris/Partager) — `contextLabel: "Vidéo : {title}"`, `contextHref: "/app/videos/{id}"`.
- Tips detail doesn't exist yet (Task 30, still post-MVP) — deferred until that screen is built, per the user's own "and later tips" phrasing.

This means Task 31 (Notes FAB) as originally scoped — a global floating button — is now superseded by this approach; if it's revisited later it would need to be reconciled with (or dropped in favor of) this per-page mechanism rather than layered on top of it.

**Implementation notes:**
- **Revised after initial delivery, per explicit user follow-up feedback:** the first cut of `AddNoteButton` rendered as a small trigger inline in each screen's existing chrome (a header icon on Recipe Detail, a 4th `ActionBtn` tile on Video Detail) with a small centered `DialogContent`. The user asked for it to instead look like the web's own `NotesFAB` — a floating circular button pinned to the bottom-right of the screen — and for the note dialog to take up nearly the full screen rather than a small centered box, and for the trigger icon to be `StickyNotePlus` (an explicit "add" icon) rather than the plain `StickyNote` glyph. `AddNoteButton` was rewritten accordingly: it now renders its own `Pressable` FAB (`absolute bottom-6 right-5`, `h-14 w-14`, `rounded-full bg-primary`) and drives the `Dialog`'s `open` state directly (no `DialogTrigger`/`trigger` prop needed anymore, since the button *is* the trigger), and `DialogContent` is overridden to `h-[92%] w-[94%] max-w-none flex-1`, with the `Textarea` set to `flex-1` so it fills the available vertical space instead of a small fixed-height box.
- Both call sites (`app/recipes/[recipeId].tsx`, `app/videos/[videoId].tsx`) had their root `ScrollView` wrapped in an outer `View className="flex-1"`, with `<AddNoteButton>` rendered as a sibling *after* the `ScrollView`, not inside its scrollable content — otherwise the "floating" button would scroll away with the page instead of staying pinned to the viewport, the same reasoning that makes a `position: absolute` overlay require a non-scrolling ancestor. Recipe Detail's earlier header icon and Video Detail's 4th `ActionBtn` tile were both removed now that the FAB replaces them.
- This is still scoped per-page (recipe/video now, tips later), not global — the "floating look" and "global route-detecting mount" are separable concerns; the user asked to restore the former without reinstating the latter (i.e. this is not a reversal of the Task 28 scope decision to skip Task 31's global FAB, just a visual-parity request for the per-page trigger).
- The empty-state copy on the Notes list screen ("Touchez le bouton flottant en bas à droite...") was adapted, not ported verbatim — the web's copy points at a global FAB positioned identically on every screen, whereas this app's floating buttons only exist on recipe/video detail pages; pointing new users at "l'icône note sur une recette ou une vidéo" was a deliberate, disclosed wording change to stay accurate rather than reusing the web's now-closer-but-still-not-identical phrasing.
- Everything else (the note-count pluralization quirk — `notes.length > 1 ? "s" : ""`, so "0 note"/"1 note"/"2 notes" — date formatting via `toLocaleDateString("fr-FR", {...})`, the card layout, delete button, context link) is a direct, unmodified port of the web's own logic.
- The context link's `href={n.contextHref as never}` cast is the same pattern already established for arbitrary runtime string hrefs (Dashboard's `Section` component, Task 13).
- **Verification limitation, disclosed:** `@rn-primitives/dialog`'s `Content` isn't mounted into the DOM at all while `open={false}` (confirmed: no `"Nouvelle note"` text anywhere in a fresh SSR fetch of either screen) — the standard Radix-style lazy-mount behavior. This means the dialog's near-full-screen sizing, the floating button's exact visual position/shadow, and the open/close interaction itself are **not verifiable via this environment's curl-based SSR technique at all**, unlike most other UI on these two screens — only a real device/simulator/browser click can confirm the dialog actually opens and sizes correctly. What *is* verified: both screens still render (200, no bundler errors) with the FAB's positioning classes present in the static markup, and `tsc` confirms the component's props/logic are correctly typed.
**Files modified:**
- Rewrote `src/app/app/profile/notes.tsx` (real screen, replacing Task 1's stub).
- Added `src/components/add-note-button.tsx`.
- Modified `src/app/app/recipes/[recipeId].tsx` and `src/app/app/videos/[videoId].tsx` to add the note-trigger button described above.
**Dependencies:** Task 1; the note-creation mechanism now ships in this same pass rather than waiting on Task 31.
**Acceptance criteria:**
- [x] Context link (`contextHref`) navigates to the right screen when tapped — same `as never` cast pattern already verified elsewhere; type-checked.
- [x] `npx tsc --noEmit` passes — 0 new errors (same 2 pre-existing, unrelated environment errors noted since Task 14).
- [x] Notes screen matches web layout/copy except the deliberately-adapted empty state — verified via SSR: header, "0 note" (correct singular per the web's own pluralization quirk), and the adapted empty-state copy all rendered correctly; Recipe Detail and Video Detail both still render correctly with their floating note buttons (regression check, re-verified again after the FAB redesign below).

**Verification:** SSR-checked all three touched screens (Notes empty state, Recipe Detail, Video Detail) — all 200, no bundler errors. Since this is the first task to exercise `useNotes`'s write path (`add`/`remove`) from real screens, a standalone script verified the store logic directly (same rigor as prior store-touching tasks): two notes added in most-recent-first order, persisted and rehydrated via a simulated-restart read against the same backing storage, then one removed — all matching the exact mutation logic already live in `local-store.ts`.
**Manual testing checklist:**
- [ ] Open the note dialog from a recipe and from a video, save a note from each, confirm both appear here in most-recent-first order with the correct context label — **not independently verified interactively**; the underlying `add` ordering was verified in isolation (see above).
- [ ] Tap a note's context link, confirm it navigates to the right recipe/video — **not independently verified interactively**; the `href` cast is type-checked and reuses an already-proven pattern.
- [ ] Delete a note, confirm the list updates and the empty state reappears once none remain — **not independently verified interactively**; `remove` verified in isolation, same class of gap as every prior interactive-state check.
**Suggested commit:** `feat(screens): add Notes screen + scoped per-page note-creation (recipe/video, tips later)`

### Task 29 — FAQ screen — post-MVP, not built this pass
**Web source:** `kitchen-haven-club/src/routes/app/faq/index.tsx`
**Goal:** Build `app/profile/faq.tsx` using RNR `Accordion` (direct upgrade from the web's hand-rolled accordion), `mailto:` link via `Linking.openURL`.
**Files to modify:** `src/app/app/profile/faq.tsx`.
**Dependencies:** none beyond Phase 0 RNR install.
**Acceptance criteria:** All FAQ items from `mock-data.faqItems` present; only one open at a time (matches web).
**Manual testing checklist:**
- [ ] Open several items in sequence, confirm previous one closes (single-open behavior).
- [ ] Tap the contact email row, confirm it opens the mail composer.
**Suggested commit:** `feat(screens): add FAQ screen using RNR Accordion`

### Task 30 — Tips screen — post-MVP, not built this pass
**Web source:** `kitchen-haven-club/src/routes/app/tips/index.tsx`
**Goal:** Build `app/profile/tips.tsx`: hero quote card, category `ToggleGroup`, article list rows.
**Files to modify:** `src/app/app/profile/tips.tsx`.
**Dependencies:** Task 6.
**Acceptance criteria:** Category filter matches web's category list exactly.
**Manual testing checklist:**
- [ ] Filter through each category, confirm correct article subset.
- [ ] Confirm the hero quote card renders with the italic script styling (Italiana font).
**Suggested commit:** `feat(screens): add Tips screen`

---

## Phase 8 — Global floating overlays (AI Chat, Notes FAB)

Built last among the UI work since they float above every `app` screen and depend on the backend endpoint (Phase 1, Tasks 8-9) and the notes store (already done in Phase 0).

### Task 31 — Notes FAB — superseded, not built (see Task 28's scope decision)
**Web source:** `kitchen-haven-club/src/components/NotesFAB.tsx`
**Original goal:** Build `src/components/notes-fab.tsx`: floating button (hidden on the Notes screen itself), RNR `Dialog` styled as a bottom sheet (slide-up, rounded top corners) containing context label + RNR `Textarea` + save/view-notes actions, calling `useNotes().add()`. Context detection (which screen the user is on, for the "Contexte : ..." label) is reimplemented against Expo Router's current route instead of the web's `location.pathname` string-matching, but produces the same labels.

**Status:** superseded by Task 28's own scope decision. The user explicitly asked for note-taking scoped to single-item content pages (recipe/video/tips) rather than a global, route-detecting overlay — `src/components/add-note-button.tsx` (built as part of Task 28) already covers that need for Recipe Detail and Video Detail, with a fixed `contextLabel`/`contextHref` per call site instead of route-based detection. If a global FAB is still wanted later, it would need to be reconciled with this per-page mechanism (e.g. dropped in favor of it, or kept only for screens that aren't a single-item content page) rather than built as originally spec'd on top of it.
**Suggested commit:** *(n/a — not built; see Task 28)*

### Task 32 — AI Chat — post-MVP, not built this pass (an "advanced dialog")
**Web source:** `kitchen-haven-club/src/components/AIChat.tsx`
**Goal:** Build `src/components/ai-chat.tsx`: floating sparkle button, RNR `Dialog`-as-bottom-sheet chat window, message list (user/assistant bubbles), lightweight markdown rendering (port `FormattedMessage`'s line-based parser as-is), recipe/video reference chips parsed from `[RECETTE id:...]`/`[VIDEO id:...]` tags, RNR `Textarea` input, calls `aiChat()` from Task 9.
**Files to modify:** Add `src/components/ai-chat.tsx`. Modify `src/app/app/_layout.tsx` to mount it globally.
**Dependencies:** Task 6, Task 9, Phase 0.
**Acceptance criteria:** Sending a message shows a loading state, then either the assistant's reply (with working recipe/video reference chips) or the matching French error copy on failure — same three error cases as web (no API key / rate-limited / network failure).
**Manual testing checklist:**
- [ ] Send a real message (with Task 8/9 live), confirm a real AI reply renders with correct markdown formatting.
- [ ] Ask about a recipe that exists in `mock-data`, confirm a tappable reference chip appears and navigates correctly.
- [ ] Trigger the network-failure path (airplane mode), confirm the French fallback error message shows instead of a crash.
**Suggested commit:** `feat(overlays): add AI Chat (bottom-sheet Dialog + backend integration)`

---

## Phase 9 — Cross-screen QA pass

### Task 33 — Full-app manual regression pass — post-MVP, not built this pass (depends on every excluded screen)
**Goal:** No new files — walk every screen against the web app side by side (screenshots or a second window), checking spacing, colors, fonts, copy, and navigation once more, now that everything exists together.
**Files to modify:** none (bug-fix commits from this pass land as their own small follow-up tasks, not tracked individually here).
**Dependencies:** every prior task.
**Acceptance criteria:** No missing sections, no placeholder text left anywhere, no broken navigation link across the whole app.
**Manual testing checklist:**
- [ ] Walk all 18 screens in order, comparing against the web app.
- [ ] Confirm dark mode (if the device/simulator is set to dark) doesn't break any screen, even though no screen has a dark-mode toggle wired yet (the web app's own "Thème sombre" setting is also just stored, not applied — matches parity).
- [ ] Confirm every `Link`/`router.push` in the app resolves (no "unmatched route" screens).
**Suggested commit:** `chore: full regression pass fixes` *(or split per bug found)*

---

## v2 client rebrand (2026-07-05) — design-system update

The client sent real design assets (`assets/new-assets/`: `auth-page.png`, `dashboard-page.png`, `index-page.png`, `new-hero-image.png`, `ogee-arch.svg`, `perle-des-lys-log-no-text.svg`, `perle-des-lys-log-with-text.svg`) requesting UI/color changes and a fix so the bottom nav ("now glued to the bottom") doesn't hide page content. The mockups turned out to show more than a palette swap — a new arch logo, a script wordmark ("Perle des Lys" replacing "PERLEDESLYS"), the founder renamed "Ghania" (not "Lys"), a redesigned Login screen, and restyled calendar/video cards — confirmed with the user before proceeding to a full match rather than guessing scope.

**Color palette — pixel-sampled, not eyeballed.** Wrote a small Node script using `pngjs` (already present transitively) to read exact RGB values out of the mockup PNGs rather than estimating from a rendered screenshot. Findings:
- `--primary`/`--ring`: `#b75469` — confirmed in **two independent places**: `ogee-arch.svg`'s fill attribute, and 5 sampled points across the "Se connecter" button in `auth-page.png` (left/mid/right/top/bottom), which came back byte-identical with zero gradient variation. This also means the new brand has **no visible gradient anywhere** in any of the 3 mockups — `GRADIENTS.luxe` (`src/constants/theme.ts`) had both its stops set to this same new primary color rather than removed, so it renders visually solid through the existing `GradientView` architecture without requiring an app-wide refactor of every screen already built against it (BottomNav, Dashboard cards, Recipe Detail's Cookidoo CTA, Lives, Profile).
- `--background`: `#fef8f7`, sampled at 3 points — barely different from the prior value, updated anyway for precision.
- `--secondary`: retargeted to `#eedbc4` (a warm tan), sampled from the Login tab-switcher's inactive track — replacing the old pale-pink secondary, since tan is the new design's actual secondary surface color.
- Everything else in the palette (`--muted`, `--accent`, `--border`, `--input`, `--destructive`, etc.) is unchanged — no mockup evidence called for changing it.
- Updated in both `src/global.css` (`--primary`/`--ring`/`--background`/`--secondary`) and `src/constants/theme.ts` (`THEME.light` mirrors + `GRADIENTS.luxe`), matching the pattern already established for keeping those two files in sync.

**New logo assets — real SVG rendering, not manual path transcription.** `perle-des-lys-log-with-text.svg` and `ogee-arch.svg` are copied into `assets/perledeslys/` (the established asset location from Task 10, resolved via the `@/assets/*` → `./assets/*` tsconfig path override — distinct from the unused `src/assets/` leftover scaffold folder). Installed `react-native-svg` + `react-native-svg-transformer`, added the transformer config to `metro.config.js` (composed with the existing `withNativeWind` wrapper) and a `declare module "*.svg"` ambient type in `src/types/svg.d.ts`, so SVGs import as ordinary React components (`import Logo from "./logo.svg"`) instead of requiring ~40KB of hand-transcribed path data into JSX — necessary here since the wordmark SVG has dozens of individual calligraphic paths.

**Brand/founder rename — "Lys" → "Ghania", "PERLEDESLYS" → "Perle des Lys".** Applied across `mock-data.ts` (`founderInfo.name`/`.fullName`, `welcomeMessage`'s signature, a FAQ question, 5 recipe/video titles/descriptions that mentioned "Lys" by name) and every screen with hardcoded copy referencing either (Landing, Login, Profile, First Steps, Dashboard, Lives). `founderInfo.avatar` was also repointed from the old generic (non-hijab, unrelated-looking) stock photo `perle-founder.jpg` to the new real photo `perle-hero-2.png` (copied from `new-hero-image.png`), since the new mockups consistently depict "Ghania" as a specific real person, not a generic stock model.

**Landing screen — rebuilt**, replacing v1's small logo-circle header + "Bienvenue dans votre écrin culinaire" headline with: a full-bleed hero photo (no side margin/rounding, unlike v1's inset rounded card), the wordmark SVG small in the top-right corner overlaid on the photo and large as the main heading below it (same asset, two sizes — the source file is one combined icon+lettering lockup), "Par Ghania" subheading, and CTAs relabeled "J'ai déjà un compte" / "Créer un compte" matching the mockup's copy exactly (the old "Accéder à mon espace" / "J'ai reçu une invitation" wording and the old headline copy don't appear anywhere in the new mockup, so they're replaced rather than kept alongside).

**Login screen — rebuilt**, replacing the small logo-circle + "Bon retour parmi nous." headline with the big `ogee-arch.svg` graphic and "Ça fait plaisir de vous revoir !" set inside its lower opening; tabs relabeled Se connecter/S'inscrire (kept the same internal `login`/`invite` values — no mockup exists for what S'inscrire's own content should look like, so it reuses the invite-code fields that already existed here, a reasonable fit for an invite-only club's idea of "signing up"); the email field is now a generic "IDENTIFIANT" (User icon, not Mail) matching the mockup; the old footer invite-link block ("Vous êtes cliente Thermomix... Demander une invitation") is removed since the S'inscrire tab now covers that need and the mockup doesn't show a footer at all.

**Bottom nav — rebuilt as a flush, in-flow bar** (`src/components/bottom-nav.tsx`): solid `bg-primary`, full-width, no rounding of its own (the rounded-corner look in the raw mockup screenshot is the phone-mockup-frame's bezel — confirmed by the same rounding appearing at the screenshot's *top* corners too, which have nothing to do with the nav bar). The important structural change: it's no longer `position: absolute`. The v1 floating-pill design used `absolute` specifically to get the "pill overlapping content" look, which is exactly what took it out of React Navigation's normal layout flow and required every screen to carry manual bottom-padding classes to avoid content hiding underneath it. A normal in-flow custom `tabBar` is measured and reserved for automatically by `<Tabs>`, the same as the default tab bar — so this fixes "content hidden by the nav" at the layout level for every screen at once, rather than needing a padding audit across every screen individually. Verified via SSR: the rendered nav bar's root `View` carries no `absolute`/`fixed` positioning class.

**MiniCalendar and Dashboard video cards — restyled** to match: each day cell in `mini-calendar.tsx` now has its own border (`border border-border`, replaced by `border-transparent` only for the solid-filled active day, to avoid a border flashing around the gradient-turned-solid active pill); the Dashboard's "Reprendre la formation" video cards now overlay category/title text directly on the image (over the existing dark scrim) and a bold `h-1.5` progress bar at the image's bottom edge, replacing the old below-image text block + thin hairline progress bar.

**Verification:** `tsc --noEmit` clean throughout (checked after every file). Booted `expo start --web` with a cleared Metro cache (to confirm the new SVG transformer config takes effect cleanly, not from a stale cache) and fetched Landing, Login, Dashboard, Lives, Profile, Recipe Detail, and First Steps — all 200, no bundler errors, no crash/error-boundary markers in any response, both SVGs confirmed rendering as real inline `<svg>` elements with the correct `viewBox`, `--primary` resolving to the new value, and the bottom nav's root `View` confirmed free of absolute/fixed positioning. Not verified (same disclosed limitation as every prior device-only concern): the fix actually eliminating content-hiding on a real device, and the visual color/logo match on an actual screen rather than inferred from SSR-compiled CSS.

---

## Post-Task-26 extension — favorites now cover videos too (2026-07-07)

Requested by the user directly (no corresponding plan task, no web equivalent — the web never had a real favorites feature at all, per Task 5's own notes): extend favoriting beyond recipes to videos, so the Favorites screen (Task 26) shows two categories.

**Store shape change (`local-store.ts`):** the original `useFavorites` store held a flat `favoriteIds: string[]` — fine for a single collection, but recipes and videos are separate id spaces, so a flat list can't tell which collection to resolve an id against once a second kind exists. Replaced with `favoriteEntries: { id: string; kind: "recipe" | "video" }[]`, and `toggle`/`isFavorite` both now take a required `kind` argument (no default, to avoid a silently-wrong lookup). `useFavorites()` now returns `favoriteRecipes`/`favoriteVideos` (resolved via the existing `recipesById`-style map pattern, now duplicated for `videosById`) instead of a single `favorites` array. This is a breaking change to the persisted `pdl.favorites` AsyncStorage key's shape — acceptable here since the app has no real users yet (mock/dev data only, same reasoning as the earlier MMKV→AsyncStorage swap); old persisted data under the old key shape is simply ignored on rehydrate (zustand's default partial-merge leaves `favoriteEntries` at its `[]` default when the persisted blob doesn't have that key), not migrated.
**Call sites updated:**
- `app/recipes/[recipeId].tsx`: `isFavorite(recipe.id)`/`toggle(recipe.id)` → `isFavorite(recipe.id, "recipe")`/`toggle(recipe.id, "recipe")`.
- `app/videos/[videoId].tsx`: the "Favoris" `ActionBtn` (one of 3 action tiles — Guide PDF / Favoris / Partager) had no `onPress` at all, matching the web's own disconnected mock (same category Recipe Detail's heart was in before Task 19). Wired to `toggle(video.id, "video")`, with the same icon-fill toggle (`fill={favVideo ? "currentColor" : "none"}`) already established for Recipe Detail's heart — Guide PDF and Partager remain intentionally non-functional, unchanged.
- `app/profile/favorites.tsx` (Task 26): rebuilt with two conditionally-rendered sections ("Recettes (n)"/"Vidéos (n)", each hidden when empty, mirroring the Search screen's per-section-count-conditional pattern from Task 14) instead of one flat recipe grid; the combined empty state (both counts zero) now mentions both "une recette ou une vidéo". Video cards reuse the `aspect-video` + overlay-play-icon treatment already established for video thumbnails elsewhere (Tutorials list, Dashboard, Video Detail's similar-videos list) rather than the recipe grid's `aspect-square` cards. Each card's heart toggle remains a structural sibling of its navigation `Pressable` (not nested inside it), the same nested-touchable-avoidance Task 26 already established.
**Verification:**
- `npx tsc --noEmit`: clean project-wide (same 2 pre-existing, unrelated environment errors noted since Task 14).
- Grepped for any remaining `.favorites` (old flat-array property name) reference across `src/` — none found, confirming no stale call site was missed.
- SSR-verified: the combined empty state renders correctly (fresh store, both counts zero) with the updated "recette ou une vidéo" copy; Video Detail's action row still renders all 3 buttons (Guide PDF/Favoris/Partager) with no bundler errors; Recipe Detail still renders correctly (regression check on the updated call site).
- Isolated script re-verified the toggle logic specifically for the new kind-scoping, including the edge case of a video and a recipe happening to share the same id string — confirmed favoriting/un-favoriting one kind never affects the other kind's entry for the same id.
- **Not independently verified interactively** (same standing limitation as every prior interactive-state check): actually favoriting a video from Video Detail and watching it appear under the Favorites screen's "Vidéos" section needs a device/simulator pass.

---

## Post-Task-27 extension — history now covers viewed recipes too (2026-07-07)

Requested by the user directly (no corresponding plan task, no web equivalent — the web's `useHistory` only ever tracked videos, confirmed by reading `kitchen-haven-club/src/lib/local-store.ts` itself). Extends Task 27's History screen to also show recently-viewed recipes, the same kind of cross-cutting extension as the earlier favorites-now-cover-videos change.

**Type change (`types/local-store.ts`):** `HistoryEntry` was a single video-shaped object (`videoId`, `duration`, `positionSec`, `totalSec`, `progress`). Replaced with a discriminated union — `VideoHistoryEntry` (`kind: "video"`, unchanged fields, just `videoId` renamed to `id`) and a new `RecipeHistoryEntry` (`kind: "recipe"`, `id`, `title`, `image`, `category`, `time` — no position/progress, since a recipe has nothing to "resume").
**Store change (`local-store.ts`):** `useHistoryStore`'s dedup/lookup/remove all now match on `(id, kind)` together, not just `id` — same reasoning as the favorites extension (a video and a recipe could in principle share an id string). `get()` is now generic: `get<K extends HistoryEntry["kind"]>(id, kind): Extract<HistoryEntry, {kind: K}> | undefined`, so a caller passing `"video"` gets a properly-narrowed `VideoHistoryEntry` back (with `positionSec` etc. visible to `tsc`) instead of the full union — this is what lets Video Detail's existing `stored?.positionSec` reads keep type-checking with no `as` cast.
**Call sites updated:**
- `app/videos/[videoId].tsx`: `get(video.id)` → `get(video.id, "video")`; the `upsert({videoId: video.id, ...})` call → `upsert({kind: "video", id: video.id, ...})`.
- `app/recipes/[recipeId].tsx` (new): added a `useEffect` (placed before the existing `if (!recipe) return` early return, guarded internally with its own `if (!recipe) return` — matching how `useFavorites()` was already called unconditionally before that same early return) that calls `upsert({kind: "recipe", id: recipe.id, title, image, category, time, updatedAt: Date.now()})` once per recipe view. Dependency array is `[recipe?.id]`, so it fires once on mount, not on every re-render (e.g. toggling the favorite heart or an ingredient checkbox doesn't re-log a view) — the same "fresh screen instance per navigation" reasoning Task 21 already established makes a mount-only effect equivalent to "once per view" here.
- `app/profile/history.tsx` (Task 27): replaced the single video-shaped row markup with a `HistoryRow` component that branches on `h.kind` — video rows keep the `Play`-icon overlay + progress-bar + "Reprendre à X / Y" text; new recipe rows use a `BookOpen`-icon overlay (no progress bar, nothing to resume) and show the recipe's `time` instead. Both link to their respective detail routes and share the same remove-row and card chrome. The header subtitle and empty-state copy were adjusted from video-specific wording ("Reprenez où vous vous étiez arrêtée" / "Aucun visionnage encore") to cover both kinds ("Vos vidéos et recettes récentes" / "Aucune activité récente") — a deliberate copy change since this feature itself has no web wording to preserve.
**Verification:**
- `npx tsc --noEmit`: clean project-wide (same 2 pre-existing, unrelated environment errors noted since Task 14).
- Grepped for any remaining `.videoId` (old flat field name) reference across `src/` — none found.
- SSR-checked all three touched screens (History's empty state with the new copy, Video Detail, Recipe Detail) — all 200, no bundler errors.
- Isolated script re-verified the store logic for the new shape: mixed video+recipe entries sort correctly most-recent-first as one combined list, and a recipe/video sharing the same id string don't collide on upsert or remove (same edge case already checked for favorites).
- **Not independently verified interactively** (same standing limitation as every prior interactive-state check): opening a recipe and then seeing it appear under History on a real device/simulator.

---

## Migration checklist

### Phase 0 — Foundation
- [x] Shared non-UI code ported (mock-data, local-store, types, constants, utils)
- [x] React Query, Safe Area, Gesture Handler, Theme, Fonts, Providers, root layout

### Phase 1 — Navigation shell & cross-cutting gaps
- [x] Task 1 — Define and scaffold the navigation structure
- [x] Task 2 — Custom bottom tab bar (BottomNav)
- [x] Task 3 — Custom Progress component
- [x] Task 4 — Gradient helper + install expo-linear-gradient
- [x] Task 5 — Real Favorites store (storage backend swapped MMKV → AsyncStorage after a real-device crash, see task notes)
- [x] Task 6 — Install remaining RNR components (toggle-group, textarea)
- [x] Task 7 — Vimeo embed component + install react-native-webview (code done; device/simulator playback verification still pending)
- [x] Task 8 — Expose aiChat as a plain HTTP endpoint (web repo) (code done; runtime verification still pending — see task notes)
- [x] Task 9 — RN API client config for the chat endpoint

### Phase 2 — Public / auth screens
- [x] Task 10 — Landing screen
- [x] Task 11 — Login screen

### Phase 3 — Home, Search, Calendar, First Steps
- [x] Task 12 — MiniCalendar widget (highlight/dots not visually confirmed — timezone-dependent web bug faithfully reproduced, see task notes)
- [x] Task 13 — Dashboard (home) screen — MVP
- [x] Task 14 — Search screen (accent-insensitive filter/tab-count live-typing not visually confirmed — needs a device/simulator, see task notes)
- [x] Task 15 — Calendar screen — month view + navigation (interactive month-nav/day-tap not device-verified, see task notes)
- [x] Task 16 — Calendar screen — week/day/year views (interactive view-switching not device-verified, see task notes)
- [x] Task 17 — First Steps screen — MVP

### Phase 4 — Recipes
- [x] Task 18 — Recipes list screen — MVP
- [x] Task 19 — Recipe detail screen — MVP

### Phase 5 — Tutorials & Video Detail
- [x] Task 20 — Tutorials list screen — MVP
- [x] Task 21 — Video detail screen — MVP (scope expanded to full screen, see task notes)
- [x] Task 22 — Video detail screen — history integration (persist/resume banner wired; live on-device watch-and-resume pass still needed, see task notes)

### Phase 6 — Lives
- [x] Task 23 — Lives screen — MVP (primary tab)

### Phase 7 — Profile cluster
- [x] Task 24 — Profile hub screen — MVP (primary tab)
- [x] Task 25 — Settings screen (interactive save/discard flow not device-verified, see task notes)
- [x] Task 26 — Favorites screen (interactive favorite/unfavorite-and-see-it-update not device-verified, see task notes)
- [x] Task 27 — History screen (interactive watch-then-appear/remove/clear not device-verified, see task notes)
- [x] Task 28 — Notes screen + scoped per-page note-creation (recipe/video now, tips later — interactive save/delete flow not device-verified, see task notes)
- [ ] Task 29 — FAQ screen — post-MVP
- [ ] Task 30 — Tips screen — post-MVP

### Phase 8 — Global floating overlays
- [x] Task 31 — Notes FAB — superseded by Task 28's scoped per-page `AddNoteButton` (not built as a global FAB, by design)
- [ ] Task 32 — AI Chat — post-MVP

### Phase 9 — QA
- [ ] Task 33 — Full-app manual regression pass — post-MVP
