# Life Tracker — Whole-App Premium Skins · Build Plan & Prompt

> Hand this whole file to a Claude Code session working in the **habit-tracker** repo.
> It is self-contained: every source file, the architecture, the phases, the fidelity
> references, and the acceptance criteria. It is a **visual skin layer** — no data-model,
> money-math, XP/streak, or sync changes.

---

## 0 · Paste-this kickoff

> Build a **whole-app skin system** for Life Tracker: add 5 premium, user-switchable skins
> — **Aurora, Halo, Meridian, Terra, Bolt** — covering **every screen** (habit dashboard,
> tasks, goals, analytics, Pocket Tracker, header/sidebar, modals), on **web and the
> Capacitor Android app**. Keep the current look ("classic") and all 5 existing themes
> 100% intact. Read `docs/redesign/BUILD_PROMPT.md` in full, then the token specs in
> `docs/redesign/tokens/*.md` and the visual references `public/showcase-habit-<skin>.html`
> (habit dashboard) + `public/showcase-<skin>.html` (Pocket). Follow the phased build order;
> verify each phase in the browser and an Android build; commit per phase.

---

## 1 · Goal & scope

- **5 whole-app skins**, selectable in-app, persisted + synced like any setting.
- Applies to **everything the user sees**: dashboard (habits, tasks, streak, XP/level, badges, challenges, scores, rewards), Goals page, Analytics page, Pocket Tracker (all 5 tabs), Header/Sidebar/nav, modals, toasts, auth page.
- Ships on **web + Android** (Vite + React + Capacitor; native shell in `/android`).
- **Default stays `classic`** — today's look with the 5 existing themes (matrix, cyberpunk, midnight, crimson, arctic) byte-for-byte unchanged.
- **No** new runtime dependencies except Google Fonts. **No** logic changes.
- Skins are all-or-nothing worlds: when a premium skin is active it **owns the whole palette, typography, and shape language**; the classic theme picker applies only to `classic`.

> Each skin is independently shippable after Phase 1. Build order in Phase 3 is optimized
> (shared primitives first), but the owner can stop after any skin.

---

## 2 · Ground truth — the app as it exists (read these first)

### App shell & habit side
| Concern | File | What's there |
|---|---|---|
| App root, pages, settings state | `src/App.jsx` | `settings` persisted at key `ht_settings`; theme applied via `document.documentElement.setAttribute('data-theme', settings.theme)` (~line 114); pages: `dashboard`, `goals`, `analytics`, `pocket` |
| Theme tokens (5 themes) | `src/index.css` | Each theme = CSS-var block under `[data-theme="…"]` (`--bg --surface --surface-2 --border --text --text-muted --primary --primary-light --accent --success --gold --orange --danger --cyan --gradient-* --shadow-glow --glow*`); shared tokens in `:root` (`--font-display`, spacing, `--text-*`, `--radius-*`, `--shadow-*`, transitions); phone rem-scale at ≤480px; safe-area padding on `body`; reduced-motion + focus-visible rules |
| All component styles | `src/App.css` | Every class the skins restyle: `.app-layout .sidebar .app-main .header .level-bar .badge-shelf .date-nav .dashboard .habits-section .habit-item .habit-checkbox .history-dot .task-* .goal-* .scores-section .score-card .reward-* .challenge-* .modal-* .kebab-* .save-indicator .undo-toast .auth-*` and Pocket's `.pocket .pk-*` |
| Theme picker + settings panel | `src/components/Header.jsx` | `THEMES` array + swatch buttons calling `onSetTheme(t.id)` inside the settings dropdown — **add the "App style" chooser here** |
| Nav | `src/components/Sidebar.jsx` | Desktop rail + mobile bottom bar (dedicated Pocket button; single bottom bar inside Pocket per v0.3.1) |
| Dashboard pieces | `LevelBar.jsx BadgeShelf.jsx DateNav.jsx DailyChallenges.jsx HabitList.jsx HabitItem.jsx TaskList.jsx TaskItem.jsx GoalsSummaryCard.jsx ScoresPanel.jsx DayProgress.jsx WeeklyScore.jsx MonthlyScore.jsx RewardsCard.jsx RewardItem.jsx CelebrationBanner.jsx` (all in `src/components/`) | `HabitItem` already renders: check button w/ `+XP` float, emoji icon, name+notes, frequency chip, tag dots, **7-day history dots**, per-habit 🔥streak, XP, kebab menu — the skin showcases map 1:1 onto this |
| Other pages | `GoalsPage.jsx GoalCard.jsx MilestoneList.jsx AnalyticsPage.jsx AuthPage.jsx` + modals (`AddEdit*.jsx NotesModal.jsx`) | Restyle targets |
| Sync | `src/hooks/useSync.js` | `SYNC_KEYS` includes `ht_settings` → a new `settings.skin` field **syncs for free** |
| Fonts | `index.html` | Loads Orbitron + JetBrains Mono today; add skin fonts here |

### Pocket side (money feature — already fully wired)
| Concern | File | What's there |
|---|---|---|
| Entry/tabs/CRUD | `src/components/pocket/PocketTracker.jsx` | Root `<div className="pocket">`; tabs Overview/Calendar/Stats/Goals/Settings; state `income/expenses/categories/goals/ui` (`ht_pocket_*`) |
| Overview | `src/components/pocket/PocketOverview.jsx` | Already switches layouts on `ui.dashboardStyle` (`ring|ledger|cards`) — the premium skins add their own Overview renderers beside these |
| Charts | `src/components/pocket/charts.jsx` | `RingGauge Donut SegmentedBar ProgressBar` — extend with `ArcGauge` (Meridian) + `BudgetRibbon` (Terra/Bolt) |
| Selectors & money | `src/utils/pocketUtils.js` | `money(iqd, ui)`→`{primary, secondary}` (IQD/USD per `ui.primaryCurrency` + `ui.iqdRate`), `compact formatIQD budgetForMonth spent remaining spentPct categoryBreakdown safeToSpendPerDay weeklyBuckets monthlyTotals goalPct suggestedMonthly`, `SEED_CATEGORIES` (fixed, theme-agnostic category colors) |
| Other tabs | `PocketCalendar.jsx PocketStats.jsx PocketGoals.jsx PocketSettings.jsx PocketBits.jsx ExpenseHistory.jsx AddExpenseModal.jsx SetIncomeModal.jsx` | Settings already has a "Dashboard style" chooser (`patchUi`) — pattern to mirror |

**Everything the designs display already exists as data/selectors.** Habits: logs/streaks/7-day history/XP/level/badges are computed in `src/utils/scoreUtils.js`, `levelUtils.js`, `rewardUtils.js`. Pocket: all figures via `pocketUtils.js`. **Do not** change any of it.

---

## 3 · Fidelity references (match these)

Per skin (`aurora | halo | meridian | terra | bolt`):
- **Token spec (authoritative):** `docs/redesign/tokens/<skin>.md` — exact hexes, fonts, shadows, radii, geometry, signature element, mobile framing, accessibility notes. Written for the Pocket screens; the visual language applies app-wide.
- **Habit dashboard reference (web + mobile):** `public/showcase-habit-<skin>.html` — the approved whole-app look: hero/signature, habit rows (check, icon, name, streak, 7-day dots, XP), task rows with priority chips, Day/Week/Month scores, reward card, nav, phone frame w/ bottom bar + FAB.
- **Pocket reference (web + mobile):** `public/showcase-<skin>.html` — the approved Pocket look.

Open them in a browser or at `http://localhost:5173/showcase-…html` (dev server, no build step).

**Fidelity is the point.** Match colors, type, spacing, radii, shadows, and the signature element precisely — approximation breaks Bolt (brutalism) and Halo (neumorphism) especially. Sample data in the references → wire to real state.

| Skin | World | Fonts | Signature (dashboard / pocket) |
|---|---|---|---|
| Aurora | dark aurora-glass, teal/violet/pink glows | Space Grotesk + Manrope | glowing tri-stop completion ring / glass hero + gradient progress |
| Halo | soft neumorphism on `#e6e9f2`, indigo | Plus Jakarta Sans | inset completion ring; checks press in / raised-vs-inset system |
| Meridian | ink + emerald + gold hairlines | Space Grotesk + Manrope | 270° arc gauge; gold hairlines; tabular numerals |
| Terra | warm bone/espresso editorial, terracotta | Newsreader + Hanken Grotesk | segmented ribbon w/ hatch; serif numerals; italic labels |
| Bolt | neo-brutalist paper, ink outlines | Archivo + Space Mono | outlined segmented bar; hard offset shadows; ledger numbers |

---

## 4 · Architecture — the skin system

One idea: a **`skin` dimension on settings**, applied as `data-skin` on the root element, with all skin CSS scoped under `html[data-skin="<skin>"]` so `classic` and the 5 themes can never be affected.

1. **State** — in `App.jsx`, extend the settings default: `skin: 'classic'` (`classic | aurora | halo | meridian | terra | bolt`). Missing field ⇒ `'classic'` (old persisted settings merge safely). Apply beside the theme effect:
   ```js
   document.documentElement.setAttribute('data-skin', settings.skin || 'classic')
   ```
   Persistence + Supabase sync are free (`ht_settings` ∈ `SYNC_KEYS`).

2. **CSS scoping & specificity** — new folder `src/skins/`: `aurora.css halo.css meridian.css terra.css bolt.css` + `index.css` that imports all five (import it once from `App.jsx` **after** `App.css`). Every selector is prefixed `html[data-skin="<skin>"] …` — specificity `(0,1,1)+` beats the theme blocks' `[data-theme]` `(0,1,0)` and `App.css` class rules at equal class-count. **No `!important`.**

3. **Two-layer skinning** (this is what makes 5 whole-app skins tractable):
   - **Layer 1 — token override (~70% of the work):** each skin re-declares the global CSS vars under its scope — `--bg --surface --surface-2 --border --text --text-muted --primary --accent --success --gold --danger --cyan --gradient-primary --shadow* --radius* --font-display` — mapped from its token spec. Because `App.css` consumes these vars everywhere, the entire app (badges, modals, kebabs, toasts, analytics, auth) re-clothes instantly. Also set `body{font-family:…}` and heading/numeral font rules per spec.
   - **Layer 2 — shape & signature (the premium 30%):** targeted rules + small components for what vars can't express:
     - the **hero device** on the dashboard (see 5),
     - habit **check controls** (Aurora glow ✓ / Halo pressed-in tile / Meridian emerald ring / Terra warm serif check / Bolt ink-fill box), history dots, streak chips,
     - card surfaces (glass blur / neumorphic dual-shadow / gradient+hairline / warm paper / ink outline + hard shadow), buttons, progress bars, nav (rail + mobile bottom bar + FAB),
     - Pocket Overview structure per skin.

4. **Signature components** — `src/skins/components/`:
   - `SkinHero.jsx` — dashboard hero showing today's completion + streak + level; switches on skin: Aurora tri-stop ring · Halo inset ring · Meridian `ArcGauge` · Terra ribbon · Bolt outlined bar. Rendered by `App.jsx`/dashboard when `skin !== 'classic'` (classic keeps `LevelBar` + `ScoresPanel` exactly as-is; premium skins may fold `LevelBar` into the hero).
   - Chart primitives in `src/components/pocket/charts.jsx`: **`ArcGauge`** — 270°, two SVG circles `r≈82`, `stroke-width 12`, `pathLength=100`, `rotate(135deg)`, track dasharray `"75 100"`, value `"<pct×0.75> 100"`, emerald gradient + soft glow (math + spec in `tokens/meridian.md`). **`BudgetRibbon`** — segmented bar (colored segments in order + 45° hatch remainder); Terra = rounded/soft, Bolt = 2.5px ink borders, zero radius.
   - Skin components read the current skin via a tiny helper (prop or `useSkin()` reading `settings.skin`) — no context gymnastics needed beyond what App already passes.

5. **Pocket under the same switch** — `data-skin` is on `<html>`, so Pocket inherits automatically; scope Pocket rules as `html[data-skin="<skin>"] .pocket …`. Premium Pocket Overviews live in `src/components/pocket/skins/<Skin>Overview.jsx` (same props as existing layouts; reuse all selectors); `PocketOverview.jsx` delegates when `skin !== 'classic'`, else keeps today's `dashboardStyle` behavior. **Do not add a separate `ui.pocketSkin`** — one global skin governs the whole app.

6. **Fonts** — add to `index.html` (preconnects exist): Space Grotesk + Manrope (Aurora & Meridian, load once), Plus Jakarta Sans, Newsreader + Hanken Grotesk, Archivo + Space Mono. Apply families **only under** `html[data-skin="…"]`. (Optional: lazy-inject per skin later; simple links first.)

7. **Switcher UI** — in `Header.jsx` settings panel, add an **"App style"** section above the theme swatches: `classic` + 5 skins (name + mini swatch). On select: `setSettings(s => ({...s, skin}))`. When `skin !== 'classic'`, the classic theme swatches are inert — hide them or show a hint ("Themes apply to Classic"). Mirror the existing swatch-button pattern.

8. **Category & tag identity colors stay fixed** — `SEED_CATEGORIES` colors and the habit `TAG_PALETTE` are identity, not theme; skins keep them (Bolt may add its ink outline around them).

---

## 5 · Per-screen treatment (each skin, from its references)

- **Dashboard** — hero (signature + streak 47-style figure + level/XP), habit list (all existing affordances: check, icon, name+notes indicator, frequency chip, tag dots, 7-day history dots, per-habit streak, XP, kebab), task list w/ priority chips, daily challenges, Goals summary, Day/Week/Month scores, rewards + claim, celebration banner, save-indicator, undo toast.
- **Goals page** — goal cards, milestone lists, progress (use the skin's progress device), linked items.
- **Analytics page** — charts recolored via skin vars; grid/cards re-surfaced; Bolt prefers chunky bars.
- **Pocket** — all 5 tabs per the Pocket references + each token spec's "Screens" section (calendar day-cells, stats cards, goal cards, settings rows, add-expense sheet, history).
- **Nav** — desktop rail/sidebar + mobile bottom bar + Pocket's internal nav; active states per skin (Meridian emerald indicator bar, Halo pressed tile, Bolt solid ink block…).
- **Modals & overlays** — AddEdit/Notes/Reward/Group/Goal modals, kebab dropdowns, shortcut panel, settings dropdown: re-surface with skin tokens (glass / raised / ink-outlined card…).
- **Auth page** — canvas + card + button in skin language (small, don't over-invest).

---

## 6 · Mobile & Android

- Responsive to ~360px, matching each reference's **mobile frame**; reuse the existing rem-scale (≤480px) and safe-area insets; don't clip the FAB/bottom bar on notched devices.
- Reuse/extend the existing mobile bottom bar (`Sidebar.jsx`) — premium skins restyle it and add the floating **+ FAB** where their reference shows one.
- `prefers-reduced-motion` already global — skins add no essential motion (load fade/rise fine).
- **Device checks per skin in the Android webview** (`npx cap sync android` → run):
  - **Aurora**: heavy `backdrop-filter: blur` + layered gradients — verify GPU perf on a mid/low device; if janky, reduce blur on small screens and add an `@supports not (backdrop-filter: blur(1px))` solid-translucent fallback. Note outcome in the PR.
  - **Halo**: dual-shadow rendering + **text contrast** on device (spec flags it; keep `#8a90a6` for non-essential labels only).
  - **Bolt/Terra/Meridian**: cheap to render; sanity-check fonts + hairlines at DPR 2–3.

---

## 7 · Build order (phased — each phase: build → verify in browser + Android → commit)

**Phase 1 · Foundation (no visible change).** `settings.skin` default + `data-skin` effect in `App.jsx` → `src/skins/` scaffold (empty files + `index.css` import chain) → font links → Header "App style" chooser (options render classic until built). ✅ Classic + all 5 themes + every page pixel-identical.

**Phase 2 · Meridian, whole app (reference skin — richest spec).** Layer-1 var map → `ArcGauge` → `SkinHero` (Meridian branch) → dashboard layer-2 (checks, dots, cards, nav, hairlines) → Goals/Analytics pass → Pocket (`MeridianOverview` + tab restyles; full multi-tab spec exists in `tokens/meridian.md`) → mobile + FAB. ✅ Matches `showcase-habit-meridian.html` + `showcase-meridian.html`.

**Phase 3 · Remaining skins** (pattern established; shared primitives first):
1. **Terra** — `BudgetRibbon` (shared w/ Bolt) + warm serif system.
2. **Bolt** — ribbon in brutalist mode; zero radius, ink borders, hard shadows.
3. **Aurora** — glass system + glow ring; then the blur-perf check/fallback.
4. **Halo** — neumorphic system; then the contrast pass.
Each: var map → SkinHero branch → dashboard layer-2 → Goals/Analytics → Pocket Overview + tabs → mobile → device check.

**Phase 4 · QA & polish.** All breakpoints; Android build per skin; a11y (contrast, `:focus-visible` visible in every skin, reduced motion, state never by color alone); skin-switch live with no reload artifacts; `npm run build` + lint clean; verify classic/theme regression one last time.

---

## 8 · Rules

- Token specs are authoritative; showcases are the target renders. Wire to **real state** — no hardcoded figures.
- Reuse existing selectors/utils (`scoreUtils`, `levelUtils`, `rewardUtils`, `pocketUtils`). Every Pocket figure via `money(iqd, ui)`.
- Scope everything under `html[data-skin="…"]`; **no `!important`**; watch specificity vs `App.css`.
- Don't touch: classic look, the 5 themes, data model, XP/streak/money logic, sync keys (the only settings change is the added `skin` field).
- Keep all existing functionality reachable in every skin (kebab menus, notes, tags, freeze, undo, export/import, focus mode, keyboard shortcuts `n t r ← → ?`).
- A11y: visible focus per skin, accessible contrast (esp. Halo/Aurora), reduced motion, arrows/labels carry meaning alongside color.

## 9 · Acceptance criteria

- "App style" in Header settings switches the **entire app** live (dashboard, goals, analytics, Pocket, nav, modals); persists and syncs.
- `classic` + all 5 themes + habit dashboard **visually identical** to before (regression-check).
- Each skin matches its two showcases (habit + pocket) on desktop web and ~360px mobile, all screens, real data, both currencies in Pocket.
- Android build renders every skin correctly; Aurora perf OK or fallback engaged.
- No console errors; `npm run build` + lint pass.

## 10 · File map

**Modify:** `src/App.jsx` (skin state + `data-skin` + skins/index.css import) · `src/components/Header.jsx` (App-style chooser) · `src/components/pocket/PocketOverview.jsx` (delegate) · `src/components/pocket/charts.jsx` (`ArcGauge`, `BudgetRibbon`) · `index.html` (fonts).
**Create:** `src/skins/{index,aurora,halo,meridian,terra,bolt}.css` · `src/skins/components/SkinHero.jsx` (+ per-skin bits as needed) · `src/components/pocket/skins/{Aurora,Halo,Meridian,Terra,Bolt}Overview.jsx`.
**Read-only:** `docs/redesign/tokens/*.md` · `public/showcase-habit-*.html` · `public/showcase-*.html`.

## 11 · Notes

- `public/showcase-*.html` are review artifacts — keep while building (live references), exclude/remove before release if you don't want them in `dist/`.
- Raw source mockups (`*.dc.html` + `support.js`) live in the 5 zips under `~/Downloads/habit new designs/` for pixel-level reference; Aurora & Halo mobile references were synthesized from tokens (their originals were web-only) — treat as strong guides.
- An earlier premium track for the habit dashboard only (Obsidian & Emerald, `public/showcase-obsidian.html` / `showcase-emerald.html`) is **superseded by this whole-app system**; if ever wanted, they'd be two more `data-skin` entries.
