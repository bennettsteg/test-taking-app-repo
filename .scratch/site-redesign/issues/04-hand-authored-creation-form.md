# 04: Hand-Authored Creation form

**What to build:** A single scrollable form (title/description at top, stacked question
cards below, "+ Add Question" at the bottom) reachable via "Create by Hand," letting the
user build a Test entirely inside the app without writing any JSON. Per question, the
user picks a type (multiple-choice or true/false) before entering content, types a
prompt, and marks the correct answer via radio button — for multiple-choice, next to
each option's text field (2–4 options, addable/removable, matching the cap from ticket
03); for true/false, via two True/False radios. Each question has an optional
explanation field. Questions can be removed before submitting. The submit button stays
disabled (no inline error messages) until every required field across every question is
filled in — title, each prompt, each option text, and a marked correct answer per
question.

Submitting assembles the draft into the same Test Import JSON shape JSON Upload produces
via a new pure `buildTestImport(draft) → TestImport` function, and submits it through the
existing `POST /api/tests` endpoint — no new API route or database logic. On success, the
user is redirected to the new Test's detail page, and the resulting Test is
indistinguishable from one created via JSON Upload (same grading behavior).

**Blocked by:** 02 ("Create New Test" choice page, with Upload JSON routed through it),
03 (Multiple-choice options capped at 2–4)

**Status:** ready-for-agent

- [ ] "Create by Hand" reaches the new form
- [ ] User can add/remove questions, pick each question's type, and see only the fields
      relevant to that type
- [ ] Multiple-choice: add/remove options within 2–4, mark the correct one via radio
      button next to its text field (never typed as separate free text)
- [ ] True/false: exactly two radio buttons (True/False) mark the correct answer
- [ ] Optional per-question explanation field is captured
- [ ] Submit stays disabled until every required field is filled in across all questions
- [ ] `buildTestImport(draft) → TestImport` is unit-tested: a multiple-choice draft
      produces a `correctAnswer` matching an entry in `options`; a true/false draft
      produces the boolean `correctAnswer` shape; output passes `testImportSchema.safeParse`
      for valid drafts
- [ ] Submitting creates a Test via the existing `POST /api/tests` endpoint and redirects
      to its detail page on success
