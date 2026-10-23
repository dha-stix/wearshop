import { Suspense } from "react";
import ShopPage from "@/components/shop/ShopPage";
import { PageLoading } from "@/components/ui/States";

export const metadata = { title: "Shop" };

export default function Shop() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ShopPage />
    </Suspense>
  );
}
