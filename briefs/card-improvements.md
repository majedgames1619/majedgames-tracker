# Midgame component-card improvements

Continue working on `majedgames1619/majedgames-tracker`.

This is a small UX improvement task for the `/companion/midgame` crafting calculator. It builds on the merged calculator, recipe editor, and clickable-components work (PRs #8, #9, #10). Keep `/` and `/companion` unchanged. Do NOT add screenshot scanning or any AI/LLM calls. Do NOT change the Phase A calculation math — read the engine as before.

Both changes below apply to the component cards in the "Direct components" view and use the existing Phase A engine result and the existing `tagBackStorage.mjs` adapter under `mgc:world:tagback:v1`. Do not overwrite recipes, selected target, quantity, or milestone data.

## Improvement 1 — "Ready" completed badge on cards

When a card is complete (owned Have is greater than or equal to Need, i.e. Craft is 0), show a clear completed state so the user can see it at a glance without reading the numbers:

* A distinct badge such as "✓ Ready" (or "✓ Done") and a subtle green accent on the card.
* This must COEXIST with other status badges, not replace them. Example: an item can be both PROTECTED and complete — in that case show both the protected badge and the completed indicator clearly. Do not let one hide the other.
* Keep the existing status colors/badges for Missing, Recipe Needed, Protected. Only add the completed treatment; do not remove existing states.
* Use the ✓ mark via a safe method (JSX numeric entity or a proper icon), not a raw pasted glyph, to avoid encoding/mojibake issues.

## Improvement 2 — "Gather" quick-add field (permanent add to inventory)

Problem this solves: while gathering a raw material, the user needs to know how much is still needed without doing mental math. Example: Have 10, Need 236; the user gathers 147 and wants to see the remaining amount immediately.

Add a small "Gather" input to each material card (near the Have field):

* The user types how many units they just gathered (e.g. 147) and confirms (Enter or a small add button).
* On confirm, that amount is ADDED PERMANENTLY to the material's owned Have (10 + 147 = 157) and saved through `tagBackStorage.mjs` under `mgc:world:tagback:v1`. This is a permanent inventory update, NOT a temporary session counter — the user chose permanent so calculations stay correct across all targets that share the material.
* After adding, the whole screen recomputes immediately (current level Have/Need/Craft, breadcrumbs' numbers, and the What to Gather summary), and the Gather input clears and is ready for another entry.
* Validation: only accept a positive number; ignore empty/invalid input. Adding must never produce a negative or NaN Have.
* The existing "Quick inventory edit" control (which sets an absolute Have value) stays as-is. Gather is a separate additive shortcut, not a replacement — one sets the total, the other adds to it.
* Keep it compact so the card does not become cluttered; the Gather field should be visually secondary to the Have/Need/Craft numbers.

## Constraints

* Reuse the Phase A engine for all recalculation; do not reimplement math.
* No copyrighted Palworld artwork; fallback tiles remain the default.
* Full keyboard support: the Gather input is focusable and confirmable via Enter; the completed badge is purely visual. Accessible contrast for the new green completed state; reduced-motion respected; responsive on mobile and desktop.
* All persisted data (recipes, inventory, target, quantity, milestones) preserved.

## Save this brief into the repo

Save this entire brief as `briefs/card-improvements.md` in the repository, in the same pull request, and confirm it appears in the PR file list on GitHub.

## Tests and build

Add unit tests for: the completed-state derivation (Have >= Need → completed; and completed + protected both flagged), and the Gather add logic (adds to Have, rejects non-positive input, recomputes shortage). Do not retest core Phase A math.

Run all unit tests and the production build. Do NOT claim browser or mobile testing (verified by the user in the Vercel preview). Do NOT claim screenshot recognition.

## Delivery

Work on a new branch, push it, open a pull request, do not merge automatically.

At the end report:

* The PR link
* Files added or changed
* Test results and production-build results
* Confirmation that Gather adds permanently and persists, and that the absolute "Quick inventory edit" still works separately
* Confirmation that the completed badge coexists with protected/other states
* Confirmation that the Phase A engine is consumed, not reimplemented
* Confirmation that all persisted data is preserved and `/` and `/companion` are unchanged
* Confirmation that `briefs/card-improvements.md` appears in the PR file list
* Whether the PR is awaiting merge
