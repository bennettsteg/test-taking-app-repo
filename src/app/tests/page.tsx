import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TestCard } from "@/components/TestCard";

export const dynamic = "force-dynamic";

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
      <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-muted">No tests yet.</p>
        <Link
          href="/tests/create"
          className="mt-3 inline-block rounded-md bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-hover hover:text-foreground-invert"
        >
          Create your first test
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
