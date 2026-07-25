import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Rain Villa",
  description: "Luxury Villa Booking & Guest Consent",
  openGraph: {
    title: "The Rain Villa",
    description: "Luxury Villa Booking & Guest Consent",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}