import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

export const metadata = { title: "Order confirmed" };

export default function Success() {
  return (
    <RequireAuth>
      <Suspense>
        <CheckoutSuccess />
      </Suspense>
    </RequireAuth>
  );
}
