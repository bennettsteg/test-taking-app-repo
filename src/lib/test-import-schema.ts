import { z } from "zod";

const multipleChoiceQuestionSchema = z.object({
  type: z.literal("multiple_choice"),
  prompt: z.string().min(1, "prompt is required"),
  options: z
    .array(z.string().min(1, "option text cannot be empty"))
    .min(2, "multiple_choice questions need at least 2 options"),
  correctAnswer: z.string().min(1, "correctAnswer is required"),
  explanation: z.string().optional(),
});

const trueFalseQuestionSchema = z.object({
  type: z.literal("true_false"),
  prompt: z.string().min(1, "prompt is required"),
  correctAnswer: z.boolean(),
  explanation: z.string().optional(),
});

export const questionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
]);

export const testImportSchema = z
  .object({
    title: z.string().min(1, "title is required"),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1, "at least one question is required"),
  })
  .superRefine((test, ctx) => {
    test.questions.forEach((question, index) => {
      if (question.type !== "multiple_choice") return;

      const trimmedOptions = question.options.map((option) => option.trim());
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== trimmedOptions.length) {
        ctx.addIssue({
          code: "custom",
          message: `Question ${index + 1}: options must be unique`,
          path: ["questions", index, "options"],
        });
      }

      const correctAnswer = question.correctAnswer.trim();
      if (!trimmedOptions.includes(correctAnswer)) {
        ctx.addIssue({
          code: "custom",
          message: `Question ${index + 1}: correctAnswer "${question.correctAnswer}" does not match any option`,
          path: ["questions", index, "correctAnswer"],
        });
      }
    });
  });

export type TestImport = z.infer<typeof testImportSchema>;
export type QuestionImport = z.infer<typeof questionSchema>;

export type OptionInput = { text: string; isCorrect: boolean };

/**
 * true_false questions have no explicit options in the import format, but the DB
 * grades every question via a selected question_option row. Materialize a synthetic
 * True/False pair so both question types share one grading path.
 */
export function toOptionInputs(question: QuestionImport): OptionInput[] {
  if (question.type === "multiple_choice") {
    const correctAnswer = question.correctAnswer.trim();
    return question.options.map((option) => ({
      text: option,
      isCorrect: option.trim() === correctAnswer,
    }));
  }

  return [
    { text: "True", isCorrect: question.correctAnswer === true },
    { text: "False", isCorrect: question.correctAnswer === false },
  ];
}
