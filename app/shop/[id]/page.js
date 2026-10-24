import ProductDetail from "@/components/shop/ProductDetail";
import { getShareProduct } from "@/lib/server/share";
import { formatMoney, getCategory } from "@/lib/config";

// Title and description for search results and link previews; the preview image comes from
// opengraph-image.js / twitter-image.js in this folder.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getShareProduct(id);
  if (!product) return { title: "Watch not found", robots: { index: false } };

  const price = formatMoney(product.price);
  const collection = getCategory(product.category)?.name;
  const specs = [product.caseSize && `${product.caseSize}mm`, product.movement, product.strap].filter(Boolean).join(", ");
  const description = `${price} · ${[collection, specs].filter(Boolean).join(" · ")}. ${product.description || ""}`.trim().slice(0, 200);
  const title = `${product.name} · ${price}`;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${id}` },
    openGraph: { title: `${title} · WearShop`, description, url: `/shop/${id}`, type: "website", siteName: "WearShop", locale: "en_NG" },
    twitter: { card: "summary_large_image", title: `${title} · WearShop`, description },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
