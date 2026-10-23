"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadMore, { usePaged } from "@/components/ui/LoadMore";
import { EmptyState, PageLoading } from "@/components/ui/States";
import NotificationBell from "@/components/orders/NotificationBell";
import StatusBadge from "@/components/orders/StatusBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyOrders } from "@/lib/hooks";
import { formatDate, formatMoney } from "@/lib/config";
import { DashHeader } from "../DashboardShell";

export default function CustomerOrders() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, loading } = useMyOrders(user.uid);
  const paged = usePaged(orders, 20);

  return (
    <>
      <DashHeader eyebrow="My dashboard" title="My orders" actions={<NotificationBell boxed />} />
      <section className="panel" style={{ marginTop: 32 }} aria-label="My orders">
        {loading ? (
          <PageLoading />
        ) : orders.length === 0 ? (
          <EmptyState icon="cart" title="No orders yet" action="Browse watches" href="/shop" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table table--clickable">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Watch</th>
                    <th scope="col">Placed</th>
                    <th scope="col" className="num">
                      Total
                    </th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.page.map((o) => (
                    <tr key={o.id} onClick={() => router.push(`/dashboard/orders/${o.id}`)}>
                      <td>
                        <Link href={`/dashboard/orders/${o.id}`} className="table-link">
                          {o.number}
                        </Link>
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
            <div className="panel__body">
              <LoadMore paged={paged} noun="orders" />
            </div>
          </>
        )}
      </section>
    </>
  );
}
