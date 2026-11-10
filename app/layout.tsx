import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://gobiz.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "GoBiz | Fresh Farm Products & Ready-Made Meals in Kenya",
    template: "%s | GoBiz",
  },

  description:
    "GoBiz is your everyday food market in Kenya. Order ready-made meals and fresh farm products in one convenient marketplace — pay on delivery within our service area.",

  applicationName: "GoBiz",

  authors: [{ name: "Gerald Mwai" }],
  creator: "DBC.Africa",
  publisher: "GoBiz",
  generator: "Next.js",

  keywords: [
    "GoBiz",
    "GoBiz Kenya",
    "ready-made meals Kenya",
    "fresh farm products Kenya",
    "food delivery Kenya",
    "order food online Kenya",
    "muratina",
    "Kenyan food marketplace",
    "farm produce delivery",
    "pay on delivery food",
  ],

  category: "food",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "GoBiz Food & Farm Market",
    title: "GoBiz | Good Food. Fresh from the Farm.",
    description:
      "Discover ready-made meals and fresh farm products with GoBiz, your everyday food market in Kenya. Order what you need and pay on delivery.",
    locale: "en_KE",
  },

  twitter: {
    card: "summary_large_image",
    title: "GoBiz | Good Food. Fresh from the Farm.",
    description:
      "Your everyday food market in Kenya for ready-made meals and fresh farm products. Pay on delivery.",
  },

  manifest: "/manifest.json",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  appleWebApp: {
    capable: true,
    title: "GoBiz",
    statusBarStyle: "default",
  },

  other: {
    "owner-name": "Gerald Mwai",
    "owner-email": "gerlomwai2@gmail.com",
    "managed-by": "GoBiz Team",
    "designed-by": "DBC.Africa",
    "designer-email": "dbc.techfirm@gmail.com",
    "business-phone": "+254757699959",
    "business-email": "254gobiz@gmail.com",
    "business-country": "KE",
    "business-region": "Nyanza",
    "business-city": "Kisii",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#145a32",
};

// Organization + Food establishment structured data for Google
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "GoBiz Food & Farm Market",
  alternateName: "GoBiz",
  url: siteUrl,
  description:
    "Ready-made meals and fresh farm products in one convenient Kenyan marketplace.",
  servesCuisine: ["Kenyan", "East African", "Farm Produce"],
  priceRange: "KSh",
  areaServed: {
    "@type": "Country",
    name: "Kenya",
    "@id": "https://www.wikidata.org/wiki/Q717",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "KE",
    addressRegion: "Nyanza",
    addressLocality: "Kisii",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+254757699959",
      email: "254gobiz@gmail.com",
      contactType: "customer service",
      areaServed: "KE",
      availableLanguage: ["en", "sw"],
    },
  ],
  founder: {
    "@type": "Person",
    name: "Gerald Mwai",
    email: "gerlomwai2@gmail.com",
  },
  maintainer: {
    "@type": "Organization",
    name: "DBC.Africa",
    email: "dbc.techfirm@gmail.com",
  },
  paymentAccepted: "Cash on Delivery",
  currenciesAccepted: "KES",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "21:00",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}