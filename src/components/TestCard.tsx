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
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium">{test.title}</h2>
          {test.description && (
            <p className="mt-1 text-sm text-muted">{test.description}</p>
          )}
          <p className="mt-1 text-xs text-muted">
            {test.questionCount} question{test.questionCount === 1 ? "" : "s"} &middot; added{" "}
            {new Date(test.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 text-sm">
          <Link
            href={`/tests/${test.id}`}
            className="rounded px-1.5 py-0.5 font-medium hover:bg-surface-hover hover:text-foreground-invert"
          >
            View
          </Link>
          <Link
            href={`/tests/${test.id}/attempts`}
            className="rounded px-1.5 py-0.5 text-muted hover:bg-surface-hover hover:text-foreground-invert"
          >
            Attempts
          </Link>
        </div>
      </div>
    </li>
  );
}
