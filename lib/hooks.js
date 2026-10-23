"use client";

import { useEffect, useState } from "react";
import {
  subscribeToAllOrders,
  subscribeToMyOrders,
  subscribeToNotifications,
  subscribeToOrder,
  subscribeToProduct,
  subscribeToProducts,
} from "./firebase-actions";

// Generic live-data hook around the subscribeTo* actions. Pass key = null to skip.
function useLive(subscribe, key, initial) {
  const [state, setState] = useState({ key: undefined, data: initial, error: null });

  useEffect(() => {
    if (key === null || key === undefined) return;
    return subscribe(
      key,
      (data) => setState({ key, data, error: null }),
      (error) => setState({ key, data: initial, error })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const loading = key !== null && key !== undefined && state.key !== key;
  return { data: loading ? initial : state.data, loading, error: state.key === key ? state.error : null };
}

const EMPTY = [];

export const useMyOrders = (uid) => useLive((id, ok, fail) => subscribeToMyOrders(id, ok, fail), uid, EMPTY);
export const useNotifications = (uid) => useLive((id, ok, fail) => subscribeToNotifications(id, ok, fail), uid, EMPTY);
export const useOrder = (orderId) => useLive((id, ok, fail) => subscribeToOrder(id, ok, fail), orderId, null);
export const useProduct = (productId) => useLive((id, ok, fail) => subscribeToProduct(id, ok, fail), productId, null);

// Manager views: pass enabled = false until the manager role is confirmed.
export const useAllOrders = (enabled) => useLive((_, ok, fail) => subscribeToAllOrders(ok, fail), enabled ? "all" : null, EMPTY);
export const useAllProducts = (enabled) =>
  useLive((_, ok, fail) => subscribeToProducts(ok, fail, { includeDrafts: true }), enabled ? "all" : null, EMPTY);
