// Demo mode: an in-browser stand-in for Firebase and Bachs, used only while Firebase isn't connected.
// Data lives in localStorage, so you can click through every customer and manager flow
// (sign in, cart, checkout, payment, tracking, product uploads, order updates) without any keys.
// lib/firebase-actions.js routes to these functions automatically when Firebase is not configured.
import { CATALOG } from "./catalog";
import { CURRENCY, getStatus, ORDER_STATUSES } from "./config";

const DB_KEY = "wearshop-demo-db";
const SESSION_KEY = "wearshop-demo-session";
// Reseeds automatically when the starter catalogue changes.
const VERSION = `2-${CATALOG.length}-${CATALOG[0]?.id || ""}`;
const DAY = 86400000;

export const DEMO_USERS = {
  customer: { uid: "demo-customer", displayName: "Demo Customer", email: "customer@demo.wearshop", role: "customer" },
  manager: { uid: "demo-manager", displayName: "Demo Manager", email: "manager@demo.wearshop", role: "manager" },
};

const iso = (ms) => new Date(ms).toISOString();
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const byNewest = (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt);

/* ---------------------------- seed data ---------------------------- */

// Small deterministic PRNG so the demo history is the same on every reset.
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function timelineUpTo(statusId, startMs) {
  const stop = ORDER_STATUSES.findIndex((s) => s.id === statusId);
  return ORDER_STATUSES.slice(0, stop + 1).map((s, i) => ({
    status: s.id,
    note: i === 0 ? "Order placed. Waiting for payment." : s.note,
    at: iso(startMs + (i === 0 ? 0 : i === 1 ? 60000 : (i - 1) * DAY)),
  }));
}

function seedOrder(db, { userId, customer, product, quantity, status, createdMs }) {
  const number = `WS-${db.counter++}`;
  const id = `demo-order-${number}`;
  const order = {
    id,
    number,
    userId,
    customer,
    shipping: { fullName: customer.name, phone: "+000 000 0000", address: "12 Example Street", city: "Lagos", state: "Lagos", country: "Nigeria" },
    items: [{ productId: product.id, name: product.name, category: product.category, price: product.price, quantity, image: product.images[0]?.url || null }],
    itemCount: quantity,
    subtotal: product.price * quantity,
    shippingFee: 0,
    total: product.price * quantity,
    currency: CURRENCY,
    status,
    payment: { provider: "bachs-demo", status: status === "pending_payment" ? "pending" : "succeeded" },
    timeline: timelineUpTo(status, createdMs),
    createdAt: iso(createdMs),
    paidAt: status === "pending_payment" ? null : iso(createdMs + 60000),
    updatedAt: iso(createdMs),
  };
  db.orders.push(order);
  if (status !== "pending_payment") {
    const edit = (db.productEdits[product.id] ||= {});
    edit.sold = (edit.sold || 0) + quantity;
  }
  return order;
}

function seed() {
  const db = {
    v: VERSION,
    counter: 10001,
    users: Object.fromEntries(
      Object.values(DEMO_USERS).map((u) => [u.uid, { name: u.displayName, email: u.email, photoURL: "", role: u.role }])
    ),
    productEdits: {},
    newProducts: [],
    deleted: [],
    orders: [],
    notifications: [],
    carts: {},
  };
  if (!CATALOG.length) return db;

  const rand = rng(42);
  const now = Date.now();
  const pick = () => CATALOG[Math.floor(rand() * CATALOG.length)];

  // A year of sales from other (fictional) shoppers so the manager's revenue chart has history.
  for (let i = 0; i < 46; i++) {
    const ageDays = Math.floor(rand() * 360) + 1;
    const recent = ageDays < 6;
    const status = recent ? ["paid", "packed", "shipped", "out_for_delivery"][i % 4] : ageDays < 9 ? "shipped" : "delivered";
    const name = `Shopper ${i + 1}`;
    seedOrder(db, {
      userId: `demo-shopper-${i + 1}`,
      customer: { name, email: `shopper${i + 1}@demo.wearshop` },
      product: pick(),
      quantity: rand() < 0.2 ? 2 : 1,
      status,
      createdMs: now - ageDays * DAY,
    });
  }
  seedOrder(db, {
    userId: "demo-shopper-pending",
    customer: { name: "Shopper 47", email: "shopper47@demo.wearshop" },
    product: pick(),
    quantity: 1,
    status: "pending_payment",
    createdMs: now - 3600000,
  });

  // The demo customer's own history: one delivered, one on its way.
  const customer = { name: DEMO_USERS.customer.displayName, email: DEMO_USERS.customer.email };
  const delivered = seedOrder(db, { userId: DEMO_USERS.customer.uid, customer, product: CATALOG[5], quantity: 1, status: "delivered", createdMs: now - 64 * DAY });
  const shipped = seedOrder(db, { userId: DEMO_USERS.customer.uid, customer, product: CATALOG[1], quantity: 1, status: "shipped", createdMs: now - 2 * DAY });
  for (const order of [delivered, shipped]) {
    order.timeline.slice(1).forEach((t, i) =>
      db.notifications.push({
        id: newId("note"),
        userId: order.userId,
        orderId: order.id,
        orderNumber: order.number,
        title: i === 0 ? `Payment confirmed for order ${order.number}` : `Order ${order.number} updated: ${getStatus(t.status).label}`,
        body: t.note,
        read: order === delivered || i < order.timeline.length - 2,
        createdAt: t.at,
      })
    );
  }
  db.orders.sort(byNewest);
  return db;
}

/* ---------------------------- storage ---------------------------- */

let cache = null;
const listeners = new Set();
const authListeners = new Set();

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(DB_KEY));
  } catch {
    cache = null;
  }
  if (!cache || cache.v !== VERSION) {
    cache = seed();
    persist();
  }
  return cache;
}

function persist() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    throw new Error("Demo storage is full. Use fewer or smaller images, or reset the demo data.");
  }
}

function commit() {
  persist();
  listeners.forEach((fn) => fn());
}

// Re-runs compute() and pushes the result whenever demo data changes (in this tab or another).
function watch(compute, onData) {
  const run = () => onData(compute());
  run();
  listeners.add(run);
  return () => listeners.delete(run);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === DB_KEY) {
      cache = null;
      listeners.forEach((fn) => fn());
    }
    if (e.key === SESSION_KEY) authListeners.forEach((fn) => fn(currentUser()));
  });
}

export function resetDemo() {
  cache = seed();
  commit();
}

/* ---------------------------- auth ---------------------------- */

function currentUser() {
  let role = null;
  try {
    role = localStorage.getItem(SESSION_KEY);
  } catch {}
  const u = DEMO_USERS[role];
  return u ? { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: null } : null;
}

export function onAuthChange(callback) {
  callback(currentUser());
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

export function signInAsDemo(role) {
  localStorage.setItem(SESSION_KEY, role);
  load();
  authListeners.forEach((fn) => fn(currentUser()));
  return currentUser();
}

export function signOutDemo() {
  localStorage.removeItem(SESSION_KEY);
  authListeners.forEach((fn) => fn(null));
}

export function subscribeToUserProfile(uid, onData) {
  return watch(() => load().users[uid] || null, onData);
}

export function saveShippingDetails(uid, shipping) {
  const db = load();
  db.users[uid] = { ...db.users[uid], shipping };
  commit();
}

/* ---------------------------- products ---------------------------- */

function allProducts() {
  const db = load();
  const deleted = new Set(db.deleted);
  const fromCatalog = CATALOG.filter((p) => !deleted.has(p.id)).map((p) => ({ ...p, ...db.productEdits[p.id] }));
  return [...db.newProducts.filter((p) => !deleted.has(p.id)), ...fromCatalog];
}

function patchProduct(id, patch) {
  const db = load();
  const created = db.newProducts.find((p) => p.id === id);
  if (created) Object.assign(created, patch);
  else db.productEdits[id] = { ...db.productEdits[id], ...patch };
}

export function subscribeToProducts(onData, { includeDrafts = false } = {}) {
  return watch(() => allProducts().filter((p) => includeDrafts || p.status === "live"), onData);
}

export function subscribeToProduct(id, onData) {
  return watch(() => allProducts().find((p) => p.id === id) || null, onData);
}

// "Uploads" by shrinking each photo to a data URL small enough for localStorage.
function shrink(file, max = 900) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => reject(new Error(`${file.name} couldn't be read.`));
    img.src = url;
  });
}

export async function uploadProductImages(_productId, files, onProgress) {
  return Promise.all(
    files.map(async (file, i) => {
      const url = await shrink(file);
      onProgress?.(i, 100);
      return { url, path: null };
    })
  );
}

export async function createProduct(fields, files, onProgress) {
  const id = newId("demo-product");
  const images = await uploadProductImages(id, files, onProgress);
  const db = load();
  db.newProducts.unshift({ id, ...fields, images, sold: 0, createdAt: iso(Date.now()), updatedAt: iso(Date.now()) });
  commit();
  return id;
}

export async function updateProduct(id, fields, newFiles, keptImages, onProgress) {
  const uploaded = newFiles.length ? await uploadProductImages(id, newFiles, onProgress) : [];
  const patch = { ...fields, updatedAt: iso(Date.now()) };
  if (keptImages || uploaded.length) patch.images = [...(keptImages || []), ...uploaded];
  patchProduct(id, patch);
  commit();
}

export function restockProduct(id, amount) {
  const product = allProducts().find((p) => p.id === id);
  patchProduct(id, { stock: (product?.stock || 0) + Math.floor(amount) });
  commit();
}

export function deleteProduct(product) {
  const db = load();
  db.deleted.push(product.id);
  commit();
}

/* ---------------------------- cart ---------------------------- */

export function loadSavedCart(uid) {
  return load().carts[uid] || [];
}

export function saveCart(uid, items) {
  load().carts[uid] = items.map(({ productId, quantity }) => ({ productId, quantity }));
  persist();
}

/* ---------------------------- checkout ---------------------------- */

// Mirrors the server's /api/checkout: prices from the catalogue, checks stock, creates a pending order.
export function startCheckout(items, shipping) {
  const user = currentUser();
  if (!user) throw new Error("Sign in to pay.");
  const products = allProducts();
  const lines = items.map(({ productId, quantity }) => {
    const p = products.find((x) => x.id === productId && x.status === "live");
    if (!p) throw new Error("A watch in your cart is no longer available.");
    if ((p.stock || 0) < quantity) throw new Error(p.stock ? `Only ${p.stock} ${p.name} left in stock.` : `${p.name} is sold out.`);
    return { productId, name: p.name, category: p.category, price: p.price, quantity, image: p.images?.[0]?.url || null };
  });
  const db = load();
  const number = `WS-${db.counter++}`;
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const now = iso(Date.now());
  const order = {
    id: `demo-order-${number}`,
    number,
    userId: user.uid,
    customer: { name: shipping.fullName || user.displayName, email: user.email },
    shipping,
    items: lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: total,
    shippingFee: 0,
    total,
    currency: CURRENCY,
    status: "pending_payment",
    payment: { provider: "bachs-demo", status: "pending" },
    timeline: [{ status: "pending_payment", note: "Order placed. Waiting for payment.", at: now }],
    createdAt: now,
    updatedAt: now,
  };
  db.orders.unshift(order);
  commit();
  return { orderId: order.id, number, checkoutUrl: `/checkout/demo-pay?orderId=${encodeURIComponent(order.id)}` };
}

// What the Bachs webhook does on the real site: mark paid, take stock, notify, clear the cart.
export function completeDemoPayment(orderId) {
  const db = load();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found.");
  if (order.status !== "pending_payment") return order.status;
  for (const item of order.items) {
    const product = allProducts().find((p) => p.id === item.productId);
    if (product) patchProduct(item.productId, { stock: Math.max(0, (product.stock || 0) - item.quantity), sold: (product.sold || 0) + item.quantity });
  }
  const now = iso(Date.now());
  Object.assign(order, {
    status: "paid",
    paidAt: now,
    updatedAt: now,
    payment: { ...order.payment, status: "succeeded" },
    timeline: [...order.timeline, { status: "paid", note: getStatus("paid").note, at: now }],
  });
  db.notifications.unshift({
    id: newId("note"),
    userId: order.userId,
    orderId,
    orderNumber: order.number,
    title: `Payment confirmed for order ${order.number}`,
    body: "Bachs confirmed your payment. We'll notify you when your watch is packed.",
    read: false,
    createdAt: now,
  });
  delete db.carts[order.userId];
  commit();
  return "paid";
}

export function confirmCheckout(orderId) {
  const order = load().orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found.");
  return { status: order.status, number: order.number };
}

/* ---------------------------- orders ---------------------------- */

export function subscribeToMyOrders(uid, onData) {
  return watch(() => load().orders.filter((o) => o.userId === uid).sort(byNewest), onData);
}

export function subscribeToOrder(id, onData) {
  return watch(() => load().orders.find((o) => o.id === id) || null, onData);
}

export function subscribeToAllOrders(onData) {
  return watch(() => [...load().orders].sort(byNewest), onData);
}

export function updateOrderStatus(order, statusId, message) {
  const db = load();
  const target = db.orders.find((o) => o.id === order.id);
  const status = getStatus(statusId);
  const note = (message || status.note).trim();
  const now = iso(Date.now());
  target.status = statusId;
  target.updatedAt = now;
  target.timeline = [...target.timeline.filter((t) => t.status !== statusId), { status: statusId, note, at: now }];
  db.notifications.unshift({
    id: newId("note"),
    userId: order.userId,
    orderId: order.id,
    orderNumber: order.number,
    title: `Order ${order.number} updated: ${status.label}`,
    body: note,
    read: false,
    createdAt: now,
  });
  commit();
}

/* ---------------------------- notifications ---------------------------- */

export function subscribeToNotifications(uid, onData) {
  return watch(() => load().notifications.filter((n) => n.userId === uid).sort(byNewest).slice(0, 40), onData);
}

export function markNotificationsRead(ids) {
  const set = new Set(ids);
  load().notifications.forEach((n) => {
    if (set.has(n.id)) n.read = true;
  });
  commit();
}
