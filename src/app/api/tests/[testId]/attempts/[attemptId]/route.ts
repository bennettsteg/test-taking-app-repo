import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string; attemptId: string }> },
) {
  const { testId, attemptId } = await params;
  const testIdNum = parseId(testId);
  const attemptIdNum = parseId(attemptId);
  if (testIdNum === null || attemptIdNum === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptIdNum, testId: testIdNum },
    select: {
      id: true,
      status: true,
      totalQuestions: true,
      correctCount: true,
      startedAt: true,
      completedAt: true,
      test: { select: { id: true, title: true } },
      responses: {
        select: {
          isCorrect: true,
          selectedOptionId: true,
          question: {
            select: {
              id: true,
              prompt: true,
              type: true,
              orderIndex: true,
              explanation: true,
              options: { select: { id: true, text: true, isCorrect: true } },
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const questions = attempt.responses
    .map((response) => ({
      questionId: response.question.id,
      prompt: response.question.prompt,
      type: response.question.type,
      orderIndex: response.question.orderIndex,
      explanation: response.question.explanation,
      options: response.question.options,
      selectedOptionId: response.selectedOptionId,
      isCorrect: response.isCorrect,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return NextResponse.json({
    id: attempt.id,
    status: attempt.status,
    totalQuestions: attempt.totalQuestions,
    correctCount: attempt.correctCount,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    test: attempt.test,
    questions,
  });
}
