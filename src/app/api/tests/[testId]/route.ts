import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseTestId(testId: string) {
  const id = Number(testId);
  return Number.isInteger(id) ? id : null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const id = parseTestId(testId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid test id" }, { status: 400 });
  }

  const test = await prisma.test.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          type: true,
          prompt: true,
          orderIndex: true,
          options: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, text: true },
          },
        },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  return NextResponse.json(test);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const id = parseTestId(testId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid test id" }, { status: 400 });
  }

  await prisma.test.deleteMany({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
