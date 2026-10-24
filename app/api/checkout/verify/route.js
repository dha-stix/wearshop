import { getRequestUser } from "@/lib/server/firebase-admin";
import { getOrder, markCheckoutExpired, markOrderPaid } from "@/lib/server/orders";
import { getCheckoutSession } from "@/lib/server/bachs";
import { errorResponse } from "@/lib/server/respond";

// GET /api/checkout/verify?orderId=...
// Fallback for the success page in case the webhook hasn't arrived yet: asks Bachs directly.
export async function GET(request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });

  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) return Response.json({ error: "Missing order." }, { status: 400 });

  try {
    const order = await getOrder(orderId);
    if (!order || order.userId !== user.uid) return Response.json({ error: "Order not found." }, { status: 404 });

    let status = order.status;
    if (status === "pending_payment" && order.payment?.checkoutId) {
      const session = await getCheckoutSession(order.payment.checkoutId);
      if (session.status === "completed") {
        ({ status } = await markOrderPaid(orderId));
      } else if (session.status === "expired" || session.status === "cancelled") {
        await markCheckoutExpired(orderId);
        status = "cancelled";
      }
    }
    return Response.json({ status, number: order.number });
  } catch (err) {
    return errorResponse(err, "We couldn't confirm the payment yet.");
  }
}
