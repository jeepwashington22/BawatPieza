"use client";

import { useEffect, useRef, useState } from "react";

type Footprint = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  age: number;
  intensity: number;
};

export default function FootprintTracker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const footprintsRef = useRef<Footprint[]>([]);
  const nextId = useRef(0);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = 400;
    const H = 400;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.scale(dpr, dpr);

    let lastSpawn = 0;
    const spawnInterval = 380;

    const drawFootprint = (fp: Footprint) => {
      ctx.save();
      ctx.translate(fp.x, fp.y);
      ctx.rotate((fp.rotation * Math.PI) / 180);

      const alpha = Math.max(0, 1 - fp.age);
      const scale = 0.85 + fp.intensity * 0.25;

      // Toe circles
      for (let i = 0; i < 5; i++) {
        const tx = -10 + i * 5;
        const ty = -14 - Math.abs(i - 2) * 2;
        const tr = 2.2 - Math.abs(i - 2) * 0.3;
        ctx.beginPath();
        ctx.arc(tx, ty, tr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 140, 40, ${alpha * 0.9})`;
        ctx.fill();
      }

      // Main foot pad
      ctx.beginPath();
      ctx.ellipse(0, 2, 7 * scale, 11 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 120, 30, ${alpha * 0.85})`;
      ctx.fill();

      // Heel
      ctx.beginPath();
      ctx.ellipse(0, 12, 5 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 110, 20, ${alpha * 0.8})`;
      ctx.fill();

      ctx.restore();
    };

    const animate = (ts: number) => {
      ctx.clearRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      if (ts - lastSpawn > spawnInterval) {
        lastSpawn = ts;
        const side = Math.random();
        let x: number, y: number, rotation: number;
        if (side < 0.5) {
          x = 30 + Math.random() * (W - 60);
          y = Math.random() < 0.5 ? 20 : H - 20;
          rotation = y < H / 2 ? 0 : 180;
        } else {
          x = Math.random() < 0.5 ? 20 : W - 20;
          y = 30 + Math.random() * (H - 60);
          rotation = x < W / 2 ? 90 : -90;
        }
        rotation += (Math.random() - 0.5) * 25;
        footprintsRef.current.push({
          id: nextId.current++,
          x,
          y,
          rotation,
          age: 0,
          intensity: 0.5 + Math.random() * 0.5,
        });
        setStepCount((s) => s + 1);
      }

      footprintsRef.current = footprintsRef.current.filter((fp) => {
        fp.age += 0.012;
        drawFootprint(fp);
        return fp.age < 1;
      });

      requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-[#090D16]">
      {/* Header */}
      <div className="absolute left-5 top-5 z-10">
        <p className="text-xs font-medium uppercase tracking-widest text-cyan-400/70">
          Kinetic Input
        </p>
        <p className="mt-1 text-lg font-bold text-white">Footstep Tracking</p>
      </div>

      {/* Step counter */}
      <div className="absolute right-5 top-5 z-10 text-right">
        <p className="text-3xl font-black tabular-nums text-orange-400">
          {stepCount}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
          Steps recorded
        </p>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Bottom label */}
      <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center justify-between">
        <p className="text-[11px] text-white/30">
          Live pedestrian movement · kinetic energy generation
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
          <span className="text-[10px] font-medium text-orange-400/80">LIVE</span>
        </div>
      </div>
    </div>
  );
}
