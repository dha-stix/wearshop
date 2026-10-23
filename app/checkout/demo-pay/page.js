import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import DemoPayment from "@/components/checkout/DemoPayment";

export const metadata = { title: "Demo payment" };

export default function DemoPay() {
  return (
    <RequireAuth>
      <Suspense>
        <DemoPayment />
      </Suspense>
    </RequireAuth>
  );
}
