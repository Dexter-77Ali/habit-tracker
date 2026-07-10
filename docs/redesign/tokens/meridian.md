# Handoff: Pocket Tracker — **Meridian** (SELECTED premium direction)

## Which design to build
Build the direction badged **`5a` — "Meridian"** — the flagship. It is the **chosen, approved** aesthetic.

The design file (`Pocket Tracker Premium.dc.html`) contains earlier **unselected alternates** — `3a` Aurora, `3b` Noir & Gold, `3c` Studio, `4a` Halo, `4b` Slate, `4c` Mesh. Kept for reference only. **Do not build them.** Build **only** the `5a` Meridian block (search the file for `id="5a"` / the comment `5a · … ` / `================= WEB =================` and `================= MOBILE =================`). A fully-built-out Meridian across every tab also ships as `Pocket Tracker Meridian.dc.html` — use that as the primary visual reference for all screens; the `5a` block is the Overview at highest fidelity.

> An earlier non-premium prototype exists (`design_handoff_pocket_tracker/`, monospace/pixel). Superseded visually by Meridian — but its **feature spec** (tabs, calendar, stats, goals, settings, income rules, state model) still fully applies. Use that README for *what the feature does*; use THIS one for *how it looks*.

## Overview
**Pocket Tracker** — a new feature for the existing **Life Tracker** app. Set a **monthly income/budget**, log **expenses** against it. Tabs: **Overview · Calendar · Stats · Goals · Settings**. Purely financial — **no** XP/gamification. Dual currency **IQD (primary) + USD (≈ secondary)**.

## About the files
`Pocket Tracker Premium.dc.html` and `Pocket Tracker Meridian.dc.html` (+ `support.js` beside them) are **HTML design references** — open in a browser to view. **Not production code to copy**; recreate Meridian inside the Life Tracker codebase using its own framework, components, tokens, and state.

## Fidelity
**High-fidelity.** The ink-and-emerald palette, gold hairlines, the precision arc gauge, tabular numerals, and layered depth are the whole point — match them. Amounts/dates/merchants are **sample data** → wire to real state.

---

## Meridian design tokens

### The idea
Private-wealth restraint meets modern fintech. A near-black ink canvas, **one** confident accent (emerald), **fine gold hairlines** as the "expensive" glint, warm-ivory text, and obsessive numeric typography. Calm, deep, deliberate — nothing shouts.

### Type
- **Display / all numerals:** `Space Grotesk` (500–600), tight tracking (-1 to -2px on big figures). Apply **`font-variant-numeric: tabular-nums`** to every numeric context so digits align in columns.
- **Body / labels:** `Manrope` (400–600).
- **Micro-labels:** 11px, `letter-spacing: 2–2.5px`, uppercase, muted — used on every card ("REMAINING · JULY 2026", "ALLOCATIONS").

### Surfaces & depth
| Token | Value |
|---|---|
| Panel (outer) | `linear-gradient(180deg,#0c0e13,#090a0e)`, radius **26px**, shadow `0 50px 140px rgba(0,0,0,.7)` |
| Panel aura (absolute, behind content) | `radial-gradient(900px 500px at 78% -8%, rgba(16,185,129,.12), transparent 60%)` + a faint gold `radial(... rgba(229,192,123,.06) ...)` |
| Panel vignette | `inset 0 0 200px rgba(0,0,0,.6)` |
| **Card** | `linear-gradient(155deg,#161a22,#111319)`, border `1px rgba(255,255,255,.07)`, top highlight `inset 0 1px 0 rgba(255,255,255,.06)`, radius **22px** |
| **Gold hairline** (top of hero cards) | a 1px bar: `linear-gradient(90deg,transparent,rgba(229,192,123,.5),transparent)` inset ~32px from the card edges |
| Hairline divider | `1px rgba(255,255,255,.05–.06)` (used between stat columns and list rows) |
| Rail | width **78px**, right border `rgba(255,255,255,.05)`; the **active** tab glyph is emerald with a glowing 3px left indicator bar |

### Palette
| Token | Value |
|---|---|
| Text primary (warm ivory) | `#f3f2ee` |
| Text secondary | `rgba(243,242,238,.5)` |
| Text muted / faint | `rgba(243,242,238,.4)` / `.32–.35` |
| **Emerald accent** | bright `#6ee7b7` · mid `#34d399` · deep `#10b981` / `#059669` · darkest `#065f46` |
| **Gold accent** (hairlines, "safe/day", highlights) | `#e5c07b` / `#c99b52` |
| Primary button | `linear-gradient(135deg,#10b981,#059669)`, text `#eafff6`, shadow `0 10px 26px rgba(16,185,129,.35)` |
| Brand tile | `linear-gradient(135deg,#10b981,#065f46)` |
| Status pill | text `#6ee7b7`, bg `rgba(16,185,129,.12)`, border `rgba(16,185,129,.25)`, with a pulsing `#34d399` dot (`box-shadow:0 0 8px #34d399`) |

**Expense amounts stay ivory** (`#f3f2ee`), not red — restraint. Direction is shown with a small `−` and a muted `≈ $…` beneath. **Delta chips** on categories use emerald for "down" (spending less = good) and a soft rose `#f0a2b8` for "up".

### Category colors (dots / bars / donut) — jewel-toned, restrained
rent `#e5c07b` (gold), grocery `#6ee7b7`, food `#f0a2b8`, education `#9aa8ff`, plus (extend in the same register): entertainment `#b79bff`, transport `#e5c07b`, medical `#6ee7b7`, travel `#7ec8f0`, AI `#6ee7b7`, business `#9aa8ff`, other `rgba(243,242,238,.4)`. Bars are thin (6px), rounded, gradient-filled, in `rgba(255,255,255,.06)` tracks.

### The arc gauge (signature element)
A 270° gauge, gap at the bottom. Two SVG circles, `r≈82–84`, `stroke-width 12–13`, `stroke-linecap:round`, `pathLength="100"`, wrapped in `transform: rotate(135deg)`:
- **Track:** `stroke: rgba(255,255,255,.07)`, `stroke-dasharray: "75 100"` (draws 270°).
- **Value:** `stroke: url(#gradient)` emerald `#6ee7b7→#059669`, `stroke-dasharray: "<pct×0.75> 100"` (e.g. 62% → `46.5 100`), plus a soft glow `filter` (`feGaussianBlur stdDeviation="4"` merged over source).
- Center holds the % used (or, on mobile, the remaining figure). Recreate with the codebase's chart/SVG approach — the math is `valueDash = usedPct * 0.75`.

### Geometry & motion
- Radii: panel 26px · cards 22px · inner tiles 11–16px · buttons 11px · pills 20px.
- Charts: emerald polyline (2.5px) + soft area gradient (`rgba(16,185,129,.28)` → transparent); last point a filled dot with a `#111319` ring so it sits proud of the card.
- Motion: content fades/rises in (~.8s); the status-pill dot pulses opacity (~2.4s). Subtle only; respect `prefers-reduced-motion`.
- Mobile: 340px frame, gradient bezel `linear-gradient(160deg,#26292f,#0c0d10)` padding 11px, inner radius 34px; a floating **emerald + FAB** notched into the bottom tab bar.

### Light theme
Meridian is **dark-led** and looks best there. If a light variant is required: canvas warm off-white `#f4f2ec`; cards white with a `#e7e3d8` hairline and soft shadow (drop the inset highlight); keep emerald + gold accents but darken text to `#1c1e17`; the gauge track becomes `rgba(0,0,0,.08)`. Confirm with me before investing in light — the brand equity is in the dark treatment.

---

## Screens (Meridian treatment)
The **Overview** is fully designed (`5a`, web + mobile) and built out for **every tab** in `Pocket Tracker Meridian.dc.html`:
- **Overview** — rail → header (segmented This-month/3M/6M + gold "PREMIUM" tag + emerald Add-expense) → hero (big remaining figure, ≈USD, "On track" pill, **arc gauge**, gold-hairline top, 3 hairline-split stats) → right column (6-month flow sparkline, projected-savings) → allocations (dot + label + thin bar + tabular amount + delta chip) + recent.
- **Calendar** — month grid; day cells are faint cards, spend shown with a small emerald fill/dot; **selected day** has an emerald ring + glow; agenda/detail panel is a card. Month total + daily average in the header.
- **Stats** — cards: weekly bars (emerald, in tracks), 6-month trend (emerald line), this-vs-last comparison with delta chips, top categories ranked.
- **Goals** — cards with an arc-ring or thin progress bar, saved/target, % + suggested monthly saving, gold "add funds"; HTB cert / car / side-project seeds.
- **Settings** — hairline rows: editable income, recurring-payday day picker (default 25), per-month budget overrides, dashboard-style chooser (selected = emerald ring).
- **Flows** — set income, add expense (amount + category chip grid, selected chip emerald, note, date), history (filters, grouped by day). Add-expense on mobile is a card bottom-sheet with the FAB.

Full behavior, state shape, selectors, seed categories, and interactions live in `design_handoff_pocket_tracker/README.md` — reuse them verbatim; only the visual language changes to Meridian.

## Files in this bundle
- `Pocket Tracker Meridian.dc.html` — the full Meridian feature across all tabs (primary reference). Open in a browser (keep `support.js` beside it).
- `Pocket Tracker Premium.dc.html` — the exploration board; build **only** the `5a` block, others are unselected alternates.
- `support.js` — needed only to view the prototypes. **Do not ship it.**
- `PROMPT.md` — paste-ready prompt for Claude Code.
