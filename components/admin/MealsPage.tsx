"use client";

import { useCallback, useEffect, useState } from "react";

type Variant = {
  id: string;
  label: string;
  price: number;
  available: boolean;
  position?: number;
};

type Product = {
  id: string;
  name: string;
  category: "READY_MADE" | "FARM";
  price: number;
  description: string;
  imageUrl?: string | null;
  variants?: Variant[];
};

type VariantDraft = {
  label: string;
  price: string;
};

export default function MealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<Product["category"]>("READY_MADE");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([
    { label: "", price: "" },
  ]);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load products.");
      }

      setProducts(
        (data.products ?? []).map(
          (product: Product & { price_kes?: number }) => ({
            ...product,
            price: Number(product.price ?? product.price_kes ?? 0),
            description: product.description ?? "",
            variants: Array.isArray(product.variants)
              ? product.variants
              : [],
          })
        )
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function selectImage(file?: File) {
    setMessage("");
    if (!file) {
      setImageFile(null);
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowed.includes(file.type)) {
      setMessage("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be 5 MB or smaller.");
      return;
    }

    setImageFile(file);
  }

  async function uploadImage(file: File): Promise<string> {
    const response = await fetch("/api/admin/products/image-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not prepare image upload.");
    }

    const uploaded = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploaded.ok) {
      throw new Error("Image upload failed. Check your R2 CORS settings.");
    }

    return data.imageUrl;
  }

  function resetForm() {
    setName("");
    setCategory("READY_MADE");
    setDescription("");
    setPrice("");
    setImageFile(null);
    setCurrentImage("");
    setEditingId(null);
    setMessage("");
    setHasVariants(false);
    setVariants([{ label: "", price: "" }]);
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setCurrentImage(product.imageUrl ?? "");
    setImageFile(null);
    setMessage("");

    const existing = product.variants ?? [];
    if (existing.length > 0) {
      setHasVariants(true);
      setVariants(
        existing.map((v) => ({
          label: v.label,
          price: String(v.price),
        }))
      );
    } else {
      setHasVariants(false);
      setVariants([{ label: "", price: "" }]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function addVariantRow() {
    setVariants((current) => [...current, { label: "", price: "" }]);
  }

  function removeVariantRow(index: number) {
    setVariants((current) =>
      current.length <= 1
        ? current
        : current.filter((_, i) => i !== index)
    );
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Enter a product name.");
      return;
    }

    if (description.trim().length > 2000) {
      setMessage("Product description must be 2000 characters or fewer.");
      return;
    }

    // Build the variants payload (empty array when toggle off → clears variants)
    let variantPayload: Array<{
      label: string;
      price: number;
      available: boolean;
    }> = [];

    let effectivePrice: number;

    if (hasVariants) {
      const cleaned: Array<{
        label: string;
        price: number;
        available: boolean;
      }> = [];

      for (const row of variants) {
        const label = row.label.trim();
        const numPrice = Number(row.price);

        if (!label || !Number.isSafeInteger(numPrice) || numPrice <= 0) {
          setMessage(
            "Each variant needs a label and a whole-number price in KSh."
          );
          return;
        }

        if (cleaned.some((v) => v.label === label)) {
          setMessage(`Duplicate variant label: "${label}".`);
          return;
        }

        cleaned.push({ label, price: numPrice, available: true });
      }

      if (cleaned.length === 0) {
        setMessage("Add at least one variant, or turn variants off.");
        return;
      }

      variantPayload = cleaned;
      effectivePrice = cleaned[0].price; // base price = first variant
    } else {
      const numPrice = Number(price);
      if (!Number.isSafeInteger(numPrice) || numPrice <= 0) {
        setMessage("Enter a whole-number price in KSh.");
        return;
      }
      effectivePrice = numPrice;
    }

    setSaving(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        setMessage("Uploading image...");
        imageUrl = await uploadImage(imageFile);
      }

      const editing = Boolean(editingId);
      setMessage(editing ? "Updating product..." : "Saving product...");

      const response = await fetch(
        editing ? `/api/products/${editingId}` : "/api/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            category,
            description: description.trim(),
            price: effectivePrice,
            ...(imageUrl ? { imageUrl } : {}),
            variants: variantPayload,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (editing ? "Could not update product." : "Could not save product.")
        );
      }

      resetForm();
      setMessage(
        editing ? "Product updated successfully." : "Product added successfully."
      );
      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" from the product list? It will no longer appear in the shop.`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setMessage("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete product.");
      }

      if (editingId === product.id) resetForm();

      setMessage("Product deleted from the shop.");
      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete product."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function categoryLabel(value: Product["category"]) {
    return value === "READY_MADE"
      ? "Ready-made meals"
      : "Fresh farm products";
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#10291f]">
          Meals & products
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage ready-made meals and fresh farm products.
        </p>
      </div>

      <form
        onSubmit={saveProduct}
        className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <h3 className="font-bold text-[#10291f]">
            {editingId ? "Edit product" : "Add a product"}
          </h3>
        </div>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Product name"
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700"
          required
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as Product["category"])
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
        >
          <option value="READY_MADE">Ready-made meals</option>
          <option value="FARM">Fresh farm products</option>
        </select>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe this product (max 2000 characters)"
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700"
          />
          <p className="mt-1 text-xs text-gray-500">
            {description.length} / 2000
          </p>
        </div>

        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(event) => {
                const checked = event.target.checked;
                setHasVariants(checked);
                if (!checked) setPrice("");
              }}
              className="mt-1 h-4 w-4"
            />
            <div>
              <p className="text-sm font-semibold text-[#10291f]">
                This product has variants
              </p>
              <p className="text-xs text-gray-500">
                Turn this on for sizes, weights, or wholesale/retail pricing.
                Leave off for a single fixed price.
              </p>
            </div>
          </label>

          {hasVariants && (
            <div className="mt-4 space-y-2">
              {variants.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <input
                    value={row.label}
                    onChange={(event) =>
                      updateVariant(i, { label: event.target.value })
                    }
                    placeholder="Label (e.g. Wholesale, 5L, 1kg)"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-700"
                  />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.price}
                    onChange={(event) =>
                      updateVariant(i, { price: event.target.value })
                    }
                    placeholder="Price (KSh)"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-700 sm:w-40"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantRow(i)}
                    disabled={variants.length <= 1}
                    aria-label="Remove variant"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariantRow}
                className="mt-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                + Add variant
              </button>
            </div>
          )}
        </div>

        {!hasVariants && (
          <input
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price (KSh)"
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-700"
          />
        )}

        <div className="sm:col-span-2">
          <label
            htmlFor="product-image"
            className="mb-2 block text-sm font-semibold text-[#10291f]"
          >
            Product image{" "}
            {editingId ? "(optional — choose to replace)" : ""}
          </label>

          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-gray-300 p-4 sm:flex-row sm:items-center">
            {preview || currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview || currentImage}
                alt="Product preview"
                className="h-28 w-28 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">
                No image selected
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Choose an image from your computer or phone.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, WebP or AVIF · Maximum 5 MB
              </p>

              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => selectImage(event.target.files?.[0])}
                className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#145a32] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#0e4727]"
              />

              {imageFile && (
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Remove selected image
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#145a32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0e4727] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Please wait..."
              : editingId
                ? "Save changes"
                : "Add product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel editing
            </button>
          )}
        </div>

        {message && (
          <p role="status" className="text-sm text-gray-600 sm:col-span-2">
            {message}
          </p>
        )}
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-[#10291f]">Product list</h3>
        </div>

        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            No products saved yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => {
              const variantCount = product.variants?.length ?? 0;

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gray-100" />
                    )}

                    <div>
                      <p className="font-semibold text-[#10291f]">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {categoryLabel(product.category)}
                        {variantCount > 0
                          ? ` · ${variantCount} variant${
                              variantCount === 1 ? "" : "s"
                            }`
                          : ""}
                      </p>
                      <p className="mt-1 font-bold">
                        {variantCount > 0
                          ? `From KSh ${Math.min(
                              ...(product.variants ?? []).map(
                                (v) => v.price
                              )
                            ).toLocaleString("en-KE")}`
                          : `KSh ${product.price.toLocaleString("en-KE")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      disabled={saving || deletingId !== null}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteProduct(product)}
                      disabled={saving || deletingId !== null}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}