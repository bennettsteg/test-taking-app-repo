import Link from "next/link";

export default function CreateTestChoicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Create New Test</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/tests/create/hand"
          className="group rounded-lg border border-border bg-surface p-6 hover:bg-surface-hover"
        >
          <h2 className="font-medium group-hover:text-foreground-invert">Create by Hand</h2>
          <p className="mt-1 text-sm text-muted group-hover:text-foreground-invert">
            Build a test directly in the app by adding questions one at a time.
          </p>
        </Link>

        <Link
          href="/tests/create/upload"
          className="group rounded-lg border border-border bg-surface p-6 hover:bg-surface-hover"
        >
          <h2 className="font-medium group-hover:text-foreground-invert">Upload JSON</h2>
          <p className="mt-1 text-sm text-muted group-hover:text-foreground-invert">
            Upload a Test Import JSON file, typically produced by an external AI.
          </p>
        </Link>
      </div>
    </div>
  );
}
