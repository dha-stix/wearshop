import RequireAuth from "@/components/auth/RequireAuth";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export const metadata = { title: "Checkout", robots: { index: false } };

export default function Checkout() {
  return (
    <RequireAuth>
      <CheckoutPage />
    </RequireAuth>
  );
}
