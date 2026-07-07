# Deep Review + Security Audit — Local Council (9 agents)

Date: 2026-07-08. No external providers configured → local council (parallel Claude subagents, adversarial verification). Every reported finding was re-verified by reading the actual code before fixing.

## Phase A — Code review (4 agents)

### Correctness/bugs
- HIGH: `_deleteHabit`/`_deleteTask` never refund earned XP → permanent phantom XP inflating level/badges. **FIXED.**
- MED: `setProfile` called inside `setTasks`/`setGoals` updater → StrictMode double-invoke → 2× XP in dev, persisted. **FIXED** (moved out of updater).
- MED: every-other-day uses ms math + `Math.floor` → DST flips odd/even parity for half the year. **FIXED** (`Math.round`).
- MED: XP delta uses current `.xp` not check-time xp (edit xp between toggles drifts). Documented.
- MED: challenge regeneration mid-day remaps positional completed ids. Documented.
- MED/LOW: completedDays only increments (uncheck after complete keeps count). Documented.
- LOW: comboBonus shown but not banked to allTimeXP. Documented.
- LOW: streak cursor starts yesterday (celebrations fire a day late). Documented.
- Clean: no in-place React state mutation; dateUtils DST-safe; getPeriodKey/getLevel correct.

### React/state integrity
- HIGH: `usePersistedStorage.js:45` restore effect `JSON.parse(localItem)` throws past the `.catch` on corrupt entry. **FIXED** (use already-parsed storedValue).
- HIGH: realtime echo can revert a newer local edit (no updated_at guard). Documented (sync rearchitecture).
- MED: data-loss window during initial fetch (`S.ready` false → edits not queued). Documented.
- Clean: tagColors memo is pure (no setState-in-render loop); celebration `prevScores=null` first-run guard correct; window.__htSync HMR-safe; useAuth cleanup correct.

### Sync/data model
- HIGH: `handleImport` guards only the container, not elements → malformed backup white-screens app + syncs corruption. **FIXED** (element validation + ErrorBoundary).
- HIGH: `ht_profile.allTimeXP` / `ht_logs` are blind scalar/object overwrites → multi-device XP/day loss. Documented (LWW limitation).
- MED: AI_COPILOT `updated_at` claim doesn't match reality (arrival-order LWW). **FIXED** (doc).
- MED: export omitted `completedChallenges` → not lossless. **FIXED.**
- MED: AI_COPILOT used UTC `now()` for dates → wrong-day items for users behind UTC. **FIXED** (local-date literal).
- LOW/MED: profile imported as `{}` → NaN XP on first toggle. **FIXED** (coerce to finite number).
- Migration 001 adequate; unique(user_id,key) covers pull + realtime.

### UI/CSS/a11y
- HIGH: freeze feature hardcodes `#06b6d4` instead of `var(--cyan)` → wrong color in 4 of 5 themes. **FIXED.**
- HIGH: hardcoded goal/milestone colors fail WCAG AA on arctic (light) theme. Documented (a11y batch).
- HIGH: modals lack focus trap + restoration; dropdowns not Escape/keyboard operable. Documented (a11y batch).
- MED: touch targets < 40px (kebab 32, checkbox 28, milestone 18…). Documented.
- MED: kebab-dropdown z-index 60 < bottom-nav 90 → covered by nav. **FIXED** (95).
- Dead CSS <2% (only stray `@keyframes bounceIn`). Mobile @412px coverage good.

## Phase B — Improvement proposals → docs/IMPROVEMENTS.md

Ranked shortlist: Streak Rescue (S), Momentum decaying-form score (M), Onboarding + templates (M), Level-Up Takeover (M), Local Insights Engine (M), Evening Debrief (M), Live Activity Log (M), Weekly Missions (M/L). Skipped as already-done/YAGNI: SVG charts, combo multipliers, prestige, log compaction.

## Phase C — Security (4 agents)

- Client XSS/injection: **no confirmed vectors.** react-markdown safe (no rehype-raw, urlTransform neutralizes javascript:), prototype pollution not reachable, SVG-via-img safe, PKCE deep-link load-bearing (injected code fails exchange without local verifier).
- LOW: IconDisplay `startsWith('/')` matches `//host` protocol-relative image beacon via crafted import. **FIXED.**
- MED: AndroidManifest `allowBackup="true"` → adb-backup session extraction. **FIXED** (false).
- LOW-MED: debug-signed debuggable public APK. Documented; release-signing opt-in.
- Clean: no cleartext traffic, SW caches no user data, only INTERNET permission, RLS policies correct (UPDATE USING doubles as WITH CHECK — not exploitable), no secrets in git history.
- Web: no security response headers → **FIXED** (public/vercel.json CSP + HSTS + frame-deny + nosniff + referrer + permissions-policy).
- Advisor: leaked-password protection disabled — user must enable in Supabase dashboard (not toggleable via MCP).

## Synthesis

The app is fundamentally sound — no exploitable XSS/injection/auth bypass. The real risks were data-integrity bugs (XP drift, crash-on-corrupt-import) and missing web hardening, all now fixed. The multi-device sync loss and a11y gaps are documented for dedicated future passes (they need careful multi-device testing / a focused a11y sprint, not a rushed fix).
