import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rain-villas-pms-2t1k.vercel.app"),

  title: "The Rain Villa",
  description: "Luxury Villa Booking & Guest Consent",

  openGraph: {
    title: "The Rain Villa",
    description: "Luxury Villa Booking & Guest Consent",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Rain Villa",
      },
    ],
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