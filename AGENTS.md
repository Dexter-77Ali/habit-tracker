# Life Tracker -- Codebase Map for AI Agents

## Stack

- React 18 + JavaScript (Vite 5, no TypeScript)
- `react-markdown` + `remark-gfm` for markdown rendering in notes
- Zero external UI libraries -- pure CSS, inline SVG icons
- Dual persistence: `localStorage` (fast sync) + `IndexedDB` via `idb-keyval` (durable backup)
- `@supabase/supabase-js` for backend auth + real-time sync (optional — app works offline without env vars)
- `uuid` for ID generation
- `idb-keyval` for IndexedDB wrapper
- `vite-plugin-pwa` for PWA / service worker support

## How to run

```bash
npm install && npm run dev   # http://localhost:5173
```

## How to deploy (Vercel static hosting)

```bash
npm run deploy   # build + link + deploy in one step
```

Live at https://life-tracker-dexter-a77.vercel.app (project `dexter-a77/life-tracker`). The `deploy` script re-links `dist/` to the project every time because `vite build` wipes `dist/.vercel` — deploying without the link step creates a NEW Vercel project named "dist". `.env.local` VITE_ vars are baked in at build time; anon key is public by design, RLS protects data. Deployment Protection is disabled (public URL).

## How to build the Android APK (Capacitor 8)

Requires: Temurin JDK 21 (`C:\Program Files\Eclipse Adoptium\jdk-21*`), Android SDK at `%LOCALAPPDATA%\Android\Sdk` (android-36). Rebuild loop after any code change:

```powershell
$env:CAPACITOR="1"; npm run build          # CAPACITOR flag disables the service worker (stale-cache white screens in WebView)
npx cap sync android
$env:JAVA_HOME = (Get-ChildItem "C:\Program Files\Eclipse Adoptium\jdk-21*" | Select-Object -First 1).FullName
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH" # must shadow the Java 8 JRE on PATH
cd android; .\gradlew.bat assembleDebug    # APK: android\app\build\outputs\apk\debug\app-debug.apk
```

- `android/local.properties` must contain `sdk.dir=C:/Users/hussien/AppData/Local/Android/Sdk` (forward slashes)
- App ID: `com.hussien.lifetracker` (permanent, set in capacitor.config.json)
- Debug-signed APK sideloads fine on Android — no release keystore needed for personal use
- Launcher icons/splash generated via `npx @capacitor/assets generate --android` from `assets/logo.svg`

---

## File Tree (38 source files + PWA assets)

```
public/
└── icons/
    ├── icon-192.svg                 # PWA icon 192px (LT logo, purple)
    └── icon-512.svg                 # PWA icon 512px (LT logo, purple)

src/
├── main.jsx                         # ReactDOM entry
├── App.jsx                          # Root component, ALL state lives here
├── App.css                          # ALL component styles (single file)
├── index.css                        # CSS reset, variables, theme tokens, safe-area padding
│
├── lib/
│   └── supabase.js                  # Supabase client init (returns null if no env vars)
│
├── hooks/
│   ├── useLocalStorage.js           # Legacy hook (kept for reference)
│   ├── usePersistedStorage.js       # Dual localStorage+IndexedDB hook + syncPush on write
│   ├── useAuth.js                   # Supabase auth wrapper (signUp/signIn/signOut)
│   ├── useSync.js                   # Real-time sync engine (pull/push/realtime)
│   └── useUndoDelete.js             # Soft-delete with 5s undo window
│
├── utils/
│   ├── dateUtils.js                 # Date key helpers, week/month ranges
│   ├── scoreUtils.js                # XP calculation, streak (with freeze support), celebrations
│   ├── levelUtils.js                # Hacker level table + progress math
│   ├── rewardUtils.js               # Badge definitions, reward eligibility
│   └── challengeUtils.js            # Daily challenge generation (deterministic, seeded by date)
│
└── components/
    ├── Sidebar.jsx                  # Left nav sidebar (Dashboard / Analytics)
    ├── Header.jsx                   # Date, level badge, streak, theme/export/import, shortcuts, sign-out, password change
    ├── AuthPage.jsx                 # Login/signup page (terminal hacker aesthetic)
    ├── DailyChallenges.jsx          # 3 daily challenges card with auto-completion detection
    ├── LevelBar.jsx                 # Full-width XP progress bar below header
    ├── BadgeShelf.jsx               # Grid of locked/unlocked achievement badges
    ├── CelebrationBanner.jsx        # Animated overlay toast (auto-dismiss 5s)
    ├── DateNav.jsx                  # Date navigation bar (prev/next/today/freeze)
    ├── HabitList.jsx                # Habits card with group support, quick-add, focus mode
    ├── HabitItem.jsx                # Single habit row (checkbox, XP, tooltip, notes, tags, edit/delete)
    ├── TaskList.jsx                 # Tasks card with groups, quick-add, archive section
    ├── TaskItem.jsx                 # Single task row (due date, priority, XP, notes, tags)
    ├── GroupHeader.jsx              # Collapsible group header row
    ├── AddEditModal.jsx             # Shared modal for habits AND tasks (mode prop) + tags + custom frequency
    ├── AddEditGroupModal.jsx        # Modal for creating/editing groups
    ├── AddEditRewardModal.jsx       # Modal for creating/editing rewards
    ├── NotesModal.jsx               # Full modal: markdown editor + live preview
    ├── TagInput.jsx                 # Reusable tag chip input with autocomplete
    ├── AnalyticsPage.jsx            # Category heatmaps + balance indicator
    ├── GoalsPage.jsx                # Full goals page (active/completed sections)
    ├── GoalCard.jsx                 # Single goal card (expandable, milestones, linked items)
    ├── GoalsSummaryCard.jsx         # Goals summary card for Dashboard (top 3)
    ├── AddEditGoalModal.jsx         # Modal for creating/editing goals
    ├── MilestoneList.jsx            # Inline milestone checklist with add/toggle/delete
    ├── ScoresPanel.jsx              # Right column container (threads streakFreezes)
    ├── DayProgress.jsx              # Day progress bar + XP breakdown (supports viewed date)
    ├── WeeklyScore.jsx              # Mon-Fri grid + progress bar
    ├── MonthlyScore.jsx             # Mini calendar grid + progress bar (frozen day indicators)
    ├── RewardsCard.jsx              # Rewards list grouped by scope
    └── RewardItem.jsx               # Single reward row with claim button
```

---

## Persistence Keys (localStorage + IndexedDB)

| Key            | Type     | Shape |
|----------------|----------|-------|
| `ht_habits`    | array    | `[{ id, name, xp, icon, createdAt, groupId, notes, tags, frequency, frequencyDays? }]` |
| `ht_logs`      | object   | `{ "YYYY-MM-DD": { habitId: bool } }` |
| `ht_tasks`     | array    | `[{ id, name, xp, icon, completed, completedAt, createdAt, dueDate?, priority?, groupId, notes, tags }]` |
| `ht_rewards`   | array    | `[{ id, name, scope, xpThreshold, repeatable, type, icon, claimedDates }]` |
| `ht_profile`   | object   | `{ allTimeXP, completedDays, joinedAt, _countedDays }` |
| `ht_settings`  | object   | `{ includeWeekends, theme, focusMode, maxFreezesPerMonth }` |
| `ht_groups`    | array    | `[{ id, name, icon, type, collapsed }]` |
| `ht_tags_meta` | object   | `{ colors: { "tagName": "#hexColor" } }` |
| `ht_goals`     | array    | `[{ id, name, icon, notes, deadline?, createdAt, completed, completedAt?, milestones[{ id, name, xp, description, dueDate?, priority, completed, completedAt? }], linkedHabitIds[], linkedTaskIds[] }]` |
| `ht_streak_freezes` | object | `{ "YYYY-MM-DD": true }` -- days where streak is preserved without completing habits |
| `ht_challenges` | object | `{ "YYYY-MM-DD": [completedChallengeIds] }` -- daily challenge completion tracking |

To hard-reset all data: `localStorage.clear()` in browser console, then refresh. IndexedDB data will auto-restore on next load unless also cleared.

### Persistence Architecture (usePersistedStorage)

- On load: reads localStorage synchronously. If empty, falls back to IndexedDB async recovery.
- On write: writes localStorage synchronously, calls `syncPush(key, value)` for Supabase sync, then IndexedDB async (fire-and-forget).
- Listens for `ht-sync-update` custom events from the sync engine to update React state when remote changes arrive.
- Exports `useSaveIndicator()` hook that returns timestamp of last write (for save indicator UI).
- If localStorage is wiped (browser cache clear), IndexedDB restores data automatically on next visit.

---

## Navigation & Pages

The app uses state-based routing (`currentPage` in App.jsx) with three pages:

- **Dashboard** -- the main habits/tasks/scores view + goals summary card
- **Goals** -- full goals page with expandable cards, milestones, linked items
- **Analytics** -- category heatmaps and balance indicator

Navigation is via the `Sidebar` component (fixed left, 60px collapsed, expands on hover).

---

## Data Flow

```
App.jsx (single source of truth)
  │
  ├─ usePersistedStorage('ht_habits')  ──► habits[]
  ├─ usePersistedStorage('ht_logs')    ──► logs{}
  ├─ usePersistedStorage('ht_tasks')   ──► tasks[]
  ├─ usePersistedStorage('ht_rewards') ──► rewards[]
  ├─ usePersistedStorage('ht_profile') ──► profile{ allTimeXP, completedDays }
  ├─ usePersistedStorage('ht_settings')──► settings{ includeWeekends, theme, focusMode, maxFreezesPerMonth }
  ├─ usePersistedStorage('ht_groups')  ──► groups[]
  ├─ usePersistedStorage('ht_tags_meta')──► tagsMeta{ colors }
  ├─ usePersistedStorage('ht_goals')   ──► goals[]
  ├─ usePersistedStorage('ht_streak_freezes')──► streakFreezes{}
  │
  ├─ UI State (not persisted):
  │    currentPage    = "dashboard" | "goals" | "analytics"
  │    viewedDate    = "YYYY-MM-DD" (defaults to today, changed via DateNav)
  │    isViewingFuture / isViewingPast = derived booleans
  │    shortcutsOpen = boolean for keyboard shortcuts panel
  │    notesModal    = { open, item, mode }
  │    goalModal     = { open, goal }
  │
  ├─ Derived (computed every render, never stored):
  │    allTags       = unique sorted tag names from all habits+tasks
  │    tagColors     = merged tagsMeta.colors with auto-assigned for new tags
  │    viewedDailyXP = calculateDailyXP(logs, habits, viewedDate, tasks)
  │    todayDailyXP  = calculateDailyXP(logs, habits, today, tasks)
  │    weekAgg       = aggregateXP(logs, habits, weekDates, tasks)
  │    monthAgg      = aggregateXP(logs, habits, monthDates, tasks)
  │    streak        = calculateStreak(logs, habits, includeWeekends, streakFreezes)
  │    freezesThisMonth = count of freezes in current month
  │    level         = getLevel(profile.allTimeXP)
  │    earnedBadges  = getEarnedBadges(profile, streak)
  │    xpByScope     = { daily, weekly, monthly } earned totals
  │    visibleHabits = habits filtered by createdAt <= viewedDate
  │
  └─ Handlers (defined in App, passed down as props):
       toggleFocusMode()    ──► toggles settings.focusMode
       freezeDay(dateKey)   ──► adds dateKey to streakFreezes (respects monthly limit)
       unfreezeDay(dateKey) ──► removes dateKey from streakFreezes
       toggleHabit(id)      ──► flips logs[viewedDate][id], adjusts allTimeXP (blocked for future)
       quickAddHabit(name)  ──► creates habit with defaults (10 XP, random emoji, daily)
       addHabit(data)        ──► pushes to habits[] (includes groupId, notes, tags, frequency, frequencyDays)
       editHabit(id,data)    ──► patches habits[i]
       deleteHabit(id)       ──► removes from habits[] and all log entries
       toggleTask(id)        ──► flips task.completed, sets completedAt, adjusts allTimeXP
       quickAddTask(name)    ──► creates task with defaults (10 XP, random emoji, no priority)
       addTask(data)         ──► pushes to tasks[] (includes groupId, notes, tags)
       editTask(id,data)     ──► patches tasks[i]
       deleteTask(id)        ──► removes from tasks[]
       clearArchivedTasks()  ──► deletes tasks completed >7 days ago
       addGroup(data)        ──► pushes to groups[]
       editGroup(id,data)    ──► patches groups[i]
       deleteGroup(id)       ──► removes group, sets orphaned items groupId=null
       toggleGroupCollapse(id) ──► toggles group.collapsed
       addGoal(data)           ──► pushes to goals[]
       editGoal(id,data)       ──► patches goals[i]
       deleteGoal(id)          ──► removes from goals[]
       toggleMilestone(goalId, milestoneId) ──► flips milestone.completed, adjusts allTimeXP, auto-completes goal if all done
       addMilestone(goalId, data) ──► pushes milestone to goal.milestones[]
       deleteMilestone(goalId, milestoneId) ──► removes milestone, adjusts allTimeXP if was completed
       linkItemToGoal(goalId, itemId, type) ──► adds ID to linkedHabitIds/linkedTaskIds
       unlinkItemFromGoal(goalId, itemId, type) ──► removes ID from linkedHabitIds/linkedTaskIds
       addReward(data)       ──► pushes to rewards[]
       editReward(id,data)   ──► patches rewards[i]
       deleteReward(id)      ──► removes from rewards[]
       claimReward(id)       ──► adds periodKey to reward.claimedDates, fires celebration
       openNotes(item, mode) ──► opens NotesModal for item
       saveNotes(notes)      ──► patches item.notes via editHabit/editTask
       navigateDate(key)     ──► sets viewedDate + switches to dashboard
       navigatePrev/Next/Today ──► date navigation helpers
```

---

## Component Prop Contracts

### Sidebar
```
currentPage: string, onNavigate: fn(page), onAddHabit: fn, onAddTask: fn, onOpenSettings: fn
```
- Desktop (>768px): fixed left sidebar with Dashboard/Goals/Analytics
- Mobile (≤768px): fixed bottom nav — Home, Goals, center FAB (+), Stats, More
- FAB opens a 2-item chooser menu (New Habit / New Task); More opens the Header settings dropdown (state lifted to App)

### Header
```
streak: number, dayComplete: bool, allTimeXP: number,
onExport: fn, onImport: fn(event), theme: string, onSetTheme: fn(themeId),
shortcutsOpen: bool, onToggleShortcuts: fn,
user: object|null, onSignOut: fn|null
```
- When `user` is set: shows email, "Change password" button, and "Sign out" in settings dropdown
- `PasswordChange` sub-component uses `supabase.auth.updateUser({ password })` directly

### LevelBar
```
allTimeXP: number
```

### BadgeShelf
```
profile: { allTimeXP, completedDays }, streak: number, stats: object
```
- Renders as a collapsed dropdown by default: header row with "🏅 Badges 3/18" count + chevron, tap to expand the grid

### Header (settings state)
- `settingsOpen` / `onSetSettingsOpen` are lifted to App.jsx so the mobile bottom-nav "More" button can open the same settings dropdown

### DateNav
```
viewedDate: string, today: string, onPrev: fn, onNext: fn, onToday: fn, isViewingFuture: bool,
isFrozen: bool, onFreezeDay: fn, onUnfreezeDay: fn, freezesRemaining: number
```

### HabitList
```
habits: array, todayLog: object, onToggle: fn(id), onEdit: fn(habit),
onDelete: fn(id), onAdd: fn, onQuickAdd: fn(name), onOpenNotes: fn(habit),
groups: array, onAddGroup: fn, onEditGroup: fn(group), onDeleteGroup: fn(id),
onToggleGroupCollapse: fn(id),
logs: object, today: string, viewedDate: string, isViewingFuture: bool, tagColors: object,
focusMode: bool, onToggleFocusMode: fn
```

### HabitItem
```
habit: object, checked: bool, onToggle: fn, onEdit: fn, onDelete: fn, onOpenNotes: fn,
disabled: bool, logs: object, today: string, tagColors: object
```

### TaskList
```
tasks: array, onToggle: fn(id), onEdit: fn(task), onDelete: fn(id), onAdd: fn,
onQuickAdd: fn(name), onOpenNotes: fn(task),
groups: array, onAddGroup: fn, onEditGroup: fn(group), onDeleteGroup: fn(id),
onToggleGroupCollapse: fn(id), onClearArchived: fn,
viewedDate: string, today: string, isViewingFuture: bool, tagColors: object
```

### TaskItem
```
task: object, onToggle: fn, onEdit: fn, onDelete: fn, onOpenNotes: fn, disabled: bool, tagColors: object
```

### GroupHeader
```
group: object, itemCount: number, onToggleCollapse: fn(id), onEdit: fn(group), onDelete: fn(id)
```

### AddEditModal
```
item: object|null, mode: "habit"|"task", onSave: fn(data), onClose: fn,
groups: array, allTags: string[], tagColors: object
```
- When mode="task": form includes dueDate, priority, and group fields
- When mode="habit": form includes frequency buttons (daily, weekdays, 3x/week, every other day, custom)
- When frequency="custom": shows 7 circular day-toggle buttons (Sun-Sat), `frequencyDays` defaults to `[1,3,5]`
- When item is null: creates new; when item exists: edits
- Groups dropdown shows groups filtered by mode type
- Tags input allows adding/removing tags with autocomplete

### NotesModal
```
item: object (habit or task), onSave: fn(notes), onClose: fn
```
- Full-screen modal with split view: markdown editor (left) + live preview (right)
- Rich toolbar: Bold, Italic, Heading, Link, List, Code
- Links in preview open in new tab

### TagInput
```
tags: string[], allTags: string[], onChange: fn(newTags), tagColors: object
```
- Chips for current tags (click × to remove)
- Text input with autocomplete dropdown
- Enter or comma to add typed tag

### AnalyticsPage
```
habits: array, tasks: array, logs: object, tagColors: object, allTags: string[], includeWeekends: bool
```
- Tag overview cards (per-tag XP and counts)
- Balance indicator (stacked horizontal bar)
- Category heatmaps (per-tag, 30 cells per row, color intensity = daily progress)

### AddEditGroupModal
```
group: object|null, type: "habit"|"task", onSave: fn(data), onClose: fn
```

### AddEditRewardModal
```
reward: object|null, onSave: fn(data), onClose: fn
```

### GoalsPage
```
goals: array, habits: array, tasks: array, logs: object, today: string,
onAdd: fn, onEdit: fn(goal), onDelete: fn(id),
onToggleMilestone: fn(goalId, milestoneId), onAddMilestone: fn(goalId, data),
onEditMilestone: fn(goalId, milestoneId, data), onDeleteMilestone: fn(goalId, milestoneId),
onUnlinkItem: fn(goalId, itemId, type), onOpenNotes: fn(goal)
```

### GoalCard
```
goal: object, habits: array, tasks: array, logs: object, today: string,
expanded: bool, onToggleExpand: fn,
onEdit: fn(goal), onDelete: fn(id), onOpenNotes: fn(goal),
onToggleMilestone: fn(goalId, milestoneId), onAddMilestone: fn(goalId, data),
onEditMilestone: fn(goalId, milestoneId, data), onDeleteMilestone: fn(goalId, milestoneId),
onUnlinkItem: fn(goalId, itemId, type)
```

### GoalsSummaryCard
```
goals: array, onViewAll: fn, onAdd: fn
```

### AddEditGoalModal
```
goal: object|null, habits: array, tasks: array, onSave: fn(data), onClose: fn
```

### MilestoneList
```
milestones: array, onToggle: fn(id), onAdd: fn(data), onEdit: fn(id, data), onDelete: fn(id)
```
- Milestones are task-like items with name, xp, description, dueDate, priority
- Add form expands with all fields; clicking a milestone opens inline edit

### ScoresPanel
```
todayEarned, todayMax, dayComplete, todayHabitEarned, todayTaskEarned,
weekDates, weekEarned, weekMax, weekComplete,
monthEarned, monthMax, monthComplete,
logs, habits, tasks,
includeWeekends, onToggleWeekends,
rewards, xpByScope, onClaimReward, onEditReward, onDeleteReward, onAddReward,
onNavigateDate: fn(dateKey), viewedDate: string, streakFreezes: object
```

### DayProgress
```
earned, max, dayComplete, habitEarned, taskEarned, viewedDate: string
```

### WeeklyScore
```
weekDates, weekEarned, weekMax, weekComplete,
logs, habits, tasks, includeWeekends, onToggleWeekends
```

### MonthlyScore
```
monthDates, monthEarned, monthMax, monthComplete,
logs, habits, tasks, onNavigateDate: fn(dateKey), streakFreezes: object
```

### RewardsCard
```
rewards, xpByScope, includeWeekends, onClaim, onEdit, onDelete, onAdd
```

### RewardItem
```
reward, xpByScope, includeWeekends, onClaim, onEdit, onDelete
```

---

## Tag System

- Tags are plain strings stored as `tags: []` on each habit/task
- Auto-color assignment from a 12-color palette (stored in `ht_tags_meta.colors`)
- `allTags` derived in App.jsx from all habits+tasks
- TagInput component provides autocomplete from existing tags
- Tag dots displayed on HabitItem/TaskItem rows
- Analytics page shows per-tag heatmaps and balance indicator

---

## Notes System (Markdown)

- Each habit/task/goal has a `notes` field (string, markdown content)
- Clicking item name or notes icon opens NotesModal
- NotesModal has a toolbar (Bold, Italic, Heading, Link, List, Code) that inserts markdown syntax
- Live preview rendered with `react-markdown` + `remark-gfm`
- Links open in new tab (`target="_blank"`)
- Notes indicator (📝) shown on items with non-empty notes

---

## Goals System

- Goals stored in `ht_goals` with milestones (sub-tasks), linked habits/tasks, optional deadline
- Milestones are task-like items within a goal: each has name, XP, description, dueDate, priority
- Checking a milestone adds its XP to allTimeXP; unchecking subtracts
- Progress = milestones completed / total milestones (percentage bar)
- When all milestones are checked, goal auto-completes and fires celebration
- Adding new milestones to a completed goal un-completes it
- Goals can link to existing habits and tasks (many-to-many via ID arrays)
- Dashboard shows top 3 active goals via GoalsSummaryCard
- Goals page shows all goals with expandable detail (milestones, linked items, notes, edit/delete)
- Milestone structure: `{ id, name, xp, description, dueDate, priority, completed, completedAt }`
- Milestones can be added/edited/deleted inline; clicking content opens inline edit form
- Priority options: low, medium, high (affects visual badge on milestone row)

---

## Scoring Logic (scoreUtils.js)

### isHabitScheduled(habit, dateKey)
Returns: `bool` -- whether a habit should be tracked on a given date.
- `daily`: always true
- `weekdays`: Mon-Fri only
- `3x-week`: Mon/Wed/Fri
- `every-other-day`: alternating from createdAt
- `custom`: checks `habit.frequencyDays[]` (array of day numbers 0=Sun..6=Sat) against `dateObj.getDay()`

### calculateDailyXP(logs, habits, dateKey, tasks)
Returns: `{ habitEarned, habitMax, taskEarned, earned, max, totalEarned, totalMax }`
- Habits: only count if `createdAt <= dateKey` AND `isHabitScheduled(habit, dateKey)`; earned if `logs[dateKey][id]` is true
- Tasks: only count if `completed && completedAt === dateKey`
- `max` includes taskEarned (tasks have no "max" concept)

### isDayComplete(logs, habits, dateKey)
- True when ALL scheduled habits for that day are checked (ignores tasks, respects frequency)

### aggregateXP(logs, habits, dateKeys, tasks)
Returns: `{ earned, max, habitEarned, habitMax, taskEarned }`

### calculateStreak(logs, habits, includeWeekends, streakFreezes)
- Walks backwards from yesterday
- Weekends skipped unless includeWeekends=true
- Frozen days (in streakFreezes) skipped -- they don't break or extend the streak
- Counts consecutive days where isDayComplete=true

### getTriggerCelebration(prev, next)
Compares prev/next state objects. Triggers on:
- Day complete, week complete, month complete
- Streak milestones: 7, 14, 30, 60, 100
- Level up (prev.level < next.level)
- New badge (prev.badgeCount < next.badgeCount)

---

## Level System (levelUtils.js)

| Lv | Title              | Min XP    |
|----|--------------------|-----------|
| 1  | Noob               | 0         |
| 2  | Script Kiddie      | 100       |
| 3  | Hacker             | 500       |
| 4  | Cracker            | 1,500     |
| 5  | Phreaker           | 4,000     |
| 6  | Cyber Punk         | 10,000    |
| 7  | Netrunner          | 25,000    |
| 8  | Ghost in the Shell | 60,000    |
| 9  | Zero Day           | 150,000   |
| 10 | Root               | 400,000   |

- `getLevel(xp)` returns the LEVELS entry for current level
- `getNextLevel(xp)` returns next entry or null at max
- `getLevelProgress(xp)` returns `{ current, next, progress%, xpInLevel, xpNeeded }`
- All-time XP increments on check, decrements on uncheck (honest tracking)

---

## Reward System (rewardUtils.js)

### Tiered Badge Families (auto-unlock, computed — never persisted)
7 families × 4 tiers (Bronze/Silver/Gold/Diamond) = 28 unlockable badges (`TOTAL_BADGES`):

| Family | Metric | Bronze / Silver / Gold / Diamond |
|--------|--------|-----------------------------------|
| Streak | current streak | 7 / 30 / 100 / 365 |
| XP Hoarder | allTimeXP | 1k / 10k / 100k / 1M |
| Perfect Days | completedDays | 1 / 30 / 100 / 365 |
| Task Slayer | tasksCompleted | 10 / 50 / 200 / 1000 |
| Collector | totalHabits | 3 / 8 / 15 / 25 |
| Challenger | challengesCompleted | 5 / 20 / 50 / 200 |
| Firewall | badgeCount (meta) | 3 / 8 / 14 / 20 |

- `getEarnedBadges(profile, streak, stats)` → flat list, one entry per earned tier (id `streak_gold`), keeps celebration badgeCount trigger working
- `getBadgeProgress(...)` → per-family `{ value, tierIndex, tier, next }` for the shelf UI
- `TIERS` exports tier colors (bronze #cd7f32, silver #c0c0c0, gold #ffd700, diamond #7df9ff)
- BadgeShelf renders families with tier pips + progress-to-next; tier color on border/label

### Custom Rewards
- Scope: daily / weekly / monthly
- Each reward has an XP threshold
- Repeatable: true = triggers every period; false = one-time only
- `claimedDates[]` tracks which periods were claimed
- Period keys: daily="YYYY-MM-DD", weekly=Monday's date, monthly="YYYY-MM"

### isRewardClaimable(reward, xpByScope, includeWeekends)
Returns `{ claimable: bool, reason: string, current?, needed? }`

---

## Theme System

- **5 themes**: Matrix (green hacker), Cyberpunk (pink/cyan neon), Midnight (purple), Crimson (red/orange), Arctic (light blue)
- CSS variables defined in `index.css` under `[data-theme="matrix"]` (default/`:root`), `[data-theme="cyberpunk"]`, `[data-theme="midnight"]`, `[data-theme="crimson"]`, `[data-theme="arctic"]`
- Applied via `document.documentElement.setAttribute('data-theme', settings.theme || 'matrix')` in App.jsx useEffect
- Setting persisted in `ht_settings.theme` (default: `'matrix'`)
- `cycleTheme()` cycles through all 5; `setTheme(t)` sets directly
- Theme picker in Header settings dropdown: 5 color-coded `.theme-pill` buttons
- Each theme defines: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--primary`, `--primary-light`, `--accent`, `--success`, `--gold`, `--orange`, `--danger`, `--cyan`, `--gradient-primary`, `--shadow-glow`, `--glow`, `--glow-border`
- **Aesthetic**: Gamer/hacker HUD — sharp 3px radius, glow borders on cards, JetBrains Mono body font, Orbitron display font (`--font-display`), scanline overlay on progress bars, no glassmorphism (zero `backdrop-filter`)

---

## CSS Architecture (App.css)

Single CSS file, organized by section headers:
1. APP LAYOUT -- `.app-layout` flex container, `.app-main` content area
2. SIDEBAR -- `.sidebar`, `.sidebar-btn`, `.sidebar-label`, `.sidebar-logo`
3. HEADER -- `.header`, `.app-title`, `.streak-badge`, `.level-badge-header`, `.theme-toggle`
4. LEVEL BAR -- `.level-bar`, `.level-badge`, `.level-fill`
5. BADGE SHELF -- `.badge-shelf`, `.badge-grid`, `.badge-item`, `.badge-item--unlocked/--locked`
6. DASHBOARD GRID -- `.dashboard` 2-column grid (1fr + 360px), collapses at 860px
7. CARDS -- `.card`, `.card--complete`, `.card-header`
8. HABIT LIST / TASK LIST -- `.habit-list`, `.task-list-card`, `.task-divider`, `.quick-add-bar`, `.quick-add-input`, `.focus-mode-btn`, `.focus-mode-summary`
9. HABIT ITEM / TASK ITEM -- `.habit-item`, `.habit-checkbox`, `.habit-xp`, `.task-priority`, `.task-due`
10. SCORES PANEL -- `.scores-panel`, `.progress-track`, `.progress-fill`
11. REWARDS CARD -- `.reward-item`, `.reward-claimed-badge`, `.reward-scope-group`
12. BUTTONS -- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`
13. MODAL -- `.modal-overlay`, `.modal`, `.form-input`, `.emoji-grid`, `.priority-row`, `.day-toggle-row`, `.day-toggle-btn`
14. CELEBRATION BANNER -- `.celebration-overlay`, `.celebration-banner`, `.confetti-piece`
15. DATE NAVIGATION -- `.date-nav`, `.date-nav-label`, `.date-nav-future`, `.date-nav-frozen`, `.freeze-btn`
16. GROUP HEADERS & COLLAPSE -- `.group-header`, `.group-chevron`, `.group-items`, `.group-count-badge`
17. HABIT TOOLTIP -- `.habit-tooltip`, `.tooltip-dot`, `.tooltip-dots`
18. MONTHLY CALENDAR VIEW -- `.month-calendar`, `.month-cal-cell`, `.month-cal-cell--frozen`, `.month-calendar-grid`
19. SHORTCUTS PANEL -- `.shortcuts-panel`, `.shortcut-row`, `.shortcut-key`
20. SAVE INDICATOR -- `.save-indicator`, `.save-dot`
21. DISABLED STATES -- `.habit-item--disabled`
22. NOTES MODAL -- `.notes-modal`, `.notes-editor`, `.notes-toolbar`, `.notes-preview`, `.notes-textarea`
23. TAG INPUT -- `.tag-input-container`, `.tag-chip`, `.tag-suggestions`, `.item-tags`, `.item-tag-dot`
24. ANALYTICS PAGE -- `.analytics-page`, `.analytics-cards`, `.balance-bar`, `.tag-heatmap-row`, `.tag-heatmap-cell`
25. GOALS PAGE -- `.goals-page`, `.goal-card`, `.goal-card-progress-bar`, `.milestone-list`, `.milestone-item`, `.goal-linked-section`, `.goals-summary-card`
26. KEYFRAMES -- fadeIn, slideUp, bounceIn, pulse, shake, floatConfetti, saveFadeIn, saveFadeOut, savePulse

---

## Keyboard Shortcuts

| Key     | Action                       |
|---------|------------------------------|
| `N`     | Open add habit modal         |
| `T`     | Open add task modal          |
| `R`     | Open add reward modal        |
| `←`     | Navigate to previous day     |
| `→`     | Navigate to next day         |
| `?`     | Toggle shortcuts panel       |
| `Esc`   | Close any open modal         |

Shortcuts are disabled when focus is in an input/textarea/select or when any modal is open.

---

## Date Navigation

- `viewedDate` state in App.jsx (string "YYYY-MM-DD", defaults to today)
- DateNav component renders between BadgeShelf and dashboard
- Viewing past: habits can be toggled (edits logs retroactively and adjusts XP)
- Viewing future: habits shown unchecked, toggling is disabled (read-only)
- Streak, week/month scores, and rewards always use real "today"
- MonthlyScore calendar cells are clickable to navigate to that date

---

## Grouping System

- Groups stored in `ht_groups` with `type: "habit"|"task"`
- Habits/tasks have nullable `groupId` field
- HabitList/TaskList render ungrouped items first under "General" label, then each group alphabetically
- Groups are collapsible (persisted `collapsed` field)
- Deleting a group sets orphaned items' `groupId` to null (items preserved)
- AddEditModal includes group dropdown when groups exist for that mode

---

## Task Auto-Archive

- Tasks completed more than 7 days ago are moved to a collapsed "Archived" section
- Archive section has a "Clear" button that permanently deletes all archived tasks
- Only visible when viewing today (not in date-navigation historical view)

---

## Common Patterns

- **Delete confirmation**: HabitItem, TaskItem, and GroupHeader use a 2-click pattern (click once shows warning icon, click again deletes, auto-resets after 3s)
- **Modal reuse**: AddEditModal handles both habits and tasks via `mode` prop
- **SVG icons**: CheckIcon, EditIcon, TrashIcon, ConfirmIcon, ChevronIcon are inline function components defined in their respective component files
- **Celebration queue**: Only one celebration at a time. `getTriggerCelebration` returns the first match, not all.
- **Save indicator**: Fixed bottom-right badge flashes green on every write, auto-fades after 2s
- **Tag auto-color**: New tags get colors auto-assigned from a 12-color palette, stored in ht_tags_meta

---

## Habit Frequency System

Habits support 5 frequency modes (stored in `habit.frequency`):
- `daily` (default) -- every day
- `weekdays` -- Mon-Fri only
- `3x-week` -- Mon/Wed/Fri
- `every-other-day` -- alternating days from creation date
- `custom` -- user picks specific days via `habit.frequencyDays[]` (array of 0-6, where 0=Sun)

The shared `isHabitScheduled(habit, dateKey)` function (exported from scoreUtils.js) is used by:
- `calculateDailyXP` / `isDayComplete` for scoring
- `HabitItem.calculateHabitStreak` for per-habit streaks
- `AddEditModal` for frequency selection UI (5 buttons + 7 day toggles for custom)

HabitItem shows a frequency badge: `wkd` (weekdays), `3x` (3x-week), `alt` (every-other-day), or day abbreviations like `MWF` (custom).

---

## Quick-Add System

- Inline text inputs at top of HabitList and TaskList (only shown when viewing today)
- Type name + Enter creates item with defaults: 10 XP, random emoji from `QUICK_ADD_EMOJIS`, daily frequency (habits) or no priority (tasks)
- Input clears after submission
- `quickAddHabit(name)` and `quickAddTask(name)` callbacks defined in App.jsx, passed as `onQuickAdd` prop

---

## Focus Mode

- Toggle button ("Focus") in HabitList header, only visible when viewing today
- When active: hides completed habits, shows "X completed, hidden" summary line
- Empty groups are hidden in focus mode
- If all habits are done, shows "All done! Nothing left to do today." message
- Persisted in `settings.focusMode` (survives refresh)

---

## Streak Freeze System

- Users can "freeze" days to protect their streak when they can't complete habits
- Frozen days are skipped in `calculateStreak` (they neither break nor extend the streak)
- Monthly limit: `settings.maxFreezesPerMonth` (default 2)
- Freeze/unfreeze button in DateNav shows remaining count, disabled when limit reached
- Frozen days shown as ❄ snowflake in MonthlyScore calendar cells with cyan tint
- DateNav shows "Frozen day" indicator when viewing a frozen date
- Freezes stored in `ht_streak_freezes` object (`{ "YYYY-MM-DD": true }`)
- Included in export/import data

---

## PWA Support

- `vite-plugin-pwa` configured in vite.config.js with `registerType: 'autoUpdate'`
- Service worker auto-generated on build, caches all app-shell assets (JS, CSS, HTML, images)
- Web manifest: "Life Tracker" / "LifeTracker", standalone display, purple theme (#6c63ff)
- SVG icons at `public/icons/icon-192.svg` and `icon-512.svg`
- `index.html` includes: `theme-color`, `apple-mobile-web-app-capable`, `viewport-fit=cover`
- `index.css` applies `env(safe-area-inset-*)` padding for notched mobile devices
- Build output includes `sw.js`, `workbox-*.js`, and `manifest.webmanifest` in `dist/`

---

## Supabase Backend (Optional)

The app runs fully offline with localStorage + IndexedDB. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`, the following layers activate:

### Auth (`useAuth.js` + `AuthPage.jsx`)
- Email/password signup + login via `supabase.auth.signUp` / `supabase.auth.signInWithPassword`
- Google OAuth via `signInWithOAuth({ provider: 'google' })` — client created with `flowType: 'pkce'` (required for native)
  - **Web**: standard redirect to `window.location.origin`
  - **Native APK**: Google blocks OAuth in WebViews → `skipBrowserRedirect: true` + `@capacitor/browser` opens system browser → returns via deep link `com.hussien.lifetracker://auth-callback?code=...` → `appUrlOpen` listener in useAuth calls `exchangeCodeForSession(code)`. Intent filter registered in AndroidManifest.xml
  - Requires Google provider enabled in Supabase dashboard (Google Cloud OAuth client ID/secret) and both redirect URLs allowlisted in Supabase Auth → URL Configuration
- `onAuthStateChange` listener returns `user` object to App.jsx
- AuthPage: terminal-aesthetic login/signup form, forces email lowercase, mobile-friendly input attributes, Google button below email form
- Password change via `supabase.auth.updateUser({ password })` in Header settings dropdown
- If no Supabase env vars → auth skipped, app runs local-only

### Sync Engine (`useSync.js`)
- **Pull on login**: fetches all `user_data` rows, writes to localStorage, fires `ht-sync-update` events
- **First-device bootstrap**: if no remote data exists, pushes all local keys to Supabase
- **Push on change**: `syncPush(key, value)` called from `usePersistedStorage` after every localStorage write. Debounced 1s per key, deduped via JSON comparison
- **Realtime**: Supabase Realtime channel (`postgres_changes`) for cross-device sync within seconds
- **HMR-safe**: shared state on `window.__htSync` survives Vite HMR module reloads
- **Critical**: all `.upsert()` calls need `.then(() => {})` -- Supabase JS v2 query builders are lazy PromiseLike that don't send HTTP requests without `.then()` or `await`

### Database (`supabase/migrations/001_initial.sql`)
- Single `user_data` table: `(user_id UUID, key TEXT, value JSONB, updated_at TIMESTAMPTZ)`
- Composite unique on `(user_id, key)`, RLS enabled (users read/write own rows only)
- Realtime enabled

### Env Setup
- `.env.local` (gitignored): `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- `.env.example`: template with placeholder values
- `src/lib/supabase.js`: returns `null` if env vars missing → all sync/auth code no-ops

---

## Daily Reminder Notifications (APK only)

- `src/utils/notificationUtils.js`: `scheduleDailyReminder(time)` — cancels + reschedules a repeating daily notification via `@capacitor/local-notifications`. No-op on web (`canNotify()` = native check). Guards malformed time strings (`/^\d{1,2}:\d{2}$/`) since the value can arrive from imported JSON.
- Setting stored as `ht_settings.reminderTime` ("HH:MM" or null). App.jsx effect reschedules on change.
- UI: time input + off button in Header settings dropdown (`.settings-reminder`), only rendered on native.
- Android 13+ runtime permission requested by the plugin on first schedule.

## Completion Juice

- Checking a habit/task: `navigator.vibrate([15,30,25])` double-buzz (10ms on uncheck) + floating gold "+N XP" burst (`.xp-float`, 0.9s CSS animation) anchored to the checkbox (`position: relative` on `.habit-checkbox`).
- Existing `justChecked` pop animation extended to 900ms to cover the float.

## App Icon

- **Master file: `public/favicon.svg`** (hacker terminal: green `>_` prompt + cursor + flame on dark). Copied verbatim to `public/icons/icon-192.svg`, `public/icons/icon-512.svg` (PWA manifest), and `assets/logo.svg` (Android source).
- Android launcher icons/splash regenerate via `npx @capacitor/assets generate --android --iconBackgroundColor "#060a06"` (74 assets). Re-run after changing the master, then rebuild the APK.
- `index.html` favicon link points at `/favicon.svg`.

## Daily Challenges System

- `challengeUtils.js`: `generateDailyChallenges(habits, logs, profile, dateKey)` returns 3 challenges seeded deterministically by date
- Challenge types: "Complete N habits", "Earn N XP", "Complete all habits in group X"
- `DailyChallenges.jsx`: card rendered above habit list, auto-detects completion from current state
- Completion stored in `ht_challenges` persistence key: `{ "YYYY-MM-DD": [completedChallengeIds] }`
- +20 XP bonus per completed challenge

---

## AI Copilot (Claude via Supabase)

The AI copilot lives OUTSIDE the app: Claude (Cowork/Claude Code with the Supabase MCP, or claude.ai with the official Supabase connector) reads/writes `user_data` rows directly; the app's realtime sync makes changes appear on all devices in seconds. Zero app code, zero API cost (covered by the user's Claude Max plan).

- **Recipe book: [docs/AI_COPILOT.md](docs/AI_COPILOT.md)** — tested SQL for add task/habit, complete task/habit, coaching snapshot; exact jsonb shapes; safety rules (UPDATE only, always bump `updated_at`, never DELETE rows).
- User setup for phone: claude.ai → Settings → Connectors → Supabase (official) → create a claude.ai Project with AI_COPILOT.md as knowledge.
- The in-app chat variant (Edge Function proxy + API credits) was designed but not built — see plan history if ever wanted.

## Git / Release Workflow (standing rules)

1. **After every change**: security-check the new code, update this file, then `git add -A && git commit && git push` (repo: github.com/Dexter-77Ali/habit-tracker, public).
2. Before any push: scan the staged set for secrets (`git diff --cached | grep -iE 'sk-|apikey|secret'`) — `.env.local` is gitignored and must stay that way.
3. APK changes: rebuild, copy to `Desktop\LifeTracker.apk`, then `gh release create vX.Y.Z <apk> --title ... --notes ...` and add a row to README's version table.
4. `plans/`, `android/app/build/`, `android/.gradle/`, `android/local.properties`, `.vercel/`, `*.apk` are gitignored.

## Known Constraints / Things to Watch

1. `DEFAULT_HABITS` at top of App.jsx calls `uuidv4()` at module load time -- these IDs regenerate if localStorage is empty, which is fine for first load but means you can't hardcode IDs
2. `_countedDays` array in profile grows forever (one entry per perfect day) -- acceptable for localStorage but could be large after years
3. Task toggle inside `setTasks` callback also calls `setProfile` -- this is a side effect inside a state updater which works but is slightly unusual React pattern
4. `color-mix()` CSS function used in `.habit-item--checked` requires modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+)
5. Reward `&middot;` in RewardItem uses HTML entity in JSX -- renders correctly because React handles it
6. IndexedDB recovery is async -- on first render after cache clear, there may be a brief flash of default data before IndexedDB values are restored
7. When schema changes (new fields like `groupId`, `notes`, `tags`), users with existing data will have `undefined` for those fields which defaults to `null`/`""`/`[]` -- backwards compatible
8. After major schema changes, recommend running `localStorage.clear()` in browser console then refreshing to avoid stale data conflicts
9. `tagColors` memo in App.jsx may call `setTagsMeta` during render for new tags -- safe because it only fires when colors object actually changed
10. Supabase JS v2 `.from().upsert()` / `.insert()` / `.update()` return lazy `PromiseLike` objects -- they do NOT send HTTP requests unless `.then()` or `await` is used. Always append `.then(() => {})` for fire-and-forget writes
11. `window.__htSync` is mutable shared state that survives Vite HMR -- module-level `let` variables do NOT survive HMR because Vite creates fresh module instances on hot reload
12. Security validation (do not remove): icon upload in AddEditModal rejects non-image MIME types and files >1 MB; the import handler in App.jsx validates every array ELEMENT is an object with an `id` (not just `Array.isArray`) and coerces `profile.allTimeXP` to a finite number — a null/primitive element or NaN XP would otherwise crash render or corrupt XP. IconDisplay only treats single-leading-slash paths and `data:image/` URLs as images (blocks `//host` protocol-relative image beacons). ErrorBoundary (main.jsx) catches any render crash and offers a local-data reset. Web security headers (CSP/HSTS/X-Frame-Options/etc.) live in `public/vercel.json` (Vite copies it to dist on build). AndroidManifest: `allowBackup="false"` (blocks adb-backup session extraction) + `POST_NOTIFICATIONS`. The distributed APK is debug-signed (debuggable) — acceptable for personal single-user use; release-signing is an opt-in hardening (forces uninstall/reinstall due to key change).
13. The `dist/` folder contents depend on the last build flavor: `CAPACITOR=1 npm run build` produces the no-service-worker native build. Always rebuild WITHOUT the flag before a Vercel deploy (the `npm run deploy` script handles this)
14. Celebration detection (App.jsx `prevScores` ref) starts as `null` and the first effect run only RECORDS state without comparing — do not "fix" it back to initialized defaults, that makes the level-up banner fire on every reload
15. Phone scaling: at ≤480px `html { font-size: 13.5px }` (index.css) shrinks the whole rem-based UI ~16%; compact padding overrides live in App.css under the same breakpoint. `body { overflow-x: hidden }` guards stray wide elements
