# Companion Portal

This task rebuilds the `/companion` page into a clean, light-themed PORTAL with cards that lead to the app's sections. The existing calculator at `/companion/midgame` and its data MUST be left completely untouched. Keep `/` unchanged. Do NOT add screenshot scanning or any AI/LLM calls. Do NOT change the Phase A calculation math or any calculator behavior.

## Background

`/companion` currently shows an old placeholder landing page (five generic "paths": Build Base, Prepare Combat, Improve Workforce, Continue Adventure, Free Play) that predates the real product and is not used. The real product is the crafting calculator at `/companion/midgame`. The app is growing into a multi-section companion, so `/companion` should become a proper portal (home) with cards, one per section.

## Goal

Replace the old `/companion` landing content with a clean, light-themed portal showing section cards. One section is ready now (the calculator); two are placeholders for future work.

## The portal (`/companion`)

* **Theme:** LIGHT and clean — light background (white / light grey), dark readable text, soft rounded cards, gentle shadows, comfortable spacing. This is a deliberate departure from the dark calculator screen; the portal is the bright entry point. (The calculator's own dark styling stays as-is for now; only the portal is light. A later design pass will unify them.)
* **Header:** a simple title area (e.g. "MajedGames Companion") and a short subtitle. Leave visual room where a channel logo could later go, but do NOT add any logo/image now.
* **Cards (three):**
  1. **Crafting Planner** — READY. This is the existing calculator. The card links/navigates to `/companion/midgame`. Use the name "Crafting Planner" (NOT "calculator"), with a short description like "Plan any build, drill through its recipe chain, and see exactly what to gather."
  2. **Breeding** — COMING SOON. A visible card with a clear "Coming soon" badge; not clickable / disabled. Short placeholder description.
  3. **Combat Prep** — COMING SOON. Same treatment: visible, "Coming soon" badge, disabled. Short placeholder description.
* Cards are keyboard accessible; the ready card is focusable and activates with Enter; the coming-soon cards are clearly marked disabled and not focusable as links.

## Critical: do not touch the calculator or its data

* Do NOT modify `/companion/midgame`, its components, its recipe/inventory/engine files, or the localStorage key `mgc:world:tagback:v1`. All user data (recipes, inventory, targets, milestones, user-created items) MUST remain exactly as-is and fully intact.
* The Crafting Planner card simply NAVIGATES to the existing `/companion/midgame` route. Do not move, rename, or duplicate that route in this task. (Renaming the route/path is explicitly out of scope here to protect saved data.)
* The only place the name "Crafting Planner" is introduced is the portal card label. Renaming inside the calculator screen itself is out of scope for this task.

## Constraints

* No copyrighted artwork. No logo yet.
* Light theme applies to the `/companion` portal only; do not restyle `/companion/midgame` or `/`.
* Responsive: cards stack cleanly on mobile, arrange in a row/grid on desktop. Accessible contrast on the light theme; reduced-motion respected.

## Save this brief into the repo

Save this entire brief as `briefs/companion-portal.md` in the repository, in the same pull request, and confirm it appears in the PR file list on GitHub.

## Tests and build

Add unit tests where sensible (e.g. the portal renders the three cards with correct ready/coming-soon states; the ready card points to `/companion/midgame`). Do not add tests that touch calculator logic.

Run all unit tests and the production build. Do NOT claim browser or mobile testing (verified by the user in the Vercel preview). Do NOT claim screenshot recognition.

## Delivery

Work on a new branch, push it, open a pull request, do not merge automatically.

At the end report:

* The PR link
* Files added or changed
* Test results and production-build results
* Explicit confirmation that `/companion/midgame`, its data files, and the `mgc:world:tagback:v1` storage were NOT modified in any way
* Confirmation that `/` is unchanged
* Confirmation that the three cards render with correct states and the Crafting Planner card links to `/companion/midgame`
* Confirmation that `briefs/companion-portal.md` appears in the PR file list
* Whether the PR is awaiting merge
