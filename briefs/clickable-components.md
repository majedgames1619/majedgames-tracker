# Clickable components

Continue working on `majedgames1619/majedgames-tracker`.

This is a small UX enhancement to the `/companion/midgame` crafting calculator. It builds on PR #8 (calculator) and PR #9 (recipe editor + raw-classification fix), which are already merged. Keep `/` and `/companion` unchanged. Do NOT add screenshot scanning or any AI/LLM calls. Do NOT change the Phase A calculation math.

## Goal

The game is an interlocking chain: every product needs components, and those components need components. Each material already resolves to its own node/page in the calculator. Right now, only components that HAVE a recipe are clickable to drill into; components without a recipe show "Recipe Needed" (a dead end) and force the user to hunt for the item in the recipe-editor dropdown.

Make navigation uniform: EVERY component name/card is clickable and takes the user to that item's own page — so the user never has to search the dropdown to reach an item they can already see on screen.

## Behaviour

When the user clicks any component name/card in the "Direct components" list (or anywhere an item name appears as a node):

- **If the item has a recipe:** navigate into it as the current node, showing its own direct components. (This already works — keep it, and make sure the whole card, not just a small area, is the click target, with the item name clearly clickable.)
- **If the item is INCOMPLETE ("Recipe Needed"):** navigate to that item's page and open its Recipe Editor there, pre-targeted to that item, so the user can fill its recipe immediately without opening the dropdown and searching. After saving, stay on that item's page and show its now-known direct components, so the user can continue drilling down the chain. The breadcrumb trail must update so the user can jump back to the original goal at any time.
- **If the item is a genuine raw material (explicitly `isRaw`):** it remains an end-of-branch leaf and is NOT clickable for drill-down. Show it clearly as raw. (Do not turn raw leaves into editor entry points; only Incomplete items open the editor.)

## Breadcrumbs and context

- Every navigation step (into a recipe OR into an incomplete item's editor page) pushes onto the breadcrumb trail, e.g. `AI Core → Computer → Corrosive Solvent (here)`.
- Each breadcrumb remains clickable to jump back to that level.
- The "What to Gather" summary continues to reflect the ORIGINAL target and quantity, not the current node, and recomputes after any recipe is saved.
- Keep a plain Back control as well.

## Constraints

- Reuse the existing Recipe Editor from PR #9 — do not build a second editor. This task only changes how the editor is REACHED (by clicking an incomplete item inline) and ensures the whole card/name is a navigation target.
- Reuse the Phase A engine for all calculations; do not reimplement math.
- All state (user recipes, inventory, selected target, quantity, milestones) continues to persist under `mgc:world:tagback:v1` via the existing `tagBackStorage.mjs` adapter, with nothing overwritten.
- No copyrighted Palworld artwork; fallback tiles remain the default.
- Full keyboard support: component cards/names must be focusable and activable with Enter/Space, and the editor opened this way must be keyboard-usable. Accessible contrast; reduced-motion respected; responsive on mobile and desktop.

## Save this brief into the repo

Save this entire brief as `briefs/clickable-components.md` in the repository, in the same pull request, and confirm it appears in the PR file list on GitHub.

## Tests and build

Add unit tests for the click-target routing logic: given an item's state (has-recipe / incomplete / raw), the click resolves to the correct action (drill-in / open-editor-for-item / no-op leaf). Do not retest core Phase A math.

Run all unit tests and the production build. Do NOT claim browser or mobile testing (verified by the user in the Vercel preview). Do NOT claim screenshot recognition.

## Delivery

Work on a new branch, push it, open a pull request, do not merge automatically.

At the end report:

- The PR link
- Files added or changed
- Test results and production-build results
- Confirmation that the existing Recipe Editor (PR #9) is reused, not duplicated
- Confirmation that raw leaves stay non-clickable and only Incomplete items open the editor
- Confirmation that breadcrumbs update correctly and What to Gather still reflects the original target
- Confirmation that all persisted data is preserved
- Confirmation that `/` and `/companion` are unchanged
- Confirmation that `briefs/clickable-components.md` appears in the PR file list
- Whether the PR is awaiting merge
