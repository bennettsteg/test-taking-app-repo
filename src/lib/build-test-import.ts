import type { TestImport } from "./test-import-schema";

export type MultipleChoiceOptionDraft = {
  id: string;
  text: string;
};

export type QuestionDraft =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: MultipleChoiceOptionDraft[];
      correctOptionId: string | null;
      explanation: string;
    }
  | {
      id: string;
      type: "true_false";
      prompt: string;
      correctAnswer: boolean | null;
      explanation: string;
    };

export type TestDraft = {
  title: string;
  description: string;
  questions: QuestionDraft[];
};

/**
 * Assembles a Hand-Authored Creation draft into the same Test Import shape
 * JSON Upload produces, so both paths submit to POST /api/tests identically.
 */
export function buildTestImport(draft: TestDraft): TestImport {
  return {
    title: draft.title,
    description: draft.description.trim() === "" ? undefined : draft.description,
    questions: draft.questions.map((question) => {
      const explanation = question.explanation.trim() === "" ? undefined : question.explanation;

      if (question.type === "multiple_choice") {
        const correctOption = question.options.find(
          (option) => option.id === question.correctOptionId,
        );
        return {
          type: "multiple_choice" as const,
          prompt: question.prompt,
          options: question.options.map((option) => option.text),
          correctAnswer: correctOption?.text ?? "",
          explanation,
        };
      }

      return {
        type: "true_false" as const,
        prompt: question.prompt,
        correctAnswer: question.correctAnswer ?? false,
        explanation,
      };
    }),
  };
}
