
import React from "react";

const difficulties = [
  { label: "Easy", value: "easy", color: "bg-green-200" },
  { label: "Medium", value: "medium", color: "bg-yellow-200" },
  { label: "Hard", value: "hard", color: "bg-red-200" },
];

const DifficultySelector = ({
  onSelect,
}: {
  onSelect: (level: "easy" | "medium" | "hard") => void;
}) => (
  <div className="flex flex-col items-center gap-4 mt-16">
    <div className="text-2xl font-semibold mb-4">Choose Difficulty</div>
    <div className="flex gap-6">
      {difficulties.map((d) => (
        <button
          key={d.value}
          className={`px-8 py-4 text-lg rounded-lg font-bold shadow-md transition-colors hover:scale-105 focus:ring-2 ring-primary ${d.color}`}
          onClick={() => onSelect(d.value as "easy" | "medium" | "hard")}
        >
          {d.label}
        </button>
      ))}
    </div>
  </div>
);

export default DifficultySelector;
