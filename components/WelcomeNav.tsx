"use client";

import type { ReactElement } from "react";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { InfoSlug } from "@/components/GoBizInfoPage";

const GoBizInfoPage = dynamic(
  () =>
    import("@/components/GoBizInfoPage").then((m) => m.GoBizInfoPage),
  { ssr: false }
);

type NavItem = {
  slug: InfoSlug;
  label: string;
  desc: string;
  accent: "green" | "red";
  icon: ReactElement;
};

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function HowItWorksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function FaqIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { slug: "about", label: "About Us", desc: "Who we are", accent: "green", icon: <AboutIcon /> },
  { slug: "how-it-works", label: "How It Works", desc: "Ordering and delivery", accent: "red", icon: <HowItWorksIcon /> },
  { slug: "faq", label: "FAQ", desc: "Answers to common questions", accent: "green", icon: <FaqIcon /> },
  { slug: "services", label: "Our Services", desc: "What we offer", accent: "red", icon: <ServicesIcon /> },
  { slug: "contact", label: "Contact Us", desc: "Get in touch", accent: "green", icon: <ContactIcon /> },
];

export default function WelcomeNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<InfoSlug | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (activePopup) setActivePopup(null);
        else if (menuOpen) setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, activePopup]);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen || activePopup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, activePopup]);

  function openPopup(slug: InfoSlug) {
    setMenuOpen(false);
    setActivePopup(slug);
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        className="absolute left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl text-white shadow-lg shadow-black/20 backdrop-blur-md transition hover:bg-white hover:text-green-900 sm:left-6 sm:top-6"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {/* ===== Full-screen glass menu ===== */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="GoBiz menu"
        >
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-green-950/70 backdrop-blur-md"
            onClick={() => setMenuOpen(false)}
          />

          {/* Glass card */}
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_30px_100px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Brand glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-green-500/30 blur-3xl"
            />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-4 border-b border-white/15 p-6 sm:p-8">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  <span className="text-green-400">Go</span>
                  <span className="text-red-400">Biz</span>
                </p>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">
                  Meals and farm products, in one place.
                </p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white transition hover:bg-white hover:text-green-900"
              >
                ×
              </button>
            </div>

            {/* Nav grid */}
            <div className="relative grid gap-2 p-4 sm:grid-cols-2 sm:p-6">
              {navItems.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => openPopup(item.slug)}
                  className="group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/20"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition group-hover:scale-105 ${
                      item.accent === "green"
                        ? "bg-gradient-to-br from-green-700 to-green-500"
                        : "bg-gradient-to-br from-red-800 to-red-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-white">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/60">
                      {item.desc}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="relative flex flex-col gap-2 border-t border-white/15 p-4 sm:flex-row sm:p-6">
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-500"
              >
                Enter the marketplace
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link
                href="/signin"
                onClick={() => setMenuOpen(false)}
                className="flex flex-1 items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-green-900"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===== Info popup ===== */}
      {activePopup && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActivePopup(null)}
          />

          {/* Popup card */}
          <div
            className="relative my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setActivePopup(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-neutral-700 shadow-lg backdrop-blur transition hover:bg-red-500 hover:text-white sm:right-4 sm:top-4"
            >
              ×
            </button>

            {/* Info content */}
            <GoBizInfoPage slug={activePopup} />
          </div>
        </div>
      )}
    </>
  );
}