"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import LoadMore, { usePaged } from "@/components/ui/LoadMore";
import { EmptyState, PageLoading } from "@/components/ui/States";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatDate, formatMoney } from "@/lib/config";
import { DashHeader } from "../DashboardShell";
import { NEEDS_UPDATE, useManagerData } from "./ManagerData";

const FILTERS = [
  { id: "action", label: "Needs update", match: (o) => NEEDS_UPDATE.includes(o.status) },
  { id: "pending", label: "Awaiting payment", match: (o) => o.status === "pending_payment" },
  { id: "delivered", label: "Delivered", match: (o) => o.status === "delivered" },
  { id: "cancelled", label: "Cancelled", match: (o) => o.status === "cancelled" },
  { id: "all", label: "All", match: () => true },
];

export default function OrdersPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { orders, loading } = useManagerData();
  const [filter, setFilter] = useState(FILTERS.some((f) => f.id === params.get("filter")) ? params.get("filter") : "action");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter(FILTERS.find((f) => f.id === filter).match)
      .filter(
        (o) =>
          !q ||
          [o.number, o.customer?.name, o.customer?.email, ...o.items.map((i) => i.name)].some((v) => v?.toLowerCase().includes(q))
      );
  }, [orders, filter, search]);
  const paged = usePaged(rows, 20, filter + search);

  if (loading) return <PageLoading />;

  return (
    <>
      <DashHeader eyebrow="Store management" title="Orders" />
      <section className="panel" style={{ marginTop: 32 }} aria-label="Orders">
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter orders">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="chip chip--sm" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label} ({orders.filter(f.match).length})
              </button>
            ))}
          </div>
          <label className="toolbar__search">
            <Icon name="search" size={18} />
            <span className="sr-only">Search orders</span>
            <input className="input" type="search" placeholder="Order number, customer or watch" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon="cart" title="No orders here">
            {search ? "Try another search." : "Orders in this state will appear here."}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table table--clickable">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Watch</th>
                    <th scope="col" className="num">
                      Total
                    </th>
                    <th scope="col">Placed</th>
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
                      <td>
                        {o.customer?.name}
                        <div className="muted" style={{ fontSize: 13 }}>
                          {o.customer?.email}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{o.items.map((i) => i.name).join(", ")}</td>
                      <td className="num">{formatMoney(o.total)}</td>
                      <td className="muted">{formatDate(o.createdAt)}</td>
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
