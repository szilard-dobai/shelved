import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit your shelf",
  description:
    "Tweak your Shelved bookshelf — pick a style, sort by date, author or title, edit each book, and watch the live preview update as you go.",
  alternates: { canonical: "/editor" },
  robots: { index: false, follow: false },
};

export default function EditorLayout({
  children,
}: LayoutProps<"/editor">) {
  return children;
}
