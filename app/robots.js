import { SITE_URL } from "@/lib/config";

// Let search engines and link crawlers read the store, but not accounts, checkout or the API.
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/checkout", "/cart", "/auth", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
