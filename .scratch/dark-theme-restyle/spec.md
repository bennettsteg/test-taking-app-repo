# Dark Theme Restyle: Grayscale Palette, Light-Grey Hover

Status: done (31ab117)

## Problem Statement

The app currently uses the fixed light theme shipped in the previous redesign
(`.scratch/site-redesign/spec.md`, done in `8a133f6`): white background, black primary
buttons, and crimson as a permanent brand/accent color on the nav bar, links, and hover
borders. That spec explicitly chose "a fixed light theme with no automatic dark mode"
and listed a dark-mode variant as out of scope. The user now wants the opposite: a dark,
near-black theme with white text, and no crimson at all. This spec supersedes that
earlier color-palette decision; the earlier spec remains as a historical record of what
shipped in `8a133f6` (nav structure, Home/Library split, Hand-Authored Creation flow —
none of which change here).

## Solution

Restyle the app to a pure grayscale dark theme: a near-black page background, dark-grey
surfaces for buttons/cards/nav/inputs at rest, and a light-grey fill (with near-black
text) as the single, consistent hover state for every interactive element. Crimson is
removed entirely. The one deliberate exception to "grayscale only" is grading
correctness feedback (green/red), which carries real information beyond interactivity
and is kept, retinted for a dark background. Body/heading font switches from Geist Sans
to a serif (Source Serif 4) for a warmer, editorial feel closer to what the user
described as "Claude-like."

## User Stories

1. As a user, I want the page background to be a near-black dark grey, so that the app
   reads as a deliberately dark theme rather than a dim version of the light one.
2. As a user, I want buttons, cards, the nav bar, and form inputs to sit on a dark-grey
   surface distinct from the page background, so that interactive/content regions are
   visually separated from the page itself.
3. As a user, I want any interactive element (button, link, card-link, radio option row)
   to turn light-grey with near-black text when I hover it, so that hovering has one
   consistent, unambiguous meaning across the whole site.
4. As a user, I want all body text to be white by default, so that the theme is legible
   and consistent regardless of which page I'm on.
5. As a user, I want form inputs to keep their dark surface while I'm typing or hovering
   them — only the border brightens on focus — so that a hover-triggered background flip
   doesn't disrupt reading text I'm actively editing.
6. As a user, I want primary actions (Create Test, Submit) to look filled and secondary
   actions (Cancel, outline links) to look outlined at rest, so that I can tell the two
   apart before I hover anything.
7. As a user, I want graded results to still mark correct/incorrect answers in green/red
   (retinted for the dark background), so that I can scan my results at a glance.
8. As a user, I want a selected-but-ungraded answer (while taking a test) to show a
   distinct white border, so that "this is my current pick" doesn't rely on the hover
   state alone.
9. As a user, I want body and heading text set in a serif typeface instead of the
   current sans-serif, so that the app has a warmer, more editorial feel.
10. As a user, I want crimson removed from every surface it previously appeared on (nav
    bar background, link text, card-hover borders, remove/add-option controls), so that
    the palette is consistently grayscale with no leftover brand color.

## Implementation Decisions

- **Tokens** (`src/app/globals.css`, replacing the crimson/light tokens):
  ```
  --background:      #121212   page background
  --surface:          #262626   buttons/cards/nav/inputs at rest
  --surface-hover:    #d4d4d4   hover fill for interactive elements
  --border:           #3f3f3f   resting borders/dividers
  --muted:            #a3a3a3   secondary/de-emphasized text (descriptions, timestamps)
  --foreground:        #ffffff  default text
  --foreground-invert: #121212  text color when a surface lights up on hover
  ```
  Mapped into Tailwind v4's `@theme inline` block as `--color-background`,
  `--color-surface`, `--color-surface-hover`, `--color-border`, `--color-muted`,
  `--color-foreground`, `--color-foreground-invert`, giving `bg-*`/`text-*`/`border-*`
  utilities of the same names.
- **Hover rule**: every clickable element (buttons, text links, card-links, radio-option
  rows in `QuestionCard`) goes from its resting state to `bg-surface-hover` +
  `text-foreground-invert` on hover. No exceptions for plain text links — they get the
  same light-grey pill treatment instead of an underline.
- **Buttons**: primary = `bg-surface` at rest; secondary = transparent + `border-border`
  at rest. Both converge to `bg-surface-hover` + `text-foreground-invert` on hover.
  `disabled:opacity-50` pattern is kept as-is.
- **Form inputs** (`HandAuthoredForm`, `UploadForm`'s file input): `bg-surface` +
  `border-border` at rest, unchanged through hover; `focus:border-foreground` is the only
  focus/hover affordance — carved out of the general hover-fill rule.
- **Muted/secondary text**: anything previously `text-neutral-500`/`text-neutral-600`
  becomes `text-muted`.
- **Error/validation text**: previously `text-red-600` (assumes a white page); becomes
  `text-red-400` for legibility on the dark background. Applied uniformly to all
  error/validation-issue text (`UploadForm`, `HandAuthoredForm`, `TakeTestClient`).
- **Grading correctness** (`QuestionCard`, `showResult` mode): correct option gets
  `border-green-700 bg-green-950 text-green-300`; the incorrect selected option gets
  `border-red-700 bg-red-950 text-red-300`. This is the one place color still carries
  semantic meaning beyond interactivity.
- **Selected-but-ungraded answer** (`QuestionCard`, not `showResult`): `border-foreground`
  (white, 2px) instead of the old `border-black`; unselected rows use `border-border` at
  rest and the standard hover-fill on hover.
- **Radio input accent color**: native `<input type="radio">` gets
  `accent-color: var(--surface-hover)` globally so its check color matches the theme
  instead of the browser default blue/black.
- **Destructive actions** ("Remove" question/option buttons in `HandAuthoredForm`): no
  separate red-on-hover treatment. They get the same `text-muted` at rest →
  `bg-surface-hover`/`text-foreground-invert` hover pill as every other interactive text
  element, keeping the hover language uniform (the grading-color exception is narrowly
  about correctness feedback, not destructive actions).
- **Font**: `next/font/google`'s `Source_Serif_4` replaces `Geist` in
  `src/app/layout.tsx`, applied via the body's `font-family` (through the CSS variable),
  covering headings, body text, and buttons. `Geist_Mono` is removed — it was imported
  but never referenced by any `font-mono`/`font-sans` utility class in the codebase.
- **Nav bar** (`NavBar.tsx`): `bg-surface` instead of `bg-crimson`; links get the
  standard hover-fill pill instead of `hover:underline`.
- **Shadows**: `shadow-sm` on `TestCard` is dropped — shadows don't read well against a
  dark background; the `border-border` outline already provides enough definition.

## Testing Decisions

- No component/DOM tests for this change — this repo has no component-testing setup
  (see the earlier `site-redesign` spec's testing decisions), and this is a pure
  presentation change with no new logic. Verified by running the dev server and checking
  each page/state (default, hover, focus, selected, graded-correct, graded-incorrect,
  disabled) manually.
- `npm run build` (type-check), `npm run lint`, and `npm test` are run to confirm the
  className/JSX edits don't break compilation or the existing grading/schema unit tests
  (which are unaffected by this change but should still pass).

## Out of Scope

- Any change to the nav structure, page routing, Home/Library split, or Hand-Authored
  Creation flow — those are unchanged from `8a133f6`.
- A light/dark theme toggle — this is a full replacement of the previous fixed light
  theme with a new fixed dark theme, not a user-selectable mode.
- Any change to grading logic, attempt submission, or the data model.
- A dedicated `Button`/`Card` shared component — the codebase currently repeats utility
  class strings per-usage rather than extracting a component library; this change follows
  that existing convention rather than introducing new abstraction.

## Further Notes

- This spec came out of a grilling session (no domain-modeling changes were needed —
  this is a pure visual/style change, not a change to `Test`/`Question`/`Library`
  vocabulary, so `CONTEXT.md` is untouched).
- No ADR: this is a CSS token/JSX className change, trivially reversible, and doesn't
  meet the "hard to reverse" bar the domain-modeling skill uses to gate ADRs.
