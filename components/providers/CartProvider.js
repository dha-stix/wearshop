"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadSavedCart, saveCart } from "@/lib/firebase-actions";
import { useAuth } from "./AuthProvider";
import { useProducts } from "./ProductsProvider";

const STORAGE_KEY = "wearshop-cart";
const MAX_QTY = 10;
const CartContext = createContext(null);

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function mergeItems(a, b) {
  const map = new Map();
  [...a, ...b].forEach(({ productId, quantity }) => {
    map.set(productId, Math.min(Math.max(map.get(productId) || 0, quantity), MAX_QTY));
  });
  return [...map].map(([productId, quantity]) => ({ productId, quantity }));
}

// Cart = [{ productId, quantity }]. Stored locally, and synced to the account once signed in.
export function CartProvider({ children }) {
  const { user } = useAuth();
  const { byId, loading: productsLoading } = useProducts();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const syncedUid = useRef(null);

  useEffect(() => {
    setItems(readLocal());
    setReady(true);
  }, []);

  // On sign-in, merge the account's saved cart with whatever was added as a guest.
  useEffect(() => {
    if (!ready || !user || syncedUid.current === user.uid) return;
    syncedUid.current = user.uid;
    loadSavedCart(user.uid)
      .then((saved) => setItems((local) => mergeItems(saved, local)))
      .catch(() => {});
  }, [user, ready]);

  useEffect(() => {
    if (!user) syncedUid.current = null;
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
    if (!user || syncedUid.current !== user.uid) return;
    const t = setTimeout(() => saveCart(user.uid, items).catch(() => {}), 600);
    return () => clearTimeout(t);
  }, [items, user, ready]);

  const add = useCallback((productId, quantity = 1) => {
    setItems((list) => {
      const existing = list.find((i) => i.productId === productId);
      if (existing) {
        return list.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) } : i
        );
      }
      return [...list, { productId, quantity: Math.min(quantity, MAX_QTY) }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((list) =>
      quantity <= 0
        ? list.filter((i) => i.productId !== productId)
        : list.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i))
    );
  }, []);

  const remove = useCallback((productId) => setItems((list) => list.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  // Once the catalogue has loaded, drop saved items whose watch was deleted or unpublished,
  // so the cart badge never counts watches the cart page can't show.
  useEffect(() => {
    if (!ready || productsLoading) return;
    setItems((list) => {
      const kept = list.filter((i) => byId.has(i.productId));
      return kept.length === list.length ? list : kept;
    });
  }, [ready, productsLoading, byId, items]);

  const value = useMemo(() => {
    // Join cart entries with live product data.
    const lines = items.map((i) => ({ ...i, product: byId.get(i.productId) })).filter((l) => l.product);
    return {
      items,
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
      ready: ready && !productsLoading,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [items, byId, productsLoading, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
