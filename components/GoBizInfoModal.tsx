
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GoBizInfoModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) router.back();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close information popup"
          className="absolute right-4 top-4 z-10 rounded-xl bg-white/15 px-3 py-1 text-2xl text-white hover:bg-white/25"
        >
          ×
        </button>
        {children}
      </section>
    </div>
  );
}
