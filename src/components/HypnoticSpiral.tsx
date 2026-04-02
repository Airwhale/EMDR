"use client";

import { useEffect, useRef } from "react";

interface HypnoticSpiralProps {
  /** Overall opacity of the spiral (keep very low) */
  opacity?: number;
  /** Rotation speed in degrees per second */
  speed?: number;
  /** Size in px */
  size?: number;
}

export default function HypnoticSpiral({
  opacity = 0.06,
  speed = 12,
  size = 500,
}: HypnoticSpiralProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;
    let rotation = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw logarithmic spiral arms
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

        // Fade from center outward
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        gradient.addColorStop(0, `rgba(201, 169, 110, ${opacity * 2})`);
        gradient.addColorStop(0.5, `rgba(201, 169, 110, ${opacity})`);
        gradient.addColorStop(1, `rgba(201, 169, 110, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
      rotation += speed / 60; // ~60fps
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [size, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        opacity: 1, // Opacity is handled in the drawing
      }}
    />
  );
}
