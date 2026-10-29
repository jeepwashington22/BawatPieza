"use client";

export function StarsBackground({
  starColor = "#ffffff",
  className = "",
  background = "radial-gradient(ellipse_at_bottom, rgba(15,23,42,0.96) 0%, rgba(2,6,23,1) 100%)",
}: {
  starColor?: string;
  className?: string;
  background?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      style={{
        backgroundImage: `${background}, radial-gradient(circle, ${starColor} 0 1.25px, transparent 1.8px)`,
        backgroundSize: "cover, 32px 32px",
        backgroundPosition: "center, center",
      }}
    />
  );
}
