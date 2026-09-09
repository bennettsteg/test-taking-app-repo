import { describe, expect, it } from "vitest";
import { gradeAttempt, type QuestionForGrading } from "./grading";

const questions: QuestionForGrading[] = [
  {
    id: 1,
    options: [
      { id: 10, isCorrect: false },
      { id: 11, isCorrect: true },
    ],
  },
  {
    id: 2,
    options: [
      { id: 20, isCorrect: true },
      { id: 21, isCorrect: false },
    ],
  },
];

describe("gradeAttempt", () => {
  it("scores all-correct submissions", () => {
    const result = gradeAttempt(questions, [
      { questionId: 1, selectedOptionId: 11 },
      { questionId: 2, selectedOptionId: 20 },
    ]);

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(2);
    expect(result.responses.every((r) => r.isCorrect)).toBe(true);
  });

  it("scores a mix of correct and incorrect answers", () => {
    const result = gradeAttempt(questions, [
      { questionId: 1, selectedOptionId: 10 },
      { questionId: 2, selectedOptionId: 20 },
    ]);

    expect(result.correctCount).toBe(1);
    expect(result.responses.find((r) => r.questionId === 1)?.isCorrect).toBe(false);
    expect(result.responses.find((r) => r.questionId === 2)?.isCorrect).toBe(true);
  });

  it("treats a missing response as incorrect rather than throwing", () => {
    const result = gradeAttempt(questions, [{ questionId: 1, selectedOptionId: 11 }]);

    expect(result.correctCount).toBe(1);
    const unanswered = result.responses.find((r) => r.questionId === 2);
    expect(unanswered?.isCorrect).toBe(false);
    expect(unanswered?.selectedOptionId).toBeNull();
  });

  it("treats an option id from another question as incorrect", () => {
    const result = gradeAttempt(questions, [{ questionId: 1, selectedOptionId: 20 }]);

    expect(result.responses.find((r) => r.questionId === 1)?.isCorrect).toBe(false);
  });
});
