"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: "READY_MADE" | "FARM";
  price: number;
  description: string;
};

const products: Product[] = [
  { id: 1, name: "Pilau Meal", category: "READY_MADE", price: 250, description: "A delicious, ready-made meal." },
  { id: 2, name: "Chicken Meal", category: "READY_MADE", price: 350, description: "A satisfying prepared meal." },
  { id: 3, name: "Chapati & Beans", category: "READY_MADE", price: 150, description: "A simple, filling meal." },
  { id: 4, name: "Fresh Tomatoes", category: "FARM", price: 100, description: "Fresh farm produce." },
  { id: 5, name: "Fresh Potatoes", category: "FARM", price: 120, description: "Everyday farm essentials." },
  { id: 6, name: "Fresh Onions", category: "FARM", price: 80, description: "A kitchen staple." },
];

const pages = {
  "About Us": {
    subtitle: "Food shopping, made convenient.",
    body: [
      "GoBiz brings ready-made meals and farm products together in one convenient marketplace.",
      "Our goal is to make it easier for customers to discover food, order what they need and receive their purchases within our service area.",
      "We are building a convenient connection between customers, food sellers and farm produce suppliers.",
    ],
  },
  "How It Works": {
    subtitle: "From browsing to delivery.",
    body: [
      "1. Browse the marketplace. Explore ready-made meals and farm products together, or filter by category.",
      "2. Add your products. Choose quantities and review your cart.",
      "3. Confirm your location. GoBiz checks whether your destination falls within our current delivery radius.",
      "4. Enter your details. Provide your name, phone number, email and delivery address, including your building or house number and floor where applicable.",
      "5. Receive your order. Payment is made on delivery. Available delivery fees are calculated at checkout.",
    ],
  },
  FAQ: {
    subtitle: "Frequently asked questions.",
    body: [
      "Do I have to share my location? No, not to browse. However, you must share your location before placing an order so we can check delivery availability.",
      "How do I pay? GoBiz initially supports payment on delivery. Online payments are not available in this version.",
      "Can I order farm products and meals together? Yes. Both categories appear in the same marketplace by default.",
      "What if GoBiz does not deliver to my area? We will let you know that your destination is outside our current service area. We hope to expand coverage in the future.",
      "How are delivery fees calculated? Fees will be determined by GoBiz's configured delivery policy. The applicable fee will be shown before an order is confirmed.",
      "How can I leave a review or complaint? Once ordering and delivery are fully enabled, customers will be able to review their experience and submit complaints.",
    ],
  },
  "Our Services": {
    subtitle: "One marketplace. Two product categories.",
    body: [
      "Ready-made meals: Discover prepared meals offered by participating food sellers.",
      "Farm products: Shop fresh produce and other available farm products.",
      "Convenient delivery: Request delivery to a destination within the active GoBiz service radius.",
      "Customer feedback: Share your experience and raise concerns through our customer support channels.",
      "Our catalogue, prices and delivery availability will depend on the products and services currently listed on GoBiz.",
    ],
  },
  "Contact Us": {
    subtitle: "We're here to help.",
    body: [
      "Have a question about our products, delivery coverage or services? Contact the GoBiz team.",
      "WhatsApp: +254 757 699959",
      "Email: 254gobiz@gmail.com",
      "For faster assistance, include your order number when contacting us about an existing order.",
    ],
  },
};

type PageName = keyof typeof pages;
type CartItem = { product: Product; quantity: number };

const mealImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85";

const farmImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85";

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoPage, setInfoPage] = useState<PageName | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [checkingLocation, setCheckingLocation] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntro(false);
      setLocationOpen(true);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

  function checkLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Your device does not support location sharing.");
      return;
    }

    setCheckingLocation(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setCheckingLocation(false);
        setLocationOpen(false);
        setLocationMessage("");
      },
      () => {
        setCheckingLocation(false);
        setLocationMessage(
          "Location was not shared. You can continue browsing, but sharing your location is required before ordering."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      category === "ALL" || product.category === category;
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (intro) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-7xl font-extrabold tracking-tight sm:text-9xl">
            <span className="text-green-700">Go</span>
            <span className="text-red-700">Biz</span>
          </h1>
          <a
            href="https://dbc-pi-two.vercel.app"
            className="mt-3 inline-block text-sm text-red-900"
          >
            Powered by DBC.creatives
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:gap-5 sm:px-6">
          {/* Hamburger moved to the left */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open GoBiz menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-2xl hover:border-green-700 hover:bg-green-50"
          >
            <span aria-hidden="true">☰</span>
          </button>

          <a href="#" className="shrink-0">
            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-green-700">Go</span>
              <span className="text-red-700">Biz</span>
            </span>
            <span className="block text-[10px] text-red-900">
              Powered by{" "}
              <span className="underline">DBC.creatives</span>
            </span>
          </a>

          <div className="hidden max-w-md flex-1 md:block">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search meals and farm products..."
              aria-label="Search products"
              className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm outline-none focus:border-green-700"
            />
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="ml-auto shrink-0 rounded-full bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-900 sm:px-5"
          >
            Cart ({cartCount})
          </button>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search meals and farm products..."
            aria-label="Search products"
            className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-green-700"
          />
        </div>
      </header>

      {/* COMPACT HERO — reduced from the previous version */}
      <section className="overflow-hidden border-b border-green-100 bg-gradient-to-br from-green-50 via-white to-sky-50">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-2 md:gap-8 md:py-9">
          <div>
            <p className="mb-2 inline-block rounded-full border border-green-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-green-800 sm:text-xs">
              Meals and farm products in one place
            </p>

            <h1 className="text-6xl font-extrabold leading-none tracking-tight sm:text-7xl lg:text-8xl">
              <span className="text-green-700">Go</span>
              <span className="text-red-700">Biz</span>
            </h1>

            <h2 className="mt-3 max-w-lg text-xl font-bold leading-tight sm:text-2xl">
              Good food. Fresh from the farm.
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
              Discover ready-made meals and fresh farm products, all in one
              convenient marketplace.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-4 rounded-full bg-green-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-900"
            >
              Explore products
            </button>

            <p className="mt-2 text-xs text-neutral-500">
              Convenient ordering. Pay on delivery.
            </p>
          </div>

          {/* Image-backed category panels */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setCategory("READY_MADE");
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl bg-green-950 p-4 text-left text-white shadow-md transition hover:-translate-y-1 sm:min-h-52 sm:rounded-3xl sm:p-5"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(10,40,22,.92), rgba(10,40,22,.08)), url("${mealImage}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Discover
              </span>
              <span className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">
                Ready-made meals
              </span>
              <span className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-2 text-xs font-bold text-green-900 sm:text-sm">
                Browse meals
              </span>
            </button>

            <button
              onClick={() => {
                setCategory("FARM");
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative mt-4 flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl bg-red-950 p-4 text-left text-white shadow-md transition hover:-translate-y-1 sm:mt-6 sm:min-h-52 sm:rounded-3xl sm:p-5"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(75,15,15,.94), rgba(75,15,15,.08)), url("${farmImage}")`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-red-100">
                Shop fresh
              </span>
              <span className="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">
                Farm products
              </span>
              <span className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-2 text-xs font-bold text-red-900 sm:text-sm">
                Browse produce
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCT MARKETPLACE */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-800">
              The GoBiz marketplace
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Find what you need
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Browse meals and farm products together.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All products", value: "ALL" },
              { label: "Ready-made meals", value: "READY_MADE" },
              { label: "Farm products", value: "FARM" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setCategory(item.value)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  category === item.value
                    ? "border-green-800 bg-green-800 text-white"
                    : "border-neutral-300 bg-white hover:border-green-700 hover:bg-green-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="relative flex aspect-[4/3] items-end overflow-hidden bg-cover bg-center p-3 sm:p-4"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.62), rgba(0,0,0,.02)), url("${
                    product.category === "FARM"
                      ? farmImage
                      : mealImage
                  }")`,
                  backgroundPosition: `${index % 2 === 0 ? "center" : "60% center"}`,
                }}
              >
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-neutral-800 sm:text-xs">
                  {product.category === "FARM"
                    ? "Farm products"
                    : "Ready-made meal"}
                </span>
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="font-bold leading-snug">{product.name}</h3>
                <p className="mt-1 min-h-8 text-xs leading-5 text-neutral-500">
                  {product.description}
                </p>
                <p className="mt-3 text-base font-extrabold sm:text-lg">
                  KSh {product.price.toLocaleString("en-KE")}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full rounded-full bg-green-800 px-3 py-2.5 text-xs font-bold text-white hover:bg-green-900 sm:text-sm"
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-12 text-center">
            <h3 className="font-bold">No matching products</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Try another search or choose a different category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("ALL");
              }}
              className="mt-4 rounded-full bg-green-800 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Show all products
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-xs text-neutral-500">
          Sample catalogue for layout testing. Live products and prices will
          come from GoBiz's database.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 bg-neutral-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="text-2xl font-extrabold">
              <span className="text-green-400">Go</span>
              <span className="text-red-400">Biz</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-400">
              Ready-made meals and farm products in one convenient marketplace.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Explore GoBiz</h3>
            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-neutral-300">
              {(Object.keys(pages) as PageName[]).map((page) => (
                <button
                  key={page}
                  onClick={() => setInfoPage(page)}
                  className="hover:text-green-300"
                >
                  {page}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold">Contact our team</h3>
            <p className="mt-3 text-sm text-neutral-300">
              WhatsApp: +254 757 699959
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              Email: 254gobiz@gmail.com
            </p>
            <a
              href="https://dbc-pi-two.vercel.app"
              className="mt-4 inline-block text-xs text-red-300 hover:text-red-200"
            >
              Powered by DBC.creatives
            </a>
          </div>
        </div>

        <div className="border-t border-neutral-800 px-5 py-4 text-center text-xs text-neutral-500">
          GoBiz · Meals and farm products
        </div>
      </footer>

      {/* LEFT MENU BUTTON OPENS A COLOURED SIDE PANEL */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="flex h-full w-[min(360px,90vw)] flex-col overflow-y-auto bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold">
                    <span className="text-green-300">Go</span>
                    <span className="text-red-300">Biz</span>
                  </h2>
                  <p className="mt-2 text-sm text-green-100">
                    Good food. Fresh from the farm.
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="rounded-xl bg-white/10 px-3 py-1 text-2xl hover:bg-white/20"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-200">
                  Explore
                </p>
                <p className="mt-1 text-sm leading-6 text-white">
                  Find meals, discover farm produce and learn more about GoBiz.
                </p>
              </div>
            </div>

            <nav className="flex-1 p-4">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                Information
              </p>

              {(Object.keys(pages) as PageName[]).map((page, index) => (
                <button
                  key={page}
                  onClick={() => {
                    setMenuOpen(false);
                    setInfoPage(page);
                  }}
                  className={`mb-2 flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition hover:translate-x-1 ${
                    index === 0
                      ? "border-green-100 bg-green-50 hover:bg-green-100"
                      : index === 1
                        ? "border-sky-100 bg-sky-50 hover:bg-sky-100"
                        : index === 2
                          ? "border-red-100 bg-red-50 hover:bg-red-100"
                          : index === 3
                            ? "border-amber-100 bg-amber-50 hover:bg-amber-100"
                            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                      index === 0
                        ? "bg-green-800 text-white"
                        : index === 1
                          ? "bg-sky-700 text-white"
                          : index === 2
                            ? "bg-red-800 text-white"
                            : index === 3
                              ? "bg-amber-600 text-white"
                              : "bg-neutral-800 text-white"
                    }`}
                  >
                    {["A", "H", "?", "S", "C"][index]}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-neutral-900">
                      {page}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {
                        [
                          "Who we are",
                          "Ordering and delivery",
                          "Answers to common questions",
                          "What we offer",
                          "Get in touch",
                        ][index]
                      }
                    </span>
                  </span>
                  <span className="text-neutral-400">›</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(true);
                }}
                className="mt-3 w-full rounded-xl bg-red-800 px-4 py-3.5 text-left font-bold text-white hover:bg-red-900"
              >
                Open my cart ({cartCount})
              </button>
            </nav>

            <div className="border-t border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-semibold text-neutral-800">
                Need assistance?
              </p>
              <a
                href="https://wa.me/254757699959"
                className="mt-2 inline-flex w-full justify-center rounded-full bg-green-800 px-4 py-3 text-sm font-bold text-white hover:bg-green-900"
              >
                Contact GoBiz on WhatsApp
              </a>
              <a
                href="https://dbc-pi-two.vercel.app"
                className="mt-4 block text-center text-xs text-red-900 underline"
              >
                Powered by DBC.creatives
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* DETAILED INFORMATION PAGES */}
      {infoPage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setInfoPage(null)}
        >
          <section
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-900 via-green-800 to-red-900 p-6 text-white sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-200">
                    Welcome to GoBiz
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold">
                    {infoPage}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    {pages[infoPage].subtitle}
                  </p>
                </div>
                <button
                  onClick={() => setInfoPage(null)}
                  aria-label="Close page"
                  className="rounded-xl bg-white/10 px-3 py-1 text-2xl hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              {pages[infoPage].body.map((paragraph, index) => (
                <div
                  key={paragraph}
                  className="flex gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-900">
                    {index + 1}
                  </span>
                  <p className="whitespace-pre-line text-sm leading-7 text-neutral-700">
                    {paragraph}
                  </p>
                </div>
              ))}

              {infoPage === "Contact Us" && (
                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <a
                    href="https://wa.me/254757699959"
                    className="rounded-full bg-green-800 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-900"
                  >
                    Chat on WhatsApp
                  </a>
                  <a
                    href="mailto:254gobiz@gmail.com"
                    className="rounded-full border border-sky-200 bg-sky-50 px-5 py-3 text-center text-sm font-bold text-sky-900 hover:bg-sky-100"
                  >
                    Send us an email
                  </a>
                </div>
              )}

              <button
                onClick={() => setInfoPage(null)}
                className="mt-2 w-full rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
              >
                Back to GoBiz
              </button>
            </div>
          </section>
        </div>
      )}

      {/* RESPONSIVE CART: DRAWER ON DESKTOP, FULL SCREEN ON MOBILE */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/50"
          onClick={() => setCartOpen(false)}
        >
          <section
            className="ml-auto flex h-full w-full flex-col bg-white sm:max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-extrabold">Your cart</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {cartCount} item{cartCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="rounded-xl px-3 py-1 text-2xl hover:bg-neutral-100"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <h3 className="text-lg font-bold">Your cart is empty</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Add meals or farm products to get started.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-5 rounded-full bg-green-800 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-4"
                    >
                      <div>
                        <h3 className="font-bold">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          KSh {item.product.price.toLocaleString("en-KE")} each
                        </p>
                        <p className="mt-1 font-bold">
                          KSh{" "}
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString("en-KE")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => changeQuantity(item.product.id, -1)}
                          aria-label={`Remove one ${item.product.name}`}
                          className="h-9 w-9 rounded-full border hover:bg-neutral-100"
                        >
                          −
                        </button>
                        <span className="min-w-4 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(item.product.id, 1)}
                          aria-label={`Add one ${item.product.name}`}
                          className="h-9 w-9 rounded-full border hover:bg-neutral-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t bg-white p-5">
              <div className="flex justify-between text-lg font-extrabold">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString("en-KE")}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Delivery charges are calculated at checkout. Payment is made
                on delivery.
              </p>

              {!location && cart.length > 0 && (
                <p className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm leading-6 text-sky-900">
                  Share your location before ordering so GoBiz can check
                  delivery availability.
                </p>
              )}

              {locationMessage && (
                <p className="mt-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
                  {locationMessage}
                </p>
              )}

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  if (!location) {
                    setCartOpen(false);
                    setLocationOpen(true);
                  } else {
                    setLocationMessage(
                      "Location captured in this browser session. Secure delivery validation and checkout will be connected to the GoBiz backend next."
                    );
                  }
                }}
                className="mt-4 w-full rounded-full bg-green-800 px-5 py-3.5 font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {location ? "Continue to checkout" : "Share location to order"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* BRANDED LOCATION PERMISSION */}
      {locationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <section className="w-full max-w-md overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-green-900 to-green-700 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-green-200">
                GoBiz delivery check
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Is GoBiz delivering to your area?
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm leading-7 text-neutral-600">
                Share your location so we can check whether your destination
                falls within our current delivery radius. If we do not yet
                serve your area, we will let you know as we work toward
                expanding coverage.
              </p>

              {locationMessage && (
                <p className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm leading-6 text-sky-900">
                  {locationMessage}
                </p>
              )}

              <button
                onClick={checkLocation}
                disabled={checkingLocation}
                className="mt-5 w-full rounded-full bg-green-800 px-5 py-3.5 font-bold text-white hover:bg-green-900 disabled:opacity-60"
              >
                {checkingLocation ? "Checking location..." : "Share my location"}
              </button>

              <button
                onClick={() => setLocationOpen(false)}
                className="mt-3 w-full rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
              >
                Browse without sharing
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
                You can browse without sharing. Location is required before
                an order can be placed. Your browser will ask for permission
                after you select the button above.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}