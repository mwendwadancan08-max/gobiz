"use client";

import { useEffect, useRef } from "react";

type Props = {
  foods: string[];
};

type FloatingFood = {
  el: HTMLDivElement;
  rx: number;
  ry: number;
  angle: number;
  baseX: number;
  baseY: number;
  floatDur: number;
};

// Positions spread across the viewport, avoiding the center product grid
const POSITIONS = [
  { top: "8%", left: "3%", size: 130 },
  { top: "15%", left: "90%", size: 110 },
  { top: "38%", left: "5%", size: 140 },
  { top: "52%", left: "94%", size: 115 },
  { top: "70%", left: "6%", size: 130 },
  { top: "85%", left: "90%", size: 105 },
  { top: "30%", left: "95%", size: 95 },
  { top: "60%", left: "1%", size: 110 },
];

const FLOAT_DURATIONS = [6, 8, 7, 9, 6.5, 7.5, 10, 9];

export default function ProductsFloatingFoods({ foods }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FloatingFood[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

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

  // rAF loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const el: HTMLDivElement = container;

    const els = Array.from(
      el.querySelectorAll<HTMLDivElement>(".products-floater")
    );

    itemsRef.current = els.map((item, i) => ({
      el: item,
      rx: 0,
      ry: 0,
      angle: Math.random() * 360,
      baseX: 0,
      baseY: 0,
      floatDur: FLOAT_DURATIONS[i % FLOAT_DURATIONS.length],
    }));

    let raf = 0;
    const time0 = Date.now();

    function tick() {
      const time = (Date.now() - time0) * 0.001;
      const m = mouseRef.current;
      const cm = currentMouseRef.current;
      cm.x += (m.x - cm.x) * 0.05;
      cm.y += (m.y - cm.y) * 0.05;

      el.style.transform = `translate(${cm.x * 20}px, ${cm.y * 20}px)`;

      itemsRef.current.forEach((f, i) => {
        const rect = f.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = m.px - cx;
        const dy = m.py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetRx = 0;
        let targetRy = 0;
        let speedMult = 1;

        if (dist < 300 && dist > 0) {
          const force = (300 - dist) / 300;
          targetRx = (dx / dist) * force * -50;
          targetRy = (dy / dist) * force * -50;
          speedMult = 1 + force * 3;
        }

        f.rx += (targetRx - f.rx) * 0.08;
        f.ry += (targetRy - f.ry) * 0.08;
        f.angle += 0.15 * speedMult;

        const phase = ((time + i * 0.6) * Math.PI * 2) / f.floatDur;
        const floatY = Math.sin(phase) * 12;
        const floatAngle = Math.cos(phase) * 5;

        f.el.style.transform = `translate(${f.rx + f.baseX}px, ${f.ry + f.baseY + floatY}px) rotate(${f.angle + floatAngle}deg)`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Bubbles
  useEffect(() => {
    const container = bubblesRef.current;
    if (!container) return;

    const el: HTMLDivElement = container;

    const id = window.setInterval(() => {
      const bubble = document.createElement("div");
      bubble.className = "products-bubble";
      const size = Math.random() * 20 + 8;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      const duration = Math.random() * 6 + 6;
      bubble.style.animation = `products-bubble-rise ${duration}s linear forwards`;
      el.appendChild(bubble);
      window.setTimeout(() => bubble.remove(), duration * 1000);
    }, 550);

    return () => {
      window.clearInterval(id);
      el.innerHTML = "";
    };
  }, []);

  return (
    <>
      {/* Floating food thumbnails */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      >
        {foods.map((src, i) => {
          const pos = POSITIONS[i % POSITIONS.length];
          return (
            <div
              key={src}
              className="products-floater products-floater-size absolute"
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
                decoding="async"
                className="h-full w-full rounded-full object-cover opacity-[0.22] shadow-[0_10px_40px_rgba(20,83,45,0.15)] ring-1 ring-green-900/10"
              />
            </div>
          );
        })}
      </div>

      {/* Rising bubbles */}
      <div
        ref={bubblesRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2] overflow-hidden"
      />
    </>
  );
}