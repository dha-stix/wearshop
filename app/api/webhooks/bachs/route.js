import { adminDb } from "@/lib/server/firebase-admin";
import { verifyWebhookSignature } from "@/lib/server/bachs";
import { findOrderIdByCheckout, markCheckoutExpired, markOrderPaid } from "@/lib/server/orders";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/webhooks/bachs — register this URL as a webhook destination in the Bachs dashboard.
// Bachs is the source of truth for payment, so fulfilment is driven from here.
export async function POST(request) {
  const raw = await request.text();
  let valid;
  try {
    valid = verifyWebhookSignature(raw, request.headers);
  } catch (err) {
    console.error(err.message);
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!valid) return Response.json({ error: "Invalid signature" }, { status: 401 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Deliveries are at-least-once: skip events we've already handled.
  const eventRef = adminDb().collection("webhookEvents").doc(String(event.id));
  if ((await eventRef.get()).exists) return Response.json({ received: true, duplicate: true });

  try {
    const data = event.data || {};
    const orderId =
      data.metadata?.orderId || data.reference || (data.checkout_id && (await findOrderIdByCheckout(data.checkout_id)));

    if (orderId) {
      switch (event.type) {
        case "checkout.completed":
          await markOrderPaid(orderId, { chargeId: data.charge_id, amount: data.amount, currency: data.currency });
          break;
        case "collection.succeeded":
          if (!data.status || String(data.status).toUpperCase() === "SUCCEEDED") {
            await markOrderPaid(orderId, { chargeId: data.charge_id, amount: data.amount, currency: data.currency });
          }
          break;
        case "collection.failed":
        case "collection.underpaid":
          await adminDb()
            .collection("orders")
            .doc(orderId)
            .update({
              "payment.status": event.type === "collection.failed" ? "failed" : "underpaid",
              updatedAt: FieldValue.serverTimestamp(),
            });
          break;
        case "checkout.expired":
          await markCheckoutExpired(orderId);
          break;
        default:
          break;
      }
    }

    await eventRef.set({ type: event.type, orderId: orderId || null, receivedAt: FieldValue.serverTimestamp() });
    return Response.json({ received: true });
  } catch (err) {
    console.error("Bachs webhook failed", err);
    // Non-2xx makes Bachs retry the delivery.
    return Response.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
