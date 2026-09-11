"use client";

import { useState } from "react";

/** Tıklanabilir 1-5 yıldız puanlama girişi. */
export function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5 text-3xl" role="radiogroup" aria-label="rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand rounded"
          style={{ color: (hover || value) >= n ? "#ffc14d" : "#3a4560" }}
        >
          {(hover || value) >= n ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
