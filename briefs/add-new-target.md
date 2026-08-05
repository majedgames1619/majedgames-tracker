# Add new target

This task adds an "Add new target" feature to the `/companion/midgame` crafting calculator, so the user can create a brand-new building/item (that does not yet exist in the app) and use it as a crafting target. It builds on the merged calculator, recipe editor, clickable components, and card improvements (PRs #8–#11). Keep `/` and `/companion` unchanged. Do NOT add screenshot scanning or any AI/LLM calls. Do NOT change the Phase A calculation math.

## Problem

Today the recipe editor only works on items that already exist in the app (the user clicks an existing item to define its recipe). There is no way to create a NEW building or item from scratch. Example: "Ancient Workbench" (a building requiring Soralite Ingot x50, AI Core x5, Bio Battery x20) is not in the app at all, so the user cannot add it or select it as a target.

## Goal

Let the user create a new target item from scratch and immediately select it in the calculator.

## Entry point

Add a clear "Add new target" (or "+ New item") button on the main calculator screen, near the CRAFTING TARGET selector at the top. Clicking it starts the creation flow.

## Creation flow

Reuse the EXISTING Recipe Editor from PR #9 — do not build a second editor. The new-target flow is just a new entry point into it, pre-set to create a new item. The user provides:

* **Name:** the new item's display name (e.g. "Ancient Workbench").
* **Type/category (optional):** a simple label such as Building/Machine, Item, or Component, used only for the small heading shown on the node (like the existing "BUILDING / MACHINE" label). If left blank, default to a neutral label. Do not let this affect the math.
* **Recipe:** the existing editor fields — component rows (material from dropdown + quantity), "add new material" for anything not yet known, yield (default 1), optional crafting station, and the explicit "mark as raw" toggle.
* On save, the new item is created in the user's per-world data and immediately becomes selectable in the CRAFTING TARGET dropdown, and can be opened as the current target showing its Have/Need/Craft breakdown.

## Persistence and data model

* Store the new item in the SAME per-world user data used by the recipe editor (`userRecipes` / user overrides) under `mgc:world:tagback:v1` via the existing `tagBackStorage.mjs` adapter, without overwriting inventory, selected target, quantity, milestones, or existing recipes.
* A user-created item is a normal graph node: it can be a target, can appear as a component of other items, can itself have incomplete components (which show "Recipe Needed" and are addable), and is included in recursive calculations by the existing Phase A engine.
* Reuse the existing self-reference guard and rely on the Phase A engine's circular-reference detection; do not duplicate math.
* The user can edit or delete a user-created target later (reuse existing edit/remove).

## Constraints

* Reuse the Phase A engine for all calculations; do not reimplement math.
* No copyrighted Palworld artwork; fallback tiles remain the default for new items too.
* Full keyboard support for the new-target button and the creation flow; accessible contrast; reduced-motion respected; responsive on mobile and desktop.
* All persisted data preserved; `/` and `/companion` unchanged.

## Save this brief into the repo

Save this entire brief as `briefs/add-new-target.md` in the repository, in the same pull request, and confirm it appears in the PR file list on GitHub.

## Tests and build

Add unit tests for: creating a new target item persists it and makes it selectable; a user-created item participates correctly in recursive calculation (as target and as a component); the self-reference guard still applies. Do not retest core Phase A math.

Run all unit tests and the production build. Do NOT claim browser or mobile testing (verified by the user in the Vercel preview). Do NOT claim screenshot recognition.

## Delivery

Work on a new branch, push it, open a pull request, do not merge automatically.

At the end report:

* The PR link
* Files added or changed
* Test results and production-build results
* Confirmation that the existing Recipe Editor is reused, not duplicated
* Confirmation that a user-created item is selectable as a target AND usable as a component
* Confirmation that the Phase A engine is consumed, not reimplemented
* Confirmation that all persisted data is preserved and `/` and `/companion` are unchanged
* Confirmation that `briefs/add-new-target.md` appears in the PR file list
- Whether the PR is awaiting merge
