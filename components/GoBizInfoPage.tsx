
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

export function GoBizInfoPage({ slug }: { slug: InfoSlug }) {
  const page = infoPages[slug];

  return (
    <article className="bg-white text-neutral-900">
      <header className="bg-gradient-to-r from-green-900 via-green-800 to-red-900 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-green-200">
          Welcome to GoBiz
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">{page.title}</h1>
        <p className="mt-2 text-sm leading-6 text-white/80">
          {page.subtitle}
        </p>
      </header>

      <div className="space-y-4 p-5 sm:p-8">
        {page.paragraphs.map((paragraph, index) => (
          <div
            key={paragraph}
            className="flex gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-900">
              {index + 1}
            </span>
            <p className="text-sm leading-7 text-neutral-700">
              {paragraph}
            </p>
          </div>
        ))}

        {slug === "contact" && (
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <a
              href="https://wa.me/254757699959"
              className="rounded-full bg-green-800 px-5 py-3 text-center text-sm font-bold text-white hover:bg-green-900"
            >
              Chat on WhatsApp
            </a>
            <a
              href="mailto:254gobiz@gmail.com"
              className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-bold text-red-900 hover:bg-red-100"
            >
              Send us an email
            </a>
          </div>
        )}

        <Link
          href="/"
          className="block w-full rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-semibold hover:bg-neutral-50"
        >
          Back to GoBiz
        </Link>
      </div>
    </article>
  );
}
