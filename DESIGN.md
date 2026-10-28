# Winchester Buyer Check: design contract

This file describes the interface as it ships in `styles.css`, `index.html` and `app.js`. Change the CSS and this file together. When the two disagree, the CSS is the record and this file is out of date.

## Product and reader

A first-time buyer in Winchester compares saved homes against their own buying plan. The reader may never have bought a home. Every screen answers three questions in this order: what am I looking at, does it fit my plan, what do I do next.

The interface is dark, calm and dense enough to compare nine homes without scrolling past decoration. It is a working screen, not a landing page.

## Tokens

All colours live on `:root` in `styles.css`. There is one theme (dark, `color-scheme: dark`). Use the token, never the hex.

### Surfaces and lines

| Token | Value | Use |
| --- | --- | --- |
| `--page` | `#0b1215` | Page ground, chart surface, ring around chart dots |
| `--panel` | `#111a20` | Home cards, side panels, tables, checklists |
| `--panel-2` | `#172129` | Select menus on panels |
| `--line` | `rgba(220, 232, 228, 0.13)` | Row rules, card borders, section dividers |
| `--line-strong` | `rgba(220, 232, 228, 0.24)` | Control borders, totals rule, chip borders |
| `--grid` | `rgba(220, 232, 228, 0.08)` | Chart gridlines only |

A surface gets a border or a tone step, never a shadow as well. Nothing on the page has a resting shadow.

### Text

| Token | Value | Contrast on `--panel` | Use |
| --- | --- | --- | --- |
| `--ink` | `#e9eee9` | 15.0:1 | Headings, values, primary labels |
| `--ink-2` | `#c3cdca` | about 11:1 | Body copy, row labels, help text in lists |
| `--muted` | `#a3b0ac` | 7.9:1 | Secondary lines, captions, units, quiet status |
| `--quiet` | `#8d9a9f` | 6.1:1 | Placeholders, icons, the neutral source dot |
| `--blue` | `#8ab8d8` | 8.3:1 | Links and text buttons. Blue always means clickable |

### Accent

`--green` (`#31c89a`) is the brand accent. It fills the primary button (text `#10231d`, 7.7:1), tints the active nav item and pressed chips, draws the focus ring (`--focus-ring`, 3px at 55% opacity, 3px offset) and ticks checklist rows. `--green-soft` is the nav count badge.

### Status tones

Four tones only: neutral, success, attention, danger. Each tone has a text colour and a mark colour. Text colours are light enough to read as words; mark colours are the validated set for dots, bars, borders and chart marks. A status is always carried by words as well as colour.

| Tone | Text token | Mark token | Means |
| --- | --- | --- | --- |
| Neutral | `--muted` | `--quiet` | No judgement, or information only |
| Success | `--green` `#31c89a` | `--success-mark` `#34ab93` | Fits the plan, short walk, enough evidence |
| Attention | `--gold` `#d9b66f` | `--attention-mark` `#b4902e` | Only just fits, test the route, gaps remain, at the Lifetime ISA limit |
| Danger | `--danger` `#ef765f` | `--danger-mark` `#be5a53` | Over the plan, over the Lifetime ISA limit, missing evidence |

The mark set passes the dataviz palette validator in dark mode on `--page` and on `--panel`, with all pairs checked: OKLCH lightness 0.59 to 0.67, chroma at least 0.10, worst colour-blind separation ΔE 9.6 (deuteranopia, attention against danger), worst normal-vision ΔE 15.2, every mark at least 3:1 against the surface. Re-run it after any change:

```bash
node validate_palette.js "#34ab93,#b4902e,#be5a53" --mode dark --surface "#0b1215" --pairs all
```

Colour goes on what differs, not on every row. On the Homes list only homes within the plan get a coloured budget line; homes over the plan get a muted line, and one summary sentence above the list gives the count.

### Chart

`--data` is the one chart hue (equal to `--success-mark`). The market chart uses it for the range bars and nothing else. The median dot and the plan line are `--ink`. Text in and around the chart uses text tokens, never `--data`.

## Type

Two self-hosted faces, both under the SIL Open Font License (`assets/fonts/`). No font is fetched from another site.

- **Fraunces** (600 to 700): page titles, section headings, the price and fit score on each card, the decision sentence on the Plan page. Never for body copy or labels.
- **DM Sans** (400 to 700): everything else.

| Role | Spec |
| --- | --- |
| Page title | Fraunces 650, `clamp(30px, 4vw, 42px)`, line height 1.1, tracking -0.02em |
| Review score | Fraunces 650, 34px |
| Card fit score | Fraunces 650, 32px |
| Card price | Fraunces 650, 26px (24px under 470px) |
| Section heading (h2) | Fraunces 600, 22px; 19px for subheads and checklist groups |
| Fieldset legend | Fraunces 600, 20px |
| Decision sentence | Fraunces 600, 20px, line height 1.35 |
| Lede | DM Sans 17px (16px on phones), line height 1.55 |
| Body and values | DM Sans 15px |
| Labels, help, table cells | DM Sans 14px |
| Captions, sublines, tags | DM Sans 13px |
| Axis ticks, table headers in the score breakdown, nav badge | DM Sans 12px. Nothing is smaller than 12px |

Figures that line up in a column use `font-variant-numeric: tabular-nums` and sit right-aligned: tables, figure lists, money breakdowns, the chart's median column and axis ticks, weight shares. Large standalone figures (card price, fit score) keep proportional figures.

Headings use `text-wrap: balance`. Long text blocks are capped: page heads at 760px, the fit score explainer at 72ch. All labels and headings are sentence case. No uppercase labels anywhere.

## Spacing and layout

- Content width: `min(1160px, 100% - 48px)`; `100% - 32px` (a 16px gutter) at 760px and below.
- Spacing steps in use: 4, 6, 8, 10, 12, 14, 16, 24, 28, 32, 40px. Tight inside a group (4 to 12), wider between groups (24 to 40). More space above a heading than below it.
- Two-column pages (Market, Plan, Review, Evidence) use a main column and a 280px-minimum side column with a 40px gap. They stack at 860px.
- Review grid: main column on the left; the offer card and the score breakdown stack on the right. On phones the order is main, offer, score.
- Sections are separated by headings, space and 1px rules. Cards are used for the home list, the offer range, side notes and checklists only. No card sits inside another card.

## Radii

| Radius | Use |
| --- | --- |
| 4px | Chart range bars (both ends are data ends; there is no baseline to square off) and the legend swatch |
| 6px | Tags |
| 9px | Inputs and selects |
| 10px | Buttons, search and sort controls, nav items, the toast |
| 14px | Cards, panels, tables, checklists |
| 99px | Filter chips, progress bar, nav count badge |
| 50% | Dots and check marks only |

## Components

**Primary button.** `--green` fill, `#10231d` text, 700 weight, 44px tall, 10px radius. One per region. The label is a verb and an object ("Change my plan", "Copy review summary").

**Secondary button.** Transparent, `--line-strong` border, `--ink` text, same size. Sits under the primary.

**Text button.** `--blue`, underlined at a 3px offset, 44px hit area, no fill. For low-stakes actions ("Copy review summary" when the offer is out of reach, "Use the default shares", "Reset the example").

**Filter chips.** 44px tall pill, `--line-strong` border. Pressed state (`aria-pressed="true"`) and hover tint with the accent at 12%. One chip is always pressed. On phones the row scrolls sideways and fades out over its last 56px to show there is more.

**Home card.** A single button covering the whole card. Left: price and tags, name, facts, tenure and condition, the reason line, the quiet budget line, what is still to confirm. Right: fit score, sold-price range, "See full check". The border turns to the accent at 40% on hover.

**Disclosure.** The fit score explainer is a `details` element with a 44px summary row, a drawn chevron that turns 90 degrees when open, and rules above and below. It is closed by default so the first home's price stays above the fold on a 390 by 844 phone.

**Money breakdown.** A two-column table: label on the left (with a 13px muted subline where needed, such as "First-time buyer relief applied"), amount on the right in tabular figures. The total row has a `--line-strong` rule above it. One plain sentence underneath says what is left and whether the mortgage is within the plan.

**Offer card.** Three figures when an offer fits the plan. When none does: one danger-toned sentence, then "Change my plan" (primary) and "Show homes I can afford" (secondary, opens Homes with the "Within my plan" chip pressed).

**Weight sliders.** Native range inputs with the accent colour, 0 to 10, with the share as a percentage beside the label. The shares always add up to 100%. Under them: the current top three and the ranking stability sentence.

**Checklist row.** A whole-row label with a hidden checkbox, a 30px round check mark, the item and its help text, and a status on the right: what the listing says, "Not confirmed", "Confirmed", "To do" or "Done". Rows group under the National Trading Standards parts with their own heading.

**Market chart.** One row per postcode and property type on a shared £0 scale with round £200,000 steps. The bar is the middle half of sales, the 12px dot (with a 2px `--page` ring) is the median, the 2px vertical line is the most the plan allows. Faint vertical gridlines at each step, no axis line. A key above names all three marks. The table below carries every value, so the chart is never the only way to read a figure.

**Toast.** Bottom centre, `#143c30` fill, accent border, 2.6 seconds, `role="status"`.

## Motion

- Colour, background and border changes: 150ms ease.
- Pressed feedback: buttons and chips scale to 0.98 for 100ms ease-out on `:active`.
- The disclosure chevron rotates over 150ms.
- The toast fades and rises 20px over 150ms.
- Route changes scroll to the top smoothly.
- Under `prefers-reduced-motion: reduce`, transitions are removed, the pressed scale is off and scrolling jumps.

No entrance animations, no parallax, no animated numbers.

## Behaviour rules

- Nothing leaves the browser. No fonts, scripts or images from other sites, no analytics, no API keys. Selection and checklist ticks are kept in `localStorage` and the page still works when storage is blocked.
- One budget calculation (`assessBudget` in `calculator.js`) feeds the Homes list, the Plan page, the Review page and the fit score, so they always agree.
- The default sort is "Within my plan first": homes the plan can afford, then the rest, each by fit score.
- Touch targets are at least 44px. Keyboard focus is always visible. No horizontal page scroll at 375px; wide tables scroll inside their own frame.
- Typographic apostrophes (’) in visible copy.

## Banned here

- Gradient fills, glows, glass panels and decorative blur.
- KPI tiles, stat-card rows and big-number hero blocks.
- Uppercase eyebrows, uppercase badges and section numbers.
- Icons in coloured circles or tiles, and emoji.
- A coloured left or right border thicker than 1px on any card or row.
- Status colour on every row of a list, and status colour used for a non-status series.
- Dashed gridlines, dual axes and more than one hue in a chart.
- Fonts or scripts loaded from another site at runtime.
- Monospace for anything that is not copied.
- Fixed-width layouts that scroll the page sideways on a phone.
