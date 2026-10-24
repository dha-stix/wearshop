import { Suspense } from "react";
import ShopPage from "@/components/shop/ShopPage";
import { PageLoading } from "@/components/ui/States";

export const metadata = {
  title: "Shop all watches",
  description: "Browse the WearShop collection: chronograph, diver, dress, field and travel watches, priced in Naira with insured delivery.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop all watches · WearShop", url: "/shop" },
};

export default function Shop() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ShopPage />
    </Suspense>
  );
}
