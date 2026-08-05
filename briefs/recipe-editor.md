# In-app recipe editor and explicit raw classification

Continue working on `majedgames1619/majedgames-tracker`.

This task adds an in-app RECIPE EDITOR to the `/companion/midgame` crafting calculator, and fixes a raw-material classification bug. Keep `/` and `/companion` unchanged. Do NOT add screenshot scanning or any AI/LLM calls. Do NOT change the Phase A calculation math except for the one classification fix described below.

## Background

The calculator (PR #8) lets the user pick a target and drill through its crafting chain, reading the merged Phase A engine (`craftingCalculator.mjs`, `recipeGraph.mjs`, `tagBackStorage.mjs`) under localStorage key `mgc:world:tagback:v1`. Many recipes are still unknown. Instead of hardcoding them, the user wants to enter recipes themselves, in-app, during play — building their own recipe database that persists to the next session.

## Part 1 — Fix the raw-material classification bug (do this first)

There is a correctness bug: some items that are actually CRAFTED (they have a recipe in the game) are being shown as "raw material — end of branch" simply because their recipe is not yet entered. Example observed: "Corrosive Solvent" (craftable from Venom Gland + Sulfur) displays as a raw material.

Fix the rule so it matches the Phase A design principle: an item is treated as raw ONLY if it is EXPLICITLY tagged as raw in the recipe graph. An item that is not tagged raw and has no recipe must be treated as INCOMPLETE ("Recipe Needed"), NEVER silently assumed to be raw.

Steps:

1. Inspect `recipeGraph.mjs` and report how raw materials are currently distinguished (is there an explicit flag like `isRaw`/`type: "raw"`, or are raw items inferred from "has no recipe"?).
2. If raw is inferred from "no recipe", change it to require an explicit raw flag. Audit the current graph and explicitly tag the genuine raw/gathered resources (ores, wood, stone, fiber, water, etc.) so they still behave as raw.
3. After the fix: an untagged item with no recipe shows "Recipe Needed" and offers the "Add recipe" action from Part 2 — it must NOT show "raw material — end of branch".
4. Add/adjust unit tests: a crafted-but-unknown item resolves to Incomplete (not raw); a genuinely tagged raw item still resolves to raw. Do not weaken existing Phase A tests.

## Part 2 — Recipe Editor

Let the user add or edit a recipe for any item directly in the UI.

### Entry points

- On any node showing "Recipe Needed", show an "Add recipe" button.
- On any node that already has a recipe, show an "Edit recipe" button.

### Editor fields

For the item being edited, the user can specify:

- **Components:** one or more rows, each = a material chosen from a dropdown + a required quantity. The dropdown lists all materials the engine already knows (from the recipe graph and inventory).
- **Add new material:** if a needed component is not in the dropdown, allow creating a new material by name inline, which is then selectable. New materials default to "Recipe Needed" (untagged, no recipe) so they can be defined later — do NOT auto-tag them as raw.
- **Yield / output quantity:** how many units one craft produces (default 1), so the engine's existing yield handling works.
- **Crafting station (optional):** a field for the machine it's made in (e.g. Ancient Furnace, Advanced Workshop, Production Assembly Line II). This fills the optional `station` metadata already added in PR #8. Leave blank if unknown — do not require it.
- **Mark as raw (explicit):** a clear, separate toggle to mark this item as a raw/gathered resource instead of giving it a recipe. This is the ONLY way an item becomes raw. Use sparingly; it is for genuine gathered resources.

### Behaviour

- Saving a recipe writes it into the user's recipe data and immediately recomputes the calculator (current level, breadcrumbs, and What to Gather).
- Editing is validated: quantities are positive numbers; an item cannot be its own direct component (basic self-reference guard). The Phase A engine already handles deeper circular detection — rely on it, do not duplicate it.
- The user can edit or remove a recipe later.

## Persistence (critical)

User-entered recipes must persist across sessions, stored under the same world namespace `mgc:world:tagback:v1` via the existing `tagBackStorage.mjs` adapter, WITHOUT overwriting inventory, selected target, or milestone data already stored there.

Important design point: the base recipe graph shipped in the repo (`recipeGraph.mjs`) is global/base data. User-entered recipes are per-world overrides/additions. Store them separately (e.g. a `userRecipes` section within the world's saved state) and merge them over the base graph at read time, so:

- The user's own recipes survive app updates that change the base graph.
- A future screenshot-import phase can write into the same user-recipe store.

Report the exact storage shape you use.

## Data notes

- Treat "Red Ore" as the nickname for Coralum Ore; keep raw Coralum Ore separate from Coralum Ingot.
- Do not pre-fill or guess any of the currently-unknown recipes (Carbon Fiber, Cement, Circuit Board, Coralum Ingot, Pal Metal Ingot, Plasteel, Refined Ingot, Soralite Ingot). The user will enter them via the editor.

## Images / accessibility / safety

- No copyrighted Palworld artwork. Fallback tiles (color/letters) remain the default for any new materials too.
- Full keyboard support for the editor (dropdowns, add/remove component rows, save/cancel), accessible contrast, reduced-motion respected, responsive on mobile and desktop.
- TAG World stays separate from Old World. All reads/writes go through the shared adapter/key.

## Save this brief into the repo

Save this entire task brief as `briefs/recipe-editor.md` in the repository, in the same pull request, alongside the existing briefs. Confirm it appears in the PR's file list on GitHub.

## Tests and build

Add unit tests for: the raw-vs-incomplete classification fix (Part 1), saving/merging a user recipe over the base graph, and the self-reference validation guard. Do not retest core Phase A math beyond the classification change.

Run all unit tests and the production build. Do NOT claim browser or mobile testing (verified by the user in the Vercel preview). Do NOT claim screenshot recognition.

## Delivery

Work on a new branch, push it, open a pull request, do not merge automatically.

At the end report:

- The PR link
- Files added or changed
- Test results and production-build results
- How raw materials were distinguished BEFORE the fix, and how they are distinguished AFTER
- The exact storage shape used for user-entered recipes
- Confirmation that the Phase A engine is consumed, not reimplemented (aside from the classification fix)
- Confirmation that inventory, selected target, and milestone data are all preserved
- Confirmation that `/` and `/companion` are unchanged
- Confirmation that `briefs/recipe-editor.md` was created and appears in the PR file list
- Whether the PR is awaiting merge
