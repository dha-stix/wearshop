import OrderTimeline from "@/components/orders/OrderTimeline";
import StatusBadge from "@/components/orders/StatusBadge";
import ProductVisual from "@/components/ui/ProductVisual";
import { formatDate, formatMoney, ORDER_STATUSES, statusIndex } from "@/lib/config";

function ProgressBar({ order }) {
  const index = Math.max(statusIndex(order.status), 0);
  const pct = (index / (ORDER_STATUSES.length - 1)) * 100;
  return (
    <div className="progress" aria-hidden="true">
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="progress__steps">
        {ORDER_STATUSES.map((s, i) => (
          <li key={s.id} data-state={i < index ? "done" : i === index ? "now" : "next"}>
            <span className="progress__dot" />
            <span className="progress__label">{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// One order's delivery progress, update history and address.
export default function OrderTracker({ order }) {
  const first = order.items[0];
  return (
    <section className="panel tracker" aria-label={`Order ${order.number}`}>
      <div className="tracker__head">
        <div className="tracker__media">
          <ProductVisual product={{ name: first?.name, category: first?.category, images: first?.image ? [{ url: first.image }] : [] }} sizes="96px" watchWidth="52%" />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <div className="label">
            Order {order.number} · {formatDate(order.createdAt)}
          </div>
          <div className="tracker__title">{order.items.map((i) => i.name).join(", ")}</div>
          <div className="muted">
            {formatMoney(order.total)} · {order.itemCount} {order.itemCount === 1 ? "watch" : "watches"}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      {order.status !== "cancelled" && <ProgressBar order={order} />}
      <div className="tracker__detail">
        <div>
          <h3 className="label" style={{ marginBottom: 16 }}>
            Updates
          </h3>
          <OrderTimeline order={order} />
        </div>
        <div>
          <h3 className="label" style={{ marginBottom: 16 }}>
            Delivering to
          </h3>
          <address className="tracker__address">
            {order.shipping.fullName}
            <br />
            {order.shipping.address}
            <br />
            {order.shipping.city}, {order.shipping.state}
            <br />
            {order.shipping.country}
            <br />
            {order.shipping.phone}
          </address>
          {order.status === "pending_payment" && order.payment?.checkoutUrl && order.payment?.status === "pending" && (
            <a href={order.payment.checkoutUrl} className="btn btn--dark btn--sm" style={{ marginTop: 20 }}>
              Complete payment
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
