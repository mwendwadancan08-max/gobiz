
import type { Metadata } from "next";
import { GoBizInfoPage } from "@/components/GoBizInfoPage";

export const metadata: Metadata = {
  title: "GoBiz Services | Meals and Farm Products",
  description: "Explore ready-made meals, farm products, delivery and customer support available through GoBiz.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <GoBizInfoPage slug="services" />;
}
