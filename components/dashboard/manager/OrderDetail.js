"use client";

import Icon from "@/components/ui/Icon";
import ProductVisual from "@/components/ui/ProductVisual";
import { EmptyState, PageLoading } from "@/components/ui/States";
import OrderTimeline from "@/components/orders/OrderTimeline";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatDate, formatMoney } from "@/lib/config";
import { DashHeader } from "../DashboardShell";
import OrderUpdateForm from "./OrderUpdateForm";
import { useManagerData } from "./ManagerData";

const BACK = { href: "/dashboard/orders", label: "All orders" };

function Detail({ label, children }) {
  return (
    <div className="detail">
      <dt className="label">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Everything about one order on the left; the update-and-notify form on the right.
export default function OrderDetail({ id }) {
  const { orders, loading } = useManagerData();
  const order = orders.find((o) => o.id === id);

  if (loading) return <PageLoading />;
  if (!order) {
    return (
      <>
        <DashHeader eyebrow="Orders" title="Not found" back={BACK} />
        <div className="panel" style={{ marginTop: 24 }}>
          <EmptyState icon="cart" title="This order doesn't exist" action="Back to orders" href="/dashboard/orders" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashHeader eyebrow={`Placed ${formatDate(order.createdAt, true)}`} title={`Order ${order.number}`} back={BACK} actions={<StatusBadge status={order.status} />} />

      <div className="dash-cols">
        <div className="dash-cols__main">
          <section className="panel" aria-label="Items">
            <div className="panel__head">
              <h2 className="title-sm">Items</h2>
              <span className="label">
                {order.itemCount} {order.itemCount === 1 ? "watch" : "watches"}
              </span>
            </div>
            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.productId}>
                  <span className="order-items__thumb">
                    <ProductVisual product={{ name: item.name, category: item.category, images: item.image ? [{ url: item.image }] : [] }} sizes="64px" animated={false} watchWidth="50%" />
                  </span>
                  <span className="order-items__name">
                    <strong>{item.name}</strong>
                    <span className="muted">
                      {formatMoney(item.price)} × {item.quantity}
                    </span>
                  </span>
                  <span className="mono">{formatMoney(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="order-items__total">
              <span>Total{order.shippingFee ? "" : " · free insured shipping"}</span>
              <strong className="mono">{formatMoney(order.total)}</strong>
            </div>
          </section>

          <div className="overview-grid overview-grid--two">
            <section className="panel" aria-label="Customer and delivery">
              <div className="panel__head">
                <h2 className="title-sm">Customer</h2>
              </div>
              <dl className="panel__body details">
                <Detail label="Name">{order.customer?.name}</Detail>
                <Detail label="Email">
                  <a href={`mailto:${order.customer?.email}`}>{order.customer?.email}</a>
                </Detail>
                <Detail label="Phone">{order.shipping.phone}</Detail>
                <Detail label="Deliver to">
                  {order.shipping.fullName}
                  <br />
                  {order.shipping.address}
                  <br />
                  {order.shipping.city}, {order.shipping.state}, {order.shipping.country}
                </Detail>
              </dl>
            </section>
            <section className="panel" aria-label="Payment">
              <div className="panel__head">
                <h2 className="title-sm">Payment</h2>
              </div>
              <dl className="panel__body details">
                <Detail label="Provider">Bachs</Detail>
                <Detail label="Status">{order.payment?.status || "—"}</Detail>
                <Detail label="Amount">{formatMoney(order.total)}</Detail>
                {order.paidAt && <Detail label="Paid">{formatDate(order.paidAt, true)}</Detail>}
                {order.payment?.checkoutId && <Detail label="Checkout ID">{order.payment.checkoutId}</Detail>}
              </dl>
              {order.stockIssue && (
                <p className="notice notice--error" style={{ margin: "0 28px 28px" }}>
                  <Icon name="alert" size={16} /> Stock ran out before this payment arrived. Restock or contact the customer.
                </p>
              )}
            </section>
          </div>

          <section className="panel" aria-label="Timeline">
            <div className="panel__head">
              <h2 className="title-sm">Timeline</h2>
              <span className="label">What the customer sees</span>
            </div>
            <div className="panel__body">
              <OrderTimeline order={order} />
            </div>
          </section>
        </div>

        <aside className="dash-cols__side">
          <OrderUpdateForm order={order} />
        </aside>
      </div>
    </>
  );
}
