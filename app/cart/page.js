import { Suspense } from "react";
import CartPage from "@/components/checkout/CartPage";
import { PageLoading } from "@/components/ui/States";

export const metadata = { title: "Cart", robots: { index: false } };

export default function Cart() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CartPage />
    </Suspense>
  );
}
