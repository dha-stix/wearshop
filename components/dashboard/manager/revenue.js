import { REVENUE_STATUSES, toDate } from "@/lib/config";

export const RANGES = {
  "7D": { label: "Last 7 days", unit: "day" },
  "6M": { label: "Last 6 months", unit: "month" },
  "12M": { label: "Last 12 months", unit: "month" },
};

export function paidOrders(orders) {
  return orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .map((o) => ({ ...o, when: toDate(o.paidAt || o.createdAt) || new Date(0) }));
}

// Buckets paid orders into days or months, oldest first.
export function buildSeries(orders, rangeId, now = new Date()) {
  const paid = paidOrders(orders);
  const isDays = RANGES[rangeId].unit === "day";
  const count = isDays ? 7 : rangeId === "6M" ? 6 : 12;

  const buckets = Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i;
    const start = isDays
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
      : new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = isDays
      ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
      : new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const label = start.toLocaleString("en-US", isDays ? { weekday: "short" } : { month: "short" });
    const inBucket = paid.filter((o) => o.when >= start && o.when < end);
    return {
      label,
      fullLabel: start.toLocaleString("en-US", isDays ? { weekday: "long", month: "short", day: "numeric" } : { month: "long", year: "numeric" }),
      value: inBucket.reduce((sum, o) => sum + (o.total || 0), 0),
      units: inBucket.reduce((sum, o) => sum + (o.itemCount || 0), 0),
    };
  });
  return buckets;
}

// Rounds up to a tidy axis maximum (1, 2, 2.5 or 5 × a power of ten).
export function niceMax(value) {
  if (value <= 0) return 100;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= value);
  return step * pow;
}

// Revenue and units per product, from paid orders.
export function salesByProduct(orders) {
  const map = new Map();
  for (const o of paidOrders(orders)) {
    for (const item of o.items || []) {
      const row = map.get(item.productId) || { revenue: 0, units: 0 };
      row.revenue += item.price * item.quantity;
      row.units += item.quantity;
      map.set(item.productId, row);
    }
  }
  return map;
}
