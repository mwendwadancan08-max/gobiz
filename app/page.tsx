import Link from "next/link";
import type { Metadata } from "next";
import WelcomeNav from "@/components/WelcomeNav";
import WelcomeFloatingLayers from "@/components/WelcomeFloatingLayers";

export const metadata: Metadata = {
  title: "GoBiz | Fresh Farm Products & Ready-Made Meals in Kenya",
  description:
    "Discover ready-made meals and fresh farm products with GoBiz, your everyday food market. Pay on delivery.",
  alternates: { canonical: "/" },
};

// Hero food spread
const heroImage =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=75";

const farmCardImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=70";

const mealCardImage =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=70";

// Small floating food thumbnails (foreground + background)
const floatingFoods = [
  // Foreground (large + medium)
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=70", // pizza slice
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=70", // salad bowl
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=70", // burger
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=70", // burger alt
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=70", // produce
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=70", // veggie bowl
  // Background (small, blurred)
  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=60",
  "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=300&q=60",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=60",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=60",
];

export default function WelcomePage() {
  return (
    <main className="welcome-shell relative min-h-screen overflow-hidden text-white">
      {/* Dark green→black radial gradient — GoBiz palette */}
      <div aria-hidden="true" className="welcome-bg" />

      {/* Soft brand glows */}
      <div
        aria-hidden="true"
        className="welcome-glow-green pointer-events-none absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="welcome-glow-red pointer-events-none absolute -right-40 -bottom-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
      />

      {/* Rising bubbles + floating food layers */}
      <WelcomeFloatingLayers foods={floatingFoods} />

      {/* Floating nav (hamburger) — preserved */}
      <WelcomeNav />

      {/* ===== MAIN CONTENT (preserved structure, soda-styled shell) ===== */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 py-16 sm:px-8 sm:py-20">
        {/* Center hero block */}
        <div className="welcome-hero flex flex-1 flex-col items-center justify-center text-center">
          <p className="welcome-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Meals · Farm · Delivered
          </p>

          <h1 className="welcome-wordmark mt-6 text-6xl font-extrabold leading-[0.9] tracking-tight sm:text-7xl md:text-8xl lg:text-[9rem]">
            <span className="text-green-400">Go</span>
            <span className="text-red-400">Biz</span>
          </h1>

          {/* Galada decorative accent word — soda-style cursive moment */}
          <p className="welcome-accent mt-2 font-[Galada] text-2xl text-green-200/90 sm:text-3xl">
            fresh.
          </p>

          <h2 className="welcome-tagline mt-4 max-w-2xl text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl">
            Good food. Fresh from the farm.
          </h2>

          <p className="welcome-description mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Ready-made meals and fresh farm products in one convenient
            marketplace. Order what you need and pay on delivery.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="welcome-cta-primary group inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-bold text-white sm:px-8"
            >
              Enter the marketplace
              <span className="welcome-cta-plus inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-black leading-none text-white">
                +
              </span>
            </Link>

            <Link
              href="/about"
              className="welcome-cta-secondary inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white"
            >
              Learn about GoBiz
            </Link>
          </div>

          <div className="welcome-trust mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            <span>Pay on delivery</span>
            <span className="opacity-30">•</span>
            <span>Fresh from verified sellers</span>
            <span className="opacity-30">•</span>
            <span>Quick delivery in your area</span>
          </div>

          <div className="welcome-award mt-8 inline-flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 text-green-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                Verified sellers
              </span>
              <span className="text-xs font-semibold text-white">
                Kenya · 2025
              </span>
            </span>
          </div>
        </div>

        {/* Bottom — category cards + SEO note (preserved) */}
        <div className="mt-14 sm:mt-20">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Link
              href="/products?category=READY_MADE"
              className="welcome-card group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl p-5 text-left text-white transition sm:min-h-48"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,40,22,0.15) 0%, rgba(10,40,22,0.92) 100%), url("${mealCardImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-200">
                Discover
              </span>
              <span className="mt-1 text-xl font-extrabold sm:text-2xl">
                Ready-made meals
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-100">
                Browse meals
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </Link>

            <Link
              href="/products?category=FARM"
              className="welcome-card group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl p-5 text-left text-white transition sm:min-h-48"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(60,10,10,0.15) 0%, rgba(60,10,10,0.92) 100%), url("${farmCardImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                Shop fresh
              </span>
              <span className="mt-1 text-xl font-extrabold sm:text-2xl">
                Farm products
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-100">
                Browse produce
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </Link>
          </div>

          <div className="welcome-seo mt-4 rounded-2xl p-5 sm:p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-300 sm:text-xs">
              Your everyday food market in Kenya
            </h3>
            <p className="mt-2 text-xs leading-6 text-white/80 sm:text-sm">
              GoBiz brings together ready-made meals from local food sellers
              and fresh farm produce from verified suppliers. Browse, add to
              cart and pay on delivery within our service area.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/70">
              <Link href="/how-it-works" className="underline-offset-4 hover:text-white hover:underline">
                How ordering works →
              </Link>
              <Link href="/faq" className="underline-offset-4 hover:text-white hover:underline">
                FAQ →
              </Link>
              <Link href="/contact" className="underline-offset-4 hover:text-white hover:underline">
                Contact →
              </Link>
            </div>
          </div>

          <footer className="mt-6 text-center text-[11px] text-white/50">
            <span>GoBiz</span>
            <span className="mx-2 text-white/25">•</span>
            <span>Owned by Gerald Mwai</span>
            <span className="mx-2 text-white/25">•</span>
            <span>Managed by the GoBiz team</span>
            <span className="mx-2 text-white/25">•</span>
            <a
              href="mailto:dbc.techfirm@gmail.com"
              aria-label="Website designed and maintained by DBC.Africa"
              title="Designed & maintained by DBC.Africa"
              className="text-white/30 underline decoration-white/10 underline-offset-4 transition hover:text-white/80 hover:decoration-white/40 focus:text-white focus:outline-none"
            >
              DBC.Africa
            </a>
          </footer>
        </div>
      </div>
    </main>
  );
}