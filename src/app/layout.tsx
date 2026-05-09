import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppStateProvider } from "@/lib/app-state";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Shelved — your bookshelf, beautifully",
  description:
    "Turn your reading history into a shareable bookshelf. Import your books from Goodreads, Storygraph, or just type them in.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-ink font-sans">
        <NextTopLoader color="var(--color-gold)" showSpinner={false} />
        <ThemeProvider>
          <AppStateProvider>
            <main>{children}</main>
            <Footer />
          </AppStateProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
