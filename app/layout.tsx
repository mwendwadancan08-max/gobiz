
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://gobiz.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "GoBiz | Fresh Farm Products & Ready-Made Meals in Kenya",
    template: "%s | GoBiz",
  },

  description:
    "Shop ready-made meals and fresh farm products with GoBiz Food & Farm Market. Your everyday food market.",

  applicationName: "GoBiz",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "GoBiz Food & Farm Market",
    title: "GoBiz | Good Food. Better Living.",
    description:
      "Discover ready-made meals and fresh farm products with GoBiz, your everyday food market.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GoBiz Food & Farm Market",
      },
    ],
    locale: "en_KE",
  },

  twitter: {
    card: "summary_large_image",
    title: "GoBiz | Good Food. Better Living.",
    description:
      "Your everyday food market for ready-made meals and fresh farm products.",
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },

  manifest: "/manifest.json",

  category: "food",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#145a32",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en-KE">
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
