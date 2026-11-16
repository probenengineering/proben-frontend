import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";

import { MotionProvider, Toaster } from "@/components/organisms";
import "@/styles/globals.css";

// Fonts from the Figma design system. Used by the type-* text styles in globals.css.
const interTight = Inter_Tight({
  variable: "--font-family-inter-tight",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-family-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proben",
  description: "Proben web app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
        <Toaster />
      </body>
    </html>
  );
}
