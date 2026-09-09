# Test Taking App

A personal app for creating and taking practice tests. This glossary covers the
vocabulary around how a Test comes into existence and how it's browsed — not the
grading/attempt model, which is documented in `prisma/schema.prisma`'s comments.

## Language

**Test Import**:
The canonical JSON shape (`title`, `description`, `questions`) validated by
`testImportSchema` and accepted by `POST /api/tests`. Both creation paths below produce
exactly this shape before submitting — there is no separate code path per origin.
_Avoid_: upload payload, test JSON (ambiguous with the generated JSON Schema doc)

**JSON Upload**:
A creation path where the user supplies a file that is already a Test Import, typically
produced by prompting an external AI. The app only validates and stores it.
_Avoid_: bulk import, file import

**Hand-Authored Creation**:
A creation path where the user builds the Test directly in a form (one question at a
time, with type, prompt, and answers), and the form assembles a Test Import in the
browser before submitting it through the same endpoint as JSON Upload.
_Avoid_: manual test creation, by-hand test, form import

**Library**:
The page listing every existing Test, reached via the nav bar's "View Existing Tests."
From here the user opens a Test's detail page to take it or review past attempts.
_Avoid_: test list, dashboard (Home is the dashboard-like landing page; Library is
specifically the list of Tests)
