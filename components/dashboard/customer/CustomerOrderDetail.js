"use client";

import { EmptyState, PageLoading } from "@/components/ui/States";
import NotificationBell from "@/components/orders/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyOrders } from "@/lib/hooks";
import { DashHeader } from "../DashboardShell";
import OrderTracker from "./OrderTracker";

const BACK = { href: "/dashboard/orders", label: "My orders" };

export default function CustomerOrderDetail({ id }) {
  const { user } = useAuth();
  const { data: orders, loading } = useMyOrders(user.uid);
  const order = orders.find((o) => o.id === id);

  if (loading) return <PageLoading />;
  return (
    <>
      <DashHeader eyebrow="Track delivery" title={order ? `Order ${order.number}` : "Order not found"} back={BACK} actions={<NotificationBell boxed />} />
      <div style={{ marginTop: 32 }}>
        {order ? (
          <OrderTracker order={order} />
        ) : (
          <div className="panel">
            <EmptyState icon="cart" title="We couldn't find that order" action="Back to my orders" href="/dashboard/orders" />
          </div>
        )}
      </div>
    </>
  );
}
