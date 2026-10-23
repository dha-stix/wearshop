"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { completeDemoPayment, isDemoMode } from "@/lib/firebase-actions";
import { useOrder } from "@/lib/hooks";
import { formatMoney } from "@/lib/config";

// Stands in for Bachs' hosted checkout while the store runs in demo mode. No money moves.
export default function DemoPayment() {
  const router = useRouter();
  const orderId = useSearchParams().get("orderId");
  const { data: order, loading } = useOrder(orderId);
  const [busy, setBusy] = useState(false);

  if (!isDemoMode) {
    return (
      <div className="container section">
        <EmptyState title="Not available" action="Back to the shop" href="/shop">
          Payments go through Bachs on the live store.
        </EmptyState>
      </div>
    );
  }
  if (loading) return <PageLoading />;
  if (!order) {
    return (
      <div className="container section">
        <EmptyState title="Order not found" action="Back to cart" href="/cart" />
      </div>
    );
  }

  const pay = () => {
    setBusy(true);
    setTimeout(() => {
      completeDemoPayment(order.id);
      router.replace(`/checkout/success?orderId=${encodeURIComponent(order.id)}`);
    }, 1200);
  };

  return (
    <div className="demo-pay">
      <div className="demo-pay__card rise">
        <p className="label demo-pay__badge">
          <Icon name="lock" size={14} /> Bachs checkout · demo
        </p>
        <h1 className="title-sm">Pay WearShop</h1>
        <p className="demo-pay__amount">{formatMoney(order.total)}</p>
        <p className="muted">
          Order {order.number} · {order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
        </p>
        <div className="demo-pay__card-field">
          <span className="label">Card</span>
          <span className="mono">4242 4242 4242 4242 · 12/30 · 123</span>
        </div>
        <p className="field__hint">Simulated payment for testing. No card is charged.</p>
        <button type="button" className="btn btn--dark btn--block" onClick={pay} disabled={busy}>
          {busy ? "Processing…" : `Pay ${formatMoney(order.total)}`}
        </button>
        <Link href={`/cart?cancelled=${order.id}`} className="btn btn--outline btn--block" style={{ marginTop: 10 }}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
