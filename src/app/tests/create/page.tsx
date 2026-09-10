import Link from "next/link";

export default function CreateTestChoicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-black">Create New Test</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/tests/create/hand"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm hover:border-crimson"
        >
          <h2 className="font-medium text-black">Create by Hand</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Build a test directly in the app by adding questions one at a time.
          </p>
        </Link>

        <Link
          href="/tests/create/upload"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm hover:border-crimson"
        >
          <h2 className="font-medium text-black">Upload JSON</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Upload a Test Import JSON file, typically produced by an external AI.
          </p>
        </Link>
      </div>
    </div>
  );
}
