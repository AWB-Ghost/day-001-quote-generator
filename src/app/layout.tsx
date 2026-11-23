import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Press_Start_2P } from "next/font/google";

import { RetroSky } from "@/components/quotes/retro-sky";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixel Quotes",
  description:
    "An 8-bit random quote generator. Print a quote, keep the good ones, shred the rest.",
};

export const viewport: Viewport = {
  themeColor: "#090a16",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pressStart.variable} ${pixelify.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <RetroSky />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
