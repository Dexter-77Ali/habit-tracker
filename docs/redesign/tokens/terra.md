# Handoff: Pocket Tracker — **Terra** (design direction)

## Which design to build
Build the direction in `Pocket Tracker Terra.dc.html` — badged **`terra`**. Warm, organic, editorial. A fully-polished **Overview** (web + mobile) is shown; other tabs/flows follow the feature spec, restyled with the Terra tokens below.

> An earlier non-premium prototype exists (`design_handoff_pocket_tracker/`, monospace/pixel) and several other explored looks (Aurora, Noir & Gold, Studio, Halo, Slate, Mesh, Meridian). Terra is a **separate direction** — if you're building Terra, ignore the others visually. The **feature spec** (tabs, calendar, stats, goals, settings, income rules, state model) in `design_handoff_pocket_tracker/README.md` still fully applies for *what the feature does*.

## Overview
**Pocket Tracker** — a new feature for the existing **Life Tracker** app. Set a **monthly income/budget**, log **expenses** against it. Tabs: **Overview · Calendar · Stats · Goals · Settings**. Purely financial — **no** XP/gamification. Dual currency **IQD (primary) + USD (≈ secondary)**.

## About the file
`Pocket Tracker Terra.dc.html` (+ `support.js` beside it) is an **HTML design reference** — open it in a browser to view. **Not production code to copy**; recreate Terra inside the Life Tracker codebase using its own framework, components, tokens, and state.

## Fidelity
**High-fidelity.** The warm bone-and-espresso palette, serif numerals, budget ribbon, and soft warm shadows are the point — match them. Amounts/dates/merchants are **sample data** → wire to real state.

---

## Terra design tokens

### The idea
Warm, organic, editorial — the opposite temperature to a typical fintech app. A **bone/cream** canvas, **espresso ink** text, an earthy **terracotta** primary with **sage** and **ochre** support, and a **serif** display face for numbers and labels give it a calm, tactile, magazine-like feel. Soft warm shadows, generous rounding, no cold grays.

### Type
- **Display / numerals / editorial labels:** `Newsreader` (serif) — weights 400–600, plus **italic** for section labels ("Remaining this month", "Where it went", "Six-month flow"). All large figures (balance, stats, list amounts) are set in Newsreader for an editorial-wealth character.
- **Body / UI / micro-labels:** `Hanken Grotesk` (400–800). Uppercase micro-labels use `letter-spacing:1.5px` and the faint clay color.

### Palette
| Token | Value | Use |
|---|---|---|
| Canvas (desk) | `#ded3c1` | page background |
| Panel | `#efe7d8`, border `#ddd0bb` | the app container |
| **Card** | `#fffdf8` (warm white), border `#e6dcc9`, shadow `0 12px 30px rgba(120,90,60,.08)` | most cards |
| Hero card | `linear-gradient(160deg,#fffdf8,#f6efe1)`, border `#e6dcc9`, `0 2px 0 #fffefb inset` top sheen | balance panel |
| **Dark contrast card** (espresso) | `#2c2620`, text ivory `#f4efe6` | projected-savings / accent panels — use sparingly for rhythm |
| Track / bar bg | `#ece1cd` / `#e8ddc9` | progress + ribbon backgrounds |
| Text primary (espresso) | `#2c2620` |
| Text body | `#6f6558` |
| Text muted / faint | `#8a7f6f` / `#a59a89` |
| **Terracotta (primary)** | `#c65f3c`, deep `#a94b2d` | primary numbers, CTA, active tab, rent |
| **Ochre** | `#d9a441` | grocery, highlights, dark-card accent |
| **Sage (positive)** | `#7a8b6f`, text `#5e6f52` | "On pace" chip, ↓ deltas (spending less = good), food |
| Clay/brown | `#b07a4f` | education, tertiary bars |
| Primary button | `linear-gradient(135deg,#c65f3c,#a94b2d)`, text `#fdf6ec`, shadow `0 10px 24px rgba(166,75,45,.3)` |
| "On pace" chip | text `#5e6f52`, bg `rgba(122,139,111,.14)`, border `rgba(122,139,111,.3)`, sage dot |

**Expense amounts stay espresso** (`#2c2620`), not red — restraint; direction shown with `−` and a muted `≈ $…`. Category **delta chips** use sage for "down", terracotta for "up".

### Signature element: the budget ribbon
Instead of a gauge, the hero shows a **horizontal segmented ribbon** (`height:14px`, `radius:8px`) — one colored segment per category in spend order (terracotta → ochre → sage → clay), and the **remaining** portion rendered as a warm **hatch**: `repeating-linear-gradient(45deg,#e8ddc9,#e8ddc9 5px,#ded0b6 5px,#ded0b6 10px)`. Below it, "Spent X · Budget Y".

### Category colors
rent `#c65f3c`, grocery `#d9a441`, food `#7a8b6f`, education `#b07a4f`, plus (extend in the same earthy register): clothing `#b0684f`, travel `#8a9b7a`, loan `#a9603c`, medical `#7a8b6f`, AI `#c98a5a`, business `#9a8b6f`, transport `#d9a441`, family `#c17a5c`, gift `#c65f3c`, coffee `#8a6b4f`, subscriptions `#a0906f`, savings `#7a8b6f`, other `#a59a89`.

### Geometry, charts, motion
- Radii: panel 26px · cards 22px · inner tiles 11–16px · buttons 11px · pills 20px. Warm, generous.
- Charts: terracotta polyline (2.5px) + soft area gradient (`rgba(198,95,60,.2)` → transparent); last point a filled dot with a `#fffdf8` ring.
- A faint terracotta **radial bloom** sits behind the hero number (top-right, `rgba(198,95,60,.12)`).
- Motion: content fades/rises in (~.7s). Subtle only; respect `prefers-reduced-motion`.
- Mobile: 340px frame, warm bezel `linear-gradient(160deg,#efe7d8,#cdbfa8)`, inner radius 34px; a floating **terracotta + FAB** notched into the bottom bar.

### Dark theme
Terra is **light-led** and looks best warm. If a dark variant is needed: canvas deep espresso `#211c17`; cards `#2c2620` with a `#3a332a` hairline; text ivory `#f4efe6` / muted `#a59683`; keep terracotta/ochre/sage accents (they glow nicely on espresso); the ribbon hatch darkens to `#3a332a`/`#2c2620`. Confirm before investing.

### Accessibility
Keep body/label text at accessible contrast on the cream cards (the faint `#a59a89` is for non-essential labels only). Don't rely on color alone for deltas — the ↑/↓ arrows carry the meaning too.

---

## Screens (Terra treatment)
The **Overview** is fully designed (web + mobile). Apply the same warm system to the other tabs (behavior from the feature spec):
- **Calendar** — month grid on cream; spend days are warm cards with a terracotta amount; **selected day** gets a terracotta ring; payday marked with an ochre dashed tile. Day-detail panel is a warm card. Month total + daily average header in serif.
- **Stats** — cream cards: weekly bars (terracotta/ochre in `#ece1cd` tracks), 6-month trend (terracotta line), July-vs-June deltas, top categories ranked. Consider one espresso card for contrast.
- **Goals** — warm cards with a serif % + progress bar (terracotta/ochre/sage per goal), saved/target, suggested monthly saving, terracotta "add funds"; HTB cert / car / side-project seeds.
- **Settings** — warm rows: editable income, recurring-payday day picker (default 25, ochre-highlighted), per-month budget overrides, dashboard-style chooser (selected = terracotta ring).
- **Flows** — set income, add expense (amount + category chip grid, selected chip terracotta, note, date), history (filters, grouped by day). Add-expense on mobile is a warm card bottom-sheet with the FAB.

Full behavior, state shape, selectors, seed categories, and interactions live in `design_handoff_pocket_tracker/README.md` — reuse them verbatim; only the visual language changes to Terra.

## Files in this bundle
- `Pocket Tracker Terra.dc.html` — open in a browser (keep `support.js` beside it). The `terra` block shows the Overview (web + mobile) at highest fidelity.
- `support.js` — needed only to view the prototype. **Do not ship it.**
- `PROMPT.md` — paste-ready prompt for Claude Code.
