import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScoreSummary } from "@/components/ScoreSummary";
import { QuestionCard } from "@/components/QuestionCard";

export default async function AttemptResultPage({
  params,
}: {
  params: Promise<{ testId: string; attemptId: string }>;
}) {
  const { testId, attemptId } = await params;
  const testIdNum = Number(testId);
  const attemptIdNum = Number(attemptId);
  if (!Number.isInteger(testIdNum) || !Number.isInteger(attemptIdNum)) notFound();

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptIdNum, testId: testIdNum },
    select: {
      id: true,
      totalQuestions: true,
      correctCount: true,
      completedAt: true,
      test: { select: { title: true } },
      responses: {
        select: {
          selectedOptionId: true,
          isCorrect: true,
          question: {
            select: {
              id: true,
              prompt: true,
              orderIndex: true,
              explanation: true,
              options: { select: { id: true, text: true, isCorrect: true } },
            },
          },
        },
      },
    },
  });

  if (!attempt) notFound();

  const questions = [...attempt.responses].sort(
    (a, b) => a.question.orderIndex - b.question.orderIndex,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{attempt.test.title}</h1>
        <p className="text-sm text-neutral-500">
          Completed {new Date(attempt.completedAt).toLocaleString()}
        </p>
      </div>

      <ScoreSummary
        correctCount={attempt.correctCount}
        totalQuestions={attempt.totalQuestions}
      />

      <div className="space-y-4">
        {questions.map((response, index) => (
          <QuestionCard
            key={response.question.id}
            index={index + 1}
            prompt={response.question.prompt}
            options={response.question.options}
            selectedOptionId={response.selectedOptionId}
            showResult
            explanation={response.question.explanation}
          />
        ))}
      </div>
    </div>
  );
}
