
import type { Metadata } from "next";
import { GoBizInfoPage } from "@/components/GoBizInfoPage";

export const metadata: Metadata = {
  title: "About GoBiz | Your Everyday Food Market",
  description: "Learn about GoBiz and our marketplace for ready-made meals and farm products in Kenya.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <GoBizInfoPage slug="about" />;
}
