"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { EmptyState, PageLoading } from "@/components/ui/States";
import NotificationBell from "@/components/orders/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyOrders, useNotifications } from "@/lib/hooks";
import { DashHeader, Stat } from "../DashboardShell";
import OrderTracker from "./OrderTracker";

const isActiveOrder = (o) => !["delivered", "cancelled"].includes(o.status);

// Welcome, headline numbers, and the delivery that's on its way right now.
export default function CustomerOverview() {
  const { user, profile } = useAuth();
  const { data: orders, loading } = useMyOrders(user.uid);
  const { data: notes } = useNotifications(user.uid);
  const firstName = (profile?.name || user.displayName || "").split(" ")[0];
  const active = orders.filter(isActiveOrder);
  const current = active[0];

  return (
    <>
      <DashHeader
        eyebrow="My dashboard"
        title="Welcome back,"
        accent={firstName ? `${firstName}.` : undefined}
        actions={<NotificationBell boxed />}
      />
      <div className="stats" style={{ marginTop: 32 }}>
        <Stat label="On the way" value={active.length} />
        <Stat label="Delivered" value={orders.filter((o) => o.status === "delivered").length} />
        <Stat label="New updates" value={notes.filter((n) => !n.read).length} dark />
      </div>

      {loading ? (
        <PageLoading />
      ) : orders.length === 0 ? (
        <div className="panel" style={{ marginTop: 24 }}>
          <EmptyState icon="watch" title="No orders yet" action="Browse watches" href="/shop">
            When you order a watch, you&apos;ll track it here from payment to your door.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="section-bar">
            <h2 className="title-sm">{current ? "On its way" : "Latest order"}</h2>
            <Link href="/dashboard/orders" className="link-btn">
              All my orders ({orders.length}) →
            </Link>
          </div>
          <OrderTracker order={current || orders[0]} />
          {active.length > 1 && (
            <p className="notice" style={{ marginTop: 16 }}>
              <Icon name="truck" size={18} className="gold-icon" />
              <span>
                You have {active.length - 1} more {active.length - 1 === 1 ? "order" : "orders"} on the way.{" "}
                <Link href="/dashboard/orders">See all orders</Link>
              </span>
            </p>
          )}
        </>
      )}
    </>
  );
}
