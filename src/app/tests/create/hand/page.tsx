import { HandAuthoredForm } from "@/components/HandAuthoredForm";

export default function HandAuthoredCreationPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Create by Hand</h1>
      <p className="mb-4 text-sm text-muted">
        Build a test directly in the app &mdash; no JSON required.
      </p>
      <HandAuthoredForm />
    </div>
  );
}
