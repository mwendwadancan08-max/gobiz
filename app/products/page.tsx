"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedbackWidget from "@/components/FeedbackWidget";

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
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
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

    const productText = normalizeSearchText(
      `${product.name} ${product.description}`
    );

    const matchesSearch = searchTerms.every((term) =>
      productText.includes(term)
    );

    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <>
      <main className="flex min-h-screen flex-col bg-white text-neutral-900">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
            <Link href="/" className="shrink-0">
              <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
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
                  className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-700 focus:bg-white"
                />
              </div>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-green-800 py-2.5 pl-4 pr-2 text-sm font-semibold text-white transition hover:bg-green-900 sm:gap-2.5 sm:pl-5 sm:pr-2.5"
            >
              <CartIcon />
              <span className="hidden sm:inline">Cart</span>
              <span className="flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-extrabold text-green-900">
                {cartCount}
              </span>
            </button>
          </div>

          <div className="px-4 pb-3 sm:hidden">
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
                className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-green-700 focus:bg-white"
              />
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-red-950">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-red-500/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-green-500/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-14 text-left sm:px-8 sm:py-20 md:py-24">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white backdrop-blur-sm sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              The marketplace
            </p>

            <h1 className="mt-6 text-7xl font-black leading-none tracking-tighter text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:text-8xl md:text-9xl lg:text-[10rem]">
              <span className="text-green-400">Go</span>
              <span className="text-red-400">Biz</span>
            </h1>

            <p className="mt-6 max-w-lg text-base font-bold text-white sm:text-lg md:text-xl">
              Good food. Fresh from the farm.
            </p>

            <p className="mt-2 max-w-md text-xs text-green-50/70 sm:text-sm">
              Browse meals and farm products. Pay on delivery.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl flex-1 px-3 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-800">
                The GoBiz catalogue
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Find what you need
              </h2>
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
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-12 text-center">
              <p className="text-sm text-neutral-600">
                Loading available products...
              </p>
            </div>
          ) : productsError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
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
                      className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-lg sm:rounded-2xl"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
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

                      <div className="flex flex-1 flex-col p-2 sm:p-4">
                        <h3 className="break-words text-xs font-bold leading-snug sm:text-base">
                          {product.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-7 text-[10px] leading-4 text-neutral-500 sm:min-h-10 sm:text-xs sm:leading-5">
                          {product.description || "Available from GoBiz."}
                        </p>

                        {hasVariants && (
                          <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
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
                                  className={`rounded-full border px-2 py-1 text-[10px] font-bold transition sm:text-xs ${
                                    isActive
                                      ? "border-green-800 bg-green-800 text-white"
                                      : "border-neutral-300 bg-white text-neutral-700 hover:border-green-600 hover:bg-green-50"
                                  } ${!v.available ? "cursor-not-allowed opacity-40" : ""}`}
                                >
                                  {v.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <p className="mt-2 break-words text-xs font-extrabold sm:mt-3 sm:text-lg">
                          {formatPrice(displayPrice)}
                        </p>

                        {lineInCart ? (
                          <div className="mt-2 flex items-center gap-1.5 sm:mt-3 sm:gap-2">
                            <button
                              onClick={() =>
                                changeQuantity(
                                  product.id,
                                  activeVariant?.id ?? null,
                                  -1
                                )
                              }
                              aria-label={`Remove one ${product.name}`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-lg font-bold text-neutral-800 transition hover:bg-neutral-100"
                            >
                              −
                            </button>

                            <span className="flex h-9 min-w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 px-2 text-xs font-extrabold text-green-800">
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
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-800 text-lg font-bold text-white transition hover:bg-green-900"
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
                              className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 hover:text-red-800"
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
                            className="mt-2 w-full rounded-full bg-green-800 px-1.5 py-2 text-[10px] font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:mt-3 sm:px-3 sm:py-2.5 sm:text-sm"
                          >
                            {productQty > 0
                              ? "Add to cart again"
                              : "Add to cart"}
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

        <footer className="mt-auto bg-neutral-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 sm:px-6">
            <div>
              <p className="text-2xl font-extrabold tracking-tight">
                <span className="text-green-400">Go</span>
                <span className="text-red-400">Biz</span>
              </p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-400">
                Ready-made meals and farm products in one convenient
                marketplace.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Explore GoBiz
              </h3>
              <div className="mt-3 flex flex-col items-start gap-2 text-sm text-neutral-300">
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
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Contact our team
              </h3>
              <p className="mt-3 text-sm text-neutral-300">
                WhatsApp:{" "}
                <a
                  href="https://wa.me/254757699959"
                  className="hover:text-green-300"
                >
                  +254 757 699959
                </a>
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                Email:{" "}
                <a
                  href="mailto:254gobiz@gmail.com"
                  className="hover:text-green-300"
                >
                  254gobiz@gmail.com
                </a>
              </p>
              <p className="mt-4 text-xs leading-5 text-neutral-500">
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
                className="mt-3 inline-block text-xs text-neutral-500 opacity-40 transition hover:text-red-300 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Designed &amp; maintained by{" "}
                <span className="font-semibold">DBC.Africa</span>
              </a>
            </div>
          </div>
        </footer>

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
                        key={cartLineKey(item.product.id, item.variantId)}
                        className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50/50 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-bold text-neutral-900">
                              {item.product.name}
                              {item.variantLabel && (
                                <span className="ml-1 text-xs font-semibold text-neutral-500">
                                  ({item.variantLabel})
                                </span>
                              )}
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">
                              {item.product.category === "FARM"
                                ? "Farm product"
                                : "Ready-made meal"}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                              {formatPrice(item.unitPrice)} each
                            </p>
                          </div>

                          <p className="shrink-0 font-extrabold text-green-900">
                            {formatPrice(
                              item.unitPrice * item.quantity
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white p-1">
                            <button
                              onClick={() =>
                                changeQuantity(
                                  item.product.id,
                                  item.variantId,
                                  -1
                                )
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
                                changeQuantity(
                                  item.product.id,
                                  item.variantId,
                                  1
                                )
                              }
                              aria-label={`Add one ${item.product.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800 text-lg font-bold text-white hover:bg-green-900"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(
                                item.product.id,
                                item.variantId
                              )
                            }
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