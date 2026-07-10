# Handoff: Pocket Tracker — **Halo** (SELECTED premium direction)

## Which design to build
Build the direction badged **`4a` — "Halo"**. It is the **chosen, approved** aesthetic.

The design file (`Pocket Tracker Premium.dc.html`) also contains several **unselected alternates** explored along the way — `3a` Aurora, `3b` Noir & Gold, `3c` Studio, `4b` Slate, `4c` Mesh. They are kept for reference only. **Do not build them.** Build **only** the `4a` Halo block (search the file for `id="4a"` / the comment `4a · HALO`).

> An earlier non-premium prototype also exists (`design_handoff_pocket_tracker/`, a monospace/pixel look). Superseded visually by Halo — but its **feature spec** (tabs, calendar, stats, goals, settings, income rules, state model) still fully applies. Use that README for *what the feature does*; use THIS one for *how it looks*.

## Overview
**Pocket Tracker** is a new feature for the existing **Life Tracker** app. A user sets a **monthly income/budget** and logs **expenses** against it. Tabs: **Overview · Calendar · Stats · Goals · Settings**. Purely financial — **no** XP/gamification. Dual currency **IQD (primary) + USD (≈ secondary)**.

## About the file
`Pocket Tracker Premium.dc.html` (+ `support.js` beside it) is an **HTML design reference** — open it in a browser to view. It is **not production code to copy**; recreate the Halo look inside the Life Tracker codebase using its own framework, components, tokens, and state. The `4a` block shows a fully-polished **Overview** hero (web). Other tabs/flows follow the feature spec, restyled with the Halo tokens below.

## Fidelity
**High-fidelity.** The neumorphic shadow system, palette, radii, and spacing are the whole point — match them precisely. Amounts/dates/merchants are **sample data** → wire to real state.

---

## Halo design tokens

### The core idea: soft neumorphism
Every surface is the **same base color** as the page (`#e6e9f2`) and is defined **only by light**: a dark bottom-right shadow + a white top-left shadow make elements look **extruded** (raised) or, with the shadows inverted to `inset`, **debossed** (pressed in). There are almost no borders and no hard fills. This is calm, tactile, and premium — get the two-shadow recipe right and everything else follows.

**Raised (cards, buttons, icon tiles):**
`box-shadow: 9px 9px 22px rgba(163,177,198,.6), -9px -9px 22px #ffffff;` (scale the offset/blur down for smaller elements: tiles `6px 6px 14px / -6px -6px 14px`).

**Pressed / inset (input wells, progress tracks, active nav, stat wells):**
`box-shadow: inset 4px 4px 9px rgba(163,177,198,.65), inset -4px -4px 9px #ffffff;`

### Palette
| Token | Value | Use |
|---|---|---|
| **Base surface = page** | `#e6e9f2` | EVERYTHING — page, cards, tiles all share this |
| Shadow (dark) | `rgba(163,177,198,.5–.7)` | bottom-right of every shadow pair |
| Shadow (light) | `#ffffff` | top-left of every shadow pair |
| Text primary | `#363b52` | headings, values |
| Text body | `#4b5069` | secondary text |
| Text muted | `#8a90a6` | labels, units |
| Text faint | `#9aa0b8` | chevrons, inactive icons |
| **Primary accent** | indigo `#6d5efc`, light `#8ea2ff` | active icon, links, primary numbers |
| **Primary gradient** | `linear-gradient(135deg,#8ea2ff,#6d5efc)` | the "Add expense" button, progress fill, brand tile glyph |
| Income / positive | `#2fb98a` |
| Expense / negative | `#f0699b` |
| Progress fill | `linear-gradient(90deg,#8ea2ff,#6d5efc)` sitting **inside an inset track** (track uses the pressed shadow), fill has a soft `2px 2px 5px rgba(109,94,252,.4)` |

### Category colors (donut / bars / legend) — soft, desaturated to match
rent `#f7a06b`, grocery `#5ad1a8`, food `#f0699b`, education `#f7cf6b`, entertainment `#b79bff`, other `#8ea2ff`, plus (extend in the same soft register): clothing `#c9a8ff`, travel `#7ec8f0`, loan `#f2909a`, medical `#5ad1a8`, AI `#8ea2ff`, business `#9aa8ff`, transport `#f7cf6b`, family `#f5a8c8`, gift `#f0699b`, coffee `#d0a884`, subscriptions `#b79bff`, savings `#5ad1a8`.

### Type
- **Display / headings / numerals:** `Plus Jakarta Sans` (700–800), tight tracking on big numbers (-0.5 to -2px).
- **Body / labels / UI:** `Plus Jakarta Sans` (400–600). One family, weight-differentiated — keeps the calm, unified feel. (`Space Grotesk` is an acceptable alternate for numerals if you want more character.)

### Geometry
- Radii: panel **30px** · cards **26px** · inner wells/tiles **14–16px** · buttons **14px** · pills **10–12px**. Generous rounding is essential to the soft look.
- Left rail **88px**; icon tiles **46–48px** rounded 14–16px (raised by default; the **active** one is inset/pressed with an indigo glyph).
- Donut: an outer raised ring wrapping the conic-gradient, with a **debossed hole** (inset shadow) showing the total.
- Spacing is airy — 20–24px gaps between cards, 26–32px card padding.

### Charts
- Line/area SVG; stroke = indigo `#6d5efc` (2.5–3.5px), soft area gradient fading from `#8ea2ff` at ~40% alpha. Last data point is a filled indigo dot with a **`#e6e9f2` ring** (so it reads as raised off the card).
- Bars: rounded, filled with the primary gradient, sitting in inset tracks.

### Dark theme
Halo is **light-led**. For a dark variant, keep the exact same neumorphic recipe but move the base to a dark slate (`#22252e`): dark shadow becomes `rgba(0,0,0,.55)`, light shadow becomes a low-alpha white `rgba(255,255,255,.05)` (a soft top-left sheen, not pure white). Text lightens to `#e7e9f2` / muted `#9aa0b8`; accents (indigo/mint/pink) stay. Test contrast — neumorphism is subtler in dark, so lean on the accent for emphasis.

### Accessibility note
Pure neumorphism can be low-contrast. Keep **text** at accessible contrast against `#e6e9f2` (the muted `#8a90a6` is for non-essential labels only), and don't rely on shadow alone to signal interactive state — pair it with the indigo accent. Respect `prefers-reduced-motion` for the fade-in.

---

## Screens (Halo treatment)
The Overview hero is fully designed in `4a`: raised left rail (active tab = pressed/inset) → greeting + inset month-switch well + gradient "Add expense" → **raised hero card** (big Plus Jakarta figure, IQD + ≈USD, inset progress track with gradient fill, three inset stat wells) → **raised donut card** (raised ring + debossed center) → **raised trend card** (indigo line) → **raised recent card** (raised icon tiles). Apply the same raised/inset system to the other tabs (behavior from the feature spec):
- **Calendar** — month grid where each day is a subtle raised tile; the **selected day is pressed in** (inset) with an indigo accent; spend intensity shown by a small indigo dot/fill. Agenda/detail panel is a raised card.
- **Stats** — raised cards: weekly bars (gradient in inset tracks), 6-month trend (indigo line), this-vs-last comparison, top categories.
- **Goals** — raised goal cards; progress in inset tracks with gradient fill; % + suggested monthly saving; HTB cert / car / side-project seeds.
- **Settings** — raised rows; the payday day-picker and toggles use pressed/raised states to signal on/off; income edit, per-month overrides, dashboard-style chooser (selected preview is pressed-in).
- **Flows** — set income, add expense (amount in an inset well + category grid of raised chips, selected chip pressed-in + indigo, note, date), history (filters, grouped by day). Add-expense on mobile is a raised bottom-sheet.

Full behavior, state shape, selectors, seed categories, and interactions live in `design_handoff_pocket_tracker/README.md` — reuse them verbatim; only the visual language changes to Halo.

## Files in this bundle
- `Pocket Tracker Premium.dc.html` — open in a browser (keep `support.js` beside it). Build **only** the `4a` Halo block; all other badges are unselected alternates.
- `support.js` — needed only to view the prototype. **Do not ship it.**
- `PROMPT.md` — paste-ready prompt for Claude Code.
