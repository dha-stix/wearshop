"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderTimeline from "@/components/orders/OrderTimeline";
import StatusBadge from "@/components/orders/StatusBadge";
import ProductVisual from "@/components/ui/ProductVisual";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyOrders, useNotifications } from "@/lib/hooks";
import { markNotificationsRead } from "@/lib/firebase-actions";
import { formatDate, formatMoney, ORDER_STATUSES, statusIndex } from "@/lib/config";
import DashboardShell, { DashHeader, Stat } from "./DashboardShell";
import NotificationsPanel from "./NotificationsPanel";

const ACTIVE = (o) => !["delivered", "cancelled"].includes(o.status);

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

export default function CustomerDashboard() {
  const { user, profile } = useAuth();
  const params = useSearchParams();
  const { data: orders, loading } = useMyOrders(user.uid);
  const { data: notes } = useNotifications(user.uid);
  const [selectedId, setSelectedId] = useState(params.get("order"));

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) || orders.find(ACTIVE) || orders[0],
    [orders, selectedId]
  );
  const unread = notes.filter((n) => !n.read).length;
  const firstName = (profile?.name || user.displayName || "").split(" ")[0];

  useEffect(() => {
    if (params.get("order")) document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
  }, [params]);

  const openOrder = (orderId, noteId, read) => {
    if (!read) markNotificationsRead([noteId]).catch(() => {});
    setSelectedId(orderId);
    document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
  };

  const nav = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "track", label: "Track delivery", icon: "truck" },
    { id: "orders", label: "My orders", icon: "cart" },
    { id: "notifications", label: "Notifications", icon: "bell", badge: unread },
  ];

  return (
    <DashboardShell nav={nav}>
      <section id="overview">
        <DashHeader eyebrow="My dashboard" title="Welcome back," accent={firstName ? `${firstName}.` : undefined} />
        <div className="stats" style={{ marginTop: 32 }}>
          <Stat label="Active orders" value={orders.filter(ACTIVE).length} />
          <Stat label="Delivered" value={orders.filter((o) => o.status === "delivered").length} />
          <Stat label="New updates" value={unread} dark />
        </div>
      </section>

      {loading ? (
        <PageLoading />
      ) : orders.length === 0 ? (
        <div className="panel" style={{ marginTop: 24 }} id="track">
          <EmptyState icon="watch" title="No orders yet" action="Browse watches" href="/shop">
            When you order a watch, you&apos;ll track it here from payment to your door.
          </EmptyState>
          <span id="orders" />
        </div>
      ) : (
        <div className="dash-grid">
          <div className="dash-grid__main">
            <section id="track" className="panel tracker" aria-label="Order tracking">
              <div className="tracker__head">
                <div className="tracker__media">
                  <ProductVisual product={{ name: selected.items[0]?.name, category: selected.items[0]?.category, images: selected.items[0]?.image ? [{ url: selected.items[0].image }] : [] }} sizes="96px" watchWidth="52%" />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <div className="label">
                    Order {selected.number} · {formatDate(selected.createdAt)}
                  </div>
                  <div className="tracker__title">
                    {selected.items.map((i) => i.name).join(", ")}
                  </div>
                  <div className="muted">
                    {formatMoney(selected.total)} · {selected.itemCount} {selected.itemCount === 1 ? "watch" : "watches"}
                  </div>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              {selected.status !== "cancelled" && <ProgressBar order={selected} />}
              <div className="tracker__detail">
                <div>
                  <h3 className="label" style={{ marginBottom: 16 }}>
                    Updates
                  </h3>
                  <OrderTimeline order={selected} />
                </div>
                <div>
                  <h3 className="label" style={{ marginBottom: 16 }}>
                    Delivering to
                  </h3>
                  <address className="tracker__address">
                    {selected.shipping.fullName}
                    <br />
                    {selected.shipping.address}
                    <br />
                    {selected.shipping.city}, {selected.shipping.state}
                    <br />
                    {selected.shipping.country}
                    <br />
                    {selected.shipping.phone}
                  </address>
                  {selected.status === "pending_payment" && selected.payment?.checkoutUrl && selected.payment?.status === "pending" && (
                    <a href={selected.payment.checkoutUrl} className="btn btn--dark btn--sm" style={{ marginTop: 20 }}>
                      Complete payment
                    </a>
                  )}
                </div>
              </div>
            </section>

            <section id="orders" className="panel" aria-label="Order history">
              <div className="panel__head">
                <h2 className="title-sm">Order history</h2>
                <Link href="/shop" className="link-btn">
                  Shop again →
                </Link>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Order</th>
                      <th scope="col">Watch</th>
                      <th scope="col">Date</th>
                      <th scope="col" className="num">
                        Total
                      </th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} aria-selected={o.id === selected.id}>
                        <td>
                          <button type="button" className="table-link" onClick={() => openOrder(o.id, null, true)}>
                            {o.number}
                          </button>
                        </td>
                        <td style={{ fontWeight: 600 }}>{o.items.map((i) => i.name).join(", ")}</td>
                        <td className="muted">{formatDate(o.createdAt)}</td>
                        <td className="num">{formatMoney(o.total)}</td>
                        <td>
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <NotificationsPanel notes={notes} onOpenOrder={openOrder} />
        </div>
      )}
    </DashboardShell>
  );
}
