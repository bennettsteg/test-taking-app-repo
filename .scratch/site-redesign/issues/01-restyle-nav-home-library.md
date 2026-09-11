# 01: Restyle app + persistent nav bar + Home page + relocated Library

**What to build:** Restyle the app in the crimson/black/dark-grey/white palette with a
fixed light theme (no dark-mode variant). Replace the current header with a persistent
nav bar present on every page, with three links: Home, Create New Test, View Existing
Tests. Add a new, lightweight Home page distinct from the Library (welcome/landing
content, not a copy of the test list). Relocate today's Library (test list → detail →
take/attempts) to live under "View Existing Tests" in the new nav structure, with its
behavior unchanged — no new search/filter/sort.

The "Create New Test" nav link may point at a route that doesn't exist yet (404) — it's
built out in ticket 02.

**Blocked by:** None (can start immediately)

**Status:** done (8a133f6)

- [ ] Every page renders the persistent nav bar with Home / Create New Test / View
      Existing Tests links
- [ ] The app uses the crimson/black/dark-grey/white palette throughout; the existing
      `prefers-color-scheme` / dark-mode handling is removed so the palette stays fixed
      regardless of system theme
- [ ] Home is a new route with lightweight landing content, reachable from the nav bar
      and distinct from the Library
- [ ] "View Existing Tests" reaches the existing Library flow (list → detail →
      take/attempts) with behavior unchanged from today
- [ ] Existing Library/detail/take/attempts pages pass their current functionality
      unmodified (only styling and routing location change)
