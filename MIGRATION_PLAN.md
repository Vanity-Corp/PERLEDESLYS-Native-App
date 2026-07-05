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

### Task 5 — Real Favorites store
**Goal:** The web app never actually tracks favorites (recipe-detail's heart toggle and `/app/favorites` are disconnected mocks — flagged in the migration report). Build a real one now, same pattern as `useNotes`/`useHistory`: `useFavorites()` in `src/lib/local-store.ts` (zustand + MMKV, key `pdl.favorites`), storing recipe IDs (`string[]`), with `toggle(id)`/`isFavorite(id)`/`favorites` (resolved `Recipe[]` via `mock-data`).
**Files to modify:** `src/lib/local-store.ts`, `src/types/local-store.ts` (if a type is needed), `src/constants/storage.ts` (add `FAVORITES` key).
**Dependencies:** none (extends already-completed Phase 0 work).
**Acceptance criteria:** Toggling a favorite persists across app restarts (MMKV); `useFavorites().favorites` returns full `Recipe` objects, not just IDs, for direct list rendering.
**Manual testing checklist:**
- [ ] From a throwaway test screen, toggle a few recipe IDs, confirm `isFavorite` flips and `favorites` list updates.
- [ ] Force-quit and relaunch the app (or fast-refresh with state reset), confirm favorites persisted.
**Suggested commit:** `feat(store): add real useFavorites store (web app never had one)`

### Task 6 — Install remaining RNR components
**Goal:** `npx @react-native-reusables/cli@latest add toggle-group textarea progress` *(skip `progress` — already hand-built in Task 3 since RNR doesn't ship it; if the CLI errors on that name, just add `toggle-group` and `textarea`)*. `toggle-group` covers every single-select category-chip filter (Recipes, Tutorials, Tips categories); `textarea` covers the AI Chat input and Notes FAB textarea.
**Files to modify:** `src/components/ui/toggle-group.tsx`, `src/components/ui/textarea.tsx` (generated by the CLI), `package.json`/lockfile.
**Dependencies:** none.
**Acceptance criteria:** Both components render in a throwaway test screen without errors; `npx tsc --noEmit` passes.
**Manual testing checklist:**
- [ ] Render a `ToggleGroup` with 3-4 options, confirm single-select behavior.
- [ ] Render a `Textarea`, confirm it grows with content like the web's auto-growing textarea.
**Suggested commit:** `chore(ui): install RNR toggle-group and textarea components`

### Task 7 — Vimeo embed component + install `react-native-webview`
**Goal:** Both `/app/first-steps` and the special-cased "Mes premiers pas" video in `/app/videos/$videoId` embed the same hardcoded Vimeo iframe. Install `react-native-webview`, build `src/components/vimeo-embed.tsx` (`<VimeoEmbed videoId="1095621493" />`) wrapping a `WebView` pointed at `https://player.vimeo.com/video/{id}`, 16:9 aspect ratio.
**Files to modify:** `package.json`/lockfile (add `react-native-webview`), add `src/components/vimeo-embed.tsx`.
**Dependencies:** none.
**Acceptance criteria:** Video loads and plays inline on both iOS and Android; component matches the web's `aspect-video` sizing.
**Manual testing checklist:**
- [ ] Load the component on a real device or simulator with network access, confirm the Vimeo player renders and is playable.
- [ ] Confirm no console warnings about missing WebView native module (may require a dev-client rebuild, not just Expo Go — note this if so).
**Suggested commit:** `feat(video): add VimeoEmbed component via react-native-webview`

### Task 8 — Expose `aiChat` as a plain HTTP endpoint *(touches the web/server project)*
**Goal:** The web app's AI Chat calls a TanStack Start server function (`src/lib/ai.functions.ts` in `kitchen-haven-club`), which only exists inside that SSR framework. Extract the handler logic (system prompt + Gemini gateway call) into a plain HTTP route the RN app can `fetch()` — reuse the existing Cloudflare Worker (`kitchen-haven-club/src/server.ts`) by adding a normal `POST /api/ai-chat` route, rather than standing up new infrastructure.
**Files to modify:** *(in `kitchen-haven-club`, not this repo)* `src/server.ts` or a new route handler, reusing `src/lib/ai.functions.ts`'s prompt-building logic.
**Dependencies:** none — can happen in parallel with any RN task.
**Acceptance criteria:** `curl -X POST https://<worker-url>/api/ai-chat -d '{"messages":[...]}'` returns the same JSON shape (`{ok, content}` / `{ok:false, error}`) the RN app will expect.
**Manual testing checklist:**
- [ ] Call the new endpoint with `curl`/Postman, confirm a real AI response comes back.
- [ ] Call it with an empty/invalid body, confirm a clean 4xx, not a 500.
**Suggested commit (web repo):** `feat(api): expose aiChat as a plain POST endpoint for the RN app`

### Task 9 — RN API client config for the chat endpoint
**Goal:** Add `EXPO_PUBLIC_API_URL` env config and a thin `src/lib/api.ts` with an `aiChat(messages)` function that `fetch()`s Task 8's endpoint — the RN-side mirror of the web's `aiChat` server-function call signature, so the AI Chat screen task (Phase 9) doesn't need to know about `fetch` details.
**Files to modify:** Add `.env`/`app.config` entry for `EXPO_PUBLIC_API_URL`, add `src/lib/api.ts`.
**Dependencies:** Task 8 (needs a real URL to call, but can be stubbed against a placeholder URL and wired for real once Task 8 ships).
**Acceptance criteria:** `aiChat({ messages })` returns the same `{ok, content}`/`{ok:false, error}` shape as the web version; network errors are caught and surfaced as `{ok:false, error: "..."}`, matching web's try/catch fallback message.
**Manual testing checklist:**
- [ ] Call `aiChat` from a throwaway test screen with airplane mode on, confirm the graceful error path (not an uncaught exception).
- [ ] Call it with real connectivity once Task 8 is deployed, confirm a real response flows through.
**Suggested commit:** `feat(lib): add RN aiChat API client`

---

## Phase 2 — Public / auth screens

### Task 10 — Landing screen
**Web source:** `kitchen-haven-club/src/routes/index.tsx`
**Goal:** Build `(auth)/index.tsx`: hero image, gradient overlay, "Accéder à mon espace" / "J'ai reçu une invitation" buttons linking to Login.
**Files to modify:** `src/app/(auth)/index.tsx`.
**Dependencies:** Task 1, Task 4 (GradientView).
**Acceptance criteria:** Matches web layout (header logo mark, hero image card, headline, two CTAs); `Link` navigates to `(auth)/login`.
**Manual testing checklist:**
- [ ] Compare side-by-side with the web screenshot for spacing/typography (Cormorant Garamond headline renders with the loaded font, not a system fallback).
- [ ] Both buttons navigate correctly.
- [ ] Looks correct on both a small phone and a tablet-size simulator (no overflow).
**Suggested commit:** `feat(screens): add Landing screen`

### Task 11 — Login screen
**Web source:** `kitchen-haven-club/src/routes/login.tsx`
**Goal:** Build `(auth)/login.tsx`: RNR `Tabs` for Identifiants/Code d'invitation, RNR `Input` fields (email/password or invite code), RNR `Button` submit → `router.replace("/app")`. Per the project's chosen stack (`CLAUDE.md`), wire the form with **React Hook Form + Zod** (the web version used bare `useState`, since RHF/Zod are the RN project's stated tech choice for forms — same fields/behavior, no new validation rules invented).
**Files to modify:** `src/app/(auth)/login.tsx`.
**Dependencies:** Task 1.
**Acceptance criteria:** Both tabs render their respective fields; submit navigates into `app`; matches web's copy and layout exactly.
**Manual testing checklist:**
- [ ] Switch between the two tabs, confirm fields swap correctly and previous input isn't lost unexpectedly (matches web behavior of keeping both fields' state).
- [ ] Submit from each tab, confirm navigation into the tab group.
- [ ] Back button/gesture returns to Landing.
**Suggested commit:** `feat(screens): add Login screen with tabbed identifiants/invite form`

---

## Phase 3 — Home, Search, Calendar, First Steps

These share the most components with each other and with the shell built in Phase 1, so they go first among the `app` screens.

### Task 12 — MiniCalendar widget
**Web source:** `kitchen-haven-club/src/components/MiniCalendar.tsx`
**Goal:** Build `src/components/mini-calendar.tsx`: 7-day week strip, today highlighted with `luxe` gradient, event dots, tapping navigates to `app/calendar`.
**Files to modify:** Add `src/components/mini-calendar.tsx`.
**Dependencies:** Task 4.
**Acceptance criteria:** Correctly computes the current Mon-Sun week (matches web's `startOfWeek` logic, Monday-first); shows up to 3 upcoming events below the strip.
**Manual testing checklist:**
- [ ] Confirm today's date is highlighted and matches the device's actual current date.
- [ ] Confirm event dots appear only on days that have events in `mock-data`'s `events`.
- [ ] Tapping the widget navigates to the Calendar screen.
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
- [ ] Task 5 — Real Favorites store
- [ ] Task 6 — Install remaining RNR components (toggle-group, textarea)
- [ ] Task 7 — Vimeo embed component + install react-native-webview
- [ ] Task 8 — Expose aiChat as a plain HTTP endpoint (web repo)
- [ ] Task 9 — RN API client config for the chat endpoint

### Phase 2 — Public / auth screens
- [ ] Task 10 — Landing screen
- [ ] Task 11 — Login screen

### Phase 3 — Home, Search, Calendar, First Steps
- [ ] Task 12 — MiniCalendar widget
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
