# 02: "Create New Test" choice page, with Upload JSON routed through it

**What to build:** Clicking "Create New Test" in the nav bar shows a choice between two
creation paths: "Create by Hand" and "Upload JSON." Selecting "Upload JSON" routes to
today's upload flow, restyled to match the new palette but otherwise functionally
unchanged (including its existing redirect to the new Test's detail page on success).

"Create by Hand" may point at a route that doesn't exist yet (404) — it's built out in
ticket 04.

**Blocked by:** 01 (Restyle app + persistent nav bar + Home page + relocated Library)

**Status:** ready-for-agent

- [ ] "Create New Test" in the nav bar reaches a choice page presenting "Create by Hand"
      and "Upload JSON"
- [ ] "Upload JSON" reaches the existing upload flow, restyled, with unchanged behavior
      (file validation errors, success redirect to the new Test's detail page)
- [ ] The standalone "Upload Test" nav item from the old header no longer exists —
      upload is reached only via Create New Test
