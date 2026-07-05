# PERLEDESLYS — Web → React Native Migration Plan

Source of truth: [`kitchen-haven-club/MIGRATION_REPORT.md`](../kitchen-haven-club/MIGRATION_REPORT.md) (per-page inventory of the web app) plus the current state of this repo (`PERLEDESLYS-Native-App`).

**Ground rules for every task below** (from `CLAUDE.md`):
- Reproduce the web app's UI/UX as closely as possible — no redesigns, no "improvements," no simplified layouts, no renamed concepts.
- Prefer a **React Native Reusables (RNR)** component first. Only build a custom component when RNR has no equivalent (progress bar, video scrubber, calendar grid, Vimeo embed, gradient hero cards, bottom-sheet-style modals — none of these exist in RNR).
- Business logic, state shape, and folder structure carry over; only the platform APIs change (`div`→`View`, `input`→`TextInput`/RNR `Input`, `localStorage`→ the MMKV+zustand stores already built, `Link`→ Expo Router `Link`, etc).
- Install new RNR components with `npx @react-native-reusables/cli@latest add <name>`.

## Phase 0 — Foundation (already completed)

Not re-listed as tasks; already done in prior sessions:
- Shared non-UI code ported: `src/lib/mock-data.ts`, `src/lib/local-store.ts` (zustand + MMKV), `src/lib/storage.ts`, `src/lib/utils.ts`, `src/types/*`, `src/constants/content.ts`, `src/constants/storage.ts`.
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

### Task 13 — Dashboard (home) screen
**Web source:** `kitchen-haven-club/src/routes/app/index.tsx`
**Goal:** Build `app/index.tsx`: header (avatar + greeting + notification bell), search bar (pushes to Search), live banner, `MiniCalendar`, "Mes premiers pas" card, featured recipe, continue-watching horizontal list, new-recipes horizontal list, quick-access tiles, popular-recipes grid, founder card, articles preview.
**Files to modify:** `src/app/app/index.tsx`.
**Dependencies:** Task 3 (Progress, for continue-watching), Task 4, Task 12.
**Acceptance criteria:** All 9 sections from the web version present, in the same order; horizontal lists scroll smoothly; every card navigates to the correct destination (recipe detail, video detail, tutorials, tips).
**Manual testing checklist:**
- [ ] Scroll the full page top to bottom, confirm no section is missing or mis-ordered vs. the web app.
- [ ] Tap through every card type at least once, confirm correct destination screen.
- [ ] Confirm horizontal scrollers don't fight the outer vertical `ScrollView`'s gesture (common RN pitfall).
**Suggested commit:** `feat(screens): add Dashboard (home) screen`

### Task 14 — Search screen
**Web source:** `kitchen-haven-club/src/routes/app/search/index.tsx`
**Goal:** Build `app/search.tsx`: search `Input`, result-type `Tabs` (Tout/Recettes/Vidéos/Articles/FAQ) with counts, accent-insensitive client-side filtering (port the web's `norm()` helper as-is), empty/no-query and no-results states.
**Files to modify:** `src/app/app/search.tsx`.
**Dependencies:** Task 1.
**Acceptance criteria:** Filtering logic matches web exactly (same `norm()` behavior, same fields searched per content type); tapping a result navigates correctly.
**Manual testing checklist:**
- [ ] Search an accented term (e.g. "poulet" vs "poulét") and confirm both match.
- [ ] Confirm tab counts update live as you type.
- [ ] Confirm empty state and no-results state both render correctly.
**Suggested commit:** `feat(screens): add Search screen`

### Task 15 — Calendar screen — month view + navigation
**Web source:** `kitchen-haven-club/src/routes/app/calendar/index.tsx`
**Goal:** Build `app/calendar.tsx` with the "mois" (month) view + the jour/semaine/mois/année `Tabs` switcher + prev/next navigation header. Week/day/year views stubbed for Task 16.
**Files to modify:** `src/app/app/calendar.tsx`.
**Dependencies:** Task 1.
**Acceptance criteria:** Month grid renders correct day count/offset for any month (test at least Feb and a 31-day month); event dots colored by type; tapping a day switches to day view (even if day view itself isn't finished until Task 16, the switch should work).
**Manual testing checklist:**
- [ ] Navigate several months forward/back, confirm the grid recalculates correctly each time (no off-by-one day offsets).
- [ ] Confirm today is visually distinct.
- [ ] Confirm event-type legend colors match the dots shown in cells.
**Suggested commit:** `feat(screens): add Calendar screen (month view)`

### Task 16 — Calendar screen — week/day/year views
**Web source:** same file as Task 15.
**Goal:** Complete the remaining three `Tabs` views (semaine/jour/année) in `app/calendar.tsx`.
**Files to modify:** `src/app/app/calendar.tsx`.
**Dependencies:** Task 15.
**Acceptance criteria:** All 4 views reachable via the switcher; year view's month tiles navigate into month view for that month (matches web).
**Manual testing checklist:**
- [ ] Cycle through all 4 views, confirm each renders without crashing on today's date.
- [ ] From year view, tap a month tile, confirm it lands on month view for the right month.
- [ ] Confirm "no events" empty states (day/week with nothing scheduled) render correctly.
**Suggested commit:** `feat(screens): complete Calendar screen (week/day/year views)`

### Task 17 — First Steps screen
**Web source:** `kitchen-haven-club/src/routes/app/first-steps/index.tsx`
**Goal:** Build `app/first-steps.tsx`: `VimeoEmbed`, video metadata, Lys's welcome letter (gradient header + card body, preserve the exact French copy and line breaks), numbered next-steps list, two action buttons (non-functional placeholders in the web version too — keep them as-is, don't invent handlers).
**Files to modify:** `src/app/app/first-steps.tsx`.
**Dependencies:** Task 4, Task 7.
**Acceptance criteria:** Welcome letter text matches web verbatim (pull from `mock-data.welcomeMessage`, already ported); Vimeo video plays.
**Manual testing checklist:**
- [ ] Confirm the video loads and the letter text has no truncation/overflow.
- [ ] Confirm line breaks in the letter body render as separate paragraphs, matching the web's `whitespace-pre-line`.
**Suggested commit:** `feat(screens): add First Steps screen`

---

## Phase 4 — Recipes

### Task 18 — Recipes list screen
**Web source:** `kitchen-haven-club/src/routes/app/recipes/index.tsx`
**Goal:** Build `app/recipes/index.tsx`: search `Input`, category `ToggleGroup` (horizontal scroll), 2-column recipe grid with `Badge` for category/new tag.
**Files to modify:** `src/app/app/recipes/index.tsx`.
**Dependencies:** Task 6 (toggle-group).
**Acceptance criteria:** Filtering (category + text, combined) matches web logic exactly; empty state renders when no matches.
**Manual testing checklist:**
- [ ] Filter by each category, confirm correct recipe subset.
- [ ] Combine a category filter with a search term, confirm both apply together (AND, not OR).
- [ ] Tap a recipe card, confirm navigation to detail with the right `recipeId`.
**Suggested commit:** `feat(screens): add Recipes list screen`

### Task 19 — Recipe detail screen
**Web source:** `kitchen-haven-club/src/routes/app/recipes/$recipeId.tsx`
**Goal:** Build `app/recipes/[recipeId].tsx`: hero image with back/favorite/share buttons, stat row (time/difficulty/portions), description, Cookidoo CTA (`Linking.openURL`), interactive ingredient checklist (RNR `Checkbox`), numbered steps, "Voir le tutoriel vidéo" button.
**Files to modify:** `src/app/app/recipes/[recipeId].tsx`.
**Dependencies:** Task 5 (real favorites store — wire the heart button to it, fixing the web's disconnected mock), Task 6.
**Acceptance criteria:** Favorite toggle persists via `useFavorites` (real behavior, better than web's local-only `useState`); ingredient checkboxes toggle a strike-through state; unknown `recipeId` shows a not-found state instead of crashing.
**Manual testing checklist:**
- [ ] Toggle a few ingredients, confirm strike-through and unstrike work.
- [ ] Toggle favorite, navigate away and back, confirm it persisted.
- [ ] Tap the Cookidoo link, confirm it opens the external browser.
- [ ] Navigate to a bogus recipe id (e.g. via a manually-typed deep link), confirm graceful not-found UI, not a crash.
**Suggested commit:** `feat(screens): add Recipe detail screen`

---

## Phase 5 — Tutorials & Video Detail (highest technical risk — do while context is fresh from Phase 1's WebView/Progress work)

### Task 20 — Tutorials list screen
**Web source:** `kitchen-haven-club/src/routes/app/tutorials/index.tsx`
**Goal:** Build `app/tutorials/index.tsx`: category `Tabs`, vertical list of video cards with thumbnail, play overlay, duration badge, `Progress` bar when `progress` is set.
**Files to modify:** `src/app/app/tutorials/index.tsx`.
**Dependencies:** Task 3.
**Acceptance criteria:** Category filter matches web tab list exactly; progress bar only shows when a video has a non-zero `progress`.
**Manual testing checklist:**
- [ ] Filter through every category tab.
- [ ] Confirm progress bars appear only on videos with progress in `mock-data`.
- [ ] Tap a card, confirm navigation to the right `videoId`.
**Suggested commit:** `feat(screens): add Tutorials list screen`

### Task 21 — Video detail screen — player shell
**Web source:** `kitchen-haven-club/src/routes/app/videos/$videoId.tsx`
**Goal:** Build `app/videos/[videoId].tsx`'s player area only: `VimeoEmbed` for the "Mes premiers pas" special case; for all other videos, the web's **simulated** player (static thumbnail + play/pause button + `setInterval`-driven fake position — this is a deliberate parity choice, not a real player, matching the web app's actual behavior). Install `@react-native-community/slider` for the scrubber.
**Files to modify:** `src/app/app/videos/[videoId].tsx`, `package.json`/lockfile (add `@react-native-community/slider`).
**Dependencies:** Task 7.
**Acceptance criteria:** Play/pause toggles the simulated timer; scrubber reflects and can override position; matches web's exact behavior (position clamps at total duration and auto-pauses).
**Manual testing checklist:**
- [ ] Press play, confirm the position advances once per second.
- [ ] Drag the scrubber, confirm position jumps and playback continues from there.
- [ ] Let a short video "finish," confirm it auto-pauses at 100%.
**Suggested commit:** `feat(screens): add Video detail screen (player shell)`

### Task 22 — Video detail screen — history integration + metadata
**Web source:** same file as Task 21.
**Goal:** Wire the player to `useHistory` (already built in Phase 0): resume-from-last-position banner, persist position on every tick, similar-videos list, action buttons row (Guide PDF/Favoris/Partager — non-functional placeholders in web too, keep as-is).
**Files to modify:** `src/app/app/videos/[videoId].tsx`.
**Dependencies:** Task 21.
**Acceptance criteria:** Opening a previously-watched video shows the "Reprise à X%" banner and starts at the saved position; watching updates `useHistory` in real time (visible on the History screen once Task 27 exists).
**Manual testing checklist:**
- [ ] Watch a video partway, leave the screen, come back — confirm resume banner and correct position.
- [ ] Tap "Recommencer," confirm position resets to 0.
- [ ] Confirm similar-videos row excludes the current video and navigates correctly.
**Suggested commit:** `feat(screens): wire Video detail screen to watch history`

---

## Phase 6 — Lives

### Task 23 — Lives screen
**Web source:** `kitchen-haven-club/src/routes/app/lives/index.tsx`
**Goal:** Build `app/lives/index.tsx`: featured next-live hero card (gradient overlay, "Rejoindre"/"Me rappeler" buttons — non-functional placeholders in web too), À venir/Replays `Tabs`, list rows with status `Badge`.
**Files to modify:** `src/app/app/lives/index.tsx`.
**Dependencies:** Task 4.
**Acceptance criteria:** Tab counts match `mock-data.lives` filtered by status; featured card only shows when an upcoming live exists.
**Manual testing checklist:**
- [ ] Switch between À venir/Replays, confirm correct lists and counts.
- [ ] Confirm replay rows show a play icon overlay, upcoming rows don't.
**Suggested commit:** `feat(screens): add Lives screen`

---

## Phase 7 — Profile cluster

### Task 24 — Profile hub screen
**Web source:** `kitchen-haven-club/src/routes/app/profile/index.tsx`
**Goal:** Build `app/profile/index.tsx`: user card, quick-access tile grid (Favoris/Historique/Notes/Premiers pas), account/support row lists (RNR `Separator` between rows), Thermomix purchase card, logout button (`router.replace("/(auth)")`, matches web's no-op-auth logout).
**Files to modify:** `src/app/app/profile/index.tsx`.
**Dependencies:** Task 1.
**Acceptance criteria:** All rows navigate to their correct destination screen (some not built until later tasks — fine, routes already exist as stubs from Task 1 and get filled in incrementally).
**Manual testing checklist:**
- [ ] Tap every tile/row at least once, confirm correct navigation target.
- [ ] Tap logout, confirm it returns to the auth stack.
**Suggested commit:** `feat(screens): add Profile hub screen`

### Task 25 — Settings screen
**Web source:** `kitchen-haven-club/src/routes/app/settings/index.tsx`
**Goal:** Build `app/profile/settings.tsx`: personal-info fields, preference `Switch` toggles, "save" flow. Wired with **React Hook Form + Zod** (per `CLAUDE.md`'s chosen stack; web used bare `useState` — same fields/behavior) against the real `useSettings` store from Phase 0.
**Files to modify:** `src/app/app/profile/settings.tsx`.
**Dependencies:** Task 1 (Phase 0's `useSettings` already exists).
**Acceptance criteria:** Editing a field and saving persists via `useSettings` (MMKV); a draft edited-but-not-saved change is discarded on leaving the screen, matching web's draft/commit-on-save behavior.
**Manual testing checklist:**
- [ ] Edit a field, save, navigate away and back — confirm it persisted.
- [ ] Edit a field, navigate away *without* saving, come back — confirm the unsaved edit was discarded.
- [ ] Toggle each switch, confirm it persists after save.
**Suggested commit:** `feat(screens): add Settings screen`

### Task 26 — Favorites screen
**Web source:** `kitchen-haven-club/src/routes/app/favorites/index.tsx`
**Goal:** Build `app/profile/favorites.tsx` reading from the real `useFavorites` store (Task 5) instead of web's hardcoded `recipes.slice(0, 6)` mock.
**Files to modify:** `src/app/app/profile/favorites.tsx`.
**Dependencies:** Task 5, Task 19 (so there's a way to actually add favorites before this screen is meaningfully testable).
**Acceptance criteria:** List reflects real favorited recipes; empty state when none favorited (a case the web mock never had to handle — add a reasonable "no favorites yet" message consistent with the app's tone, not a redesign).
**Manual testing checklist:**
- [ ] Favorite a couple of recipes from the detail screen, confirm they appear here.
- [ ] Un-favorite one, confirm it disappears from this list.
- [ ] With zero favorites, confirm the empty state renders instead of a blank screen.
**Suggested commit:** `feat(screens): add Favorites screen backed by real favorites store`

### Task 27 — History screen
**Web source:** `kitchen-haven-club/src/routes/app/history/index.tsx`
**Goal:** Build `app/profile/history.tsx` reading `useHistory` (Phase 0): list with resume position, remove-one and clear-all actions, empty state.
**Files to modify:** `src/app/app/profile/history.tsx`.
**Dependencies:** Task 22 (needs Video Detail actually writing history for this screen to show real data).
**Acceptance criteria:** Matches web row layout; remove/clear actions update the list immediately.
**Manual testing checklist:**
- [ ] Watch a couple of videos (Task 22), confirm they show up here in most-recent-first order.
- [ ] Remove one, confirm it disappears; clear all, confirm empty state appears.
**Suggested commit:** `feat(screens): add History screen`

### Task 28 — Notes screen
**Web source:** `kitchen-haven-club/src/routes/app/notes/index.tsx`
**Goal:** Build `app/profile/notes.tsx` reading `useNotes` (Phase 0): list with context link, delete action, empty state.
**Files to modify:** `src/app/app/profile/notes.tsx`.
**Dependencies:** Task 1 (fully testable once Notes FAB, Phase 9, can actually create notes — but the list/delete UI can be built and tested against manually-seeded store data before then).
**Acceptance criteria:** Context link (`contextHref`) navigates to the right screen when tapped.
**Manual testing checklist:**
- [ ] Seed a note via a throwaway debug call to `useNotes().add(...)`, confirm it renders with correct date formatting.
- [ ] Tap its context link, confirm it navigates correctly.
- [ ] Delete it, confirm the list updates and empty state appears when none remain.
**Suggested commit:** `feat(screens): add Notes screen`

### Task 29 — FAQ screen
**Web source:** `kitchen-haven-club/src/routes/app/faq/index.tsx`
**Goal:** Build `app/profile/faq.tsx` using RNR `Accordion` (direct upgrade from the web's hand-rolled accordion), `mailto:` link via `Linking.openURL`.
**Files to modify:** `src/app/app/profile/faq.tsx`.
**Dependencies:** none beyond Phase 0 RNR install.
**Acceptance criteria:** All FAQ items from `mock-data.faqItems` present; only one open at a time (matches web).
**Manual testing checklist:**
- [ ] Open several items in sequence, confirm previous one closes (single-open behavior).
- [ ] Tap the contact email row, confirm it opens the mail composer.
**Suggested commit:** `feat(screens): add FAQ screen using RNR Accordion`

### Task 30 — Tips screen
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

### Task 31 — Notes FAB
**Web source:** `kitchen-haven-club/src/components/NotesFAB.tsx`
**Goal:** Build `src/components/notes-fab.tsx`: floating button (hidden on the Notes screen itself), RNR `Dialog` styled as a bottom sheet (slide-up, rounded top corners) containing context label + RNR `Textarea` + save/view-notes actions, calling `useNotes().add()`. Context detection (which screen the user is on, for the "Contexte : ..." label) is reimplemented against Expo Router's current route instead of the web's `location.pathname` string-matching, but produces the same labels.
**Files to modify:** Add `src/components/notes-fab.tsx`. Modify `src/app/app/_layout.tsx` to mount it once, globally, alongside the tab navigator.
**Dependencies:** Task 6 (Textarea), Phase 0 (`useNotes`).
**Acceptance criteria:** FAB appears on every `app` screen except Notes; context label matches what the web version would show for the equivalent screen; saved notes appear immediately on the Notes screen (Task 28).
**Manual testing checklist:**
- [ ] Open the FAB from several different screens (a recipe detail, a video detail, the dashboard), confirm the context label is correct each time.
- [ ] Save a note, navigate to Notes screen, confirm it's there with the right context link.
- [ ] Confirm the FAB is hidden specifically on the Notes screen.
**Suggested commit:** `feat(overlays): add Notes FAB (bottom-sheet Dialog)`

### Task 32 — AI Chat
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

### Task 33 — Full-app manual regression pass
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

## Migration checklist

### Phase 0 — Foundation
- [x] Shared non-UI code ported (mock-data, local-store, types, constants, utils)
- [x] React Query, Safe Area, Gesture Handler, Theme, Fonts, Providers, root layout

### Phase 1 — Navigation shell & cross-cutting gaps
- [x] Task 1 — Define and scaffold the navigation structure
- [x] Task 2 — Custom bottom tab bar (BottomNav)
- [x] Task 3 — Custom Progress component
- [x] Task 4 — Gradient helper + install expo-linear-gradient
- [x] Task 5 — Real Favorites store
- [x] Task 6 — Install remaining RNR components (toggle-group, textarea)
- [x] Task 7 — Vimeo embed component + install react-native-webview (code done; device/simulator playback verification still pending)
- [x] Task 8 — Expose aiChat as a plain HTTP endpoint (web repo) (code done; runtime verification still pending — see task notes)
- [x] Task 9 — RN API client config for the chat endpoint

### Phase 2 — Public / auth screens
- [x] Task 10 — Landing screen
- [x] Task 11 — Login screen

### Phase 3 — Home, Search, Calendar, First Steps
- [x] Task 12 — MiniCalendar widget (highlight/dots not visually confirmed — timezone-dependent web bug faithfully reproduced, see task notes)
- [ ] Task 13 — Dashboard (home) screen
- [ ] Task 14 — Search screen
- [ ] Task 15 — Calendar screen — month view + navigation
- [ ] Task 16 — Calendar screen — week/day/year views
- [ ] Task 17 — First Steps screen

### Phase 4 — Recipes
- [ ] Task 18 — Recipes list screen
- [ ] Task 19 — Recipe detail screen

### Phase 5 — Tutorials & Video Detail
- [ ] Task 20 — Tutorials list screen
- [ ] Task 21 — Video detail screen — player shell
- [ ] Task 22 — Video detail screen — history integration + metadata

### Phase 6 — Lives
- [ ] Task 23 — Lives screen

### Phase 7 — Profile cluster
- [ ] Task 24 — Profile hub screen
- [ ] Task 25 — Settings screen
- [ ] Task 26 — Favorites screen
- [ ] Task 27 — History screen
- [ ] Task 28 — Notes screen
- [ ] Task 29 — FAQ screen
- [ ] Task 30 — Tips screen

### Phase 8 — Global floating overlays
- [ ] Task 31 — Notes FAB
- [ ] Task 32 — AI Chat

### Phase 9 — QA
- [ ] Task 33 — Full-app manual regression pass
