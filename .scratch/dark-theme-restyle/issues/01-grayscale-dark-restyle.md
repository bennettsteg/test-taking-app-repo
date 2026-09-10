# 01: Grayscale dark theme restyle

**What to build:** Replace the current crimson/white light theme with a pure grayscale
dark theme (near-black background, dark-grey surfaces, light-grey hover fill, white
text), drop crimson entirely, retint grading correct/incorrect colors for the dark
background, and switch body/heading font from Geist Sans to Source Serif 4. Full details
in `../spec.md`.

**Blocked by:** None

**Status:** in-progress

- [ ] `globals.css` defines the new token set (`background`, `surface`,
      `surface-hover`, `border`, `muted`, `foreground`, `foreground-invert`) and no
      crimson tokens remain
- [ ] `layout.tsx` uses Source Serif 4 (via `next/font/google`) instead of Geist
      Sans/Mono; body renders white text on the near-black background
- [ ] `NavBar` uses `bg-surface` (not crimson) with hover-fill nav links
- [ ] `TestCard`, `QuestionCard`, `ScoreSummary` use dark surfaces/borders; `QuestionCard`
      selected-but-ungraded state uses a white border; `showResult` correct/incorrect use
      retinted green/red
- [ ] `UploadForm`, `HandAuthoredForm`, `TakeTestClient` buttons follow the
      primary(filled)/secondary(outline) pattern, both converging to light-grey-fill +
      dark-text on hover; form inputs stay on the dark surface through hover/focus,
      brightening only the border on focus; error text is `text-red-400`
      instead of `text-red-600`
- [ ] Every other page (`page.tsx`, `tests/page.tsx`, `tests/create/*`,
      `tests/[testId]/*`) has all `text-black`/`text-neutral-*`/`bg-white`/`bg-black`/
      `border-neutral-*`/`crimson` classes replaced with the new tokens
- [ ] `npm run build`, `npm run lint`, and `npm test` all pass
- [ ] Manually verified in the dev server: default, hover, focus, selected, and
      graded-correct/incorrect states on the take-test and attempt-result pages

## Comments
