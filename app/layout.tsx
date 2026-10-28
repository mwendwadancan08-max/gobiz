import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoBiz | Meals & Farm Products",
  description:
    "Shop ready-made meals and fresh farm products with GoBiz.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
