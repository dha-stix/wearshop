"use client";

import { AuthProvider } from "./AuthProvider";
import { ProductsProvider } from "./ProductsProvider";
import { CartProvider } from "./CartProvider";
import { ToastProvider } from "./ToastProvider";
import DemoBadge from "@/components/layout/DemoBadge";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            {children}
            <DemoBadge />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
