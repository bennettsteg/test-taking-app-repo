import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TestDetailPage({
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
      description: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  if (!test) notFound();

  return (
    <div>
      <h1 className="text-lg font-semibold">{test.title}</h1>
      {test.description && <p className="mt-1 text-neutral-600">{test.description}</p>}
      <p className="mt-1 text-sm text-neutral-500">
        {test._count.questions} question{test._count.questions === 1 ? "" : "s"}
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/tests/${test.id}/take`}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          Start Test
        </Link>
        <Link
          href={`/tests/${test.id}/attempts`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
        >
          View Attempts
        </Link>
      </div>
    </div>
  );
}
