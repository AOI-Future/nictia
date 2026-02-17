"use client";

import { useRef, useEffect, useCallback } from "react";

// Simple noise function (simplex-like)
function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  const base = n - Math.floor(n);
  return base * 2 - 1;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const smoothFx = fx * fx * (3 - 2 * fx);
  const smoothFy = fy * fy * (3 - 2 * fy);

  const n00 = noise2D(ix, iy);
  const n10 = noise2D(ix + 1, iy);
  const n01 = noise2D(ix, iy + 1);
  const n11 = noise2D(ix + 1, iy + 1);

  const nx0 = n00 + (n10 - n00) * smoothFx;
  const nx1 = n01 + (n11 - n01) * smoothFx;

  return nx0 + (nx1 - nx0) * smoothFy;
}

function fbm(x: number, y: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speed: number;
  life: number;
}

export default function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 3000), 800);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        prevX: x,
        prevY: y,
        speed: 0.3 + Math.random() * 0.7,
        life: Math.random(),
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      timeRef.current += 0.003;
      const t = timeRef.current;

      // Fade trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;

        // Flow field angle from noise
        const scale = 0.003;
        const noiseVal = fbm(p.x * scale + t, p.y * scale + t * 0.5, 3);
        let angle = noiseVal * Math.PI * 4;

        // Mouse interaction: repel particles near cursor
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRadius = 150;

        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 2;
          angle += Math.atan2(dy, dx) * force;
        }

        const vx = Math.cos(angle) * p.speed * 1.5;
        const vy = Math.sin(angle) * p.speed * 1.5;

        p.x += vx;
        p.y += vy;
        p.life -= 0.001;

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Reset dead particles
        if (p.life <= 0) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.prevX = p.x;
          p.prevY = p.y;
          p.life = 0.5 + Math.random() * 0.5;
        }

        // Draw particle trail
        const alpha = p.life * 0.25;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw grid overlay (subtle)
      if (Math.floor(t * 100) % 200 === 0) {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.015)";
        ctx.lineWidth = 0.5;
        const gridSize = 60;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ background: "#000" }}
    />
  );
}
