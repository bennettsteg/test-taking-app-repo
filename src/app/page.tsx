import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-black">Welcome to Practice Tests</h1>
        <p className="mt-2 text-neutral-600">
          Turn your notes into practice tests, then take them and review your score.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/tests/create"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          Create New Test
        </Link>
        <Link
          href="/tests"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-black hover:bg-neutral-100"
        >
          View Existing Tests
        </Link>
      </div>
    </div>
  );
}
