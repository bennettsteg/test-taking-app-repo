export function ScoreSummary({
  correctCount,
  totalQuestions,
}: {
  correctCount: number;
  totalQuestions: number;
}) {
  const percent = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-2xl font-semibold">
        {correctCount} / {totalQuestions}
      </p>
      <p className="text-neutral-600">{percent}%</p>
    </div>
  );
}
