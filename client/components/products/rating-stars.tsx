import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five lucide stars filled to the exact rating (4.8 fills 80% of the fifth), with an accessible label. */
export function RatingStars({ rating, size = 16, className }: { rating: number; size?: number; className?: string }) {
  const value = Math.min(5, Math.max(0, rating));
  return (
    <span role="img" aria-label={`Rated ${rating} out of 5`} className={cn("inline-flex items-center gap-px", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="relative inline-flex shrink-0" aria-hidden="true">
            <Star size={size} fill="currentColor" className="text-(--line)" />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} fill="currentColor" className="max-w-none shrink-0 text-[#f59e0b]" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function reviewLabel(count: number) {
  return `${count} written ${count === 1 ? "review" : "reviews"}`;
}
