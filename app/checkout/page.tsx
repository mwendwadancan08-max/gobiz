
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Product = {
  id: string | number;
  name: string;
  price: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const CART_KEY = "gobiz-cart";
const LOCATION_KEY = "gobiz-location";

const SERVICE_LAT = -0.6974717835542885;
const SERVICE_LNG = 34.78543150783463;
const DELIVERY_RADIUS_KM = 5;

const DBC_URL = "https://dbc-pi-two.vercel.app/";

function formatPrice(value: number) {
  return `KSh ${value.toLocaleString("en-KE")}`;
}

function distanceKm(a: Coordinates, b: Coordinates) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = radians(b.latitude - a.latitude);
  const dLng = radians(b.longitude - a.longitude);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.latitude)) *
      Math.cos(radians(b.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

function GoBizLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`}>
      <span className="text-green-700">Go</span>
      <span className="text-red-600">Biz</span>
    </span>
  );
}

function CheckoutBrand() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm sm:px-5">
      <a href="/" aria-label="GoBiz home" className="shrink-0">
        <GoBizLogo className="text-2xl sm:text-3xl" />
        <span className="block text-[10px] font-semibold tracking-wide text-neutral-500 sm:text-xs">
          FOOD & FARM MARKET
        </span>
      </a>

      <div className="text-right">
        <p className="text-xs font-bold text-neutral-800 sm:text-sm">
          Secure checkout
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 sm:text-xs">
          Pay on delivery
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [area, setArea] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [floor, setFloor] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedLocation = localStorage.getItem(LOCATION_KEY);

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed as CartItem[]);
      }

      if (savedLocation) {
        const parsed: unknown = JSON.parse(savedLocation);

        if (
          parsed &&
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
      setError(
        "We could not restore your cart. Return to the marketplace and try again."
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0
  );

  const distance = location
    ? distanceKm(location, {
        latitude: SERVICE_LAT,
        longitude: SERVICE_LNG,
      })
    : null;

  const withinRadius = distance !== null && distance <= DELIVERY_RADIUS_KM;

  function shareLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Your device does not support GPS location sharing.");
      return;
    }

    setCheckingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coords);
        localStorage.setItem(LOCATION_KEY, JSON.stringify(coords));
        setCheckingLocation(false);
      },
      () => {
        setCheckingLocation(false);
        setError(
          "Location is required. Allow location permission and try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty. Add products before ordering.");
      return;
    }

    if (!location) {
      setError("Share your GPS location before placing your order.");
      return;
    }

    if (!withinRadius) {
      setError(
        "Your location is outside GoBiz's 5 km delivery radius. We cannot accept this delivery order."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email },
          fulfillmentMethod: "DELIVERY",
          deliveryAddress: area.trim(),
          buildingName: buildingName.trim() || null,
          floor: floor.trim() || null,
          doorNumber: doorNumber.trim() || null,
          latitude: location.latitude,
          longitude: location.longitude,
          items: cart.map((item) => ({
            productId: String(item.product.id),
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "We could not place your order."
        );
      }

      setConfirmation({
        orderNumber: String(
          result.orderNumber ??
            result.order?.orderNumber ??
            result.orderId ??
            result.order?.id ??
            "Confirmed"
        ),
        total: Number(result.total ?? result.order?.total ?? subtotal),
      });

      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(LOCATION_KEY);
      setCart([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-700">
        Loading checkout...
      </main>
    );
  }

  if (confirmation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 text-neutral-900">
        <section className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <CheckoutBrand />

          <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl font-bold text-green-700">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            Order received
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Thank you for ordering from GoBiz. Payment is made on delivery.
          </p>

          <p className="mt-5 text-sm text-neutral-500">Order reference</p>
          <p className="mt-1 break-all text-lg font-bold">
            {confirmation.orderNumber}
          </p>

          <p className="mt-4 text-xl font-extrabold">
            {formatPrice(confirmation.total)}
          </p>

          <a
            href="/"
            className="mt-7 inline-flex w-full justify-center rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Back to <span className="ml-1">GoBiz</span>
          </a>

          <footer className="mt-8 border-t border-neutral-100 pt-4">
            <a
              href={DBC_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website designed by DBC.creatives"
              title="Designed by DBC.creatives"
              className="inline-block text-[10px] text-neutral-400 transition hover:text-neutral-700 sm:text-xs"
            >
              Powered by <span className="font-semibold">DBC.creatives</span>
            </a>
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-3 py-4 text-neutral-900 sm:px-5 sm:py-7">
      <div className="mx-auto max-w-5xl">
        <CheckoutBrand />

        <header className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white sm:mt-6">
          <div className="h-1 bg-gradient-to-r from-green-700 via-neutral-900 to-red-600" />

          <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                Your order, your way
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Checkout with <GoBizLogo />
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                Confirm your delivery details and pay when your order arrives.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-800 sm:self-center">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Fresh choices. Easy ordering.
            </div>
          </div>
        </header>

        <a
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-green-800 transition hover:text-red-600"
        >
          ← Back to marketplace
        </a>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
          <form
            onSubmit={submitOrder}
            className="min-w-0 space-y-6 rounded-2xl border border-neutral-200 bg-white p-4 sm:rounded-3xl sm:p-7"
          >
            <section>
              <h2 className="text-base font-extrabold sm:text-lg">
                <span className="mr-2 text-green-700">01.</span>
                Delivery location
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                GoBiz delivers within 5 km of its service centre. Share your
                current GPS location to verify your delivery eligibility.
              </p>

              {location ? (
                <div
                  className={`mt-4 rounded-xl border p-4 ${
                    withinRadius
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {withinRadius
                      ? "Your GPS location is within the delivery radius."
                      : "Your GPS location is outside the delivery radius."}
                  </p>

                  <p className="mt-1 text-sm text-neutral-600">
                    Distance: {distance?.toFixed(2)} km from the service centre.
                  </p>

                  <button
                    type="button"
                    onClick={shareLocation}
                    disabled={checkingLocation}
                    className="mt-3 text-sm font-bold text-green-800 underline underline-offset-4 disabled:opacity-60"
                  >
                    {checkingLocation ? "Checking location..." : "Refresh GPS location"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={shareLocation}
                  disabled={checkingLocation}
                  className="mt-4 w-full rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:opacity-60 sm:w-auto"
                >
                  {checkingLocation
                    ? "Getting location..."
                    : "Share GPS location"}
                </button>
              )}

              <label className="mt-5 block text-sm font-semibold">
                Area / estate / location name *
                <input
                  required
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Enter your area or estate"
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Building / plot name (optional)
                  <input
                    value={buildingName}
                    onChange={(event) => setBuildingName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Floor (optional)
                  <input
                    value={floor}
                    onChange={(event) => setFloor(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </label>

                <label className="text-sm font-semibold sm:col-span-2">
                  Door / house number (optional)
                  <input
                    value={doorNumber}
                    onChange={(event) => setDoorNumber(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </label>
              </div>
            </section>

            <div className="border-t border-neutral-200" />

            <section>
              <h2 className="text-base font-extrabold sm:text-lg">
                <span className="mr-2 text-green-700">02.</span>
                Your contact details
              </h2>

              <div className="mt-4 space-y-4">
                <label className="block text-sm font-semibold">
                  Full name *
                  <input
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Phone number *
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="07XX XXX XXX"
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Email address *
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  />
                </label>
              </div>
            </section>

            <div className="border-t border-neutral-200" />

            <section>
              <h2 className="text-base font-extrabold sm:text-lg">
                <span className="mr-2 text-green-700">03.</span>
                Payment
              </h2>

              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="font-bold text-green-900">
                  Cash / payment on delivery
                </p>
                <p className="mt-1 text-sm leading-6 text-green-900">
                  Pay when your order arrives. No online payment is required.
                </p>
              </div>
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                submitting || cart.length === 0 || !location || !withinRadius
              }
              className="w-full rounded-full bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {submitting
                ? "Placing your order..."
                : !location
                  ? "Share location to place order"
                  : !withinRadius
                    ? "Outside delivery area"
                    : "Confirm order"}
            </button>

            <p className="text-xs leading-5 text-neutral-500">
              Your order is only accepted after the server validates your
              delivery location and order details.
            </p>
          </form>

          <aside className="h-fit min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 sm:rounded-3xl sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold sm:text-xl">Your order</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                {cart.reduce((count, item) => count + item.quantity, 0)} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8">
                <p className="text-sm text-neutral-500">
                  Your cart is empty.
                </p>
                <a
                  href="/"
                  className="mt-4 inline-block text-sm font-bold text-green-800 underline underline-offset-4"
                >
                  Browse products
                </a>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between gap-3 border-b border-neutral-100 pb-4"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="flex justify-between gap-3 pt-2 text-base font-extrabold sm:text-lg">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <p className="text-xs leading-5 text-neutral-500">
                  Any applicable delivery fee is confirmed by the checkout
                  service.
                </p>
              </div>
            )}

            <div className="mt-6 border-t border-neutral-100 pt-4">
              <p className="text-xs leading-5 text-neutral-500">
                Fresh farm products and ready-made meals, brought closer to you.
              </p>
              <p className="mt-2 text-sm font-extrabold">
                <GoBizLogo />
                <span className="ml-1 font-medium text-neutral-500">
                  — Your everyday food market
                </span>
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-neutral-200 py-5 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} <GoBizLogo />. All rights reserved.
          </p>

          <a
            href={DBC_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit the DBC.creatives website"
            title="Designed by DBC.creatives"
            className="rounded-full px-3 py-2 text-[10px] text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 sm:text-xs"
          >
            Powered by <span className="font-semibold">DBC.creatives</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
