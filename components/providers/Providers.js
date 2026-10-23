"use client";

import { AuthProvider } from "./AuthProvider";
import { ProductsProvider } from "./ProductsProvider";
import { CartProvider } from "./CartProvider";
import { ToastProvider } from "./ToastProvider";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>{children}</CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
