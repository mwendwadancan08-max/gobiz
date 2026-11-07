import Link from "next/link";
import type { Metadata } from "next";
import WelcomeNav from "@/components/WelcomeNav";

export const metadata: Metadata = {
  title: "GoBiz | Fresh Farm Products & Ready-Made Meals in Kenya",
  description:
    "Discover ready-made meals and fresh farm products with GoBiz, your everyday food market. Pay on delivery.",
  alternates: { canonical: "/" },
};

// Appetizing food spread — hero
const heroImage =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=75";

// Fresh farm produce — small card
const farmCardImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=70";

// Prepared meal — small card (pizza — appetizing, indulgent)
const mealCardImage =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=70";

export default function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Full-bleed food photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url("${heroImage}")` }}
      />

      {/* Darker brand overlay so the food photo still shows */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-green-950/85 via-green-950/70 to-neutral-950/90"
      />
      {/* Subtle red glow bottom-right for brand depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 h-[28rem] w-[28rem] rounded-full bg-red-600/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-16 h-96 w-96 rounded-full bg-green-500/20 blur-3xl"
      />

      <WelcomeNav />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 py-16 sm:px-8 sm:py-20">
        {/* Centered hero text */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Meals · Farm · Delivered
          </p>

          <h1 className="mt-6 text-6xl font-extrabold leading-[0.9] tracking-tight drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)] sm:text-7xl md:text-8xl lg:text-[9rem]">
            <span className="text-green-400">Go</span>
            <span className="text-red-400">Biz</span>
          </h1>

          <h2 className="mt-5 max-w-2xl text-xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl">
            Good food. Fresh from the farm.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Ready-made meals and fresh farm products in one convenient
            marketplace. Order what you need and pay on delivery.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-green-600 px-7 py-4 text-base font-bold text-white shadow-2xl shadow-green-900/50 transition hover:bg-green-500 sm:px-8"
            >
              Enter the marketplace
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-green-900"
            >
              Learn about GoBiz
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/75 sm:text-sm">
            <span>Pay on delivery</span>
            <span className="text-white/30">•</span>
            <span>Fresh from verified sellers</span>
            <span className="text-white/30">•</span>
            <span>Quick delivery in your area</span>
          </div>
        </div>

        {/* Bottom — visual category cards + short SEO note */}
        <div className="mt-14 sm:mt-20">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Link
              href="/products?category=READY_MADE"
              className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl p-5 text-left text-white shadow-2xl transition hover:-translate-y-0.5 sm:min-h-48"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,40,22,0.15) 0%, rgba(10,40,22,0.9) 100%), url("${mealCardImage}")`,
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </Link>

            <Link
              href="/products?category=FARM"
              className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl p-5 text-left text-white shadow-2xl transition hover:-translate-y-0.5 sm:min-h-48"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(60,10,10,0.15) 0%, rgba(60,10,10,0.9) 100%), url("${farmCardImage}")`,
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
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
            <span>Meals and farm products</span>
            <span className="mx-2 text-white/25">•</span>
            <a
              href="https://dbc-pi-two.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/30 underline-offset-4 transition hover:text-white"
            >
              DBC.creatives
            </a>
          </footer>
        </div>
      </div>
    </main>
  );
}