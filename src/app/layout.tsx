import type { Metadata, Viewport } from "next";
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

const SITE_URL = "https://shelved.ink";
const SITE_NAME = "Shelved";
const DESCRIPTION =
  "Turn your reading history into a beautiful, shareable bookshelf. Import from Goodreads or Storygraph, pick a shelf style, and download a high-resolution image or share a public link to every title you've read.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shelved — your bookshelf, beautifully",
    template: "%s · Shelved",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "bookshelf visualizer",
    "shareable bookshelf",
    "Goodreads alternative",
    "Goodreads CSV import",
    "Storygraph export",
    "reading list visualizer",
    "year in books",
    "yearly reading recap",
    "book tracker",
    "reading log",
    "book collage maker",
    "virtual bookshelf",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "books",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Shelved — your bookshelf, beautifully",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelved — your bookshelf, beautifully",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4ead4" },
    { media: "(prefers-color-scheme: dark)", color: "#140a06" },
  ],
  colorScheme: "light dark",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "Shelved.ink",
  url: SITE_URL,
  applicationCategory: "LifestyleApplication",
  applicationSubCategory: "Books",
  operatingSystem: "Any (web-based)",
  description: DESCRIPTION,
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Import reading history from Goodreads CSV",
    "Import reading history from Storygraph CSV",
    "Add books manually",
    "Choose between wood and minimal shelf styles",
    "Sort by date, author, or title",
    "Download a high-resolution shelf image",
    "Publish a shareable link to a public bookshelf page",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
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
