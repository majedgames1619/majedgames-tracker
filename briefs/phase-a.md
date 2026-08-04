Continue working on majedgames1619/majedgames-tracker.

This task is Phase A only: the crafting-data foundation and calculation engine. Do not redesign the UI and do not implement screenshot scanning in this phase. Preserve the current /companion/midgame page behavior. Only make the minimum integration changes required for the existing page to keep working while consuming the extracted data.

First inspect the current main branch and the implementations merged through PR #4 AND PR #5. Treat BOTH as the current source of truth: PR #4 for the TAG World inventory, known recipes, priorities, and protected resources; PR #5 for the existing /companion/midgame milestone board and its Next Move logic. Do not invent or overwrite any values that already exist. Phase A must coexist cleanly with the merged milestone board and must not break it.

The milestone board (PR #5) already uses the localStorage key `mgc:world:tagback:v1`. The recipe/inventory data in this phase must share that same key and world namespace so the two do not conflict or overwrite each other's data.

## Goal

Extract the existing recipes and inventory calculations out of UI components into a reusable, structured recipe graph, and build a reliable recursive crafting calculator that later UI work (Phase B) can consume without touching the math.

## Data model

The structured graph must support:

* Buildings and craftable items
* Crafted components that require other components
* Raw resources
* Recipe input quantities AND output quantity per craft (yield)
* Inventory quantities
* Protected resources
* Incomplete or unknown recipes
* Separate world profiles

Keep TAG World completely separate from Old World. No Old World inventory, recipes, or progress may leak into TAG World.

Treat "Red Ore" as the user-facing nickname for Coralum Ore, but keep raw Coralum Ore and finished Coralum Ingots as two separate inventory items.

### Raw vs. incomplete — these are different states, do not merge them

A node with no recipe can mean two opposite things, and they must be handled separately:

* **Raw resource:** has no recipe because it is gathered. Raw resources must be EXPLICITLY tagged as raw in the data. These are the only items allowed to appear in the final "What to Gather" shortage list.
* **Incomplete recipe:** an item that is NOT tagged raw and has no recipe entered yet. This is unknown data, not a gatherable. It must appear in the incomplete list and must NEVER be assumed to be raw or placed in the gather summary.

Rule: missing recipe + tagged raw = gatherable. Missing recipe + not tagged raw = incomplete. Never guess a missing recipe.

## Calculation engine

Build pure, deterministic, reusable functions (no React, no UI, no side effects) that:

* Calculate Have / Need / Missing for a target and every node beneath it
* Handle recipe yield greater than 1 correctly: to produce N missing units of an item that yields Y per craft, the number of crafts is ceil(N / Y); multiply the recipe INPUTS by the number of crafts, not by N. Any surplus produced (crafts * Y - N, between 0 and Y-1) is tracked as available so a sibling branch can consume it instead of crafting more.
* Subtract owned inventory at the correct level before expanding a branch
* Avoid double-counting shared inventory: when several branches require the same material, compute total demand once against the available units so the same owned units are never subtracted twice
* Preserve already-owned crafted inventory and only expand the remaining shortage
* Produce a final raw-resource shortage list containing ONLY items tagged raw
* Detect and stop circular recipe references (A needs B needs A) without infinite loops or crashing
* Handle incomplete recipes by branch: if a node's recipe is incomplete, compute everything else normally, mark THAT branch incomplete, and surface it — one incomplete node must not poison or invalidate the whole result. Do not return a confident shortage number for a branch that depends on unknown data.
* Identify protected resources required by a target

### Protected-resource semantics

A protected resource that the user owns is still counted as AVAILABLE for the math (warn-but-subtract), but is flagged in the result so Doc can warn the user before they consume it. Protected does not mean "held back from the calculation" — it means "usable, but the user must be warned that crafting this target will consume a protected material." Surface which protected resources a given target would consume and how many.

### Frozen result contract

Return one stable result object shape that Phase B and Doc can rely on without renegotiation. At minimum:

* target (id + resolved name)
* per-node breakdown: id, name, have, need, missing, isRaw, isProtected, isIncomplete
* rawShortages: list of raw items still needed with quantities
* incomplete: list of nodes whose recipe is unknown
* protectedRequired: protected resources this target would consume, with quantities
* circular: flag/list if any circular reference was detected

All list outputs (rawShortages, incomplete, protectedRequired, per-node lists) must be returned in a stable, sorted order so results are deterministic and tests are not flaky.

## Doc boundary

Prepare the structured result interface above so Phase B can build Doc on top of it, but do NOT add an LLM or any external AI call in this phase. Doc is intended to be rules-based, reading only the recipe graph, current inventory, target priorities, readiness, shortages, and protected-resource rules.

## Persistence

The live page already uses the localStorage key `mgc:world:tagback:v1` (from PR #5). Inspect the existing application and report the exact saved-data shape stored under that key today.

Do not invent a new key. The recipe/inventory data must live under the same `mgc:world:tagback:v1` key and world namespace as the milestone board, without overwriting the milestone data already stored there. Because this phase changes no UI, the engine should read the existing key and shape as-is through a small adapter. First determine whether any migration is even necessary — if the current shape already works with the engine, no migration should be added. Only if the engine genuinely requires a new shape should you add a safe, versioned migration from the real existing key, and in that case the current TAG World inventory and progress must be preserved exactly. Defer any key or schema change that would require rewiring the UI to Phase B, when the UI changes anyway.

## Images

Do not add copyrighted Palworld artwork in Phase A. The later UI should assume the default artwork state is a generated visual fallback (colored tile/icon plus item name). Image paths may exist as optional metadata, but missing artwork must never break anything. No image work is required in this phase beyond leaving room for optional metadata.

## Tests

Add unit tests covering at minimum:

* Single-level recipe calculation
* Multi-level recursive recipe calculation
* Recipe input multiplication by craft count
* Recipe yield greater than 1 (ceil craft count + surplus tracked as available)
* Owned crafted-component subtraction at the correct level
* Shared-resource deduplication / double-counting prevention
* Raw-resource shortage output contains only tagged-raw items
* Raw (gatherable) vs. incomplete (unknown) items are never conflated; incomplete items never appear in the gather list
* Incomplete branch is isolated: the rest of the result still computes, only that branch is flagged
* Protected-resource is counted as available but flagged, with correct consumed quantity
* Circular-recipe detection stops safely
* TAG World / Old World isolation
* Raw Coralum Ore remaining separate from Coralum Ingots
* Migration from the real existing localStorage format IF a migration was added (otherwise a test asserting the existing shape is read correctly)
* Deterministic sorted ordering of output lists

## Save this brief into the repo

As part of this task, create a `briefs/` folder at the repository root (if it does not exist) and save this entire task brief as `briefs/phase-a.md`. This keeps the project briefs versioned alongside the code so they are accessible from any machine. Include this file in the same pull request.

## Build and delivery

Run all unit tests and the production build. Do not claim browser testing or screenshot-recognition testing — neither is part of Phase A.

Work on a new branch, push it, and open a pull request. Do not merge automatically.

At the end report:

* The PR link
* Files added or changed
* Test results and production-build results
* The real localStorage key you found, and whether a migration was necessary (and why)
* Which recipes remain incomplete
* Confirmation that the existing UI (including the PR #5 milestone board) was not redesigned and still works
* Confirmation that `briefs/phase-a.md` was created in the repo
* Whether the PR is awaiting merge
