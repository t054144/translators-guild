/**
 * Canvas particle field.
 *
 * Three roles, all of them carrying meaning rather than atmosphere:
 *   - `field`   parallax star layers, so vertical motion reads as altitude
 *   - `exhaust` combustion products, tied to engine state
 *   - `data`    packets moving source → processing → display during ingest
 *
 * Budget is adaptive: the loop measures its own frame cost and sheds particles
 * if it cannot hold the target, rather than dragging the whole interface down.
 * Under prefers-reduced-motion it renders a single static frame and stops.
 */

import { useEffect, useRef } from 'react';

export type FieldMode = 'field' | 'exhaust' | 'data';

interface Props {
  mode: FieldMode;
  /** 0 = off, 1 = nominal. Exhaust density and star speed scale with it. */
  intensity?: number;
  className?: string;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  hue: number;
  layer: number;
}

const BUDGET_MAX = 420;
const BUDGET_MIN = 60;

export function Particles({ mode, intensity = 1, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 900px)').matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let budget = mobile ? 140 : BUDGET_MAX;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(rect?.width ?? canvas.clientWidth, 1);
      h = Math.max(rect?.height ?? canvas.clientHeight, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const parts: P[] = [];

    const seedField = () => {
      parts.length = 0;
      const n = Math.floor(budget * 0.5);
      for (let i = 0; i < n; i += 1) {
        const layer = i % 3;
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: (0.06 + layer * 0.11) * (0.6 + Math.random() * 0.8),
          r: layer === 2 ? 1.25 : layer === 1 ? 0.9 : 0.6,
          life: 1,
          max: 1,
          hue: 195,
          layer,
        });
      }
    };

    const seedData = () => {
      parts.length = 0;
      for (let i = 0; i < Math.floor(budget * 0.3); i += 1) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0.35 + Math.random() * 0.5,
          vy: 0,
          r: 1,
          life: 1,
          max: 1,
          hue: 188,
          layer: i % 3,
        });
      }
    };

    if (mode === 'field') seedField();
    if (mode === 'data') seedData();

    const spawnExhaust = (count: number) => {
      const ox = w / 2;
      const oy = h;
      for (let i = 0; i < count; i += 1) {
        const spread = (Math.random() - 0.5) * 26;
        const max = 30 + Math.random() * 46;
        parts.push({
          x: ox + spread,
          y: oy - Math.random() * 6,
          vx: spread * 0.035 + (Math.random() - 0.5) * 0.5,
          vy: 1.4 + Math.random() * 2.6,
          r: 2 + Math.random() * 5,
          life: max,
          max,
          hue: 18 + Math.random() * 26,
          layer: 0,
        });
      }
    };

    let raf = 0;
    let slowFrames = 0;

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      const k = intensityRef.current;

      if (mode === 'field') {
        for (const p of parts) {
          p.y += p.vy * k * dt;
          if (p.y > h) {
            p.y = -2;
            p.x = Math.random() * w;
          }
          ctx.globalAlpha = 0.18 + p.layer * 0.2;
          ctx.fillStyle = p.layer === 2 ? '#7fe3f2' : '#9fb0c4';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'data') {
        for (const p of parts) {
          p.x += p.vx * k * dt;
          if (p.x > w) {
            p.x = -4;
            p.y = Math.random() * h;
          }
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#4dd4e8';
          ctx.fillRect(p.x, p.y, 3, 1);
        }
      } else {
        if (k > 0.02) spawnExhaust(Math.ceil(k * (mobile ? 3 : 7)));
        for (let i = parts.length - 1; i >= 0; i -= 1) {
          const p = parts[i]!;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy *= 0.985;
          p.r *= 1.028;
          p.life -= dt;
          if (p.life <= 0 || p.y > h + 40) {
            parts.splice(i, 1);
            continue;
          }
          const t = p.life / p.max;
          ctx.globalAlpha = t * 0.5;
          ctx.fillStyle = `hsl(${p.hue}, ${72 + t * 22}%, ${44 + t * 34}%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        // Shed particles rather than drop frames.
        if (parts.length > budget) parts.splice(0, parts.length - budget);
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      draw(1);
      return () => {
        ro.disconnect();
      };
    }

    let last = performance.now();
    const loop = (now: number) => {
      const raw = now - last;
      last = now;
      // Clamp dt so a backgrounded tab does not teleport every particle.
      const dt = Math.min(raw, 50) / 16.667;

      if (raw > 34) {
        slowFrames += 1;
        if (slowFrames > 24 && budget > BUDGET_MIN) {
          budget = Math.max(BUDGET_MIN, Math.floor(budget * 0.7));
          slowFrames = 0;
          if (mode === 'field') seedField();
          if (mode === 'data') seedData();
        }
      } else if (slowFrames > 0) {
        slowFrames -= 1;
      }

      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
