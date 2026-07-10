# Life Tracker — Whole-App Premium Skins · Handoff Package

Everything needed to build 5 premium, user-switchable **whole-app skins**
(Aurora · Halo · Meridian · Terra · Bolt) across the habit/task dashboard, goals,
analytics, and Pocket Tracker — on **web + Android**.

## What to hand off
Give the build session **[`BUILD_PROMPT.md`](./BUILD_PROMPT.md)** — the full plan
(architecture, phases, per-screen treatment, file map, acceptance criteria). It points
at everything below.

## Contents
| Path | What |
|---|---|
| `BUILD_PROMPT.md` | **The plan/prompt.** Start here. |
| `tokens/{aurora,halo,meridian,terra,bolt}.md` | Authoritative design tokens per skin — exact hexes, fonts, shadows, radii, signature element, mobile framing, a11y. |
| `../../public/showcase-habit-<skin>.html` | **Approved habit/task dashboard** references (web + mobile) per skin. |
| `../../public/showcase-<skin>.html` | **Approved Pocket Tracker** references (web + mobile) per skin. |

Open references in a browser directly, or via the dev server at
`http://localhost:5173/showcase-habit-<skin>.html`.

## One-line kickoff (paste into the session)
> Build a whole-app skin system for Life Tracker: add 5 premium, user-switchable skins —
> Aurora, Halo, Meridian, Terra, Bolt — covering every screen (habit dashboard, tasks,
> goals, analytics, Pocket Tracker, nav, modals), on web and the Capacitor Android app.
> Keep classic and all 5 existing themes intact. Read `docs/redesign/BUILD_PROMPT.md`
> fully, then `docs/redesign/tokens/*.md` and the showcases in `public/`. Follow the
> phased build order; verify each phase in the browser and an Android build; commit per
> phase. No data-model or logic changes.

## Key premise
The app is fully built (habits/XP/streaks + Pocket money feature, state, selectors, sync).
Skins are a **visual layer**: `settings.skin` → `data-skin` on `<html>` → scoped CSS
(`html[data-skin="…"]`) + a few signature components. Classic and the 5 existing themes
stay byte-for-byte identical.
