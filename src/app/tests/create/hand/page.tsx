import { HandAuthoredForm } from "@/components/HandAuthoredForm";

export default function HandAuthoredCreationPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-black">Create by Hand</h1>
      <p className="mb-4 text-sm text-neutral-600">
        Build a test directly in the app &mdash; no JSON required.
      </p>
      <HandAuthoredForm />
    </div>
  );
}
