Continue working on majedgames1619/majedgames-tracker.

This task is Phase B1 only: the visual crafting tracker and the rules-based Doc panel, built ON TOP OF the Phase A engine that is already merged. Do NOT implement the deep click-through crafting-chain drill-down in this phase (that is Phase B2). Do NOT implement screenshot scanning (that is Phase C). Do NOT reimplement or change the calculation math — import and call the existing Phase A engine.

## Source of truth

main now contains PR #4 (recipes + TAG World inventory), PR #5 (the /companion/midgame milestone board), and PR #6 (the Phase A crafting engine). Inspect all three. This phase is a UI layer that consumes the Phase A engine modules already in the repo:

* `app/companion/midgame/data/recipeGraph.mjs`
* `app/companion/midgame/data/craftingCalculator.mjs`
* `app/companion/midgame/data/tagBackStorage.mjs`

All crafting math (have/need/missing, recursive shortages, yield handling, protected flags, raw-vs-incomplete, circular detection) already lives in `craftingCalculator.mjs` and is tested. Do not duplicate it in the UI. If the UI needs a number, get it from the engine.

Continue using the same localStorage key and world namespace as the existing app: `mgc:world:tagback:v1`. Do not overwrite the milestone data already stored there. Read and write through the existing `tagBackStorage.mjs` adapter.

## Goal

Redesign the `/companion/midgame` page into a visual, card-based crafting tracker with a connected Doc panel. Replace the text-heavy layout with images/fallback tiles, large cards, simple numbers, and strong status states. Long explanations go under collapsed "Read More" sections. Keep `/` and `/companion` unchanged.

Keep the existing milestone board, but demote it to SUPPORTING information (a secondary section, tab, or drawer) — it is no longer the main interface.

## First-screen experience

When the page opens, the user should immediately see, without scrolling into detail:

* The current crafting target, shown as a large visual card: image or fallback tile, name, quantity needed, quantity owned, quantity remaining to craft, a simple progress bar, and a clear status.
* A horizontal row of the target's first-level required components, each as a card showing its own Have / Need / Missing. (In Phase B1 these are informative display cards, NOT drill-down links — do not make them look clickable or lead to dead ends. The interactive drill-down is Phase B2.)
* A short Doc recommendation (one line, actionable).
* An "Upload Inventory Screenshots" entry point rendered as a clearly labeled, DISABLED "coming soon" placeholder. Do not implement upload and do not claim it works — it is wired in Phase C.

Everything else is progressively disclosed via tabs, drawers, or "Read More."

## Status states

Each target/component card shows one strong, visually distinct status derived from the engine result:

* **Ready** — everything needed is owned or craftable from owned materials.
* **Missing Materials** — raw or crafted shortages exist.
* **Protected Resource Required** — crafting this would consume a protected resource. (Protected is counted as available but flagged, per the Phase A engine.)
* **Recipe Needed** — the item or one of its inputs has an incomplete/unknown recipe (one of the eight currently-incomplete ingots). Show this clearly instead of a misleading number, and make it obvious which recipe is missing so the user knows which screenshot to add next. Do NOT guess the recipe.

## Target selection

Let the user select their current crafting target from the known craftable items and buildings in the recipe graph. Persist the selected target in `mgc:world:tagback:v1` alongside the existing data (do not overwrite milestones).

## What to Gather

Surface the engine's raw-resource shortage list (`rawShortages`) as a clear, actionable "What to Gather" summary — raw materials only, with quantities. This is a primary output of the page, not buried. Items with incomplete recipes must appear under a separate "Recipe Needed" note, never mixed into the gather list.

## Doc panel (rules-based, no AI)

Build Doc as a rules-based panel that reads ONLY the Phase A engine result, current inventory, milestone state, and protected-resource flags. No LLM, no external AI call.

Provide large, simple action buttons:

* What should I do next?
* What can I craft now?
* What is blocking me?
* What should I gather tonight?
* What resources should I protect?

Each answer is SHORT and actionable at the top. Detailed reasoning, tips, and longer text go under a collapsed "Read More." Doc's advice must recompute immediately whenever the target or inventory changes.

## Layout

* Desktop: two-column layout — visual tracker on one side, Doc panel on the other, both visible together.
* Mobile: simple tabs or large controls for **Tracker**, **Ask Doc**, and **Inventory**.

Updating the tracker or inventory must immediately recalculate Doc's advice.

## Inventory (manual editing only in this phase)

Provide a simple manual inventory editor as the ONLY inventory input in Phase B1 (the screenshot scanner is Phase C). Editing inventory writes through `tagBackStorage.mjs` under the shared key and immediately recalculates the tracker and Doc. Do not build a spreadsheet-like table as the main experience — keep it a clean, minimal editor behind a tab or drawer.

## Images

Do NOT add copyrighted Palworld artwork. The default artwork state is a generated visual fallback (a colored tile or icon plus item name), and every card must be usable with only the fallback. Image paths may exist as optional metadata, but missing artwork must never create broken cards. Each card should be recognizable by its fallback color/shape and name.

## Data safety

TAG World is the active profile and must stay completely separate from Old World. Do not copy or reference any Old World data. All reads/writes go through the shared `mgc:world:tagback:v1` key via the existing adapter, preserving the milestone board data already stored there.

## Accessibility and responsiveness

* Full keyboard support for all interactive controls.
* Accessible color contrast for all status states.
* Respect reduced-motion preferences.
* Responsive layout that works on mobile and desktop.

## Save this brief into the repo

Save this entire task brief as `briefs/phase-b1.md` in the repository, in the same pull request, alongside the existing `briefs/phase-a.md`.

## Tests and build

Add unit tests for any pure UI-helper logic you introduce, for example: status derivation (Ready / Missing Materials / Protected Resource Required / Recipe Needed) from an engine result, and Doc answer selection from an engine result. Do not retest the Phase A math — it is already covered.

Run all unit tests and the production build. Do NOT claim browser testing or mobile testing — those are verified by the user in the Vercel preview. Do NOT claim screenshot recognition — it is not part of this phase.

## Delivery

Work on a new branch, push it, and open a pull request. Do not merge automatically.

At the end report:

* The PR link
* Files added or changed
* Test results and production-build results
* Confirmation that the Phase A engine is consumed (imported), not reimplemented, in the UI
* Confirmation that the milestone board (PR #5) still works and was demoted to supporting information
* Confirmation that `/` and `/companion` are unchanged
* Confirmation that no screenshot scanning, no drill-down, and no AI/LLM calls were added
* Confirmation that `briefs/phase-b1.md` was created
* Whether the PR is awaiting merge
