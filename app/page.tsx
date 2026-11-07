import Link from "next/link";
import type { Metadata } from "next";
import WelcomeNav from "@/components/WelcomeNav";

export const metadata: Metadata = {
  title: "GoBiz | Fresh Farm Products & Ready-Made Meals in Kenya",
  description:
    "Discover ready-made meals and fresh farm products with GoBiz, your everyday food market. Pay on delivery.",
  alternates: { canonical: "/" },
};

const heroImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=70";

export default function WelcomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-green-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${heroImage}")` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-green-900/85 to-red-950/75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-green-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-red-500/20 blur-3xl"
      />

      <WelcomeNav />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Meals · Farm · Delivered
          </p>

          <h1 className="mt-6 text-6xl font-extrabold leading-none tracking-tight drop-shadow-2xl sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="text-green-400">Go</span>
            <span className="text-red-400">Biz</span>
          </h1>

          <h2 className="mt-4 max-w-2xl text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl">
            Good food. Fresh from the farm.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-green-50/85 sm:text-base">
            Ready-made meals and fresh farm products in one convenient
            marketplace. Order what you need and pay on delivery.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
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
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-green-900"
            >
              Learn about GoBiz
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-green-100/85 sm:text-sm">
            <span>Pay on delivery</span>
            <span className="text-green-300/40">•</span>
            <span>Fresh from verified sellers</span>
            <span className="text-green-300/40">•</span>
            <span>Quick delivery in your area</span>
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-green-300">
              Your everyday food market in Kenya
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/85">
              GoBiz brings together ready-made meals from local food sellers
              and fresh farm produce from verified suppliers. Browse
              categories, add what you need to your cart, and pay on delivery
              within our service area.
            </p>
            <div className="mt-4 grid gap-2 text-xs text-green-100/80 sm:grid-cols-3">
              <Link
                href="/products?category=READY_MADE"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/15"
              >
                Browse ready-made meals →
              </Link>
              <Link
                href="/products?category=FARM"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/15"
              >
                Shop farm products →
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/15"
              >
                How ordering works →
              </Link>
            </div>
          </div>

          <footer className="mt-6 text-center text-[11px] text-white/60">
            <span>GoBiz</span>
            <span className="mx-2 text-white/30">•</span>
            <span>Meals and farm products</span>
            <span className="mx-2 text-white/30">•</span>
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