
import type { Metadata } from "next";
import { GoBizInfoPage } from "@/components/GoBizInfoPage";

export const metadata: Metadata = {
  title: "How GoBiz Works | Ordering and Delivery",
  description: "Learn how to browse products, place an order and check delivery availability with GoBiz.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return <GoBizInfoPage slug="how-it-works" />;
}
