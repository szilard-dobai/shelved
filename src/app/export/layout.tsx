import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download & share your shelf",
  description:
    "Download your Shelved bookshelf as a high-resolution image, or publish a public link where viewers can browse every title, author and rating.",
  alternates: { canonical: "/export" },
  robots: { index: false, follow: false },
};

export default function ExportLayout({
  children,
}: LayoutProps<"/export">) {
  return children;
}
