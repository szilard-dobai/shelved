import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import your books",
  description:
    "Bring your reading history into Shelved. Upload a Goodreads or Storygraph CSV export, or add books one at a time.",
  alternates: { canonical: "/import" },
  robots: { index: false, follow: false },
};

export default function ImportLayout({
  children,
}: LayoutProps<"/import">) {
  return children;
}
