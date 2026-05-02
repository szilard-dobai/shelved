import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/app-state";
import { ThemeBoot } from "@/components/ThemeBoot";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    >
      <body className="bg-bg text-ink font-sans min-h-screen">
        <ThemeBoot />
        <AppStateProvider>
          {children}
          <ThemeToggle />
        </AppStateProvider>
      </body>
    </html>
  );
}
