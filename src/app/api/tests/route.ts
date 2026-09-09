import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { testImportSchema, toOptionInputs } from "@/lib/test-import-schema";

export async function GET() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  return NextResponse.json(
    tests.map((test) => ({
      id: test.id,
      title: test.title,
      description: test.description,
      createdAt: test.createdAt,
      questionCount: test._count.questions,
    })),
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = testImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid test JSON", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { title, description, questions } = parsed.data;
  const sourceFilename = request.headers.get("x-source-filename") ?? undefined;

  const test = await prisma.test.create({
    data: {
      title,
      description,
      sourceFilename,
      rawImport: body as Prisma.InputJsonValue,
      questions: {
        create: questions.map((question, index) => ({
          orderIndex: index,
          type: question.type,
          prompt: question.prompt,
          explanation: question.explanation,
          options: {
            create: toOptionInputs(question).map((option, optionIndex) => ({
              ...option,
              orderIndex: optionIndex,
            })),
          },
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: test.id }, { status: 201 });
}
