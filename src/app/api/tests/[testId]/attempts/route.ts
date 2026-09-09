import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gradeAttempt } from "@/lib/grading";

function parseTestId(testId: string) {
  const id = Number(testId);
  return Number.isInteger(id) ? id : null;
}

const submitAttemptSchema = z.object({
  startedAt: z.iso.datetime(),
  responses: z.array(
    z.object({
      questionId: z.number().int(),
      selectedOptionId: z.number().int().nullable(),
    }),
  ),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const id = parseTestId(testId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid test id" }, { status: 400 });
  }

  const attempts = await prisma.testAttempt.findMany({
    where: { testId: id },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      status: true,
      totalQuestions: true,
      correctCount: true,
      startedAt: true,
      completedAt: true,
    },
  });

  return NextResponse.json(attempts);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const id = parseTestId(testId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid test id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = submitAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const questions = await prisma.question.findMany({
    where: { testId: id },
    select: {
      id: true,
      options: { select: { id: true, isCorrect: true } },
    },
  });

  if (questions.length === 0) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const grading = gradeAttempt(questions, parsed.data.responses);

  const attempt = await prisma.testAttempt.create({
    data: {
      testId: id,
      status: "completed",
      totalQuestions: grading.totalQuestions,
      correctCount: grading.correctCount,
      startedAt: new Date(parsed.data.startedAt),
      completedAt: new Date(),
      responses: {
        create: grading.responses.map((response) => ({
          questionId: response.questionId,
          selectedOptionId: response.selectedOptionId,
          isCorrect: response.isCorrect,
        })),
      },
    },
    select: { id: true, totalQuestions: true, correctCount: true },
  });

  return NextResponse.json(attempt, { status: 201 });
}
