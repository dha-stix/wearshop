"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { saveShippingDetails, startCheckout } from "@/lib/firebase-actions";
import { formatMoney } from "@/lib/config";
import CheckoutSteps from "./CheckoutSteps";
import OrderSummary from "./OrderSummary";

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel" },
  { name: "address", label: "Street address", autoComplete: "street-address", wide: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State / region", autoComplete: "address-level1" },
  { name: "country", label: "Country", autoComplete: "country-name" },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const { lines, subtotal, ready } = useCart();
  // Prefill from the last order's delivery details, or the Google name. RequireAuth has already
  // waited for the profile, so it's available on first render.
  const [form, setForm] = useState(() => ({ ...EMPTY, fullName: user?.displayName || "", ...(profile?.shipping || {}) }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");

  if (!ready) return <PageLoading />;
  if (!lines.length) {
    return (
      <div className="container section">
        <EmptyState icon="cart" title="Nothing to check out" action="Browse watches" href="/shop">
          Your cart is empty.
        </EmptyState>
      </div>
    );
  }

  const update = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const pay = async (e) => {
    e.preventDefault();
    const missing = Object.fromEntries(FIELDS.filter((f) => !form[f.name].trim()).map((f) => [f.name, `Enter your ${f.label.toLowerCase()}`]));
    setErrors(missing);
    if (Object.keys(missing).length) return;

    setBusy(true);
    setFailure("");
    try {
      await saveShippingDetails(user.uid, form).catch(() => {});
      const { checkoutUrl } = await startCheckout(lines, form);
      window.location.assign(checkoutUrl);
    } catch (err) {
      setFailure(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="container cart-layout" onSubmit={pay} noValidate>
      <div className="cart-main">
        <CheckoutSteps current={1} />
        <h1 className="title" style={{ marginBottom: 24 }}>
          Delivery details
        </h1>
        <div className="signed-in-as" style={{ marginBottom: 24 }}>
          {user.photoURL ? (
            <Image src={user.photoURL} alt="" width={36} height={36} />
          ) : (
            <span className="avatar-fallback">
              <Icon name="user" size={18} />
            </span>
          )}
          <span>
            Signed in as <strong>{user.email}</strong>
          </span>
        </div>
        <div className="form-grid">
          {FIELDS.map((f) => (
            <label key={f.name} className="field" style={f.wide ? { gridColumn: "1 / -1" } : undefined}>
              <span className="field__label">{f.label}</span>
              <input
                className="input"
                name={f.name}
                type={f.type || "text"}
                autoComplete={f.autoComplete}
                value={form[f.name]}
                onChange={update(f.name)}
                aria-invalid={Boolean(errors[f.name])}
                aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
              />
              {errors[f.name] && (
                <span id={`${f.name}-error`} className="field__error">
                  {errors[f.name]}
                </span>
              )}
            </label>
          ))}
        </div>
        <p className="field__hint" style={{ marginTop: 16 }}>
          After you press pay you&apos;ll go to Bachs&apos; secure checkout, then come back here when it&apos;s done.
        </p>
      </div>

      <OrderSummary lines={lines} subtotal={subtotal} showItems>
        {failure && (
          <p className="notice notice--error" role="alert" style={{ marginTop: 20 }}>
            {failure}
          </p>
        )}
        <button type="submit" className="btn btn--dark btn--block" style={{ marginTop: 24 }} disabled={busy}>
          {busy ? "Opening Bachs…" : `Pay ${formatMoney(subtotal)} with Bachs`}
        </button>
      </OrderSummary>
    </form>
  );
}
