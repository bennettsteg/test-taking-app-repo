# 03: Multiple-choice options capped at 2–4 (shared schema + README + tests)

**What to build:** Tighten the Test Import contract so a multiple-choice question may
have at most 4 options (in addition to the existing minimum of 2). This is a real
constraint on the shared schema, not a UI-only limit — it applies identically to JSON
Upload and (once built) Hand-Authored Creation, and rejects any JSON Upload with 5+
options with a clear validation error. Regenerate the JSON Schema doc from the Zod
schema, and update the README's documented field table (and any AI-prompting
instructions describing the format) to state the 2–4 range so externally-generated JSON
respects the cap.

**Blocked by:** None (can start immediately)

**Status:** done (8a133f6)

- [ ] A multiple-choice question with 4 options passes validation
- [ ] A multiple-choice question with 5 options fails validation with a clear issue
      message
- [ ] `schema/test-import.schema.json` is regenerated from the updated Zod schema
- [ ] README's field table and any AI-prompting format instructions state the 2–4 option
      range
- [ ] Vitest cases cover both the 4-option pass and 5-option failure
