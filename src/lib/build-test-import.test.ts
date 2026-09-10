import { describe, expect, it } from "vitest";
import { buildTestImport, type TestDraft } from "./build-test-import";
import { testImportSchema } from "./test-import-schema";

const validDraft: TestDraft = {
  title: "Cell Biology Midterm",
  description: "Chapters 3-5 review",
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      prompt: "Which organelle is the site of ATP production?",
      options: [
        { id: "o1", text: "Nucleus" },
        { id: "o2", text: "Mitochondria" },
        { id: "o3", text: "Golgi apparatus" },
      ],
      correctOptionId: "o2",
      explanation: "Mitochondria produce ATP via oxidative phosphorylation.",
    },
    {
      id: "q2",
      type: "true_false",
      prompt: "The cell membrane is composed of a phospholipid bilayer.",
      correctAnswer: true,
      explanation: "",
    },
  ],
};

describe("buildTestImport", () => {
  it("produces a correctAnswer matching an option for a multiple_choice draft", () => {
    const result = buildTestImport(validDraft);
    const question = result.questions[0];
    expect(question.type).toBe("multiple_choice");
    if (question.type !== "multiple_choice") throw new Error("expected multiple_choice");
    expect(question.options).toEqual(["Nucleus", "Mitochondria", "Golgi apparatus"]);
    expect(question.correctAnswer).toBe("Mitochondria");
    expect(question.options).toContain(question.correctAnswer);
  });

  it("produces a boolean correctAnswer for a true_false draft", () => {
    const result = buildTestImport(validDraft);
    const question = result.questions[1];
    expect(question.type).toBe("true_false");
    if (question.type !== "true_false") throw new Error("expected true_false");
    expect(question.correctAnswer).toBe(true);
  });

  it("omits empty explanation rather than sending an empty string", () => {
    const result = buildTestImport(validDraft);
    expect(result.questions[1].explanation).toBeUndefined();
  });

  it("produces output that passes testImportSchema.safeParse", () => {
    const result = testImportSchema.safeParse(buildTestImport(validDraft));
    expect(result.success).toBe(true);
  });

  it("omits an empty top-level description", () => {
    const draft: TestDraft = { ...validDraft, description: "" };
    const result = buildTestImport(draft);
    expect(result.description).toBeUndefined();
  });
});
