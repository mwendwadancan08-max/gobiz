import Link from "next/link";

export const infoPages = {
  about: {
    title: "About Us",
    subtitle: "Food shopping, made convenient.",
    description:
      "Learn about GoBiz, your everyday food market for ready-made meals and fresh farm products in one convenient marketplace.",
    paragraphs: [
      "GoBiz brings ready-made meals and farm products together in one convenient marketplace.",
      "Our goal is to make it easier for customers to discover food, order what they need and receive their purchases within our service area.",
      "We are building a convenient connection between customers, food sellers and farm produce suppliers.",
    ],
  },
  "how-it-works": {
    title: "How It Works",
    subtitle: "From browsing to delivery.",
    description:
      "Learn how to browse GoBiz, add meals and farm products to your cart, share your location and place an order.",
    paragraphs: [
      "Browse the marketplace and explore available meals or farm products.",
      "Add products to your cart and review your quantities.",
      "Share your GPS location so GoBiz can verify delivery availability.",
      "Enter your name, phone number, email and delivery address.",
      "Confirm your order and pay on delivery.",
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Answers before you order.",
    description:
      "Find answers about GoBiz delivery, location sharing, payments, products and customer feedback.",
    paragraphs: [
      "Do I have to share my location? Not to browse. A valid location within the delivery radius is required before ordering.",
      "How do I pay? GoBiz currently supports payment on delivery.",
      "Can I order farm products and meals together? Yes, add both to the same cart.",
      "What if my area is outside the delivery radius? You cannot place a delivery order from outside the current service area.",
      "How are delivery fees calculated? The applicable delivery fee is shown during checkout.",
      "How can I leave a review or complaint? Use the Feedback button on the GoBiz website.",
    ],
  },
  services: {
    title: "Our Services",
    subtitle: "One marketplace. Two product categories.",
    description:
      "Explore GoBiz ready-made meals, farm products, convenient delivery and customer feedback services.",
    paragraphs: [
      "Ready-made meals: Discover prepared meals offered by participating food sellers.",
      "Farm products: Shop fresh produce and other available farm products.",
      "Convenient delivery: Request delivery within the active GoBiz service radius.",
      "Customer feedback: Share your experience and raise concerns through our feedback form.",
      "Our catalogue, prices and delivery availability depend on the products and services currently listed on GoBiz.",
    ],
  },
  contact: {
    title: "Contact Us",
    subtitle: "We're here to help.",
    description:
      "Contact the GoBiz team about products, delivery coverage, services or an existing order.",
    paragraphs: [
      "Have a question about our products, delivery coverage or services? Contact the GoBiz team.",
      "WhatsApp: +254 757 699959",
      "Email: 254gobiz@gmail.com",
      "For assistance with an existing order, include your order number.",
    ],
  },
} as const;

export type InfoSlug = keyof typeof infoPages;

/* ---------- small inline icons ---------- */

function BackChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42-.14 0-.31-.02-.47-.02-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

/* ---------- body renderers per slug ---------- */

function AboutBody({ paragraphs }: { paragraphs: readonly string[] }) {
  const pillars = [
    {
      label: "One marketplace",
      text: paragraphs[0] ?? "",
      gradient: "from-green-800 to-green-600",
    },
    {
      label: "Convenience first",
      text: paragraphs[1] ?? "",
      gradient: "from-red-800 to-red-600",
    },
    {
      label: "Real connections",
      text: paragraphs[2] ?? "",
      gradient: "from-neutral-900 to-neutral-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Intro */}
      <p className="text-[15px] leading-7 text-neutral-700">
        GoBiz is a Kenyan food marketplace that combines prepared meals from
        local sellers with fresh produce from verified farms — one cart, one
        checkout, one delivery to your door.
      </p>

      {/* Pillars */}
      <div className="grid gap-3 sm:grid-cols-3">
        {pillars.map((pillar, i) => (
          <div
            key={pillar.label}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${pillar.gradient} text-xs font-extrabold text-white shadow-md`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
              {pillar.label}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-neutral-700">
              {pillar.text}
            </p>
          </div>
        ))}
      </div>

      {/* Ownership section */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-green-50 via-white to-red-50 p-6 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-800">
          Ownership &amp; team
        </p>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
          Who stands behind GoBiz
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {/* Owner */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-800 to-green-600 text-white shadow-sm">
              <UserIcon />
            </span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-green-800">
              Owner
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">
              Gerald Mwai
            </p>
            <a
              href="mailto:gerlomwai2@gmail.com"
              className="mt-1 block break-words text-xs text-neutral-600 hover:text-green-800 hover:underline"
            >
              gerlomwai2@gmail.com
            </a>
          </div>

          {/* Manager */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-sm">
              <TeamIcon />
            </span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
              Managed by
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">
              The GoBiz team
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              Daily operations, orders, and customer care.
            </p>
          </div>

          {/* Builder */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-800 to-red-600 text-white shadow-sm">
              <CodeIcon />
            </span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-800">
              Built &amp; maintained by
            </p>
            <p className="mt-1 text-sm font-bold text-neutral-900">
              DBC.Africa
            </p>
            <a
              href="mailto:dbc.techfirm@gmail.com"
              className="mt-1 block break-words text-xs text-neutral-600 hover:text-red-700 hover:underline"
            >
              dbc.techfirm@gmail.com
            </a>
          </div>
        </div>

        <p className="mt-5 text-[11px] leading-6 text-neutral-500">
          GoBiz is owned and operated in Kenya. Website design, engineering,
          and maintenance are provided by DBC.Africa.
        </p>
      </div>

      {/* Hidden DBC.Africa credit */}
      <div className="pt-1 text-center">
        <a
          href="mailto:dbc.techfirm@gmail.com"
          aria-label="Website designed and maintained by DBC.Africa"
          title="Designed & maintained by DBC.Africa"
          className="text-[10px] text-neutral-300 underline-offset-4 transition hover:text-neutral-600 hover:underline focus:text-neutral-600 focus:outline-none"
        >
          Designed &amp; maintained by DBC.Africa
        </a>
      </div>
    </div>
  );
}

function HowItWorksBody({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <ol className="relative space-y-3 border-l border-green-100 pl-6">
      {paragraphs.map((p, i) => (
        <li key={p} className="relative">
          <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full bg-green-800 text-xs font-bold text-white ring-4 ring-white">
            {i + 1}
          </span>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[15px] leading-7 text-neutral-700">{p}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function FaqBody({ paragraphs }: { paragraphs: readonly string[] }) {
  const items = paragraphs.map((p) => {
    const idx = p.indexOf("?");
    if (idx === -1) return { question: p, answer: "" };
    return {
      question: p.slice(0, idx + 1).trim(),
      answer: p.slice(idx + 1).trim(),
    };
  });

  return (
    <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50">
            <span className="text-[15px] font-semibold text-neutral-900">
              {item.question}
            </span>
            <span className="shrink-0 text-neutral-400 transition group-hover:text-green-800">
              <ChevronDown />
            </span>
          </summary>
          {item.answer && (
            <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-4">
              <p className="text-[15px] leading-7 text-neutral-700">
                {item.answer}
              </p>
            </div>
          )}
        </details>
      ))}
    </div>
  );
}

function ServicesBody({ paragraphs }: { paragraphs: readonly string[] }) {
  const cards = paragraphs.slice(0, -1);
  const note = paragraphs[paragraphs.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((p) => {
          const idx = p.indexOf(":");
          const label = idx === -1 ? "" : p.slice(0, idx).trim();
          const desc = idx === -1 ? p : p.slice(idx + 1).trim();

          return (
            <div
              key={p}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-green-200 hover:shadow-md"
            >
              {label && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-green-800">
                    {label}
                  </h3>
                </div>
              )}
              <p className="text-[15px] leading-7 text-neutral-700">{desc}</p>
            </div>
          );
        })}
      </div>

      {note && (
        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-xs leading-6 text-neutral-500">
          {note}
        </p>
      )}
    </div>
  );
}

function ContactBody({ paragraphs }: { paragraphs: readonly string[] }) {
  const intro = paragraphs[0];
  const footerNote = paragraphs[paragraphs.length - 1];

  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-7 text-neutral-700">{intro}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href="https://wa.me/254757699959"
          className="group flex flex-col gap-2 rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:border-green-800 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-800 transition group-hover:bg-green-800 group-hover:text-white">
            <WhatsAppIcon />
          </span>
          <span className="mt-1 text-xs font-bold uppercase tracking-widest text-green-800">
            WhatsApp
          </span>
          <span className="text-[15px] font-semibold text-neutral-900">
            +254 757 699959
          </span>
          <span className="mt-1 text-xs text-neutral-500">
            Chat with the GoBiz team
          </span>
        </a>

        <a
          href="mailto:254gobiz@gmail.com"
          className="group flex flex-col gap-2 rounded-2xl border border-red-200 bg-white p-5 shadow-sm transition hover:border-red-800 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-800 transition group-hover:bg-red-800 group-hover:text-white">
            <MailIcon />
          </span>
          <span className="mt-1 text-xs font-bold uppercase tracking-widest text-red-800">
            Email
          </span>
          <span className="text-[15px] font-semibold break-words text-neutral-900">
            254gobiz@gmail.com
          </span>
          <span className="mt-1 text-xs text-neutral-500">
            For order assistance, include your order number
          </span>
        </a>
      </div>

      {footerNote && footerNote !== intro && (
        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-xs leading-6 text-neutral-500">
          {footerNote}
        </p>
      )}

      <a
        href="https://wa.me/254757699959"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-green-800 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-900"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Chat on WhatsApp
      </a>
    </div>
  );
}

/* ---------- main component ---------- */

export function GoBizInfoPage({ slug }: { slug: InfoSlug }) {
  const page = infoPages[slug];

  return (
    <article className="bg-white text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition hover:text-green-800"
          >
            <BackChevron />
            Back to GoBiz
          </Link>

          <p className="mt-5 inline-block rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-green-800">
            GoBiz
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {page.title}
          </h1>

          <p className="mt-2 max-w-xl text-base leading-7 text-neutral-600">
            {page.subtitle}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        {slug === "about" && <AboutBody paragraphs={page.paragraphs} />}
        {slug === "how-it-works" && (
          <HowItWorksBody paragraphs={page.paragraphs} />
        )}
        {slug === "faq" && <FaqBody paragraphs={page.paragraphs} />}
        {slug === "services" && <ServicesBody paragraphs={page.paragraphs} />}
        {slug === "contact" && <ContactBody paragraphs={page.paragraphs} />}

        {slug !== "contact" && (
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-gradient-to-br from-green-50 to-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold tracking-tight text-neutral-900 sm:text-xl">
              Ready to shop?
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Discover ready-made meals and fresh farm products — pay on
              delivery.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-900"
              >
                Browse the marketplace
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Back to home
              </Link>
            </div>
          </div>
        )}

        {slug === "contact" && (
          <div className="mt-8">
            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Back to GoBiz
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}