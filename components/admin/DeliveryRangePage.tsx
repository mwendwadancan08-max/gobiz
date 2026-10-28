"use client";

import { useEffect, useState } from "react";

type DeliverySettings = {
  latitude: number | null;
  longitude: number | null;
  radiusKm: number;
};

type ApiSettings = {
  service_latitude?: number | string | null;
  service_longitude?: number | string | null;
  radius_km?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  radiusKm?: number | string | null;
};

function toNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeSettings(data: ApiSettings): DeliverySettings {
  const latitude = toNumber(
    data.service_latitude ?? data.latitude
  );

  const longitude = toNumber(
    data.service_longitude ?? data.longitude
  );

  const radius = toNumber(
    data.radius_km ?? data.radiusKm
  );

  return {
    latitude,
    longitude,
    radiusKm: radius !== null && radius > 0 ? radius : 10,
  };
}

export default function DeliveryRangePage() {
  const [settings, setSettings] = useState<DeliverySettings>({
    latitude: null,
    longitude: null,
    radiusKm: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(
          "/api/admin/delivery-settings",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load delivery settings."
          );
        }

        if (!data.settings) {
          throw new Error(
            "The API did not return saved delivery settings."
          );
        }

        if (!cancelled) {
          setSettings(normalizeSettings(data.settings));
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load saved delivery settings."
          );
          setMessageType("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function getLocation() {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      setMessageType("error");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        setLocating(false);
        setMessage("Location captured. Save to apply it.");
        setMessageType("info");
      },
      () => {
        setLocating(false);
        setMessage(
          "Could not access location. Allow location permission and try again."
        );
        setMessageType("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  }

  async function saveSettings() {
    const { latitude, longitude, radiusKm } = settings;

    if (
      latitude === null ||
      longitude === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setMessage("Enter a valid delivery centre location.");
      setMessageType("error");
      return;
    }

    if (
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0 ||
      radiusKm > 100
    ) {
      setMessage("Enter a radius greater than 0 and no more than 100 km.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/delivery-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            radiusKm,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not save delivery settings."
        );
      }

      if (!data.settings) {
        throw new Error(
          "The server did not return the saved settings."
        );
      }

      // Use the values returned by the database, not just the form.
      setSettings(normalizeSettings(data.settings));

      setMessage("Delivery settings saved successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save delivery settings. Please try again."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#10291f]">
          Delivery range
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set your delivery centre and choose your own delivery radius.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        {loading ? (
          <p className="text-sm text-gray-500">
            Loading saved settings...
          </p>
        ) : (
          <>
            <div>
              <label
                htmlFor="radiusKm"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Delivery radius (km)
              </label>

              <input
                id="radiusKm"
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={settings.radiusKm}
                onChange={(event) => {
                  const value = event.target.value;

                  setSettings((current) => ({
                    ...current,
                    radiusKm: value === "" ? 0 : Number(value),
                  }));
                }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter any radius between 0.1 km and 100 km.
                Your saved value will be restored when you return.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Latitude
                </label>

                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={settings.latitude ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    setSettings((current) => ({
                      ...current,
                      latitude:
                        value === "" ? null : Number(value),
                    }));
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Longitude
                </label>

                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={settings.longitude ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    setSettings((current) => ({
                      ...current,
                      longitude:
                        value === "" ? null : Number(value),
                    }));
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={getLocation}
              disabled={locating || saving}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#10291f] hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
            >
              {locating
                ? "Getting location..."
                : "Use current location"}
            </button>

            <div className="border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || loading}
                className="w-full rounded-xl bg-[#145a32] px-5 py-3 font-semibold text-white hover:bg-[#0e4727] disabled:opacity-50 sm:w-auto"
              >
                {saving
                  ? "Saving..."
                  : "Save delivery settings"}
              </button>
            </div>
          </>
        )}

        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`text-sm ${
              messageType === "error"
                ? "text-red-600"
                : messageType === "success"
                  ? "text-green-700"
                  : "text-gray-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <p className="text-sm leading-6 text-gray-500">
        The delivery radius must also be enforced by the checkout
        API on the server. Saving it here alone does not restrict
        customer orders.
      </p>
    </section>
  );
}