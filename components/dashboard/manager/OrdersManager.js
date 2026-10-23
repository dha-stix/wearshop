"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import StatusBadge from "@/components/orders/StatusBadge";
import { useToast } from "@/components/providers/ToastProvider";
import { updateOrderStatus } from "@/lib/firebase-actions";
import { CANCELLED, formatDate, formatMoney, getStatus, MANAGER_STATUSES } from "@/lib/config";

const FILTERS = [
  { id: "action", label: "Needs update", match: (o) => ["paid", "packed", "shipped", "out_for_delivery"].includes(o.status) },
  { id: "pending", label: "Awaiting payment", match: (o) => o.status === "pending_payment" },
  { id: "delivered", label: "Delivered", match: (o) => o.status === "delivered" },
  { id: "all", label: "All", match: () => true },
];

// The next sensible status, so the manager usually only has to press the button.
function nextStatus(order) {
  const ids = MANAGER_STATUSES.map((s) => s.id);
  const i = ids.indexOf(order.status);
  return i >= 0 && ids[i + 1] && ids[i + 1] !== CANCELLED.id ? ids[i + 1] : order.status;
}

function UpdatePanel({ order }) {
  const toast = useToast();
  const [status, setStatus] = useState(nextStatus(order));
  const [message, setMessage] = useState(getStatus(nextStatus(order)).note);
  const [busy, setBusy] = useState(false);
  const pending = order.status === "pending_payment";
  const options = pending ? [CANCELLED] : MANAGER_STATUSES;

  useEffect(() => {
    const s = pending ? CANCELLED.id : nextStatus(order);
    setStatus(s);
    setMessage(getStatus(s).note);
  }, [order, pending]);

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
      <h3 className="order-panel__number">{order.number}</h3>
      <p className="order-panel__meta">
        {order.customer?.name} · {order.customer?.email}
      </p>

      <div className="order-panel__block">
        {order.items.map((i) => (
          <div key={i.productId} className="row row--between">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span className="mono">{formatMoney(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="row row--between" style={{ marginTop: 8, color: "var(--gold)" }}>
          <span>Total</span>
          <span className="mono">{formatMoney(order.total)}</span>
        </div>
      </div>

      <address className="order-panel__block">
        {order.shipping.fullName}, {order.shipping.phone}
        <br />
        {order.shipping.address}, {order.shipping.city}, {order.shipping.state}, {order.shipping.country}
      </address>

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

export default function OrdersManager({ orders }) {
  const [filter, setFilter] = useState("action");
  const [selectedId, setSelectedId] = useState(null);
  const visible = useMemo(() => orders.filter(FILTERS.find((f) => f.id === filter).match), [orders, filter]);
  const selected = orders.find((o) => o.id === selectedId) || visible[0];

  return (
    <section id="orders" className="orders-manager" aria-label="Orders">
      <div className="panel orders-manager__list">
        <div className="panel__head">
          <h2 className="title-sm">Orders</h2>
          <div className="chips" role="group" aria-label="Filter orders">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="chip chip--sm" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label} ({orders.filter(f.match).length})
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="panel__body muted">No orders here.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Watch</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} aria-selected={selected?.id === o.id} onClick={() => setSelectedId(o.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <button type="button" className="table-link" onClick={() => setSelectedId(o.id)}>
                        {o.number}
                      </button>
                    </td>
                    <td>{o.customer?.name}</td>
                    <td style={{ fontWeight: 600 }}>{o.items.map((i) => i.name).join(", ")}</td>
                    <td className="muted">{formatDate(o.createdAt)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && <UpdatePanel key={selected.id} order={selected} />}
    </section>
  );
}
