import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shelved — your bookshelf, beautifully",
    short_name: "Shelved",
    description:
      "Turn your reading history into a beautiful, shareable bookshelf. Import from Goodreads or Storygraph, pick a shelf style, and download a high-resolution image or share a public link.",
    start_url: "/",
    display: "standalone",
    background_color: "#140a06",
    theme_color: "#140a06",
    orientation: "portrait",
    categories: ["books", "lifestyle", "productivity"],
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon1", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
