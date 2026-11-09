import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Posterwala",
    default: "Posterwala — Custom Posters, Polaroids & Fine Art Prints in India",
  },
  description:
    "India's premier print studio for museum-grade wall art, custom photo polaroids, and large format posters. High DPI resolution checks, matte & glossy archival finishes with free delivery across India.",
  keywords: [
    "custom posters India",
    "photo polaroid prints",
    "wall art prints",
    "custom framed prints",
    "300 DPI posters",
    "minimalist art",
    "anime posters",
    "photo prints online",
  ],
  authors: [{ name: "Posterwala" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://posterwala.com",
    title: "Posterwala — Custom Posters, Polaroids & Fine Art Prints",
    description:
      "Craft museum-grade wall art, custom retro polaroids, and vibrant photo prints with live resolution previews and pan-India shipping.",
    siteName: "Posterwala",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Posterwala Custom Art Prints",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Posterwala — Custom Posters, Polaroids & Fine Art Prints",
    description:
      "Museum-grade custom posters and photo prints with live resolution checks.",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${displayFont.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-background text-foreground">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
