# Inventory Management Screen

This task adds a dedicated INVENTORY MANAGEMENT screen to the `/companion/midgame` crafting calculator, so the user can prepare/update the owned quantity of all materials in one place (typically before a play session) instead of editing them one card at a time. It builds on the merged calculator, recipe editor, clickable components, card improvements, and user-created targets (PRs #8â€“#12). Keep `/` and `/companion` unchanged. Do NOT add screenshot scanning or any AI/LLM calls. Do NOT change the Phase A calculation math.

## Problem

Today, owned quantities are edited per material card, scattered across the drill-down. There is no single place to review and set inventory for many materials at once. The user wants to fill in the owned quantity of all the important materials in one screen up front, so the calculator is working from accurate numbers during play.

Note: a compact "Quick inventory edit" control already exists (single material dropdown + value). This task is a fuller, dedicated screen, not a replacement of the drill-down editing â€” both stay.

## Goal

A dedicated inventory screen listing ALL known materials, each with an editable owned-quantity field and a search box to focus on specific items.

## The inventory screen

* **Entry point:** a clear button on the main calculator screen (e.g. "Manage inventory" near the CRAFTING TARGET selector). Clicking it opens the inventory screen; the user can return to the calculator.
* **List:** every material the app knows (all components AND raw materials from the recipe graph plus any user-created items/materials). Each row shows: the material name (with its fallback tile), and an editable owned-quantity field.
* **Search/filter:** a search box at the top to filter the list by name, so the user can focus on a specific material quickly (the list can be long).
* **Editing:** the user types an owned quantity per material. Values are saved immediately (auto-save) to the shared world inventory under `mgc:world:tagback:v1` via the existing `tagBackStorage.mjs` adapter â€” the SAME inventory the calculator reads, so any target opened afterward reflects the updated numbers.
* Validation: accept non-negative numbers only; ignore invalid input; never write NaN or negative.
* Changing inventory here must recompute the calculator when the user returns to it (the calculator reads the same stored inventory).

## Constraints

* This is inventory ENTRY only. Do NOT auto-decrement or auto-modify inventory based on crafting in this task â€” this screen only lets the user set owned quantities directly. (The "Crafted" auto-adjust button is a separate, later improvement.)
* Reuse the Phase A engine for any calculation; do not reimplement math.
* Keep it usable, not a cramped spreadsheet: a clean, readable list with comfortable tap targets. It is fine to show many rows; the search box is the primary way to narrow down.
* No copyrighted Palworld artwork; fallback tiles remain the default.
* Full keyboard support: the search box and every quantity field are focusable and editable via keyboard; accessible contrast; reduced-motion respected; responsive on mobile (single column, large fields) and desktop.
* All other persisted data (recipes, selected target, quantity, milestones, user-created targets) preserved. TAG World stays separate from Old World.

## Save this brief into the repo

Save this entire brief as `briefs/inventory-screen.md` in the repository, in the same pull request, and confirm it appears in the PR file list on GitHub.

## Tests and build

Add unit tests for: reading the full material list for the screen, saving an edited quantity to the shared inventory and reading it back, search/filter narrowing the list, and rejection of negative/invalid input. Do not retest core Phase A math.

Run all unit tests and the production build. Do NOT claim browser or mobile testing (verified by the user in the Vercel preview). Do NOT claim screenshot recognition.

## Delivery

Work on a new branch, push it, open a pull request, do not merge automatically.

At the end report:

* The PR link
* Files added or changed
* Test results and production-build results
* Confirmation that the inventory screen writes to the SAME shared inventory the calculator reads (numbers stay in sync)
* Confirmation that no auto-decrement/crafting logic was added (entry only)
* Confirmation that the Phase A engine is consumed, not reimplemented
* Confirmation that all persisted data is preserved and `/` and `/companion` are unchanged
* Confirmation that `briefs/inventory-screen.md` appears in the PR file list
* Whether the PR is awaiting merge

