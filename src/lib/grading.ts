export type OptionForGrading = {
  id: number;
  isCorrect: boolean;
};

export type QuestionForGrading = {
  id: number;
  options: OptionForGrading[];
};

export type SubmittedResponse = {
  questionId: number;
  selectedOptionId: number | null;
};

export type GradedResponse = SubmittedResponse & {
  isCorrect: boolean;
};

export type GradingResult = {
  totalQuestions: number;
  correctCount: number;
  responses: GradedResponse[];
};

export function gradeAttempt(
  questions: QuestionForGrading[],
  submittedResponses: SubmittedResponse[],
): GradingResult {
  const responsesByQuestionId = new Map(
    submittedResponses.map((response) => [response.questionId, response]),
  );

  const responses: GradedResponse[] = questions.map((question) => {
    const submitted = responsesByQuestionId.get(question.id) ?? {
      questionId: question.id,
      selectedOptionId: null,
    };

    const selectedOption = question.options.find(
      (option) => option.id === submitted.selectedOptionId,
    );

    return {
      questionId: question.id,
      selectedOptionId: submitted.selectedOptionId,
      isCorrect: selectedOption?.isCorrect ?? false,
    };
  });

  const correctCount = responses.filter((response) => response.isCorrect).length;

  return {
    totalQuestions: questions.length,
    correctCount,
    responses,
  };
}
