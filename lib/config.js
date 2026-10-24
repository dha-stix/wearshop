// Store-wide settings and the vocabulary shared by pages, dashboards and the server.

export const STORE_NAME = "WearShop";
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "NGN";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// A product with this many units or fewer left is flagged as low stock for the manager.
export const LOW_STOCK_THRESHOLD = 3;
export const MAX_IMAGES_PER_PRODUCT = 10;
export const MAX_IMAGE_MB = 8;

// narrowSymbol shows "₦1,875,000" rather than "NGN 1,875,000".
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

export function formatMoney(amount) {
  return moneyFormatter.format(Number(amount) || 0);
}

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return new Date(value);
}

export function formatDate(value, withTime = false) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: withTime ? undefined : "numeric",
    hour: withTime ? "2-digit" : undefined,
    minute: withTime ? "2-digit" : undefined,
  });
}

// Each category also carries the colours used to draw a watch when a product has no photo yet.
export const CATEGORIES = [
  {
    id: "chronograph",
    name: "Chronograph",
    blurb: "Stopwatch precision for the man who times everything.",
    look: { dial: "#F2F0EB", caseColor: "#B8BBC0", strap: "#1B1C1F", lume: "#111111", accent: "#8A2B1F" },
  },
  {
    id: "diver",
    name: "Diver",
    blurb: "Rotating bezels and serious water resistance.",
    look: { dial: "#13233F", caseColor: "#B8BBC0", strap: "#13233F", lume: "#EDEAE3", accent: "#C9A45C" },
  },
  {
    id: "dress",
    name: "Dress",
    blurb: "Slim cases that slide under a shirt cuff.",
    look: { dial: "#F2EEE4", caseColor: "#C9A45C", strap: "#3A2414", lume: "#1A1A1A", accent: "#8A2B1F" },
  },
  {
    id: "field",
    name: "Field",
    blurb: "Rugged, legible, built for long days outside.",
    look: { dial: "#2B2E26", caseColor: "#6E7176", strap: "#4A4234", lume: "#EDEAE3", accent: "#C9A45C" },
  },
  {
    id: "travel",
    name: "Travel",
    blurb: "Second time zones for men who cross them.",
    look: { dial: "#111214", caseColor: "#C9A45C", strap: "#141414", lume: "#EDEAE3", accent: "#E06A4E" },
  },
];

export const DEFAULT_LOOK = { dial: "#0E0E0F", caseColor: "#C9A45C", strap: "#141414", lume: "#E8D5A6", accent: "#C9A45C" };

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}

export const MOVEMENTS = ["Automatic", "Quartz", "Manual wind"];
export const STRAPS = ["Leather", "Steel bracelet", "Rubber", "Canvas"];

// Order lifecycle, in the order a parcel moves through it.
export const ORDER_STATUSES = [
  { id: "pending_payment", label: "Awaiting payment", note: "We are waiting for Bachs to confirm your payment." },
  { id: "paid", label: "Payment confirmed", note: "Bachs confirmed your payment." },
  { id: "packed", label: "Packed & insured", note: "Packed in a WearShop presentation box and insured for full value." },
  { id: "shipped", label: "In transit", note: "Your watch has left our vault with the courier." },
  { id: "out_for_delivery", label: "Out for delivery", note: "The courier is on the way to your address today." },
  { id: "delivered", label: "Delivered", note: "Delivered. Enjoy your new watch." },
];
export const CANCELLED = { id: "cancelled", label: "Cancelled", note: "This order was cancelled." };

// Statuses a manager can move an order to once it has been paid for.
export const MANAGER_STATUSES = ORDER_STATUSES.filter((s) => s.id !== "pending_payment").concat(CANCELLED);

export function getStatus(id) {
  return ORDER_STATUSES.find((s) => s.id === id) || (id === CANCELLED.id ? CANCELLED : { id, label: id, note: "" });
}

export function statusIndex(id) {
  return ORDER_STATUSES.findIndex((s) => s.id === id);
}

// Orders that count as money received.
export const REVENUE_STATUSES = ["paid", "packed", "shipped", "out_for_delivery", "delivered"];
