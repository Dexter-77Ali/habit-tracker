# ⚡ Life Tracker

A gamified habit & task tracker with a hacker-terminal aesthetic. Build streaks, earn XP, level up from **Noob** to **Root**, and unlock tiered badges — while your data syncs in realtime across web and Android.

**🌐 Live app:** https://life-tracker-dexter-a77.vercel.app

![stack](https://img.shields.io/badge/React_18-Vite_5-00ff41?style=flat-square) ![backend](https://img.shields.io/badge/Supabase-auth_%2B_realtime_sync-3ecf8e?style=flat-square) ![mobile](https://img.shields.io/badge/Android-Capacitor_8-a4c639?style=flat-square)

## Features

- **Habits** with flexible scheduling (daily, weekdays, 3×/week, custom days) and per-habit streaks
- **Tasks** with due dates, priorities, and auto-archive
- **Goals** with milestones, linked habits/tasks, and progress tracking
- **Gamification**: 18 hacker levels (Noob → Root), 28 tiered badges (Bronze → Diamond), daily challenges, streak freezes, XP rewards
- **5 themes** (Matrix, Cyberpunk, Midnight, Crimson, Arctic) **+ 5 premium whole-app skins**: Meridian (ink/emerald), Terra (warm editorial), Bolt (neo-brutalist), Aurora (aurora-glass), Halo (soft neumorphism) — switch in Settings → App style
- **Sync**: email/password + Google sign-in, realtime cross-device sync via Supabase — fully offline-capable without it
- **Mobile**: swipe-to-complete, haptic feedback, daily reminder notifications, bottom navigation, installable PWA + native APK
- 191 hacker-themed icons + custom icon upload, markdown notes, tags, analytics heatmaps
- **💰 Pocket Tracker**: personal income & expense tracker — monthly budget with recurring payday, category breakdowns, spend calendar, stats/trends, saving goals, dual currency (IQD + USD), and per-tab layout choices. Purely financial, no XP

## 📱 Mobile App (Android)

Download the APK from [**Releases**](https://github.com/Dexter-77Ali/habit-tracker/releases) and sideload it (tap the file → allow "Install unknown apps" → *Install anyway* past Play Protect — normal for self-built apps).

| Version | Date | Highlights |
|---------|------|------------|
| v0.4.0 | 2026-07-10 | 🎨 5 premium whole-app skins — Meridian, Terra, Bolt, Aurora, Halo — restyling every screen; switch in Settings → App style (Classic + 5 themes still intact) |
| v0.3.1 | 2026-07-09 | Mobile nav fix: dedicated Pocket button in the bottom bar, Pocket's tab bar now cleanly replaces the app nav (no more overlapping bars), Exit tab |
| v0.3.0 | 2026-07-08 | 💰 Pocket Tracker: full income/expense tracker — budget ring/ledger/cards dashboards, spend calendar, stats, saving goals, dual IQD/USD currency, payday auto-reset |
| v0.2.2 | 2026-07-08 | Security hardening (CSP headers, backup lock-down, beacon block, crash recovery) + XP-integrity fixes from a deep code review |
| v0.2.1 | 2026-07-08 | Phone-fit UI scaling (Pixel-sized screens), fixed level-up banner showing on every reload |
| v0.2.0 | 2026-07-05 | Google sign-in, daily reminder notifications, tiered badges, completion effects, new terminal icon, FAB habit/task chooser, collapsible badges |
| v0.1.0 | 2026-07-04 | First Capacitor build: full app + Supabase sync in a native shell |

## 🤖 AI Copilot

Life Tracker is operated conversationally through Claude (via the official [Supabase connector](https://supabase.com/blog/supabase-is-now-an-official-claude-connector)): tell Claude *"I have 3 tasks today: X, Y, Z"* and they appear in the app in seconds via realtime sync — plus habit coaching based on your actual streak/completion data. Recipes live in [docs/AI_COPILOT.md](docs/AI_COPILOT.md).

## Development

```bash
npm install && npm run dev        # http://localhost:5173
npm run deploy                    # build + deploy to Vercel
```

Android build (needs JDK 21 + Android SDK):

```powershell
$env:CAPACITOR="1"; npm run build; npx cap sync android
cd android; .\gradlew.bat assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Supabase (optional — app runs local-only without it): copy `.env.example` → `.env.local` with your project URL + anon key, apply `supabase/migrations/`.

## Architecture

React 18 + Vite 5, zero UI libraries. All state in App.jsx, dual persistence (localStorage + IndexedDB) with optional Supabase realtime sync layered on top. Full codebase map in [AGENTS.md](AGENTS.md).
