# AI Copilot — Operating Life Tracker via Supabase

This file teaches an AI assistant (Claude with the Supabase connector, or any session with SQL access to the project) how to read and write Life Tracker data safely. All recipes below were tested live on 2026-07-07.

## How it works

All app data lives in **one table**: `user_data (user_id uuid, key text, value jsonb, updated_at timestamptz)` — one row per storage key. The app subscribes to Postgres realtime changes, so any `UPDATE` here appears in the app (web + Android) within seconds. No restart, no refresh.

- Project ref: `zpcusqgwutbhbhmnwqjt`
- Single user: `user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79'` (verify with `SELECT DISTINCT user_id FROM user_data` if unsure)

## Safety rules (always follow)

1. **Only UPDATE** `user_data` rows. Never `DELETE` rows, never `DROP`/`ALTER` anything, never touch `auth.*` tables.
2. **Always set `updated_at = now()`** in the same UPDATE — the sync engine uses it for conflict resolution.
3. Match the item shapes below **exactly** (the app assumes them). Generate ids with `gen_random_uuid()`. Dates are strings `YYYY-MM-DD`.
4. To remove an item from an array, write the filtered array back — don't null the row.
5. XP values: integers 1–1000 (default 10 for habits, 10–25 for tasks by effort).
6. Icons: an emoji string (e.g. `'🎯'`) or an app icon path (e.g. `'/icons/063-terminal.png'`).

## Data shapes (per key)

| key | type | item shape |
|---|---|---|
| `ht_tasks` | array | `{id, name, xp, icon, completed, completedAt, createdAt, dueDate, priority, groupId, notes, tags}` — priority: `none\|low\|medium\|high`; completedAt/dueDate: `YYYY-MM-DD` or null |
| `ht_habits` | array | `{id, name, xp, icon, tags, notes, groupId, createdAt, frequency}` — frequency: `daily\|weekdays\|3x-week\|every-other-day\|custom` (+`frequencyDays: [0-6]` when custom) |
| `ht_logs` | object | `{"YYYY-MM-DD": {"<habitId>": true/false}}` — habit completion per day |
| `ht_profile` | object | `{joinedAt, allTimeXP, completedDays, _countedDays[]}` |
| `ht_goals` | array | `{id, name, icon, notes, deadline?, createdAt, completed, milestones[], linkedHabitIds[], linkedTaskIds[]}` — milestone: `{id, name, xp, description, dueDate, priority, completed, completedAt}` |
| `ht_streak_freezes` | object | `{"YYYY-MM-DD": true}` |
| `ht_settings`, `ht_groups`, `ht_rewards`, `ht_tags_meta`, `ht_challenges` | — | read-only for the copilot unless the user explicitly asks |

## Recipe: add task(s)

```sql
UPDATE user_data
SET value = value || jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(), 'name', 'TASK NAME HERE', 'xp', 10, 'icon', '🔧',
        'completed', false, 'completedAt', null, 'createdAt', to_char(now(),'YYYY-MM-DD'),
        'dueDate', null, 'priority', 'none', 'groupId', null, 'notes', '', 'tags', '[]'::jsonb
      )
      -- , jsonb_build_object(...)   -- append more objects for multiple tasks in one call
    ),
    updated_at = now()
WHERE user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79' AND key = 'ht_tasks';
```

Set `dueDate` to `'YYYY-MM-DD'` and `priority` when the user gives them ("urgent" → `high`).

## Recipe: add habit(s)

```sql
UPDATE user_data
SET value = value || jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(), 'name', 'HABIT NAME', 'xp', 10, 'icon', '🎯',
        'tags', '[]'::jsonb, 'notes', '', 'groupId', null,
        'createdAt', to_char(now(),'YYYY-MM-DD'), 'frequency', 'daily'
      )),
    updated_at = now()
WHERE user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79' AND key = 'ht_habits';
```

For custom days add `'frequencyDays', '[1,3,5]'::jsonb` (0=Sun … 6=Sat) with `'frequency','custom'`.

## Recipe: complete a task (by name)

Two statements: mark the task done, then add its XP to the profile.

```sql
UPDATE user_data SET value = (
  SELECT jsonb_agg(CASE WHEN t->>'name' ILIKE '%SEARCH NAME%' AND (t->>'completed')::bool = false
    THEN t || jsonb_build_object('completed', true, 'completedAt', to_char(now(),'YYYY-MM-DD'))
    ELSE t END)
  FROM jsonb_array_elements(value) t
), updated_at = now()
WHERE user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79' AND key = 'ht_tasks';

UPDATE user_data SET value = value || jsonb_build_object('allTimeXP', (value->>'allTimeXP')::int + <task xp>),
    updated_at = now()
WHERE user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79' AND key = 'ht_profile';
```

## Recipe: complete a habit for today

Look up the habit id from `ht_habits` first, then:

```sql
UPDATE user_data SET value = jsonb_set(
      value,
      ARRAY[to_char(now(),'YYYY-MM-DD'), '<habit-uuid>'],
      'true'::jsonb, true),
    updated_at = now()
WHERE user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79' AND key = 'ht_logs';
-- then add the habit's xp to ht_profile.allTimeXP as in the task recipe
```

## Recipe: full coaching snapshot (read-only, one query)

```sql
SELECT jsonb_object_agg(key, value) AS snapshot
FROM user_data
WHERE user_id = '1a5338c9-8328-463a-afb8-06d2a06f7b79'
  AND key IN ('ht_habits','ht_logs','ht_profile','ht_tasks','ht_streak_freezes','ht_goals');
```

### How to coach from the snapshot
- **Streak**: walk `ht_logs` backwards from yesterday; a day counts when every habit scheduled that day (per its `frequency`, and `createdAt <= day`) is `true`. Days in `ht_streak_freezes` are skipped, not broken.
- **Per-habit completion %**: for the last 30 days, `days completed / days scheduled`.
- **Level**: from `allTimeXP` — 0 Noob, 100 Script Kiddie, 500 Hacker, 1.5k Cracker, 4k Phreaker, 10k Cyber Punk, 25k Netrunner, 45k White Hat, 70k Black Hat, 100k Ghost, 150k Zero Day, 220k Botmaster, 300k Cryptkeeper, 400k Shadowbroker, 550k Digital Wraith, 750k Daemon Lord, 1M Kernel Panic, 1.5M Root.
- Coach in the app's hacker voice: short, direct, numbers first ("Streak 4 — Friday is your weak day, 33% completion. Freeze it or schedule light.").

## Known constraint

Sync is last-write-wins **per key**. If the user's device is offline holding unsent changes to the same key, whichever writes last wins. Rare for a single user; if the user reports a lost item, just re-add it.
