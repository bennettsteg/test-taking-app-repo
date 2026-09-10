"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";

type Question = {
  id: number;
  prompt: string;
  options: { id: number; text: string }[];
};

export function TakeTestClient({ testId, questions }: { testId: number; questions: Question[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startedAt] = useState(() => new Date().toISOString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/tests/${testId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt,
          responses: questions.map((question) => ({
            questionId: question.id,
            selectedOptionId: answers[question.id] ?? null,
          })),
        }),
      });

      if (!response.ok) {
        setError("Something went wrong submitting your answers.");
        return;
      }

      const attempt = await response.json();
      router.push(`/tests/${testId}/attempts/${attempt.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index + 1}
          prompt={question.prompt}
          options={question.options}
          selectedOptionId={answers[question.id] ?? null}
          onSelect={(optionId) =>
            setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
          }
        />
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {answeredCount} of {questions.length} answered
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
