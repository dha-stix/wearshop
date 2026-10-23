"use client";

import { createContext, useContext, useMemo } from "react";
import { useAllOrders, useAllProducts } from "@/lib/hooks";
import { salesByProduct } from "./revenue";

// One live subscription to every order and product, shared by all manager pages,
// so moving between Overview, Orders and Products is instant.
const ManagerDataContext = createContext(null);

export const NEEDS_UPDATE = ["paid", "packed", "shipped", "out_for_delivery"];

export function ManagerDataProvider({ children }) {
  const orders = useAllOrders(true);
  const products = useAllProducts(true);

  const value = useMemo(
    () => ({
      orders: orders.data,
      products: products.data,
      sales: salesByProduct(orders.data),
      needsUpdate: orders.data.filter((o) => NEEDS_UPDATE.includes(o.status)),
      loading: orders.loading || products.loading,
      error: orders.error || products.error,
    }),
    [orders, products]
  );

  return <ManagerDataContext.Provider value={value}>{children}</ManagerDataContext.Provider>;
}

export const useManagerData = () => useContext(ManagerDataContext);
