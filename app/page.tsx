"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import FeedbackWidget from "@/components/FeedbackWidget";

type Product = {
  id: number | string;
  name: string;
  category: "READY_MADE" | "FARM";
  price: number;
  description: string;
  imageUrl?: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

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
      "1. Browse the marketplace and explore meals or farm products.",
      "2. Add products to your cart and review your quantities.",
      "3. Share your GPS location so GoBiz can verify delivery availability.",
      "4. Enter your name, phone number, email and delivery address.",
      "5. Confirm your order and pay on delivery.",
    ],
  },
  FAQ: {
    subtitle: "Frequently asked questions.",
    body: [
      "Do I have to share my location? Not to browse. A valid location within the delivery radius is required before ordering.",
      "How do I pay? GoBiz currently supports payment on delivery.",
      "Can I order farm products and meals together? Yes, add both to the same cart.",
      "What if my area is outside the delivery radius? You will not be able to place a delivery order from outside the current service area.",
      "How are delivery fees calculated? The applicable delivery fee is shown during checkout.",
      "How can I leave a review or complaint? Use the Feedback button on the left side of the page.",
    ],
  },
  "Our Services": {
    subtitle: "One marketplace. Two product categories.",
    body: [
      "Ready-made meals: Discover prepared meals offered by participating food sellers.",
      "Farm products: Shop fresh produce and other available farm products.",
      "Convenient delivery: Request delivery within the active GoBiz service radius.",
      "Customer feedback: Share your experience and raise concerns through our feedback form.",
      "Our catalogue, prices and delivery availability depend on the products and services currently listed on GoBiz.",
    ],
  },
  "Contact Us": {
    subtitle: "We're here to help.",
    body: [
      "Have a question about our products, delivery coverage or services? Contact the GoBiz team.",
      "WhatsApp: +254 757 699959",
      "Email: 254gobiz@gmail.com",
      "For assistance with an existing order, include your order number.",
    ],
  },
};

type PageName = keyof typeof pages;

const pageRoutes: Record<PageName, string> = {
  "About Us": "/about",
  "How It Works": "/how-it-works",
  FAQ: "/faq",
  "Our Services": "/services",
  "Contact Us": "/contact",
};

const pageDescriptions: Record<PageName, string> = {
  "About Us": "Who we are",
  "How It Works": "Ordering and delivery",
  FAQ: "Answers to common questions",
  "Our Services": "What we offer",
  "Contact Us": "Get in touch",
};

function AboutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function HowItWorksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FaqIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ServicesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const pageIcons: Record<PageName, () => ReactElement> = {
  "About Us": AboutIcon,
  "How It Works": HowItWorksIcon,
  FAQ: FaqIcon,
  "Our Services": ServicesIcon,
  "Contact Us": ContactIcon,
};

const mealImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=70";

const farmImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=70";

const heroImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=70",
];

const CART_STORAGE_KEY = "gobiz-cart";
const LOCATION_STORAGE_KEY = "gobiz-location";

function formatPrice(price: number) {
  return `KSh ${price.toLocaleString("en-KE")}`;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [addedProduct, setAddedProduct] = useState("");
  const [addedNotice, setAddedNotice] = useState(false);
  const [showStickyCart, setShowStickyCart] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntro(false);
      setLocationOpen(true);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (intro || menuOpen || cartOpen || locationOpen) return;

    const interval = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroImages.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [intro, menuOpen, cartOpen, locationOpen]);

  // Track scroll so we can switch the cart from "on-hero" to "sticky pinned"
  useEffect(() => {
    function onScroll() {
      setShowStickyCart(window.scrollY > 220);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(
            parsed.filter(
              (item): item is CartItem =>
                item !== null &&
                typeof item === "object" &&
                "product" in item &&
                "quantity" in item &&
                typeof item.quantity === "number" &&
                item.quantity > 0 &&
                item.product !== null &&
                typeof item.product === "object"
            )
          );
        }
      }

      const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);

      if (savedLocation) {
        const parsed: unknown = JSON.parse(savedLocation);

        if (
          parsed !== null &&
          typeof parsed === "object" &&
          "latitude" in parsed &&
          "longitude" in parsed &&
          typeof parsed.latitude === "number" &&
          typeof parsed.longitude === "number"
        ) {
          setLocation({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          });
        }
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (cartHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError("");

      try {
        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Products could not be loaded.");
        }

        const data: unknown = await response.json();

        const rawProducts = Array.isArray(data)
          ? data
          : data &&
              typeof data === "object" &&
              "products" in data &&
              Array.isArray(data.products)
            ? data.products
            : null;

        if (!rawProducts) {
          throw new Error("The products API returned an unexpected response.");
        }

        const validProducts: Product[] = rawProducts
          .filter(
            (item): item is Record<string, unknown> =>
              typeof item === "object" && item !== null
          )
          .filter(
            (item) =>
              (typeof item.id === "number" ||
                typeof item.id === "string") &&
              typeof item.name === "string" &&
              (item.category === "READY_MADE" ||
                item.category === "FARM") &&
              Number.isFinite(Number(item.price)) &&
              Number(item.price) >= 0
          )
          .map((item) => ({
            id: item.id as number | string,
            name: item.name as string,
            category: item.category as "READY_MADE" | "FARM",
            price: Number(item.price),
            description:
              typeof item.description === "string"
                ? item.description
                : "",
            imageUrl:
              typeof item.imageUrl === "string"
                ? item.imageUrl
                : typeof item.image_url === "string"
                  ? item.image_url
                  : null,
          }));

        setProducts(validProducts);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setProductsError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading products."
        );
      } finally {
        if (!controller.signal.aborted) {
          setProductsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
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
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coordinates);

        try {
          localStorage.setItem(
            LOCATION_STORAGE_KEY,
            JSON.stringify(coordinates)
          );
        } catch {
          // Checkout must still verify location availability.
        }

        setCheckingLocation(false);
        setLocationOpen(false);
        setLocationMessage("");
      },
      () => {
        setCheckingLocation(false);
        setLocationMessage(
          "Location was not shared. You can continue browsing, but you must share your location before placing an order."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => String(item.product.id) === String(product.id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.product.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setAddedProduct(product.name);
    setAddedNotice(true);
    window.setTimeout(() => setAddedNotice(false), 2200);
  }

  function changeQuantity(id: number | string, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          String(item.product.id) === String(id)
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: number | string) {
    setCart((current) =>
      current.filter(
        (item) => String(item.product.id) !== String(id)
      )
    );
  }

  function scrollToProducts() {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCategory("ALL");
  }

  function goToCheckout() {
    if (cart.length === 0) return;

    setCartOpen(false);
    window.location.href = "/checkout";
  }

  const searchTerms = normalizeSearchText(search)
    .split(" ")
    .filter(Boolean);

  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      category === "ALL" || product.category === category;

    const productText = normalizeSearchText(
      `${product.name} ${product.description}`
    );

    const matchesSearch = searchTerms.every((term) =>
      productText.includes(term)
    );

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!search.trim() || productsLoading || visibleProducts.length === 0) {
      return;
    }

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [search, productsLoading, visibleProducts.length]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (intro) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-7xl font-extrabold tracking-tight sm:text-9xl">
              <span className="text-green-700">Go</span>
              <span className="text-red-700">Biz</span>
            </h1>
          </div>
        </main>
        <FeedbackWidget />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white text-neutral-900">
        {/* ===== HERO (no header strip — starts at the very top) ===== */}
        <section className="relative overflow-hidden">
          {/* Slideshow background */}
          {heroImages.map((src, index) => (
            <div
              key={src}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ease-in-out"
              style={{
                backgroundImage: `url("${src}")`,
                opacity: heroSlide === index ? 1 : 0,
              }}
              aria-hidden="true"
            />
          ))}

          <div
            className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-green-900/80 to-red-950/70"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />

          {/* ===== Floating hamburger (top-left, on the hero) ===== */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open GoBiz menu"
            className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl text-white shadow-lg shadow-black/20 backdrop-blur-md transition hover:bg-white hover:text-green-900 sm:left-6 sm:top-6"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <span aria-hidden="true">☰</span>
          </button>

          {/* ===== Floating cart (top-right, on the hero) ===== */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="group absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur-md transition hover:bg-white hover:text-green-900 sm:right-6 sm:top-6"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <span className="transition group-hover:text-green-900">
              <CartIcon />
            </span>
            <span className="hidden sm:inline">Cart</span>
            <span className="flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-extrabold text-green-900 transition group-hover:bg-green-900 group-hover:text-white">
              {cartCount}
            </span>
          </button>

          {/* Hero content */}
          <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 sm:pb-10 sm:pt-20 md:pb-12 md:pt-24 lg:pb-14 lg:pt-28">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Meals · Farm · Delivered
              </p>

              <h1 className="mt-4 text-5xl font-extrabold leading-none tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
                <span className="text-green-400">Go</span>
                <span className="text-red-400">Biz</span>
              </h1>

              <h2 className="mt-3 max-w-xl text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl">
                Good food. Fresh from the farm.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-green-50/90 sm:text-base">
                Discover ready-made meals and fresh farm products in one
                convenient marketplace.
              </p>

              {/* Single search bar for the whole page */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  scrollToProducts();
                }}
                className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center"
                role="search"
              >
                <div className="relative flex-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      handleSearchChange(event.target.value)
                    }
                    placeholder="Search meals, farm produce, prices..."
                    aria-label="Search products"
                    className="w-full rounded-full border border-white/30 bg-white/95 py-3 pl-12 pr-4 text-sm text-neutral-900 shadow-lg outline-none placeholder:text-neutral-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 sm:py-3.5 sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-800 sm:py-3.5 sm:text-base"
                >
                  Search
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setCategory("READY_MADE");
                    scrollToProducts();
                  }}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-green-900"
                >
                  Ready-made meals
                </button>
                <button
                  onClick={() => {
                    setCategory("FARM");
                    scrollToProducts();
                  }}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-red-900"
                >
                  Farm products
                </button>
                <button
                  onClick={scrollToProducts}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-green-100 transition hover:text-white"
                >
                  Browse all products
                  <ChevronRightIcon />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-green-100/90 sm:text-sm">
                <span>Pay on delivery</span>
                <span className="text-green-300/50">•</span>
                <span>Fresh from verified sellers</span>
                <span className="text-green-300/50">•</span>
                <span>Quick delivery in your area</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center gap-1.5 pb-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setHeroSlide(index)}
                aria-label={`Show hero image ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  heroSlide === index
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </section>

        {/* ===== Sticky cart that appears after scrolling past the hero ===== */}
        {showStickyCart && (
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="group fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full bg-green-800 px-3 py-2 text-sm font-semibold text-white shadow-xl shadow-green-900/30 transition hover:bg-green-900 sm:right-6 sm:top-6"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <CartIcon />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-extrabold text-green-900">
              {cartCount}
            </span>
          </button>
        )}

        <section
          id="products"
          className="mx-auto max-w-7xl scroll-mt-24 px-3 py-9 sm:px-6 sm:py-12"
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

          {productsLoading ? (
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-12 text-center">
              <p className="text-sm text-neutral-600">
                Loading available products...
              </p>
            </div>
          ) : productsError ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
              <h3 className="font-bold text-red-900">
                Products are temporarily unavailable
              </h3>
              <p className="mt-2 text-sm text-red-800">{productsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-900"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {visibleProducts.map((product) => {
                  const cartItem = cart.find(
                    (item) =>
                      String(item.product.id) === String(product.id)
                  );

                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-lg sm:rounded-2xl"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-full w-full bg-cover bg-center"
                            role="img"
                            aria-label={product.name}
                            style={{
                              backgroundImage: `url("${product.category === "FARM" ? farmImage : mealImage}")`,
                            }}
                          />
                        )}
                      </div>

                      <div className="p-2 sm:p-4">
                        <h3 className="break-words text-xs font-bold leading-snug sm:text-base">
                          {product.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-7 text-[10px] leading-4 text-neutral-500 sm:min-h-10 sm:text-xs sm:leading-5">
                          {product.description || "Available from GoBiz."}
                        </p>
                        <p className="mt-2 break-words text-xs font-extrabold sm:mt-3 sm:text-lg">
                          {formatPrice(product.price)}
                        </p>

                        {cartItem ? (
                          <div className="mt-2 flex items-center gap-1.5 sm:mt-3 sm:gap-2">
                            <span className="flex min-h-9 flex-1 items-center justify-center rounded-full bg-red-700 px-1.5 py-2 text-[10px] font-bold text-white sm:text-sm">
                              Added to cart
                            </span>

                            <span className="flex h-9 min-w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 px-2 text-xs font-extrabold text-red-800">
                              {cartItem.quantity}
                            </span>

                            <button
                              onClick={() => addToCart(product)}
                              aria-label={`Add another ${product.name}`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-800 text-xl font-bold text-white hover:bg-green-900"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="mt-2 w-full rounded-full bg-green-800 px-1.5 py-2 text-[10px] font-bold text-white hover:bg-green-900 sm:mt-3 sm:px-3 sm:py-2.5 sm:text-sm"
                          >
                            Add to cart
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {visibleProducts.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-12 text-center">
                  <h3 className="font-bold">
                    {products.length === 0
                      ? "No products available yet"
                      : "No matching products"}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    {products.length === 0
                      ? "Products added to the GoBiz catalogue will appear here."
                      : "Try another search or choose a different category."}
                  </p>
                  {products.length > 0 && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setCategory("ALL");
                      }}
                      className="mt-4 rounded-full bg-green-800 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Show all products
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="border-t border-neutral-800 bg-neutral-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:grid-cols-3 sm:px-6">
            <div>
              <p className="text-2xl font-extrabold">
                <span className="text-green-400">Go</span>
                <span className="text-red-400">Biz</span>
              </p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-400">
                Ready-made meals and farm products in one convenient
                marketplace.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Explore GoBiz</h3>
              <div className="mt-3 flex flex-col items-start gap-2 text-sm text-neutral-300">
                {(Object.keys(pages) as PageName[]).map((page) => (
                  <Link
                    key={page}
                    href={pageRoutes[page]}
                    className="hover:text-green-300"
                  >
                    {page}
                  </Link>
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
            GoBiz - Meals and farm products
          </div>
        </footer>

        {menuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="GoBiz menu"
          >
            <aside
              className="ml-0 flex h-full w-[min(400px,90vw)] flex-col bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-neutral-200 bg-gradient-to-b from-green-50 to-white px-5 pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight">
                      <span className="text-green-700">Go</span>
                      <span className="text-red-700">Biz</span>
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      Meals and farm products, in one place.
                    </p>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl text-neutral-700 transition hover:border-red-300 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>

                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-800 bg-white px-4 py-3 text-sm font-bold text-green-800 transition hover:bg-green-800 hover:text-white"
                >
                  <UserIcon />
                  Sign in to your account
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Navigation
                </p>

                <div className="space-y-0.5">
                  {(Object.keys(pages) as PageName[]).map((page) => {
                    const Icon = pageIcons[page];
                    return (
                      <Link
                        key={page}
                        href={pageRoutes[page]}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-neutral-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-800 transition group-hover:bg-green-800 group-hover:text-white">
                          <Icon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-neutral-900">
                            {page}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-neutral-500">
                            {pageDescriptions[page]}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-green-700"
                        >
                          <ChevronRightIcon />
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Your order
                </p>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-green-800 px-4 py-3 text-left text-white transition hover:bg-green-900"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <CartIcon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">
                      Open my cart
                    </span>
                    <span className="mt-0.5 block text-[11px] text-green-100">
                      {cartCount} item{cartCount === 1 ? "" : "s"} waiting
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-green-900">
                    {cartCount}
                  </span>
                </button>
              </nav>

              <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-4">
                <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Need assistance?
                </p>
                <a
                  href="https://wa.me/254757699959"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-green-800 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-900"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42-.14 0-.31-.02-.47-.02-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
                  </svg>
                  Contact GoBiz on WhatsApp
                </a>
                <div className="mt-3 flex items-center justify-between">
                  <a
                    href="https://dbc-pi-two.vercel.app"
                    className="text-[10px] text-neutral-500 underline underline-offset-2 hover:text-red-700"
                  >
                    Powered by DBC.creatives
                  </a>
                  <span className="text-[10px] text-neutral-400">
                    v1.0
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}

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
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50/50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-bold text-neutral-900">
                              {item.product.name}
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">
                              {item.product.category === "FARM"
                                ? "Farm product"
                                : "Ready-made meal"}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                              {formatPrice(item.product.price)} each
                            </p>
                          </div>

                          <p className="shrink-0 font-extrabold text-green-900">
                            {formatPrice(
                              item.product.price * item.quantity
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white p-1">
                            <button
                              onClick={() =>
                                changeQuantity(item.product.id, -1)
                              }
                              aria-label={`Remove one ${item.product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-lg font-bold text-neutral-800 hover:bg-neutral-100"
                            >
                              −
                            </button>

                            <span className="min-w-5 text-center text-sm font-extrabold text-neutral-900">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                changeQuantity(item.product.id, 1)
                              }
                              aria-label={`Add one ${item.product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800 text-lg font-bold text-white hover:bg-green-900"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100"
                          >
                            Remove item
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
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Delivery charges are calculated at checkout. Payment is made
                  on delivery.
                </p>

                {!location && cart.length > 0 && (
                  <p className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm leading-6 text-sky-900">
                    You can continue to checkout, but sharing your GPS location
                    is mandatory before an order can be placed.
                  </p>
                )}

                <button
                  disabled={cart.length === 0}
                  onClick={goToCheckout}
                  className="mt-4 w-full rounded-full bg-green-800 px-5 py-3.5 font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  Proceed to checkout
                </button>
              </div>
            </section>
          </div>
        )}

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
                  Share your GPS location so GoBiz can check delivery
                  availability. You can skip this step to browse, but location
                  sharing is required before placing an order.
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
                  {checkingLocation
                    ? "Checking location..."
                    : "Share my location"}
                </button>

                <button
                  onClick={() => setLocationOpen(false)}
                  className="mt-3 w-full rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
                >
                  Browse without sharing
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
                  You can browse without sharing. Your location is required
                  when placing an order.
                </p>
              </div>
            </section>
          </div>
        )}

        {addedNotice && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 z-[120] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-neutral-950 px-4 py-3 text-white shadow-2xl"
          >
            <p className="text-sm font-bold">Added to cart</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs text-neutral-300">
                {addedProduct}
              </p>
              <button
                onClick={() => {
                  setAddedNotice(false);
                  setCartOpen(true);
                }}
                className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-bold text-neutral-900"
              >
                View cart ({cartCount})
              </button>
            </div>
          </div>
        )}
      </main>

      <FeedbackWidget />
    </>
  );
}