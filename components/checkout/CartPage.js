"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductVisual from "@/components/ui/ProductVisual";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatMoney } from "@/lib/config";
import CheckoutSteps from "./CheckoutSteps";
import OrderSummary from "./OrderSummary";

export default function CartPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { lines, count, subtotal, ready, setQuantity, remove } = useCart();
  const cancelled = params.get("cancelled");

  if (!ready) return <PageLoading />;

  const stockProblem = lines.find((l) => l.quantity > (l.product.stock || 0));
  const goToCheckout = () => router.push(user ? "/checkout" : "/auth/login?next=/checkout");

  return (
    <div className="container cart-layout">
      <div className="cart-main">
        <CheckoutSteps current={0} />
        {cancelled && (
          <p className="notice" style={{ marginBottom: 24 }}>
            Payment was cancelled, so you haven&apos;t been charged. Your cart is still here when you&apos;re ready.
          </p>
        )}
        <h1 className="title" style={{ marginBottom: 24 }}>
          Your cart <span className="muted">({count})</span>
        </h1>

        {lines.length === 0 ? (
          <div className="panel">
            <EmptyState icon="cart" title="Your cart is empty" action="Browse watches" href="/shop">
              Find something worth wearing, then come back here to check out.
            </EmptyState>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {lines.map(({ productId, quantity, product }) => {
              const stock = product.stock || 0;
              return (
                <div key={productId} className="cart-line">
                  <Link href={`/shop/${productId}`} className="cart-line__media" aria-hidden="true" tabIndex={-1}>
                    <ProductVisual product={product} sizes="112px" watchWidth="54%" />
                  </Link>
                  <div className="cart-line__info">
                    <Link href={`/shop/${productId}`} className="cart-line__name">
                      {product.name}
                    </Link>
                    <div className="label" style={{ marginTop: 4 }}>
                      {formatMoney(product.price)} each
                    </div>
                    {quantity > stock && (
                      <p className="field__error" style={{ marginTop: 4 }}>
                        {stock ? `Only ${stock} left — lower the quantity.` : "Sold out — remove it to continue."}
                      </p>
                    )}
                    <button type="button" className="link-btn" style={{ color: "var(--ink-2)" }} onClick={() => remove(productId)}>
                      Remove
                    </button>
                  </div>
                  <div className="qty qty--sm" aria-label={`Quantity of ${product.name}`}>
                    <button type="button" aria-label="Decrease" onClick={() => setQuantity(productId, quantity - 1)}>
                      −
                    </button>
                    <span>{quantity}</span>
                    <button type="button" aria-label="Increase" onClick={() => setQuantity(productId, quantity + 1)} disabled={quantity >= stock}>
                      +
                    </button>
                  </div>
                  <div className="cart-line__total">{formatMoney(product.price * quantity)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <OrderSummary lines={lines} subtotal={subtotal}>
          <button type="button" className="btn btn--dark btn--block" style={{ marginTop: 24 }} onClick={goToCheckout} disabled={Boolean(stockProblem)}>
            {user ? "Checkout" : "Sign in to checkout"}
          </button>
        </OrderSummary>
      )}
    </div>
  );
}
