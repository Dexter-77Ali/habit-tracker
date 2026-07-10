# Handoff: Pocket Tracker — **Bolt** (design direction)

## Which design to build
Build the direction in `Pocket Tracker Bolt.dc.html` — badged **`bolt`**. Neo-brutalist: flat paper, thick ink outlines, hard offset shadows, chunky type, zero gradients. A fully-polished **Overview** (web + mobile) is shown; other tabs/flows follow the feature spec, restyled with the Bolt tokens below.

> An earlier non-premium prototype exists (`design_handoff_pocket_tracker/`) and several other explored looks (Aurora, Noir & Gold, Studio, Halo, Slate, Mesh, Meridian, Terra). Bolt is a **separate direction** — if you're building Bolt, ignore the others visually. The **feature spec** in `design_handoff_pocket_tracker/README.md` still fully applies for *what the feature does*.

## Overview
**Pocket Tracker** — a new feature for the existing **Life Tracker** app. Set a **monthly income/budget**, log **expenses** against it. Tabs: **Overview · Calendar · Stats · Goals · Settings**. Purely financial — **no** XP/gamification. Dual currency **IQD (primary) + USD (≈ secondary)**.

## About the file
`Pocket Tracker Bolt.dc.html` (+ `support.js` beside it) is an **HTML design reference** — open it in a browser to view. **Not production code to copy**; recreate Bolt inside the Life Tracker codebase using its own framework, components, tokens, and state.

## Fidelity
**High-fidelity.** The flat palette, thick borders, hard offset shadows, and mono numerals ARE the design — match them exactly (a soft/blurred rendering breaks the whole look). Amounts/dates/merchants are **sample data** → wire to real state.

---

## Bolt design tokens

### The idea
Neo-brutalist / "sticker" fintech. Everything is a **flat block outlined in near-black ink** and lifted with a **hard offset shadow (no blur)**. No gradients, no soft shadows, no translucency. Loud, confident, tactile — the opposite of the premium/glassy directions. Bold flat accent colors do the work; type is heavy and uppercase, numbers are monospace like a ledger/receipt.

### The three rules (get these right and it's Bolt)
1. **Ink outline on everything:** `border: 2.5px solid #181410` (3px on the outermost frame, 2px on tiny chips).
2. **Hard offset shadow, never blurred:** `box-shadow: 6px 6px 0 #181410` on cards (4px on buttons/FAB, 10px on the outer frame). Interactive press = translate toward the shadow and shrink it.
3. **Flat fills only:** solid color blocks, `border-radius: 0` everywhere. No gradients anywhere.

### Palette
| Token | Value | Use |
|---|---|---|
| Canvas (desk) | `#d9d2c2` | page background |
| Panel | `#ece7da` | app container |
| **Card** | `#fbf9f3` (near-white) | most cards |
| Inset / stat block | `#ece7da` | mini stat cells, icon squares |
| Track (unfilled bar) | `#ece7da` (with ink border) | progress backgrounds |
| Ink (outline + primary text) | `#181410` |
| Body text | `#5c554a` |
| Divider (inside cards) | `2px solid #e6ded0` |
| **Electric blue (primary)** | `#2f4bff`, dark `#1a34d6` | primary CTA, active tab fill, rent, projected-savings block, chart bars |
| **Lime (highlight/positive)** | `#c6f24e` (ink text on it `#3d4a12`) | "On track" chip, safe/day block, ↓ delta badge, latest bar |
| **Coral** | `#ff5a3c` | food, alerts |
| **Amber** | `#ffb43a` | grocery |
| **Violet** | `#8b5cf6` | education |

**Expense amounts stay ink** (`#181410`), not red — direction shown with `−`. Tags/labels sit **on** color blocks (blue block + white text, lime block + ink text).

### Type
- **Display / headings / labels:** `Archivo` — **800–900** weight, **UPPERCASE**, tight tracking (-0.5 to -1px on the wordmark), `letter-spacing:1px` on small caps labels.
- **All numbers:** `Space Mono` (700) — balance, stats, list amounts, category totals. The monospace ledger feel is core; do not set numbers in Archivo.

### Signature elements
- **Budget bar:** a single `height:22px` bar with a `2.5px` ink outer border; each category is a flat segment separated by a `2.5px` ink right-border; the **remaining** portion is a 45° hatch `repeating-linear-gradient(45deg,#ece7da,#ece7da 6px,#d9d2c2 6px,#d9d2c2 12px)`.
- **Bar chart:** flat blue columns, each `2.5px` ink outlined; highlight the latest/notable column in lime. Brutalism favors **bars over smooth lines** — prefer chunky bars for Stats too.
- **Tabs:** active tab = solid ink block with paper text; inactive = plain body text.
- **Chips/tags:** solid color block + `2–2.5px` ink border, uppercase 10–11px Archivo 800.

### Geometry & motion
- `border-radius: 0` throughout (this is deliberate — do not round). Buttons/cards are hard rectangles.
- Motion: minimal and snappy — a quick fade/rise on load; on press, `transform: translate(2px,2px)` and reduce the shadow to `2px 2px 0` (tactile "click"). No easing flourishes. Respect `prefers-reduced-motion`.
- Mobile: 340px, the **bezel is a solid ink block** (`#181410`, 10px padding); a floating **blue + FAB** with ink border + hard shadow notched into the bottom bar.

### Category colors
rent `#2f4bff`, grocery `#ffb43a`, food `#ff5a3c`, education `#8b5cf6`, plus (extend with saturated flats): clothing `#ff8ac4`, travel `#22b8cf`, loan `#e03131`, medical `#20c997`, entertainment `#845ef7`, AI `#4dabf7`, business `#5c7cfa`, transport `#fab005`, family `#f783ac`, gift `#ff5a3c`, coffee `#a9744f`, subscriptions `#748ffc`, savings `#82c91e`, other `#adb5bd`. Every block gets the ink border.

### No dark theme by default
Bolt is a **paper** aesthetic. A dark variant is possible (ink canvas `#181410`, cards `#211c16`, keep the flat accents + now-white outlines `#f4efe6`, shadows become the accent color), but it changes the character — confirm with me before building it.

### Accessibility
Big heavy type helps, but check contrast of body text (`#5c554a`) on cream and of text sitting on color blocks (white on blue is fine; use ink on lime/amber). Don't signal state by color alone — the ↑/↓ arrows and labels carry meaning.

---

## Screens (Bolt treatment)
The **Overview** is fully designed (web + mobile). Apply the same system to the other tabs (behavior from the feature spec):
- **Calendar** — month grid of hard-outlined cells; spend days filled pale with an ink amount; **selected day** = blue fill / thick ink ring; payday cell = lime. Day-detail panel is an outlined card. Month total + daily average in Space Mono.
- **Stats** — outlined cards: weekly **bar columns** (blue, latest in lime), 6-month bars, July-vs-June deltas as chips, top categories with outlined color bars.
- **Goals** — outlined cards with a chunky outlined progress bar (per-goal flat color), Space Mono saved/target, suggested monthly, blue "add funds" block; HTB cert / car / side-project seeds.
- **Settings** — outlined rows: editable income, recurring-payday day picker (default 25, blue-filled selected), per-month budget overrides, dashboard-style chooser (selected = thick ink ring / blue).
- **Flows** — set income, add expense (amount + category chip grid of outlined color blocks, selected = filled, note, date), history (filters as blocks, grouped by day). Add-expense on mobile is an outlined bottom-sheet with the FAB.

Full behavior, state shape, selectors, seed categories, and interactions live in `design_handoff_pocket_tracker/README.md` — reuse them verbatim; only the visual language changes to Bolt.

## Files in this bundle
- `Pocket Tracker Bolt.dc.html` — open in a browser (keep `support.js` beside it). The `bolt` block shows the Overview (web + mobile) at highest fidelity.
- `support.js` — needed only to view the prototype. **Do not ship it.**
- `PROMPT.md` — paste-ready prompt for Claude Code.
