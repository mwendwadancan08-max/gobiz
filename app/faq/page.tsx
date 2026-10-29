
import type { Metadata } from "next";
import { GoBizInfoPage } from "@/components/GoBizInfoPage";

export const metadata: Metadata = {
  title: "GoBiz FAQ | Payments, Products and Delivery",
  description: "Get answers to common questions about GoBiz products, location sharing, delivery and payments.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return <GoBizInfoPage slug="faq" />;
}
