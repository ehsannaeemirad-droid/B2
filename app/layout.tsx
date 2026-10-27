import type { Metadata, Viewport } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TapRead — English reading for A1 learners",
  description:
    "A flipped-classroom English reading companion for adult A1 learners.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-text-size="normal"
      suppressHydrationWarning
      className={`${inter.variable} ${vazirmatn.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
