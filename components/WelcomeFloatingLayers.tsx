"use client";

import { useEffect, useRef } from "react";

type Props = {
  foods: string[];
};

type BerryState = {
  el: HTMLDivElement;
  rx: number;
  ry: number;
  angle: number;
  baseX: number;
  baseY: number;
  targetRx: number;
  targetRy: number;
  floatDur: number;
};

const FOREGROUND_COUNT = 6;
const FOREGROUND_POSITIONS = [
  { top: "22%", left: "18%", size: 140 },
  { top: "58%", left: "28%", size: 110 },
  { top: "30%", left: "72%", size: 150 },
  { top: "14%", left: "48%", size: 120 },
  { top: "72%", left: "14%", size: 100 },
  { top: "48%", left: "82%", size: 130 },
];

const BACKGROUND_POSITIONS = [
  { top: "18%", left: "38%", size: 90 },
  { top: "52%", left: "58%", size: 80 },
  { top: "78%", left: "42%", size: 85 },
  { top: "10%", left: "88%", size: 75 },
];

const BERRY_FLOAT_DURATIONS = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10];

export default function WelcomeFloatingLayers({ foods }: Props) {
  const fgRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const berriesRef = useRef<BerryState[]>([]);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  const foregroundFoods = foods.slice(0, FOREGROUND_COUNT);
  const backgroundFoods = foods.slice(FOREGROUND_COUNT);

  // Pointer tracking
  useEffect(() => {
    function handleMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = e.clientY / window.innerHeight - 0.5;
      mouseRef.current.px = e.clientX;
      mouseRef.current.py = e.clientY;
    }
    function handleTouch(e: TouchEvent) {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      mouseRef.current.x = t.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = t.clientY / window.innerHeight - 0.5;
      mouseRef.current.px = t.clientX;
      mouseRef.current.py = t.clientY;
    }
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, []);

  // rAF loop: parallax + repulsion + float
  useEffect(() => {
    let raf = 0;
    const time0 = Date.now();

    // Gather all berry elements from both containers
    const fgEls = fgRef.current
      ? Array.from(fgRef.current.querySelectorAll<HTMLDivElement>(".welcome-berry"))
      : [];
    const bgEls = bgRef.current
      ? Array.from(bgRef.current.querySelectorAll<HTMLDivElement>(".welcome-berry"))
      : [];

    berriesRef.current = [...fgEls, ...bgEls].map((el, i) => ({
      el,
      rx: 0,
      ry: 0,
      angle: Math.random() * 360,
      baseX: 0,
      baseY: 0,
      targetRx: 0,
      targetRy: 0,
      floatDur: BERRY_FLOAT_DURATIONS[i % BERRY_FLOAT_DURATIONS.length],
    }));

    function tick() {
      const time = (Date.now() - time0) * 0.001;
      const m = mouseRef.current;
      const cm = currentMouseRef.current;

      cm.x += (m.x - cm.x) * 0.05;
      cm.y += (m.y - cm.y) * 0.05;

      // Parallax on the containers
      if (fgRef.current) {
        fgRef.current.style.transform = `translate(${cm.x * 60}px, ${cm.y * 60}px)`;
      }
      if (bgRef.current) {
        bgRef.current.style.transform = `translate(${cm.x * -30}px, ${cm.y * -30}px)`;
      }

      // Repel + float each berry
      berriesRef.current.forEach((berry, i) => {
        const rect = berry.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = m.px - cx;
        const dy = m.py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetRx = 0;
        let targetRy = 0;
        let speedMult = 1;

        if (dist < 400 && dist > 0) {
          const force = (400 - dist) / 400;
          targetRx = (dx / dist) * force * -80;
          targetRy = (dy / dist) * force * -80;
          speedMult = 1 + force * 5;
        }

        berry.rx += (targetRx - berry.rx) * 0.1;
        berry.ry += (targetRy - berry.ry) * 0.1;
        berry.angle += 0.2 * speedMult;

        const phase = (time + i * 0.7) * (Math.PI * 2) / berry.floatDur;
        const floatY = Math.sin(phase) * 15;
        const floatAngle = Math.cos(phase) * 6;

        berry.el.style.transform = `translate(${berry.rx + berry.baseX}px, ${berry.ry + berry.baseY + floatY}px) rotate(${berry.angle + floatAngle}deg)`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Bubble spawner
  useEffect(() => {
    const container = bubblesRef.current;
    if (!container) return;

    const id = window.setInterval(() => {
      const bubble = document.createElement("div");
      bubble.className = "welcome-bubble";
      const size = Math.random() * 20 + 8;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      const duration = Math.random() * 6 + 6;
      bubble.style.animation = `welcome-bubble-rise ${duration}s linear forwards`;
      container.appendChild(bubble);
      window.setTimeout(() => bubble.remove(), duration * 1000);
    }, 500);

    return () => {
      window.clearInterval(id);
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <>
      {/* Background food thumbnails */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] transition-transform duration-100 ease-out will-change-transform"
      >
        {backgroundFoods.map((src, i) => {
          const pos = BACKGROUND_POSITIONS[i % BACKGROUND_POSITIONS.length];
          return (
            <div
              key={src}
              className="welcome-berry welcome-berry-bg absolute"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.size,
                height: pos.size,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full rounded-full object-cover opacity-50 blur-[1.5px]"
              />
            </div>
          );
        })}
      </div>

      {/* Foreground food thumbnails */}
      <div
        ref={fgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[15] transition-transform duration-100 ease-out will-change-transform"
      >
        {foregroundFoods.map((src, i) => {
          const pos = FOREGROUND_POSITIONS[i % FOREGROUND_POSITIONS.length];
          return (
            <div
              key={src}
              className="welcome-berry absolute"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.size,
                height: pos.size,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="welcome-berry-img h-full w-full rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/15"
              />
            </div>
          );
        })}
      </div>

      {/* Bubbles */}
      <div
        ref={bubblesRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[10] overflow-hidden"
      />
    </>
  );
}