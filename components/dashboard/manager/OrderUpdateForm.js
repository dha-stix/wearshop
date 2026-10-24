"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/providers/ToastProvider";
import { updateOrderStatus } from "@/lib/firebase-actions";
import { CANCELLED, getStatus, MANAGER_STATUSES } from "@/lib/config";

// The next sensible status, so the manager usually only has to press the button.
function nextStatus(order) {
  const ids = MANAGER_STATUSES.map((s) => s.id);
  const i = ids.indexOf(order.status);
  return i >= 0 && ids[i + 1] && ids[i + 1] !== CANCELLED.id ? ids[i + 1] : order.status;
}

// Status picker + message. Saving updates the order and notifies the customer in one step.
export default function OrderUpdateForm({ order }) {
  const toast = useToast();
  const pending = order.status === "pending_payment";
  const options = pending ? [CANCELLED] : MANAGER_STATUSES;
  // The parent remounts this form (key) whenever the order's status changes, so these start fresh.
  const [status, setStatus] = useState(() => (pending ? CANCELLED.id : nextStatus(order)));
  const [message, setMessage] = useState(() => getStatus(pending ? CANCELLED.id : nextStatus(order)).note);
  const [busy, setBusy] = useState(false);

  const changeStatus = (e) => {
    setStatus(e.target.value);
    setMessage(getStatus(e.target.value).note);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    try {
      await updateOrderStatus(order, status, message);
      toast(`${order.customer?.name || "Customer"} has been notified`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="order-panel" onSubmit={submit}>
      <p className="label" style={{ color: "var(--gold)" }}>
        Update order
      </p>
      <h2 className="order-panel__number">{order.number}</h2>
      <p className="order-panel__meta">Currently: {getStatus(order.status).label}</p>

      {order.stockIssue && (
        <p className="order-panel__warn">
          <Icon name="alert" size={16} /> Stock ran out before this payment arrived. Restock or contact the customer.
        </p>
      )}
      {pending && <p className="order-panel__note">Waiting for Bachs to confirm payment. You can only cancel it for now.</p>}

      <label className="field" style={{ marginTop: 20 }}>
        <span className="field__label">New status</span>
        <select className="select select--dark" value={status} onChange={changeStatus}>
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field" style={{ marginTop: 16 }}>
        <span className="field__label">Message to customer</span>
        <textarea className="textarea select--dark" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <button type="submit" className="btn btn--gold btn--block" style={{ marginTop: 20 }} disabled={busy || !message.trim() || status === order.status}>
        <Icon name="bell" size={18} />
        {busy ? "Sending…" : "Update & notify customer"}
      </button>
      <p className="order-panel__note">The customer sees this instantly in their dashboard notifications.</p>
    </form>
  );
}

