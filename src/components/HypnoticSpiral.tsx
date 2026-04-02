"use client";

import { useEffect, useRef } from "react";

interface HypnoticSpiralProps {
  opacity?: number;
  speed?: number;
  size?: number;
}

/**
 * Canvas-rendered logarithmic spiral. Uses devicePixelRatio for sharp rendering.
 * The RAF loop only touches the canvas — no React state updates, no re-renders.
 */
export default function HypnoticSpiral({
  opacity = 0.06,
  speed = 12,
  size = 500,
}: HypnoticSpiralProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  // Store props in refs so RAF loop doesn't restart when they change
  const opacityRef = useRef(opacity);
  const speedRef = useRef(speed);
  opacityRef.current = opacity;
  speedRef.current = speed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    let rotation = 0;

    const draw = () => {
      const currentOpacity = opacityRef.current;
      const currentSpeed = speedRef.current;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);

      const arms = 5;
      const maxRadius = size * 0.45;

      for (let arm = 0; arm < arms; arm++) {
        const armOffset = (arm / arms) * Math.PI * 2;
        ctx.beginPath();

        for (let t = 0; t < 720; t += 2) {
          const angle = (t * Math.PI) / 180 + armOffset;
          const r = (t / 720) * maxRadius;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);

          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        gradient.addColorStop(0, `rgba(201, 169, 110, ${currentOpacity * 2})`);
        gradient.addColorStop(0.5, `rgba(201, 169, 110, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(201, 169, 110, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
      rotation += currentSpeed / 60;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [size]); // Only restart on size change — opacity/speed read from refs

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
