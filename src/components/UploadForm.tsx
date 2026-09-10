"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ValidationIssue = { path: (string | number)[]; message: string };

export function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIssues([]);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError("Choose a JSON file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        setError("That file isn't valid JSON.");
        return;
      }

      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-source-filename": file.name },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Upload failed.");
        setIssues(data?.issues ?? []);
        return;
      }

      const created = await response.json();
      router.push(`/tests/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          Test JSON file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/json,.json"
          className="mt-1 block w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {issues.length > 0 && (
        <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
          {issues.map((issue, index) => (
            <li key={index}>
              {issue.path.join(".")}: {issue.message}
            </li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isSubmitting ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
