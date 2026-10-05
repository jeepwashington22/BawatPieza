import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "#ffd995" }: SpotlightProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-[34rem] w-[34rem] rounded-full opacity-70 blur-3xl",
        "bg-[radial-gradient(circle_at_center,var(--spotlight-fill)_0%,transparent_68%)]",
        className,
      )}
      style={{ "--spotlight-fill": fill } as React.CSSProperties}
    />
  );
}
