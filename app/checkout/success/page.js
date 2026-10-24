import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

export const metadata = { title: "Order confirmed", robots: { index: false } };

export default function Success() {
  return (
    <RequireAuth>
      <Suspense>
        <CheckoutSuccess />
      </Suspense>
    </RequireAuth>
  );
}
