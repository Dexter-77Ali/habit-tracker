# Habit Tracker Dashboard

An interactive habit and task tracking dashboard built with React + Vite. All data is stored in localStorage — no backend required.

## Features

- Daily habit checklist with toggleable checkboxes
- Animated progress bar for the current day
- Weekly score grid (Mon–Fri by default, weekends optional)
- Monthly heatmap and score
- Streak counter (weekends skipped by default)
- Celebration banners on day/week/month completion and streak milestones
- Add, edit, and delete habits with custom XP weights and emoji icons
- Fully responsive (mobile + desktop)

## Setup

```bash
# 1. Open a terminal in this folder
cd habit-tracker

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    Header.jsx           — date + streak badge
    HabitList.jsx        — today's checklist
    HabitItem.jsx        — single habit row
    AddEditModal.jsx     — create/edit form
    ScoresPanel.jsx      — right-hand panel
    DayProgress.jsx      — animated progress bar
    WeeklyScore.jsx      — week grid + toggle
    MonthlyScore.jsx     — month heatmap
    CelebrationBanner.jsx — animated celebration
  hooks/
    useLocalStorage.js   — persistent state hook
  utils/
    dateUtils.js         — date helpers
    scoreUtils.js        — XP + streak calculations
  App.jsx                — central state hub
  App.css                — all component styles
  index.css              — reset + CSS variables
```

## localStorage keys

| Key          | Contents                              |
|--------------|---------------------------------------|
| `ht_habits`  | Array of habit definitions            |
| `ht_logs`    | Daily completion map `{date: {id: bool}}` |
| `ht_settings`| `{ includeWeekends: bool }`           |
