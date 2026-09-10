"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildTestImport, type QuestionDraft, type TestDraft } from "@/lib/build-test-import";

function newMultipleChoiceQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    type: "multiple_choice",
    prompt: "",
    options: [
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" },
    ],
    correctOptionId: null,
    explanation: "",
  };
}

function isQuestionComplete(question: QuestionDraft): boolean {
  if (question.prompt.trim() === "") return false;
  if (question.type === "multiple_choice") {
    if (question.options.some((option) => option.text.trim() === "")) return false;
    return question.options.some((option) => option.id === question.correctOptionId);
  }
  return question.correctAnswer !== null;
}

function isDraftComplete(draft: TestDraft): boolean {
  return (
    draft.title.trim() !== "" && draft.questions.length > 0 && draft.questions.every(isQuestionComplete)
  );
}

export function HandAuthoredForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draft: TestDraft = { title, description, questions };
  const canSubmit = isDraftComplete(draft) && !isSubmitting;

  function updateQuestion(id: string, update: (question: QuestionDraft) => QuestionDraft) {
    setQuestions((prev) => prev.map((question) => (question.id === id ? update(question) : question)));
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((question) => question.id !== id));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, newMultipleChoiceQuestion()]);
  }

  function setQuestionType(id: string, type: "multiple_choice" | "true_false") {
    updateQuestion(id, (question) => {
      if (question.type === type) return question;
      if (type === "multiple_choice") {
        return {
          id: question.id,
          type: "multiple_choice",
          prompt: question.prompt,
          options: [
            { id: crypto.randomUUID(), text: "" },
            { id: crypto.randomUUID(), text: "" },
          ],
          correctOptionId: null,
          explanation: question.explanation,
        };
      }
      return {
        id: question.id,
        type: "true_false",
        prompt: question.prompt,
        correctAnswer: null,
        explanation: question.explanation,
      };
    });
  }

  function addOption(questionId: string) {
    updateQuestion(questionId, (question) => {
      if (question.type !== "multiple_choice" || question.options.length >= 4) return question;
      return { ...question, options: [...question.options, { id: crypto.randomUUID(), text: "" }] };
    });
  }

  function removeOption(questionId: string, optionId: string) {
    updateQuestion(questionId, (question) => {
      if (question.type !== "multiple_choice" || question.options.length <= 2) return question;
      return {
        ...question,
        options: question.options.filter((option) => option.id !== optionId),
        correctOptionId: question.correctOptionId === optionId ? null : question.correctOptionId,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildTestImport(draft)),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Something went wrong creating the test.");
        return;
      }

      const created = await response.json();
      router.push(`/tests/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          className="space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-sm font-semibold">Question {index + 1}</h2>
            <button
              type="button"
              onClick={() => removeQuestion(question.id)}
              className="rounded px-1.5 py-0.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground-invert"
            >
              Remove
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              value={question.type}
              onChange={(event) =>
                setQuestionType(question.id, event.target.value as "multiple_choice" | "true_false")
              }
              className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
            >
              <option value="multiple_choice">Multiple choice</option>
              <option value="true_false">True/false</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Prompt</label>
            <input
              value={question.prompt}
              onChange={(event) =>
                updateQuestion(question.id, (q) => ({ ...q, prompt: event.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
            />
          </div>

          {question.type === "multiple_choice" ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Options (mark the correct one)
              </label>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctOptionId === option.id}
                    onChange={() =>
                      updateQuestion(question.id, (q) =>
                        q.type === "multiple_choice" ? { ...q, correctOptionId: option.id } : q,
                      )
                    }
                  />
                  <input
                    value={option.text}
                    onChange={(event) =>
                      updateQuestion(question.id, (q) =>
                        q.type === "multiple_choice"
                          ? {
                              ...q,
                              options: q.options.map((o) =>
                                o.id === option.id ? { ...o, text: event.target.value } : o,
                              ),
                            }
                          : q,
                      )
                    }
                    className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(question.id, option.id)}
                    disabled={question.options.length <= 2}
                    className="rounded px-1.5 py-0.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground-invert disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(question.id)}
                disabled={question.options.length >= 4}
                className="rounded px-1.5 py-0.5 text-sm hover:bg-surface-hover hover:text-foreground-invert disabled:opacity-30"
              >
                + Add option
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Correct answer</label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === true}
                    onChange={() =>
                      updateQuestion(question.id, (q) =>
                        q.type === "true_false" ? { ...q, correctAnswer: true } : q,
                      )
                    }
                  />
                  True
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === false}
                    onChange={() =>
                      updateQuestion(question.id, (q) =>
                        q.type === "true_false" ? { ...q, correctAnswer: false } : q,
                      )
                    }
                  />
                  False
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Explanation (optional)</label>
            <textarea
              value={question.explanation}
              onChange={(event) =>
                updateQuestion(question.id, (q) => ({ ...q, explanation: event.target.value }))
              }
              rows={2}
              className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-hover hover:text-foreground-invert"
      >
        + Add Question
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-hover hover:text-foreground-invert disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Test"}
        </button>
      </div>
    </form>
  );
}
