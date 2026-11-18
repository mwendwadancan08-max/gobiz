"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedbackWidget from "@/components/FeedbackWidget";
import ProductsFloatingFoods from "@/components/ProductsFloatingFoods";

type Variant = {
  id: string;
  label: string;
  price: number;
  available: boolean;
  position?: number;
};

type Product = {
  id: number | string;
  name: string;
  category: "READY_MADE" | "FARM";
  subCategoryId?: string | null;
  subCategoryName?: string | null;
  price: number;
  description: string;
  imageUrl?: string | null;
  variants?: Variant[];
};

type CartItem = {
  product: Product;
  variantId: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SubCategory = "ALL" | "DRINKS" | "SNACKS" | "MEALS";

const contactPages = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Our Services", href: "/services" },
  { label: "Contact Us", href: "/contact" },
];

const mealImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=65";

const farmImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=65";

const floatingFoodImages = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=70",
  "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=300&q=70",
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

function cartLineKey(productId: number | string, variantId: string | null) {
  return `${productId}::${variantId ?? "simple"}`;
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [category, setCategory] = useState("ALL");
  const [subCategory, setSubCategory] = useState<SubCategory>("ALL");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [addedProduct, setAddedProduct] = useState("");
  const [addedNotice, setAddedNotice] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          const normalized: CartItem[] = [];

          for (const raw of parsed) {
            if (
              raw === null ||
              typeof raw !== "object" ||
              !("product" in raw) ||
              !("quantity" in raw) ||
              typeof (raw as CartItem).quantity !== "number" ||
              (raw as CartItem).quantity <= 0 ||
              (raw as CartItem).product === null ||
              typeof (raw as CartItem).product !== "object"
            ) {
              continue;
            }

            const item = raw as Partial<CartItem> & {
              product: Product;
              quantity: number;
            };

            const variantId =
              typeof item.variantId === "string" ? item.variantId : null;
            const variantLabel =
              typeof item.variantLabel === "string"
                ? item.variantLabel
                : null;
            const unitPrice =
              typeof item.unitPrice === "number" &&
              Number.isFinite(item.unitPrice) &&
              item.unitPrice > 0
                ? item.unitPrice
                : Number(item.product.price);

            normalized.push({
              product: item.product,
              variantId,
              variantLabel,
              unitPrice,
              quantity: item.quantity,
            });
          }

          setCart(normalized);
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
          .map((item) => {
            const rawVariants = Array.isArray(item.variants)
              ? (item.variants as unknown[])
              : [];

            const variants: Variant[] = rawVariants
              .filter(
                (v): v is Record<string, unknown> =>
                  typeof v === "object" && v !== null
              )
              .filter(
                (v) =>
                  typeof v.id === "string" &&
                  typeof v.label === "string" &&
                  Number.isFinite(Number(v.price)) &&
                  Number(v.price) > 0
              )
              .map((v) => ({
                id: v.id as string,
                label: v.label as string,
                price: Number(v.price),
                available: v.available !== false,
                position:
                  typeof v.position === "number" ? v.position : 0,
              }))
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

            return {
              id: item.id as number | string,
              name: item.name as string,
              category: item.category as "READY_MADE" | "FARM",
              subCategoryId:
                typeof item.subCategoryId === "string"
                  ? item.subCategoryId
                  : null,
              subCategoryName:
                typeof item.subCategoryName === "string"
                  ? item.subCategoryName
                  : null,
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
              variants,
            };
          });

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

  function resolveUnit(
    product: Product,
    variantId: string | null
  ): { variantId: string | null; variantLabel: string | null; unitPrice: number } {
    if (variantId) {
      const variant = product.variants?.find((v) => v.id === variantId);
      if (variant) {
        return {
          variantId: variant.id,
          variantLabel: variant.label,
          unitPrice: variant.price,
        };
      }
    }

    return {
      variantId: null,
      variantLabel: null,
      unitPrice: Number(product.price),
    };
  }

  function addToCart(product: Product, variantId?: string | null) {
    const chosenVariantId =
      variantId ??
      (product.variants && product.variants.length > 0
        ? selectedVariant[String(product.id)] ??
          product.variants[0].id
        : null);

    const { variantId: vid, variantLabel, unitPrice } = resolveUnit(
      product,
      chosenVariantId
    );

    setCart((current) => {
      const existing = current.find(
        (item) =>
          String(item.product.id) === String(product.id) &&
          (item.variantId ?? null) === vid
      );

      if (existing) {
        return current.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          product,
          variantId: vid,
          variantLabel,
          unitPrice,
          quantity: 1,
        },
      ];
    });

    setAddedProduct(
      variantLabel ? `${product.name} (${variantLabel})` : product.name
    );
    setAddedNotice(true);
    window.setTimeout(() => setAddedNotice(false), 2200);
  }

  function changeQuantity(
    productId: number | string,
    variantId: string | null,
    amount: number
  ) {
    setCart((current) =>
      current
        .map((item) =>
          String(item.product.id) === String(productId) &&
          (item.variantId ?? null) === (variantId ?? null)
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(
    productId: number | string,
    variantId: string | null
  ) {
    setCart((current) =>
      current.filter(
        (item) =>
          !(
            String(item.product.id) === String(productId) &&
            (item.variantId ?? null) === (variantId ?? null)
          )
      )
    );
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCategory("ALL");
    setSubCategory("ALL");
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubCategory("ALL");
  }

  function goToCheckout() {
    if (cart.length === 0) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(
          cart.map((item) => ({
            product: {
              id: item.product.id,
              name: item.product.name,
              category: item.product.category,
              price: item.product.price,
            },
            variantId: item.variantId,
            variantLabel: item.variantLabel,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          }))
        )
      );
    } catch {
      // ignore
    }

    setCartOpen(false);
    window.location.href = "/checkout";
  }

  const searchTerms = normalizeSearchText(search)
    .split(" ")
    .filter(Boolean);

  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      category === "ALL" || product.category === category;

    let matchesSub = true;

    if (category === "READY_MADE" && subCategory !== "ALL") {
      const productSubName = (product.subCategoryName ?? "").toUpperCase();

      if (subCategory === "DRINKS") matchesSub = productSubName === "DRINKS";
      else if (subCategory === "SNACKS") matchesSub = productSubName === "SNACKS";
      else if (subCategory === "MEALS") matchesSub = productSubName === "MEALS";
    }

    const productText = normalizeSearchText(
      `${product.name} ${product.description}`
    );

    const matchesSearch = searchTerms.every((term) =>
      productText.includes(term)
    );

    return matchesCategory && matchesSub && matchesSearch;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const subCategoryLabels: Record<SubCategory, string> = {
    ALL: "All",
    DRINKS: "Drinks",
    SNACKS: "Snacks",
    MEALS: "Meals",
  };

  const headingText =
    category === "ALL"
      ? "Everything in one place"
      : category === "FARM"
        ? "Fresh farm products"
        : subCategory === "ALL"
          ? "Ready-made meals"
          : `Ready-made · ${subCategoryLabels[subCategory]}`;

  return (
    <>
      <main className="products-shell relative flex min-h-screen flex-col overflow-hidden bg-white text-neutral-900">
        <ProductsFloatingFoods foods={floatingFoodImages} />

        {/* FIXED HEADER — never moves, always visible */}
        <header className="products-floating-header fixed inset-x-0 top-0 z-40">
          <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4">
            <div className="rounded-2xl border border-neutral-200/80 bg-white/95 px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:rounded-3xl sm:px-5 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/" className="shrink-0">
                  <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
                    <span className="text-green-700">Go</span>
                    <span className="text-red-700">Biz</span>
                  </span>
                </Link>

                <div className="hidden flex-1 sm:block">
                  <div className="relative mx-auto max-w-md">
                    <SearchIcon />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      placeholder="Search meals and farm products..."
                      aria-label="Search products"
                      className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-green-700 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCartOpen(true)}
                  aria-label="Open cart"
                  className="products-cart-btn ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-800 py-2 pl-3 pr-1.5 text-xs font-semibold text-white sm:gap-2.5 sm:py-2.5 sm:pl-5 sm:pr-2.5 sm:text-sm"
                >
                  <CartIcon />
                  <span className="hidden sm:inline">Cart</span>
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1 py-0.5 text-[10px] font-extrabold text-green-900 sm:min-w-6 sm:px-1.5 sm:text-[11px]">
                    {cartCount}
                  </span>
                </button>
              </div>

              {/* Mobile search — inside fixed card so it's always visible */}
              <div className="mt-2 sm:hidden">
                <div className="relative">
                  <SearchIcon />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      handleSearchChange(event.target.value)
                    }
                    placeholder="Search meals and farm products..."
                    aria-label="Search products"
                    className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-3 text-xs outline-none focus:border-green-700 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Spacer so content starts below the fixed header */}
        <div aria-hidden="true" className="h-[72px] sm:h-[88px]" />

        <section className="products-hero relative overflow-hidden">
          <div aria-hidden="true" className="products-hero-bg absolute inset-0" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-red-600/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-green-500/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-12 text-left sm:px-8 sm:py-16 md:py-20">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              The GoBiz catalogue
            </p>

            <h1 className="mt-4 text-6xl font-black leading-none tracking-tighter text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)] sm:mt-6 sm:text-8xl md:text-9xl lg:text-[10rem]">
              <span className="text-green-400">Go</span>
              <span className="text-red-400">Biz</span>
            </h1>

            <p className="mt-1.5 font-[Galada] text-2xl text-green-300/90 sm:mt-3 sm:text-4xl">
              fresh.
            </p>

            <p className="mt-3 max-w-lg text-sm font-bold text-white sm:mt-5 sm:text-lg md:text-xl">
              Good food. Fresh from the farm.
            </p>

            <p className="mt-1.5 max-w-md text-[11px] text-green-50/70 sm:mt-2 sm:text-sm">
              Browse meals and farm products. Pay on delivery.
            </p>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-6 sm:py-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 sm:text-xs">
                Find what you need
              </p>
              <h2 className="mt-1.5 text-xl font-extrabold tracking-tight sm:mt-2 sm:text-3xl">
                {headingText}
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Meals", value: "READY_MADE" },
                { label: "Farm", value: "FARM" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleCategoryChange(item.value)}
                  className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    category === item.value
                      ? "border-green-800 bg-green-800 text-white shadow-lg shadow-green-900/20"
                      : "border-neutral-300 bg-white/80 backdrop-blur-sm hover:border-green-700 hover:bg-green-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {category === "READY_MADE" && (
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {(
                [
                  { label: "All", value: "ALL" as SubCategory },
                  { label: "Drinks", value: "DRINKS" as SubCategory },
                  { label: "Snacks", value: "SNACKS" as SubCategory },
                  { label: "Meals", value: "MEALS" as SubCategory },
                ]
              ).map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSubCategory(item.value)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition sm:px-3.5 sm:py-1.5 sm:text-xs ${
                    subCategory === item.value
                      ? "border-green-900 bg-green-900 text-white shadow-sm"
                      : "border-green-200 bg-green-50/70 text-green-900 hover:border-green-400 hover:bg-green-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {productsLoading ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/80 px-5 py-12 text-center backdrop-blur-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
              <p className="mt-3 text-xs text-neutral-600 sm:text-sm">
                Loading available products...
              </p>
            </div>
          ) : productsError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
              <h3 className="text-sm font-bold text-red-900 sm:text-base">
                Products are temporarily unavailable
              </h3>
              <p className="mt-2 text-xs text-red-800 sm:text-sm">{productsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-green-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-900 sm:text-sm"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {visibleProducts.map((product) => {
                  const hasVariants =
                    (product.variants?.length ?? 0) > 0;

                  const activeVariantId = hasVariants
                    ? selectedVariant[String(product.id)] ??
                      product.variants![0].id
                    : null;

                  const activeVariant = hasVariants
                    ? product.variants!.find(
                        (v) => v.id === activeVariantId
                      ) ?? product.variants![0]
                    : null;

                  const displayPrice = activeVariant
                    ? activeVariant.price
                    : product.price;

                  const productQty = cart
                    .filter(
                      (item) =>
                        String(item.product.id) === String(product.id)
                    )
                    .reduce((sum, item) => sum + item.quantity, 0);

                  const lineInCart = cart.find(
                    (item) =>
                      String(item.product.id) === String(product.id) &&
                      (item.variantId ?? null) ===
                        (activeVariant?.id ?? null)
                  );

                  return (
                    <article
                      key={product.id}
                      className="products-card group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/95 shadow-sm backdrop-blur-sm sm:rounded-2xl"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="products-card-image h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="products-card-image h-full w-full bg-cover bg-center"
                            role="img"
                            aria-label={product.name}
                            style={{
                              backgroundImage: `url("${product.category === "FARM" ? farmImage : mealImage}")`,
                            }}
                          />
                        )}

                        <span
                          className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-white shadow-md backdrop-blur-sm sm:left-2 sm:top-2 sm:px-2 sm:text-[9px] ${
                            product.category === "FARM"
                              ? "bg-red-600/90"
                              : "bg-green-700/90"
                          }`}
                        >
                          {product.category === "FARM"
                            ? "Farm"
                            : product.subCategoryName ?? "Meal"}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-2 sm:p-4">
                        <h3 className="break-words text-[11px] font-bold leading-snug sm:text-base">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-2 min-h-6 text-[9px] leading-3.5 text-neutral-500 sm:mt-1 sm:min-h-10 sm:text-xs sm:leading-5">
                          {product.description || "Available from GoBiz."}
                        </p>

                        {hasVariants && (
                          <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
                            {product.variants!.map((v) => {
                              const isActive = v.id === activeVariantId;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  disabled={!v.available}
                                  onClick={() =>
                                    setSelectedVariant((current) => ({
                                      ...current,
                                      [String(product.id)]: v.id,
                                    }))
                                  }
                                  className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold transition sm:px-2 sm:py-1 sm:text-xs ${
                                    isActive
                                      ? "border-green-800 bg-green-800 text-white shadow-sm"
                                      : "border-neutral-300 bg-white text-neutral-700 hover:border-green-600 hover:bg-green-50"
                                  } ${!v.available ? "cursor-not-allowed opacity-40" : ""}`}
                                >
                                  {v.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-1.5 flex items-baseline justify-between gap-1 sm:mt-3 sm:gap-2">
                          <p className="break-words text-xs font-extrabold tracking-tight text-neutral-900 sm:text-lg">
                            {formatPrice(displayPrice)}
                          </p>
                          {productQty > 0 && !lineInCart && (
                            <span className="shrink-0 rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-800 sm:px-2 sm:text-[10px]">
                              {productQty} in cart
                            </span>
                          )}
                        </div>

                        {lineInCart ? (
                          <div className="mt-1.5 flex items-center gap-1 sm:mt-3 sm:gap-2">
                            <button
                              onClick={() =>
                                changeQuantity(
                                  product.id,
                                  activeVariant?.id ?? null,
                                  -1
                                )
                              }
                              aria-label={`Remove one ${product.name}`}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-base font-bold text-neutral-800 transition hover:bg-neutral-100 sm:h-9 sm:w-9 sm:text-lg"
                            >
                              −
                            </button>

                            <span className="flex h-7 min-w-6 items-center justify-center rounded-full border border-green-200 bg-green-50 px-1 text-[10px] font-extrabold text-green-800 sm:h-9 sm:min-w-8 sm:px-2 sm:text-xs">
                              {lineInCart.quantity}
                            </span>

                            <button
                              onClick={() =>
                                addToCart(
                                  product,
                                  activeVariant?.id ?? null
                                )
                              }
                              aria-label={`Add another ${product.name}`}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-800 text-base font-bold text-white transition hover:bg-green-900 sm:h-9 sm:w-9 sm:text-lg"
                            >
                              +
                            </button>

                            <button
                              onClick={() =>
                                removeFromCart(
                                  product.id,
                                  activeVariant?.id ?? null
                                )
                              }
                              aria-label={`Remove ${product.name} from cart`}
                              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 hover:text-red-800 sm:h-9 sm:w-9"
                            >
                              <BinIcon />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              addToCart(
                                product,
                                activeVariant?.id ?? null
                              )
                            }
                            disabled={
                              !!activeVariant && !activeVariant.available
                            }
                            className="products-add-btn mt-1.5 w-full rounded-full bg-green-800 px-2 py-1.5 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-300 sm:mt-3 sm:py-2.5 sm:text-sm"
                          >
                            {productQty > 0
                              ? "Add another"
                              : "Add to cart"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {visibleProducts.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white/80 px-5 py-12 text-center backdrop-blur-sm">
                  <h3 className="text-sm font-bold sm:text-base">
                    {products.length === 0
                      ? "No products available yet"
                      : category === "READY_MADE" && subCategory !== "ALL"
                        ? `No ${subCategoryLabels[subCategory]} yet`
                        : "No matching products"}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
                    {products.length === 0
                      ? "Products added to the GoBiz catalogue will appear here."
                      : category === "READY_MADE" && subCategory !== "ALL"
                        ? `We haven't added any ${subCategoryLabels[subCategory].toLowerCase()} yet. Try another sub-category.`
                        : "Try another search or choose a different category."}
                  </p>
                  {products.length > 0 && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setCategory("ALL");
                        setSubCategory("ALL");
                      }}
                      className="mt-4 rounded-full bg-green-800 px-5 py-2.5 text-xs font-semibold text-white sm:text-sm"
                    >
                      Show all products
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="relative z-10 mt-auto bg-neutral-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-12">
            <div>
              <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
                <span className="text-green-400">Go</span>
                <span className="text-red-400">Biz</span>
              </p>
              <p className="mt-2 max-w-xs text-xs leading-5 text-neutral-400 sm:mt-3 sm:text-sm sm:leading-6">
                Ready-made meals and farm products in one convenient
                marketplace.
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 sm:text-xs">
                Explore GoBiz
              </h3>
              <div className="mt-2 flex flex-col items-start gap-1.5 text-xs text-neutral-300 sm:mt-3 sm:gap-2 sm:text-sm">
                {contactPages.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="transition hover:text-green-300"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 sm:text-xs">
                Contact our team
              </h3>
              <p className="mt-2 text-xs text-neutral-300 sm:mt-3 sm:text-sm">
                WhatsApp:{" "}
                <a
                  href="https://wa.me/254757699959"
                  className="hover:text-green-300"
                >
                  +254 757 699959
                </a>
              </p>
              <p className="mt-1.5 text-xs text-neutral-300 sm:mt-2 sm:text-sm">
                Email:{" "}
                <a
                  href="mailto:254gobiz@gmail.com"
                  className="hover:text-green-300"
                >
                  254gobiz@gmail.com
                </a>
              </p>
              <p className="mt-3 text-[10px] leading-4 text-neutral-500 sm:mt-4 sm:text-xs sm:leading-5">
                Owned by{" "}
                <span className="font-semibold text-neutral-300">
                  Gerald Mwai
                </span>
                {" · "}
                Managed by the{" "}
                <span className="font-semibold text-neutral-300">
                  GoBiz team
                </span>
              </p>
              <a
                href="mailto:dbc.techfirm@gmail.com"
                aria-label="Website designed and maintained by DBC.Africa"
                title="Designed & maintained by DBC.Africa"
                className="mt-2 inline-block text-[10px] text-neutral-500 opacity-40 transition hover:text-red-300 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300 sm:mt-3 sm:text-xs"
              >
                Designed &amp; maintained by{" "}
                <span className="font-semibold">DBC.Africa</span>
              </a>
            </div>
          </div>
        </footer>

        {cartOpen && (
          <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          >
            <section
              className="ml-auto flex h-full w-full flex-col bg-white sm:max-w-md"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b p-4 sm:p-5">
                <div>
                  <h2 className="text-lg font-extrabold sm:text-xl">Your cart</h2>
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

              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {cart.length === 0 ? (
                  <div className="py-16 text-center">
                    <h3 className="text-base font-bold sm:text-lg">Your cart is empty</h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                      Add meals or farm products to get started.
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-5 rounded-full bg-green-800 px-5 py-3 text-xs font-semibold text-white sm:text-sm"
                    >
                      Continue shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3">
                    {cart.map((item) => (
                      <div
                        key={cartLineKey(item.product.id, item.variantId)}
                        className="flex flex-col gap-2.5 rounded-xl border border-green-200 bg-green-50/50 p-3 shadow-sm sm:gap-3 sm:rounded-2xl sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-bold text-neutral-900 sm:text-base">
                              {item.product.name}
                              {item.variantLabel && (
                                <span className="ml-1 text-[10px] font-semibold text-neutral-500 sm:text-xs">
                                  ({item.variantLabel})
                                </span>
                              )}
                            </h3>
                            <p className="mt-0.5 text-[10px] text-neutral-500 sm:mt-1 sm:text-xs">
                              {item.product.category === "FARM"
                                ? "Farm product"
                                : "Ready-made meal"}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500 sm:mt-1 sm:text-sm">
                              {formatPrice(item.unitPrice)} each
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-extrabold text-green-900 sm:text-base">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-1 sm:gap-3">
                            <button
                              onClick={() =>
                                changeQuantity(item.product.id, item.variantId, -1)
                              }
                              aria-label={`Remove one ${item.product.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-base font-bold text-neutral-800 hover:bg-neutral-100 sm:h-8 sm:w-8 sm:text-lg"
                            >
                              −
                            </button>

                            <span className="min-w-5 text-center text-xs font-extrabold text-neutral-900 sm:text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                changeQuantity(item.product.id, item.variantId, 1)
                              }
                              aria-label={`Add one ${item.product.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-green-800 text-base font-bold text-white hover:bg-green-900 sm:h-8 sm:w-8 sm:text-lg"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id, item.variantId)}
                            className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-800 hover:bg-red-100 sm:px-3 sm:py-2 sm:text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t bg-white p-4 sm:p-5">
                <div className="flex justify-between text-base font-extrabold sm:text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-2 text-[10px] leading-4 text-neutral-500 sm:text-xs sm:leading-5">
                  Delivery charges are calculated at checkout. Payment is made
                  on delivery.
                </p>

                {!location && cart.length > 0 && (
                  <p className="mt-2.5 rounded-lg border border-sky-100 bg-sky-50 p-2.5 text-[11px] leading-5 text-sky-900 sm:mt-3 sm:rounded-xl sm:p-3 sm:text-sm sm:leading-6">
                    You can continue to checkout, but sharing your GPS location
                    is mandatory before an order can be placed.
                  </p>
                )}

                <button
                  disabled={cart.length === 0}
                  onClick={goToCheckout}
                  className="mt-3 w-full rounded-full bg-green-800 px-5 py-3 text-sm font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:mt-4 sm:py-3.5"
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-200 sm:text-xs">
                  GoBiz delivery check
                </p>
                <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
                  Is GoBiz delivering to your area?
                </h2>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs leading-6 text-neutral-600 sm:text-sm sm:leading-7">
                  Share your GPS location so GoBiz can check delivery
                  availability. You can skip this step to browse, but location
                  sharing is required before placing an order.
                </p>

                {locationMessage && (
                  <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-2.5 text-xs leading-5 text-sky-900 sm:mt-4 sm:rounded-xl sm:p-3 sm:text-sm sm:leading-6">
                    {locationMessage}
                  </p>
                )}

                <button
                  onClick={checkLocation}
                  disabled={checkingLocation}
                  className="mt-4 w-full rounded-full bg-green-800 px-5 py-3 text-sm font-bold text-white hover:bg-green-900 disabled:opacity-60 sm:mt-5 sm:py-3.5"
                >
                  {checkingLocation
                    ? "Checking location..."
                    : "Share my location"}
                </button>

                <button
                  onClick={() => setLocationOpen(false)}
                  className="mt-2.5 w-full rounded-full border border-neutral-300 px-5 py-2.5 text-xs font-semibold hover:bg-neutral-50 sm:mt-3 sm:py-3 sm:text-sm"
                >
                  Browse without sharing
                </button>

                <p className="mt-3 text-center text-[10px] leading-4 text-neutral-500 sm:mt-4 sm:text-xs sm:leading-5">
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
            className="fixed bottom-4 left-1/2 z-[120] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-xl bg-neutral-950 px-3 py-2.5 text-white shadow-2xl sm:bottom-5 sm:w-[calc(100%-2rem)] sm:rounded-2xl sm:px-4 sm:py-3"
          >
            <p className="text-xs font-bold sm:text-sm">Added to cart</p>
            <div className="mt-1 flex items-center justify-between gap-2 sm:gap-3">
              <p className="min-w-0 truncate text-[10px] text-neutral-300 sm:text-xs">
                {addedProduct}
              </p>
              <button
                onClick={() => {
                  setAddedNotice(false);
                  setCartOpen(true);
                }}
                className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-neutral-900 sm:px-3 sm:py-2 sm:text-xs"
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