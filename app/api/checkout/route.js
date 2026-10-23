import { getRequestUser } from "@/lib/server/firebase-admin";
import { attachCheckout, createPendingOrder } from "@/lib/server/orders";
import { createCheckoutSession } from "@/lib/server/bachs";
import { errorResponse } from "@/lib/server/respond";

// POST /api/checkout { items: [{ productId, quantity }], shipping }
// Creates a pending order priced from Firestore, then a Bachs hosted checkout for its total.
export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Sign in to pay." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const order = await createPendingOrder({ user, items: body.items, shipping: body.shipping });
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const checkout = await createCheckoutSession({
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      customer: { email: user.email, name: order.shipping.fullName, phone_number: order.shipping.phone },
      successUrl: `${origin}/checkout/success?orderId=${order.id}`,
      cancelUrl: `${origin}/cart?cancelled=${order.id}`,
    });
    await attachCheckout(order.id, checkout);
    return Response.json({ orderId: order.id, number: order.number, checkoutUrl: checkout.checkout_url });
  } catch (err) {
    return errorResponse(err, "We couldn't reach Bachs to start the payment. Try again.");
  }
}
