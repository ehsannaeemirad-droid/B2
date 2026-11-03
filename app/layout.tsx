import type { Metadata, Viewport } from "next";
import { Inter, Nunito, Vazirmatn } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

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
  title: "TapRead — English reading for Basic 2 learners",
  description:
    "A flipped-classroom English reading companion for adult learners: 20 short texts, each with six guided steps.",
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
      className={`${nunito.variable} ${inter.variable} ${vazirmatn.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
