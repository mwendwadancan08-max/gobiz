
import type { Metadata } from "next";
import { GoBizInfoPage } from "@/components/GoBizInfoPage";

export const metadata: Metadata = {
  title: "Contact GoBiz | Customer Support",
  description: "Contact GoBiz about products, delivery and orders through WhatsApp or email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <GoBizInfoPage slug="contact" />;
}
