# Handoff: Pocket Tracker — **Aurora** (SELECTED premium direction)

## Which design to build
Build the direction badged **`3a` — "Aurora"**. It is the **chosen, approved** aesthetic.

The design file (`Pocket Tracker Premium.dc.html`) also contains two **alternate** directions that were explored and **not** selected — `3b` Noir & Gold and `3c` Studio. They are kept for reference only. **Do not build them.** Ignore everything except the `3a` Aurora block (search the file for `id="3a"` / the comment `3a · AURORA`). More premium alternates may be added to this file over time — the selected one is always the one this README names (Aurora).

> There is also an earlier, non-premium prototype in the repo (`design_handoff_pocket_tracker/`, the monospace/pixel look). That is superseded by Aurora for visual style — but its **feature spec** (tabs, calendar, stats, goals, settings, income rules, state model) still fully applies. Use that README for *what the feature does*; use THIS one for *how it looks*.

## Overview
**Pocket Tracker** is a new feature for the existing **Life Tracker** app. A user sets a **monthly income/budget** and logs **expenses** against it. Tabs: **Overview · Calendar · Stats · Goals · Settings**. Purely financial — **no** XP/gamification. Dual currency **IQD (primary) + USD (≈ secondary)**.

## About the file
`Pocket Tracker Premium.dc.html` (+ `support.js` beside it) is an **HTML design reference** — open it in a browser to view. It is **not production code to copy**; recreate the Aurora look inside the Life Tracker codebase using its own framework, components, tokens, and state. The `3a` block shows a fully-polished **Overview** hero (web). The other tabs/flows follow the feature spec from the earlier handoff, restyled with the Aurora tokens below.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, blur, and glow are intentional — match them. Amounts/dates/merchants are **sample data** → wire to real state.

---

## Aurora design tokens

### Type
- **Display / headings / all numerals:** `Space Grotesk` (600–700), tight tracking (letter-spacing -0.5 to -2px on big numbers).
- **Body / labels / UI:** `Manrope` (400–800). Default `body` font.

### Surfaces & depth (the core of the look)
| Token | Value | Use |
|---|---|---|
| Page background | `radial-gradient(1200px 800px at 80% -10%, #1b1030, transparent 60%), radial-gradient(1000px 700px at 0% 0%, #0a1a2a, transparent 55%), #0a0a0e` | app canvas |
| Panel (outer card) | `#0b0e18`, border `1px rgba(255,255,255,.09)`, radius **30px**, shadow `0 40px 120px rgba(0,0,0,.6)` | the main container |
| **Aurora wash** (inside panel, absolutely positioned) | `radial-gradient(600px 420px at 12% 8%, rgba(45,212,191,.28), transparent 60%), radial-gradient(680px 480px at 88% 4%, rgba(167,139,250,.32), transparent 62%), radial-gradient(520px 520px at 70% 100%, rgba(240,171,252,.20), transparent 60%)` | colored glow behind content |
| Glow orb | blurred `radial-gradient(circle, rgba(139,233,255,.5), transparent 65%)`, `filter: blur(30px)`, gentle opacity pulse | ambient light |
| **Glass card** | bg `rgba(255,255,255,.05)`, border `1px rgba(255,255,255,.1)`, `backdrop-filter: blur(18px)`, inset highlight `inset 0 1px 0 rgba(255,255,255,.1)`, radius **24px** | donut / recent / trend cards |
| **Hero balance card** | bg `linear-gradient(135deg, rgba(45,212,191,.16), rgba(167,139,250,.16))`, border `1px rgba(255,255,255,.14)`, inset top highlight, radius 24px | the remaining-balance panel |
| Rail (left nav) | `rgba(255,255,255,.02)` + `backdrop-filter: blur(10px)`, right border `rgba(255,255,255,.06)`, width **76px** | sidebar |

### Accent palette
| Token | Value |
|---|---|
| Teal (income/positive) | `#2dd4bf` / bright `#5eead4` |
| Violet | `#a78bfa` |
| Pink (expense/negative) | `#f0abfc` |
| Cyan (USD / links / info) | `#8be9ff` |
| Indigo/blue | `#6366f1` / `#60a5fa` |
| **Brand tile gradient** | `linear-gradient(135deg,#2dd4bf,#a78bfa)` |
| **Primary button** | `linear-gradient(135deg,#2dd4bf,#6366f1)`, shadow `0 10px 30px rgba(99,102,241,.45)` |
| **Progress fill** | `linear-gradient(90deg,#2dd4bf,#a78bfa,#f0abfc)` + `box-shadow:0 0 18px rgba(167,139,250,.7)` on a `rgba(0,0,0,.25)` track |
| Text primary | `#f4f2ff` |
| Text secondary | `rgba(255,255,255,.6)` |
| Text muted / faint | `rgba(255,255,255,.45)` / `.4` |

### Category colors (donut / bars / legend)
rent `#fb923c`, grocery `#2dd4bf`, food `#f0abfc`, education `#facc15`, entertainment `#a78bfa`, other `#60a5fa`, plus (extend harmoniously): clothing `#c084fc`, travel `#38bdf8`, loan `#fb7185`, medical `#5eead4`, AI `#8be9ff`, business `#818cf8`, transport `#facc15`, family `#f9a8d4`, gift `#f0abfc`, coffee `#d6a06a`, subscriptions `#a78bfa`, savings `#34d399`.

### Geometry & motion
- Radii: panel 30px · cards 24px · inner tiles/icons 11–13px · buttons 12px · pills 8px.
- Icon tiles use tinted accent backgrounds at ~15% alpha (`rgba(45,212,191,.15)` etc.).
- Charts: SVG polyline + area; stroke uses the tri-stop gradient `#2dd4bf→#a78bfa→#f0abfc`; last data point a filled dot with a `#0b0e18` ring. Bars are CSS-height with gradient fills.
- Motion: content fades/rises in (`translateY(14px)`, ~.7s), the glow orb pulses opacity slowly (6s). Keep motion subtle; respect `prefers-reduced-motion`.

### Light theme
Aurora is **dark-led**. For the light variant: page `#eef1f8`; glass cards become white at high opacity (`rgba(255,255,255,.7)`) with `border #e6eaf3` and a soft shadow instead of dark; keep the same teal/violet/pink accents but deepen text to `#1e2233` and darken the aurora washes to ~10–14% alpha so they read as tint, not glow. Preserve the gradient button and progress fill.

---

## Screens (Aurora treatment)
The Overview hero is fully designed in `3a`: left rail → greeting + month switch + gradient "Add expense" → **hero balance card** (big Space Grotesk figure, IQD + ≈USD, glowing progress, Income/Spent/Safe-per-day) → **glass donut** breakdown → **glass 6-month trend** (gradient line) → **glass recent** list. Apply the same surface system to the other tabs (from the feature spec):
- **Calendar** — month grid on the panel; day cells are subtle glass tiles, spend intensity tinted with the accent; selected day gets a bright border + glow; side/agenda panel in glass.
- **Stats** — glass cards: weekly bars (gradient), 6-month trend (gradient line), this-vs-last comparison, top categories.
- **Goals** — glass goal cards with gradient progress + suggested monthly saving; HTB cert / car / side-project seeds.
- **Settings** — glass rows: editable income, recurring-payday day picker (default 25), per-month budget overrides, dashboard-style chooser.
- **Flows** — set income, add expense (amount + category grid + note + date), history (filters, grouped by day). Add-expense on mobile is a glass bottom-sheet.

Full behavior, state shape, selectors, seed categories, and interactions are in `design_handoff_pocket_tracker/README.md` — reuse them verbatim; only the visual language changes to Aurora.

## Files in this bundle
- `Pocket Tracker Premium.dc.html` — open in a browser (keep `support.js` beside it). Build **only** the `3a` Aurora block; `3b`/`3c` are unselected alternates.
- `support.js` — needed only to view the prototype. **Do not ship it.**
- `PROMPT.md` — paste-ready prompt for Claude Code.
