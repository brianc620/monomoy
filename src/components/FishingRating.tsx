"use client";

interface FishingRatingProps {
  rating: number; // 1-5
  label?: string;
}

export default function FishingRating({ rating, label }: FishingRatingProps) {
  const ratingText = ["Poor", "Fair", "Good", "Great", "Epic"];
  const ratingColors = [
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-green-400",
    "text-emerald-400",
  ];

  return (
    <div className="text-center">
      {label && (
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {label}
        </div>
      )}
      <div className="flex justify-center gap-1 text-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < rating ? ratingColors[rating - 1] : "text-gray-700"}
          >
            {i < rating ? "🐟" : "·"}
          </span>
        ))}
      </div>
      <div className={`text-sm font-semibold mt-1 ${ratingColors[rating - 1]}`}>
        {ratingText[rating - 1]}
      </div>
    </div>
  );
}
