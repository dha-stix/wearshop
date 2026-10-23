"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subscribeToProducts } from "@/lib/firebase-actions";

// One live subscription to the catalogue, shared by the storefront and the cart.
const ProductsContext = createContext({ products: [], loading: true, error: null, byId: new Map() });

export function ProductsProvider({ children }) {
  const [state, setState] = useState({ products: [], loading: true, error: null });

  useEffect(
    () =>
      subscribeToProducts(
        (products) => setState({ products, loading: false, error: null }),
        (error) => setState({ products: [], loading: false, error })
      ),
    []
  );

  const value = useMemo(() => ({ ...state, byId: new Map(state.products.map((p) => [p.id, p])) }), [state]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export const useProducts = () => useContext(ProductsContext);
