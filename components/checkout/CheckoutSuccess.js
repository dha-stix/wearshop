"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { PageLoading } from "@/components/ui/States";
import { useCart } from "@/components/providers/CartProvider";
import { confirmCheckout } from "@/lib/firebase-actions";
import { useOrder } from "@/lib/hooks";
import { formatMoney } from "@/lib/config";

const RETRY_DELAYS = [0, 2000, 4000, 8000];

// Bachs sends the customer here after paying. The webhook normally marks the order paid;
// this page also asks the server to check with Bachs in case the webhook is still on its way.
export default function CheckoutSuccess() {
  const orderId = useSearchParams().get("orderId");
  const { data: order, loading } = useOrder(orderId);
  const { clear } = useCart();
  const [gaveUp, setGaveUp] = useState(false);
  const paid = order && order.status !== "pending_payment";

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      for (const delay of RETRY_DELAYS) {
        await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        try {
          const { status } = await confirmCheckout(orderId);
          if (status !== "pending_payment") return;
        } catch {}
      }
      if (!cancelled) setGaveUp(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (paid) clear();
  }, [paid, clear]);

  if (!orderId) {
    return (
      <div className="container success">
        <h1>No order to show</h1>
        <Link href="/dashboard" className="btn btn--dark" style={{ marginTop: 24 }}>
          Go to my orders
        </Link>
      </div>
    );
  }
  if (loading) return <PageLoading />;

  return (
    <div className="container success">
      <div className="success__mark">
        <Icon name={paid ? "check" : "clock"} size={44} strokeWidth={paid ? 2.2 : 1.6} />
      </div>
      <p className="eyebrow" style={{ justifyContent: "center" }}>
        Order {order?.number}
      </p>
      <h1>{paid ? "Payment confirmed" : "Confirming payment"}</h1>
      <p className="lead">
        {paid
          ? `Thank you. We've received ${formatMoney(order.total)} and your watch is being prepared. You'll get a notification at every step.`
          : gaveUp
            ? "Bachs hasn't confirmed this payment yet. If you completed it, it will show in your dashboard within a few minutes."
            : "Hold on while we confirm your payment with Bachs. This usually takes a few seconds."}
      </p>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link href={`/dashboard?order=${orderId}`} className="btn btn--dark">
          Track this order
        </Link>
        <Link href="/shop" className="btn btn--outline">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
