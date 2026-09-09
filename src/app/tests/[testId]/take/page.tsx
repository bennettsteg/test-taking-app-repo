import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TakeTestClient } from "@/components/TakeTestClient";

export default async function TakeTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const id = Number(testId);
  if (!Number.isInteger(id)) notFound();

  const test = await prisma.test.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          prompt: true,
          options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
        },
      },
    },
  });

  if (!test) notFound();

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">{test.title}</h1>
      <TakeTestClient testId={test.id} questions={test.questions} />
    </div>
  );
}
