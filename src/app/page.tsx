import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TestCard } from "@/components/TestCard";

export default async function LibraryPage() {
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

  if (tests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-neutral-600">No tests yet.</p>
        <Link
          href="/tests/upload"
          className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
        >
          Upload your first test
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tests.map((test) => (
        <TestCard
          key={test.id}
          test={{
            id: test.id,
            title: test.title,
            description: test.description,
            questionCount: test._count.questions,
            createdAt: test.createdAt.toISOString(),
          }}
        />
      ))}
    </ul>
  );
}
