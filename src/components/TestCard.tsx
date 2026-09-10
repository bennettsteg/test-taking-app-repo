import Link from "next/link";

export type TestSummary = {
  id: number;
  title: string;
  description: string | null;
  questionCount: number;
  createdAt: string;
};

export function TestCard({ test }: { test: TestSummary }) {
  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium">{test.title}</h2>
          {test.description && (
            <p className="mt-1 text-sm text-neutral-600">{test.description}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500">
            {test.questionCount} question{test.questionCount === 1 ? "" : "s"} &middot; added{" "}
            {new Date(test.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 text-sm">
          <Link href={`/tests/${test.id}`} className="font-medium text-crimson hover:underline">
            View
          </Link>
          <Link
            href={`/tests/${test.id}/attempts`}
            className="text-neutral-600 hover:underline"
          >
            Attempts
          </Link>
        </div>
      </div>
    </li>
  );
}
