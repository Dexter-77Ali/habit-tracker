# Life Tracker — Improvement Proposals

Ranked shortlist from a multi-lens design review (UI, UX, systems). Nothing here is built yet — this is the menu for future batches. Effort: S = hours, M = a day, L = multi-day.

## Top picks (highest impact per effort)

### 1. Streak Rescue — S — **build first**
Catch a just-broken streak on load and offer a retro-freeze repair instead of a silent reset to 0. Losing a long streak silently is the #1 quit moment; the freeze machinery already exists (`ht_streak_freezes`, `freezeDay`). Trigger: streak fell to 0 with a completable day missed in the last ~48h → dashboard card "Your 34-day streak is at risk → spend a freeze / pay small XP". New component `StreakRescue.jsx`, reuses existing handlers. Cheapest high-retention win.

### 2. Momentum (decaying "form" score) — M
`allTimeXP` only ever climbs, so a lapsed Level-10 user has no reason to return today. Add a second, *decaying* signal: `momentum = Σ dailyEarned(d) × 0.85^daysAgo` over 21 days, normalized 0–100, tiers Cold/Warm/Hot/Blazing. Pure function (no persistence), computed each render like `getLevel`/`calculateStreak`. Turns an accumulation game into a stay-in-form game — gives *everyone* the "stakes can drop" feeling. Touches `scoreUtils.js`, `LevelBar.jsx`.

### 3. First-Run Onboarding + Template Packs — M
New users land on `DEFAULT_HABITS` with zero explanation → fast bounce. A 3-step first launch: pick 1–3 packs ("Morning Routine", "Deep Work", "Fitness", "Wind Down") → one card teaching check→XP→level→streak with a live demo → optional reminder time. Gated on a new `ht_onboarded` flag, seeds via existing `addHabit`/`addGroup`. Highest new-user activation lever. New `OnboardingModal.jsx` + `utils/templates.js`.

### 4. Level-Up Takeover — M
Level-ups (rare — 100 to 1.5M XP gaps) currently share the same 5s toast as "week complete." Give them a dedicated full-screen "ACCESS GRANTED" sequence: dim, theme-color matrix rain, rank name resolving char-by-char in Orbitron, XP counter rolling, tap/reduced-motion to skip. `App.jsx` already tracks level in `prevScores` — emit a `levelUp` flag from `getTriggerCelebration`. The ~10 level-ups of a lifetime are the highest-value moment and currently the most under-sold. New `LevelUpTakeover.jsx`.

## Strong second tier

### 5. Local Insights Engine — M
The app logs everything and only draws heatmaps. Pure functions over `ht_logs`: weakest weekday ("38% fewer done on Fridays"), keystone habit (`P(perfect day | habit done)` vs base rate), at-risk habit (30-day completion <50% and declining). 2–3 ranked cards in `AnalyticsPage.jsx`. No AI, no backend. "Meditation is your keystone — perfect days 3× more often when you do it" out-sticks any badge.

### 6. Evening Debrief — M
A one-tap "wrap up day" ritual: scorecard → batch-check missed habits → one-line reflection journal (`ht_journal`) → pre-seed tomorrow's tasks → offer a freeze if incomplete → closing celebration. Rituals are the strongest daily-retention mechanic. Triggers from a Header button or after `reminderTime`. New `DebriefModal.jsx`.

### 7. Live Activity Log ("tail -f") — M
Replace dead dashboard space with an auto-scrolling monospace feed of your own momentum: `[09:42] +10 XP meditate OK`, `challenge 2/3`, `streak → 15`. Fully derivable from existing data (`completedAt`, `claimedDates`, `ht_challenges`). Makes background state visible — the core HUD fantasy, cheap. New `ActivityLog.jsx` in `ScoresPanel`.

### 8. Weekly Missions — M/L
The mid-horizon is empty (challenges reset nightly, levels take months). One Mon–Sun mission seeded by ISO-week, 3 escalating stages ("perfect 3 days → 5 → full week") + badge. Derived from logs via `isDayComplete`. New `missionUtils.js` + `Missions.jsx`, key `ht_missions`.

## Bigger bets (do after the above prove out)

- **Focus Mode → "Single Target Lock"** (M/L): rework the weak "hide completed" toggle into a full-screen zen terminal showing ONE next target at a time. Screenshot-worthy on the APK.
- **Boot Sequence** (M): turn the known IndexedDB-restore flash into a branded terminal boot animation (`> ht_habits... OK`) instead of a bug. Respect `prefers-reduced-motion`, run once.
- **Week Planner view** (L): Mon–Sun agenda of scheduled habits + due tasks, tap-to-reassign day. Real but the largest build.

## Explicitly skipped (YAGNI / already done)
- SVG charts — `AnalyticsPage` already ships a theme-aware `TrendChart` and `DayProgress` a ring; only flat heatmaps remain (polish, not a big).
- Combo multipliers — already half-built (`scoreUtils.js` has a 25% group-combo bonus).
- Prestige at max level — 1.5M XP ceiling, ~0 users reach it; Momentum (#2) delivers that feeling to everyone now.
- Log compaction — `ht_logs` is ~KB/year, fine for decades.
- Time-of-day scheduling — completions store a date key, no timestamps exist to mine; needs new capture first.
