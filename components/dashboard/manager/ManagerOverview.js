"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import ProductVisual from "@/components/ui/ProductVisual";
import { PageLoading } from "@/components/ui/States";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatDate, formatMoney, LOW_STOCK_THRESHOLD } from "@/lib/config";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashHeader, Stat } from "../DashboardShell";
import RevenuePanel from "./RevenuePanel";
import { buildSeries, RANGES } from "./revenue";
import { useManagerData } from "./ManagerData";

const PREVIEW = 5;

// Store at a glance: money in, what needs doing now, and where to go next.
// Staff get the same page without revenue, sales or product editing.
export default function ManagerOverview() {
  const { isManager } = useAuth();
  const { orders, products, sales, needsUpdate, loading, error } = useManagerData();
  const [range, setRange] = useState("6M");
  const series = useMemo(() => buildSeries(orders, range), [orders, range]);

  if (loading) return <PageLoading />;

  const isMonths = range !== "7D";
  const current = series[series.length - 1];
  const previous = series[series.length - 2];
  const periodRevenue = isMonths ? current.value : series.reduce((s, b) => s + b.value, 0);
  const periodUnits = isMonths ? current.units : series.reduce((s, b) => s + b.units, 0);
  const change = isMonths && previous?.value ? Math.round(((current.value - previous.value) / previous.value) * 100) : null;
  const lowStock = products
    .filter((p) => (p.stock || 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));
  const topSellers = [...products]
    .filter((p) => sales.get(p.id)?.units)
    .sort((a, b) => sales.get(b.id).revenue - sales.get(a.id).revenue)
    .slice(0, PREVIEW);

  return (
    <>
      <DashHeader
        eyebrow={isManager ? "Store management" : "Staff desk"}
        title="The"
        accent="vault room"
        actions={
          isManager && (
            <Link href="/dashboard/products/new" className="btn btn--dark btn--sm">
              <Icon name="plus" size={16} strokeWidth={2} /> Add product
            </Link>
          )
        }
      />
      {error && (
        <p className="notice notice--error" style={{ marginTop: 24 }}>
          Couldn&apos;t load store data. Check that your account has the manager role in Firestore.
        </p>
      )}

      <div className="stats" style={{ marginTop: 32 }}>
        {isManager ? (
          <>
            <Stat
              dark
              label={`Revenue sold · ${isMonths ? current.fullLabel : RANGES[range].label}`}
              value={formatMoney(periodRevenue)}
              note={change === null ? "Confirmed payments" : `${change >= 0 ? "+" : ""}${change}% vs ${previous.label}`}
            />
            <Stat label="Watches sold" value={periodUnits} note={isMonths ? "This month" : "Last 7 days"} />
          </>
        ) : (
          <Stat dark label="Awaiting payment" value={orders.filter((o) => o.status === "pending_payment").length} note="Not yet paid" />
        )}
        <Stat label="Orders to update" value={needsUpdate.length} note="Paid, not yet delivered" />
        <Stat label="Low stock" value={lowStock.length} note={`${LOW_STOCK_THRESHOLD} or fewer left`} danger={lowStock.length > 0} />
      </div>

      {isManager && (
        <div style={{ marginTop: 24 }}>
          <RevenuePanel series={series} range={range} setRange={setRange} />
        </div>
      )}

      <div className="overview-grid">
        <section className="panel" aria-label="Orders to update">
          <div className="panel__head">
            <h2 className="title-sm">Orders to update</h2>
            <Link href="/dashboard/orders" className="link-btn">
              All orders →
            </Link>
          </div>
          {needsUpdate.length === 0 ? (
            <p className="panel__body muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="mini-list">
              {needsUpdate.slice(0, PREVIEW).map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/orders/${o.id}`} className="mini-list__row">
                    <span className="mini-list__main">
                      <strong className="mono">{o.number}</strong>
                      <span className="muted">
                        {o.customer?.name} · {formatDate(o.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={o.status} />
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-label="Low stock">
          <div className="panel__head">
            <h2 className="title-sm">Low stock</h2>
            <Link href="/dashboard/products?stock=low" className="link-btn">
              {isManager ? "Restock →" : "View →"}
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="panel__body muted">Every watch is well stocked.</p>
          ) : (
            <ul className="mini-list">
              {lowStock.slice(0, PREVIEW).map((p) => (
                <li key={p.id}>
                  <Link href={isManager ? `/dashboard/products/${p.id}` : "/dashboard/products?stock=low"} className="mini-list__row">
                    <span className="inv-product__thumb">
                      <ProductVisual product={p} sizes="44px" animated={false} watchWidth="50%" />
                    </span>
                    <span className="mini-list__main">
                      <strong>{p.name}</strong>
                    </span>
                    <span className={`badge ${p.stock ? "badge--danger" : "badge--muted"}`}>{p.stock ? `${p.stock} left` : "Sold out"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isManager && (
        <section className="panel" aria-label="Top sellers">
          <div className="panel__head">
            <h2 className="title-sm">Top sellers</h2>
            <Link href="/dashboard/products" className="link-btn">
              All products →
            </Link>
          </div>
          {topSellers.length === 0 ? (
            <p className="panel__body muted">Sales will show here once orders are paid.</p>
          ) : (
            <ul className="mini-list">
              {topSellers.map((p) => (
                <li key={p.id}>
                  <Link href={`/dashboard/products/${p.id}`} className="mini-list__row">
                    <span className="inv-product__thumb">
                      <ProductVisual product={p} sizes="44px" animated={false} watchWidth="50%" />
                    </span>
                    <span className="mini-list__main">
                      <strong>{p.name}</strong>
                      <span className="muted">{sales.get(p.id).units} sold</span>
                    </span>
                    <span className="mono">{formatMoney(sales.get(p.id).revenue)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
      </div>
    </>
  );
}
