# Phase B2 — Single-target crafting calculator

Continue working on `majedgames1619/majedgames-tracker`.

This task replaces the current `/companion/midgame` visual layout (from PR #7 / Phase B1) with a focused single-target crafting CALCULATOR. Keep `/` and `/companion` unchanged. Do NOT implement screenshot scanning (that is a later phase). Do NOT reimplement or change the calculation math — import and call the existing Phase A engine.

## Why this change

The Phase B1 layout was more complex than the user needs. The real goal is a calculator that reduces in-game stop-and-search: the user picks a target, and the app shows — in one place — what they have, what to craft, and what raw materials to gather, with the ability to drill down through the crafting chain without losing sight of the goal.

## Source of truth

`main` contains PR #4 (recipes + TAG World inventory), PR #5 (milestone board), PR #6 (Phase A engine), and PR #7 (Phase B1 UI). Inspect all of them. This task is a UI redesign that consumes the Phase A engine modules already in the repo:

- `app/companion/midgame/data/recipeGraph.mjs`
- `app/companion/midgame/data/craftingCalculator.mjs`
- `app/companion/midgame/data/tagBackStorage.mjs`

All crafting math (have/need/craft, recursive shortages, yield handling, protected flags, raw-vs-incomplete, circular detection, shared-demand deduplication) already lives in `craftingCalculator.mjs` and is tested. Do NOT duplicate it in the UI. If the UI needs a number, get it from the engine.

Continue using the same localStorage key and world namespace: `mgc:world:tagback:v1`, through the existing `tagBackStorage.mjs` adapter. Do not overwrite the milestone data already stored there. The milestone board (PR #5) must still work; keep it as a secondary section, tab, or drawer.

## The calculator screen (core of this task)

### 1. Target selector

The user picks a target (any craftable item, component, OR building/machine — anything in the recipe graph, not only "final" products) and a quantity (default 1). Persist the selected target and quantity in `mgc:world:tagback:v1` alongside existing data.

### 2. Current level view

Show the selected target's DIRECT components as a row/list of cards. Each card shows, using the engine result:

- Component name (+ optional image, fallback tile if none)
- **Have** (owned, from inventory)
- **Need** (required for the chosen target and quantity)
- **Craft** (the shortfall to make)
- A clear status color: Ready (have ≥ need), Missing (need more), Recipe Needed (recipe unknown/incomplete), Protected (crafting consumes a protected resource).

### 3. Drill-down navigation

Each component that HAS a recipe is clickable. Clicking it descends one level: the screen now shows that component as the current node, with ITS direct components (Have / Need / Craft each). The user can keep clicking down the chain until reaching raw resources (which have no recipe and are tagged raw). Components with an incomplete recipe are NOT clickable — show them as "Recipe Needed" instead of a dead end.

### 4. Breadcrumbs (must-have)

A breadcrumb trail at the top always shows the path from the original target to the current node, e.g. `AI Core → Computer → Circuit Board → (here)`. Each breadcrumb is clickable to jump back to that level. This directly solves the user's real problem of getting lost in the tree and forgetting the original goal. Also provide a plain Back control.

### 5. What to Gather summary (must-have)

Always visible (below the current level, not hidden behind clicks): the engine's full raw-resource shortage list for the ORIGINAL target and quantity — every raw material still needed, summed once across the whole tree, in stable sorted order. Raw materials only. Items with incomplete recipes appear under a separate "Recipe Needed — can't fully compute" note, never mixed into the gather list. This is the "collect all of this in one trip" output.

### 6. Required machine hint

If the current node's recipe specifies a crafting station, show a small hint such as "Made in: Ancient Furnace" or "Made in: Advanced Workshop". The recipe graph may not yet have station data for every item; where it is missing, simply omit the hint (do not guess). If the graph has no station field, add an OPTIONAL station field to the recipe schema so this data can be filled in later without breaking anything.

### 7. Fast manual inventory edit

The user's inventory changes constantly while playing. Make editing a material's owned quantity fast and always reachable — for example, an inline editable "Have" number on each card, or a compact inventory drawer. Editing writes through `tagBackStorage.mjs` under the shared key and immediately recomputes the whole screen (current level, breadcrumbs' numbers, and the What to Gather summary). Inventory is a single total quantity per material (the user sums split stacks themselves). Do not build a large spreadsheet-style table.

## Data notes for this world

- Inventory is one total number per material.
- Treat "Red Ore" as the nickname for Coralum Ore; keep raw Coralum Ore separate from Coralum Ingot.
- The following recipes are currently INCOMPLETE and must render as "Recipe Needed", never guessed: Carbon Fiber, Cement, Circuit Board, Coralum Ingot, Pal Metal Ingot, Plasteel, Refined Ingot, Soralite Ingot. (These will be filled in later from screenshots.)
- Do not add or change recipe numbers in this task unless a value is already present in the merged recipe graph. This task is UI; recipe data is added separately.

## Images

Do NOT add copyrighted Palworld artwork. Default artwork is a generated fallback tile (color/icon + name). Every card must be fully usable with only the fallback. Image paths are optional metadata; missing artwork must never break a card.

## Data safety

TAG World is the active profile, completely separate from Old World. All reads/writes go through `mgc:world:tagback:v1` via the existing adapter, preserving the milestone board data already stored there.

## Accessibility and responsiveness

- Full keyboard support for the selector, drill-down cards, breadcrumbs, and inventory editing.
- Accessible color contrast for all status states.
- Respect reduced-motion preferences.
- Responsive: works on mobile (single column, large tap targets) and desktop.

## Save this brief into the repo

Save this entire task brief as `briefs/phase-b2-calculator.md` in the repository, in the same pull request, alongside the existing briefs.

## Tests and build

Add unit tests for any pure UI-helper logic you introduce, for example: deriving a card's status (Ready / Missing / Recipe Needed / Protected) from an engine result, and building the breadcrumb path / What-to-Gather list from an engine result. Do not retest the Phase A math — it is already covered.

Run all unit tests and the production build. Do NOT claim browser testing or mobile testing — those are verified by the user in the Vercel preview. Do NOT claim screenshot recognition — it is not part of this task.

## Delivery

Work on a new branch, push it, and open a pull request. Do not merge automatically.

At the end report:

- The PR link
- Files added or changed
- Test results and production-build results
- Confirmation that the Phase A engine is consumed (imported), not reimplemented
- Confirmation that the milestone board (PR #5) still works and remains available as secondary info
- Confirmation that `/` and `/companion` are unchanged
- Confirmation that no screenshot scanning and no AI/LLM calls were added
- Which recipes still render as "Recipe Needed"
- Confirmation that `briefs/phase-b2-calculator.md` was created
- Whether the PR is awaiting merge
