import { describe, expect, it } from "vitest";
import { testImportSchema, toOptionInputs } from "./test-import-schema";

const validTest = {
  title: "Cell Biology Midterm",
  description: "Chapters 3-5 review",
  questions: [
    {
      type: "multiple_choice",
      prompt: "Which organelle is the site of ATP production?",
      options: ["Nucleus", "Mitochondria", "Golgi apparatus", "Ribosome"],
      correctAnswer: "Mitochondria",
      explanation: "Mitochondria produce ATP via oxidative phosphorylation.",
    },
    {
      type: "true_false",
      prompt: "The cell membrane is composed of a phospholipid bilayer.",
      correctAnswer: true,
    },
  ],
};

describe("testImportSchema", () => {
  it("accepts a valid test", () => {
    const result = testImportSchema.safeParse(validTest);
    expect(result.success).toBe(true);
  });

  it("rejects a multiple_choice question whose correctAnswer isn't one of the options", () => {
    const result = testImportSchema.safeParse({
      title: "Bad Test",
      questions: [
        {
          type: "multiple_choice",
          prompt: "Pick one",
          options: ["A", "B"],
          correctAnswer: "C",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate options on a multiple_choice question", () => {
    const result = testImportSchema.safeParse({
      title: "Bad Test",
      questions: [
        {
          type: "multiple_choice",
          prompt: "Pick one",
          options: ["A", "A"],
          correctAnswer: "A",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown question type", () => {
    const result = testImportSchema.safeParse({
      title: "Bad Test",
      questions: [{ type: "short_answer", prompt: "Explain photosynthesis" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a test with no questions", () => {
    const result = testImportSchema.safeParse({ title: "Empty Test", questions: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a true_false question with a non-boolean correctAnswer", () => {
    const result = testImportSchema.safeParse({
      title: "Bad Test",
      questions: [{ type: "true_false", prompt: "Is the sky blue?", correctAnswer: "true" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("toOptionInputs", () => {
  it("marks the matching option as correct for multiple_choice", () => {
    const options = toOptionInputs({
      type: "multiple_choice",
      prompt: "Pick one",
      options: ["A", "B", "C"],
      correctAnswer: "B",
    });

    expect(options).toEqual([
      { text: "A", isCorrect: false },
      { text: "B", isCorrect: true },
      { text: "C", isCorrect: false },
    ]);
  });

  it("builds synthetic True/False options for true_false questions", () => {
    const trueOptions = toOptionInputs({
      type: "true_false",
      prompt: "Is the sky blue?",
      correctAnswer: true,
    });
    expect(trueOptions).toEqual([
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ]);

    const falseOptions = toOptionInputs({
      type: "true_false",
      prompt: "Is the sky green?",
      correctAnswer: false,
    });
    expect(falseOptions).toEqual([
      { text: "True", isCorrect: false },
      { text: "False", isCorrect: true },
    ]);
  });
});
