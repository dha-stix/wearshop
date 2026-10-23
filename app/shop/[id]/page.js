import ProductDetail from "@/components/shop/ProductDetail";

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
