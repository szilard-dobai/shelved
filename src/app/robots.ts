import type { MetadataRoute } from "next";

const SITE_URL = "https://shelved.ink";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "DuckAssistBot",
  "Bytespider",
  "meta-externalagent",
  "Meta-ExternalAgent",
  "cohere-ai",
  "YouBot",
  "Amazonbot",
  "Diffbot",
  "Mistralai-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/editor", "/import", "/export"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/editor", "/import", "/export"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
