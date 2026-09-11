# Site Redesign: Crimson UI, Nav Restructure, and Hand-Authored Test Creation

Status: done (8a133f6)

## Problem Statement

The app's current UI is unstyled default Tailwind with no brand identity, and navigation
is minimal — a single title link plus one "Upload Test" button. More importantly, there
is exactly one way to create a Test: uploading a JSON file that the user must first get
an external AI to generate. There's no way to build a Test directly inside the app, and
nothing about the interface reflects the University of Alabama branding the user wants.

## Solution

Restyle the app in a crimson/black/dark-grey/white palette, replace the current header
with a persistent nav bar (Home / Create New Test / View Existing Tests), split test
creation into two explicit paths behind "Create New Test" (JSON Upload, unchanged, and a
new Hand-Authored Creation form), and tighten the multiple-choice options constraint to
2–4, enforced identically across both creation paths and documented for externally
AI-generated JSON Uploads.

## User Stories

1. As a user, I want a persistent nav bar with Home, Create New Test, and View Existing Tests on every page, so that I can move between the app's core actions without hunting for links.
2. As a user, I want the nav bar and interface styled in a crimson/black/dark-grey/white palette, so that the app feels branded rather than generic.
3. As a user, I want a fixed light theme with no automatic dark mode, so that the brand palette stays consistent regardless of my system settings.
4. As a user, I want to click "Home" and land on a lightweight welcome page distinct from my test list, so that I have a clear starting point separate from browsing existing Tests.
5. As a user, I want to click "View Existing Tests" and see the same Library I have today (list of Tests, click through to detail/take/attempts), so that my existing workflow for taking tests isn't disrupted by the redesign.
6. As a user, I want to click "Create New Test" and be presented with a choice between "Create by Hand" and "Upload JSON", so that I can pick the creation path that fits the Test I have in mind.
7. As a user, I want the "Upload JSON" choice to behave exactly like today's upload flow, so that my existing external-AI-to-JSON workflow keeps working unchanged.
8. As a user, I want to build a Test directly in the app via "Create by Hand" without writing any JSON myself, so that I can create simple Tests without leaving the app or invoking an external AI.
9. As a user, I want to enter a title and optional description for a hand-authored Test, so that the created Test carries the same identifying information a JSON Upload would.
10. As a user, I want to add questions to a hand-authored Test one at a time via an "Add Question" button, so that I can build up a Test of any length.
11. As a user, I want to pick each question's type (multiple-choice or true/false) before entering its content, so that the form only shows the fields relevant to that type.
12. As a user, I want to type a prompt for each question, so that the question text is captured.
13. As a user, I want to add and remove multiple-choice options (2 to 4 per question) via a per-question control, so that I can shape each question's answer set within the app's supported range.
14. As a user, I want to mark the correct multiple-choice option with a radio button next to its text field, so that I never have to type the correct answer separately and risk it not matching an option.
15. As a user, I want a true/false question to offer exactly two radio buttons (True/False) to mark the correct answer, so that marking correctness is consistent with how multiple-choice questions work.
16. As a user, I want an optional explanation field per question, so that I can add review context shown on the graded results page, matching what JSON Upload already supports.
17. As a user, I want to remove a question I've added, so that I can correct mistakes before submitting.
18. As a user, I want the "Create Test" submit button to stay disabled until every required field (title, each prompt, each option text, a marked correct answer per question) is filled in, so that I can't submit an incomplete Test and get a confusing server-side error.
19. As a user, I want submitting a hand-authored Test to create the same kind of Test record as a JSON Upload (with the same grading behavior), so that hand-authored Tests and uploaded Tests are indistinguishable once created.
20. As a user, I want to be redirected to the new Test's detail page after either creation path succeeds, so that I land somewhere useful immediately after creating a Test.
21. As a user, I want multiple-choice questions to be capped at 4 options regardless of which creation path I use, so that the constraint is consistent and I can't create via JSON Upload a Test that Hand-Authored Creation couldn't produce.
22. As a user, I want the README's documented JSON format to state the 2–4 option range, so that when I prompt an external AI to generate a Test, the AI produces JSON that will pass validation.
23. As a user, I want uploading a JSON file with more than 4 options on a multiple-choice question to be rejected with a clear validation error, so that I find out immediately rather than after grading breaks.

## Implementation Decisions

- **Nav bar**: persistent global bar replacing the current header in the root layout. Three items — Home, Create New Test, View Existing Tests. "Upload Test" is removed as a standalone nav item; it's reached only via Create New Test.
- **Color palette**: crimson nav-bar background with white text; black for primary buttons and headings; white page background; mid-grey for secondary text and borders. No dark-mode variant — remove the existing `prefers-color-scheme` handling in favor of one fixed theme.
- **Home page**: new route with lightweight landing/dashboard content, distinct from the Library — not a copy of the test list.
- **View Existing Tests**: relocates today's Library page (test list → detail → take/attempts) under the new nav structure. Behavior is unchanged; no new search/filter/sort.
- **Create New Test**: new choice page presenting two options, Create by Hand and Upload JSON.
  - Upload JSON routes to the existing upload flow/component, unchanged.
  - Create by Hand is a new form: a single scrollable page (title/description at top, stacked question cards below, `+ Add Question` at the bottom), not a multi-step wizard.
- **Hand-Authored Creation data flow**: the form holds an in-memory draft matching the question shape (type, prompt, options-with-correct-flag or boolean, optional explanation). A new pure function — `buildTestImport(draft) → TestImport` (indicative naming) — transforms that draft into the exact `TestImport` JSON shape already accepted by `POST /api/tests`. The form submits that function's output to the existing endpoint; no new API route or database logic.
  - Multiple-choice: the correct answer is chosen via a radio button next to each option's text field, never typed as separate free text — this structurally prevents the "correctAnswer doesn't match any option" failure mode JSON Upload is exposed to.
  - True/false: two radio buttons, labeled True/False.
  - Multiple-choice options: minimum 2, maximum 4 per question — the same constraint as the schema change below, not a separate UI-only limit.
  - The `Create Test` submit control is disabled (no inline error messages) until every required field across every question is filled in.
- **Schema change** (`src/lib/test-import-schema.ts`): `multipleChoiceQuestionSchema.options` gets `.max(4)` added alongside the existing `.min(2)`, enforced for both creation paths since both go through `testImportSchema`.
  - Regenerate `schema/test-import.schema.json` via `npm run schema:generate`.
  - Update `README.md`'s field table (currently "At least 2 options, all unique") to state the 2–4 range, and update any AI-prompting instructions describing the format so externally-generated JSON respects the cap.

## Testing Decisions

- Test external behavior (input → output), not implementation details — consistent with the existing `grading.test.ts` / `test-import-schema.test.ts` style: plain Vitest, no mocking, no DOM rendering.
- New seam: `buildTestImport(draft) → TestImport` (naming indicative) is the single unit under test for Hand-Authored Creation.
  - A draft with a multiple-choice question and a marked-correct option produces a `TestImport` whose `correctAnswer` matches an entry in `options`.
  - A draft with a true/false question produces the boolean `correctAnswer` shape.
  - The function's output passes `testImportSchema.safeParse` for valid drafts.
- Extend `test-import-schema.test.ts` with cases for the new `.max(4)` constraint: a 4-option question passes; a 5-option question fails with a validation issue.
- No component/DOM tests for the nav bar, color restyle, page layout, or button-disabled behavior — this repo has no component-testing setup, and these are presentation concerns verified manually by running the dev server.

## Out of Scope

- Editing or deleting an existing Test's questions after creation (both creation paths remain create-only, matching today's app).
- Save-as-draft / resuming an in-progress hand-authored Test.
- Drag-and-drop reordering of questions or options.
- Search, filter, or sort on the View Existing Tests / Library page.
- A dark-mode variant of the new color palette.
- Any change to grading logic, attempt submission, or the `AttemptResponse`/`TestAttempt` data model.
- Raising or otherwise changing the multiple-choice minimum-options constraint (stays at 2).

## Further Notes

- This spec came out of a grilling + domain-modeling session. The resolved vocabulary
  (`Test Import`, `JSON Upload`, `Hand-Authored Creation`, `Library`) is recorded in
  `CONTEXT.md` at the repo root and should be used in code, comments, and follow-up
  tickets.
- The `.max(4)` schema change is a real constraint on the shared contract, not a
  UI-only limit — it will reject any JSON Upload with 5+ options on a multiple-choice
  question, including for Tests generated from external AI prompts that predate the
  README update.
- No ADR was written for the options cap: it's trivially reversible (a schema
  constraint, no migration involved) and doesn't meet the "hard to reverse" bar the
  domain-modeling skill uses to gate ADRs.
