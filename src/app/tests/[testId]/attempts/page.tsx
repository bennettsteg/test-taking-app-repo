import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AttemptHistoryPage({
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
      attempts: {
        orderBy: { completedAt: "desc" },
        select: { id: true, correctCount: true, totalQuestions: true, completedAt: true },
      },
    },
  });

  if (!test) notFound();

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">{test.title} &mdash; Attempts</h1>

      {test.attempts.length === 0 ? (
        <p className="text-neutral-600">No attempts yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="py-2">Date</th>
              <th className="py-2">Score</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {test.attempts.map((attempt) => (
              <tr key={attempt.id} className="border-b border-neutral-100">
                <td className="py-2">{new Date(attempt.completedAt).toLocaleString()}</td>
                <td className="py-2">
                  {attempt.correctCount} / {attempt.totalQuestions}
                </td>
                <td className="py-2 text-right">
                  <Link
                    href={`/tests/${test.id}/attempts/${attempt.id}`}
                    className="text-crimson hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
