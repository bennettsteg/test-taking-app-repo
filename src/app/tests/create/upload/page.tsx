import { UploadForm } from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Upload a Test</h1>
      <p className="mb-4 text-sm text-muted">
        Upload a JSON file matching the test format described in the README.
      </p>
      <UploadForm />
    </div>
  );
}
