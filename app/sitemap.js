import { SITE_URL, CATEGORIES } from "@/lib/config";
import { adminDb } from "@/lib/server/firebase-admin";

export const revalidate = 3600;

// Home, the shop, each collection and every live watch.
export default async function sitemap() {
  const pages = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/shop?category=${c.id}`, changeFrequency: "weekly", priority: 0.7 })),
  ];
  try {
    const snap = await adminDb().collection("products").where("status", "==", "live").get();
    for (const d of snap.docs) {
      const updated = d.data().updatedAt?.toDate?.();
      pages.push({ url: `${SITE_URL}/shop/${d.id}`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 });
    }
  } catch (err) {
    console.error("sitemap: couldn't list products", err.message);
  }
  return pages;
}
