"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Shape =
  | "square"
  | "tile"
  | "hexagon"
  | "triangle"
  | "diamond"
  | "circle"
  | "cross"
  | "dot";

type Direction = "diagonal" | "up" | "down" | "left" | "right" | "none";

type ShapeGridProps = {
  shape?: Shape;
  direction?: Direction;
  lineColor?: string;
  hoverColor?: string;
  hoverFillColor?: string;
  fillOpacity?: number;
  cellSize?: number;
  speed?: number;
  tiltX?: number;
  tiltY?: number;
  rainbow?: boolean;
  radius?: number;
  trail?: number;
  glow?: number;
  twinkle?: number;
  fade?: number;
  clickCascade?: boolean;
  intro?: boolean;
  opacity?: number;
  backgroundColor?: string;
  paused?: boolean;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const directionVectors: Record<Direction, [number, number]> = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1],
  diagonal: [1, -1],
  none: [0, 0],
};

const rgbFromHex = (hex: string) => {
  const value = hex.replace("#", "");
  const safe = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const numeric = Number.parseInt(safe, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

const withAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = rgbFromHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ShapeGrid({
  shape = "square",
  direction = "diagonal",
  lineColor = "#2a2734",
  hoverColor = "#ffffff",
  hoverFillColor = "#ffffff",
  fillOpacity = 0.15,
  cellSize = 40,
  speed = 0.5,
  tiltX = 0,
  tiltY = 0,
  rainbow = false,
  radius = 1.5,
  trail = 0.6,
  glow = 0.35,
  twinkle = 0,
  fade = 1,
  clickCascade = true,
  intro = true,
  opacity = 1,
  backgroundColor = "transparent",
  paused = false,
  dpr = 1,
  className = "",
  style,
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, dpr || 1);
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * ratio);
      canvas.height = Math.max(1, rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = (time: number) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      context.clearRect(0, 0, width, height);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      const floatAmount = paused ? 0 : time * 0.00018 * speed * 60;
      const [dx, dy] = directionVectors[direction] ?? [1, -1];

      const drawCell = (x: number, y: number, size: number, intensity: number) => {
        const fillColor = rainbow
          ? `hsla(${((x * 0.20 + y * 0.12 + time * 0.03) % 360 + 360) % 360}, 95%, 72%, ${0.08 + intensity * 0.45})`
          : withAlpha(hoverFillColor, clamp(fillOpacity + intensity * 0.2, 0, 1));

        context.save();
        context.translate(x, y);
        const rotated = Math.abs(tiltX) + Math.abs(tiltY) > 0;
        if (rotated) {
          context.rotate((tiltX * Math.PI) / 180);
          context.translate(-size / 2, -size / 2);
        }

        const pxSize = size * 0.7;

        if (shape === "circle") {
          context.beginPath();
          context.arc(size / 2, size / 2, pxSize / 2.2, 0, Math.PI * 2);
          context.fillStyle = fillColor;
          context.fill();
          context.strokeStyle = withAlpha(lineColor, clamp(0.5 + intensity, 0, 1));
          context.lineWidth = 1;
          context.stroke();
        } else if (shape === "diamond") {
          context.beginPath();
          context.moveTo(size / 2, 0);
          context.lineTo(size, size / 2);
          context.lineTo(size / 2, size);
          context.lineTo(0, size / 2);
          context.closePath();
          context.fillStyle = fillColor;
          context.fill();
          context.strokeStyle = withAlpha(lineColor, clamp(0.5 + intensity, 0, 1));
          context.stroke();
        } else if (shape === "triangle") {
          context.beginPath();
          context.moveTo(size / 2, 0);
          context.lineTo(size, size);
          context.lineTo(0, size);
          context.closePath();
          context.fillStyle = fillColor;
          context.fill();
          context.strokeStyle = withAlpha(lineColor, clamp(0.5 + intensity, 0, 1));
          context.stroke();
        } else if (shape === "hexagon") {
          context.beginPath();
          const a = size / 2;
          for (let i = 0; i < 6; i += 1) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x1 = a + Math.cos(angle) * a;
            const y1 = a + Math.sin(angle) * a;
            if (i === 0) context.moveTo(x1, y1);
            else context.lineTo(x1, y1);
          }
          context.closePath();
          context.fillStyle = fillColor;
          context.fill();
          context.strokeStyle = withAlpha(lineColor, clamp(0.5 + intensity, 0, 1));
          context.stroke();
        } else if (shape === "cross") {
          context.strokeStyle = withAlpha(lineColor, clamp(0.4 + intensity, 0, 1));
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(size / 2, 0);
          context.lineTo(size / 2, size);
          context.moveTo(0, size / 2);
          context.lineTo(size, size / 2);
          context.stroke();
        } else if (shape === "dot") {
          context.beginPath();
          context.arc(size / 2, size / 2, pxSize * 0.2, 0, Math.PI * 2);
          context.fillStyle = withAlpha(hoverColor, clamp(0.25 + intensity, 0, 1));
          context.fill();
        } else {
          context.fillStyle = fillColor;
          context.fillRect(0, 0, size, size);
          context.strokeStyle = withAlpha(lineColor, clamp(0.5 + intensity, 0, 1));
          context.lineWidth = 1;
          context.strokeRect(0.25, 0.25, size - 0.5, size - 0.5);
        }

        context.restore();
      };

      const offsetX = ((floatAmount * cellSize * (dx || 1)) % cellSize) + cellSize;
      const offsetY = ((floatAmount * cellSize * (dy || 1)) % cellSize) + cellSize;

      for (let gy = -cellSize * 2; gy < height + cellSize * 2; gy += cellSize) {
        for (let gx = -cellSize * 2; gx < width + cellSize * 2; gx += cellSize) {
          const x = gx + offsetX;
          const y = gy + offsetY;
          const distX = pointerRef.current.x - x;
          const distY = pointerRef.current.y - y;
          const dist = Math.hypot(distX, distY);
          const hitRadius = cellSize * (radius || 1.1);
          const intensity = pointerRef.current.active && dist < hitRadius ? 1 - dist / hitRadius : 0;
          const shimmer = Math.sin((x + y + time * 0.006) * 0.22) * 0.3 + 0.3;
          const pulse = clamp(intensity + shimmer, 0, 1);

          drawCell(x, y, cellSize, pulse);
        }
      }

      if (trail > 0 && pointerRef.current.active) {
        const glowRadius = cellSize * (radius + 2.5);
        const glowGradient = context.createRadialGradient(
          pointerRef.current.x,
          pointerRef.current.y,
          0,
          pointerRef.current.x,
          pointerRef.current.y,
          glowRadius,
        );
        glowGradient.addColorStop(0, withAlpha(hoverColor, 0.15 + glow * 0.3));
        glowGradient.addColorStop(1, withAlpha(hoverColor, 0));
        context.fillStyle = glowGradient;
        context.fillRect(0, 0, width, height);
      }

      frameRef.current = requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    resize();
    render(0);
    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [backgroundColor, cellSize, clickCascade, direction, dpr, fillOpacity, glow, hoverColor, hoverFillColor, intro, opacity, paused, rainbow, radius, shape, speed, tiltX, tiltY, trail, twinkle, fade, lineColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        backgroundColor,
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
