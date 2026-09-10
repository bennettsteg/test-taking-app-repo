"use client";

export type QuestionOption = { id: number; text: string; isCorrect?: boolean };

type QuestionCardProps = {
  index: number;
  prompt: string;
  options: QuestionOption[];
  selectedOptionId: number | null;
  onSelect?: (optionId: number) => void;
  showResult?: boolean;
  explanation?: string | null;
};

export function QuestionCard({
  index,
  prompt,
  options,
  selectedOptionId,
  onSelect,
  showResult = false,
  explanation,
}: QuestionCardProps) {
  return (
    <fieldset className="rounded-lg border border-neutral-200 bg-white p-4">
      <legend className="mb-2 px-1 text-sm font-medium">
        {index}. {prompt}
      </legend>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          let labelClass = "flex items-center gap-2 rounded-md border px-3 py-2 text-sm";
          if (showResult) {
            if (option.isCorrect) {
              labelClass += " border-green-300 bg-green-50";
            } else if (isSelected) {
              labelClass += " border-red-300 bg-red-50";
            } else {
              labelClass += " border-neutral-200";
            }
          } else {
            labelClass += isSelected
              ? " border-black"
              : " border-neutral-200 hover:border-neutral-400";
          }

          return (
            <label key={option.id} className={labelClass}>
              <input
                type="radio"
                name={`question-${index}`}
                checked={isSelected}
                disabled={!onSelect}
                onChange={() => onSelect?.(option.id)}
              />
              {option.text}
            </label>
          );
        })}
      </div>
      {showResult && explanation && (
        <p className="mt-3 text-sm text-neutral-600">{explanation}</p>
      )}
    </fieldset>
  );
}
