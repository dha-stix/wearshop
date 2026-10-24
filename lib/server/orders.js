// Order creation and payment confirmation. Runs on the server with the Admin SDK so prices,
// stock and payment status can never be set by the browser.
import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import { CURRENCY, getStatus } from "@/lib/config";

const MAX_LINES = 20;
const MAX_QTY_PER_LINE = 10;
const SHIPPING_FIELDS = ["fullName", "phone", "address", "city", "state", "country"];

export class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function cleanShipping(shipping = {}) {
  const clean = {};
  for (const field of SHIPPING_FIELDS) {
    const value = String(shipping[field] || "").trim().slice(0, 200);
    if (!value) throw new OrderError("Fill in all delivery details.");
    clean[field] = value;
  }
  return clean;
}

function cleanItems(items) {
  if (!Array.isArray(items) || !items.length) throw new OrderError("Your cart is empty.");
  const merged = new Map();
  for (const item of items) {
    const id = String(item?.productId || "");
    const qty = Math.floor(Number(item?.quantity));
    if (!id || !(qty > 0)) throw new OrderError("Your cart has an invalid item.");
    merged.set(id, Math.min((merged.get(id) || 0) + qty, MAX_QTY_PER_LINE));
  }
  if (merged.size > MAX_LINES) throw new OrderError(`Checkout supports up to ${MAX_LINES} different watches.`);
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

// Prices the cart from Firestore, checks stock, and stores a pending order with a readable number.
export async function createPendingOrder({ user, items, shipping }) {
  const db = adminDb();
  const lines = cleanItems(items);
  const delivery = cleanShipping(shipping);

  return db.runTransaction(async (tx) => {
    const productRefs = lines.map((l) => db.collection("products").doc(l.productId));
    const counterRef = db.collection("counters").doc("orders");
    const [productSnaps, counterSnap] = await Promise.all([tx.getAll(...productRefs), tx.get(counterRef)]);

    const orderItems = lines.map((line, i) => {
      const snap = productSnaps[i];
      const product = snap.exists ? snap.data() : null;
      if (!product || product.status !== "live") throw new OrderError("A watch in your cart is no longer available.");
      if ((product.stock || 0) < line.quantity) {
        throw new OrderError(
          product.stock ? `Only ${product.stock} ${product.name} left in stock.` : `${product.name} is sold out.`,
          409
        );
      }
      return {
        productId: line.productId,
        name: product.name,
        category: product.category || "",
        price: Number(product.price),
        quantity: line.quantity,
        image: product.images?.[0]?.url || null,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const next = (counterSnap.exists ? counterSnap.data().next : 10001) || 10001;
    const orderRef = db.collection("orders").doc();
    const order = {
      number: `WS-${next}`,
      userId: user.uid,
      customer: { name: user.name || delivery.fullName, email: user.email || "" },
      shipping: delivery,
      items: orderItems,
      itemCount: orderItems.reduce((n, item) => n + item.quantity, 0),
      subtotal,
      shippingFee: 0,
      total: subtotal,
      currency: CURRENCY,
      status: "pending_payment",
      payment: { provider: "bachs", status: "pending" },
      timeline: [{ status: "pending_payment", note: "Order placed. Waiting for payment.", at: Timestamp.now() }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    tx.set(counterRef, { next: next + 1 }, { merge: true });
    tx.set(orderRef, order);
    return { id: orderRef.id, ...order };
  });
}

export async function attachCheckout(orderId, checkout) {
  await adminDb()
    .collection("orders")
    .doc(orderId)
    .update({
      "payment.checkoutId": checkout.checkout_id,
      "payment.checkoutUrl": checkout.checkout_url,
      "payment.expiresAt": checkout.expires_at || null,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function findOrderIdByCheckout(checkoutId) {
  const snap = await adminDb().collection("orders").where("payment.checkoutId", "==", checkoutId).limit(1).get();
  return snap.empty ? null : snap.docs[0].id;
}

export async function getOrder(orderId) {
  const snap = await adminDb().collection("orders").doc(orderId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

// Idempotent: safe to call from both the webhook and the success page.
// Marks the order paid, takes the watches out of stock and notifies the customer.
export async function markOrderPaid(orderId, payment = {}) {
  const db = adminDb();
  return db.runTransaction(async (tx) => {
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new OrderError("Order not found.", 404);
    const order = orderSnap.data();
    if (order.status !== "pending_payment") return { status: order.status, changed: false };

    const productRefs = order.items.map((item) => db.collection("products").doc(item.productId));
    const productSnaps = await tx.getAll(...productRefs);

    let stockIssue = false;
    order.items.forEach((item, i) => {
      const snap = productSnaps[i];
      if (!snap.exists) {
        stockIssue = true;
        return;
      }
      const available = snap.data().stock || 0;
      const take = Math.min(available, item.quantity);
      if (take < item.quantity) stockIssue = true;
      tx.update(productRefs[i], {
        stock: FieldValue.increment(-take),
        sold: FieldValue.increment(item.quantity),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const paid = getStatus("paid");
    tx.update(orderRef, {
      status: "paid",
      stockIssue,
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      "payment.status": "succeeded",
      "payment.chargeId": payment.chargeId || null,
      "payment.amountPaid": payment.amount ?? null,
      "payment.currencyPaid": payment.currency || null,
      timeline: FieldValue.arrayUnion({ status: "paid", note: paid.note, at: Timestamp.now() }),
    });
    tx.set(db.collection("notifications").doc(), {
      userId: order.userId,
      orderId,
      orderNumber: order.number,
      title: `Payment confirmed for order ${order.number}`,
      body: `Bachs confirmed your payment. We'll notify you when your watch is packed.`,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.delete(db.collection("carts").doc(order.userId));
    return { status: "paid", changed: true };
  });
}

// The Bachs payment window closed without payment: cancel the order so it doesn't sit in
// "Awaiting payment" forever. Nothing was charged and no stock was taken.
export async function markCheckoutExpired(orderId) {
  const db = adminDb();
  const ref = db.collection("orders").doc(orderId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.data().status !== "pending_payment") return;
    tx.update(ref, {
      status: "cancelled",
      "payment.status": "expired",
      updatedAt: FieldValue.serverTimestamp(),
      timeline: FieldValue.arrayUnion({
        status: "cancelled",
        note: "The payment window expired before payment was made. You haven't been charged.",
        at: Timestamp.now(),
      }),
    });
  });
}
