"use client";

import { useMemo, useState } from "react";
import { PageLoading } from "@/components/ui/States";
import { useAllOrders, useAllProducts } from "@/lib/hooks";
import { formatMoney, LOW_STOCK_THRESHOLD } from "@/lib/config";
import DashboardShell, { DashHeader, Stat } from "../DashboardShell";
import RevenuePanel from "./RevenuePanel";
import InventoryTable from "./InventoryTable";
import ProductForm from "./ProductForm";
import OrdersManager from "./OrdersManager";
import { buildSeries, RANGES, salesByProduct } from "./revenue";

export default function ManagerDashboard() {
  const { data: orders, loading: ordersLoading, error: ordersError } = useAllOrders(true);
  const { data: products, loading: productsLoading } = useAllProducts(true);
  const [range, setRange] = useState("6M");
  const [editing, setEditing] = useState(null);

  const series = useMemo(() => buildSeries(orders, range), [orders, range]);
  const sales = useMemo(() => salesByProduct(orders), [orders]);
  const needsUpdate = orders.filter((o) => ["paid", "packed", "shipped", "out_for_delivery"].includes(o.status)).length;

  const isMonths = range !== "7D";
  const current = series[series.length - 1];
  const previous = series[series.length - 2];
  const periodRevenue = isMonths ? current.value : series.reduce((s, b) => s + b.value, 0);
  const periodUnits = isMonths ? current.units : series.reduce((s, b) => s + b.units, 0);
  const change = isMonths && previous?.value ? Math.round(((current.value - previous.value) / previous.value) * 100) : null;
  const stockLeft = products.reduce((n, p) => n + (p.stock || 0), 0);
  const lowCount = products.filter((p) => (p.stock || 0) <= LOW_STOCK_THRESHOLD).length;

  const edit = (product) => {
    setEditing(product);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const nav = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "revenue", label: "Revenue", icon: "chart" },
    { id: "inventory", label: "Inventory", icon: "box" },
    { id: "products", label: "Add product", icon: "watch" },
    { id: "orders", label: "Orders", icon: "cart", badge: needsUpdate },
  ];

  return (
    <DashboardShell nav={nav} role="Manager">
      <section id="overview">
        <DashHeader
          eyebrow="Store management"
          title="The"
          accent="vault room"
          actions={
            <a href="#products" className="btn btn--dark btn--sm" onClick={() => setEditing(null)}>
              + New product
            </a>
          }
        />
        {ordersError && (
          <p className="notice notice--error" style={{ marginTop: 24 }}>
            Couldn&apos;t load orders. Check that your account has the manager role in Firestore.
          </p>
        )}
        <div className="stats" style={{ marginTop: 32 }}>
          <Stat
            dark
            label={`Revenue sold · ${isMonths ? current.fullLabel : RANGES[range].label}`}
            value={formatMoney(periodRevenue)}
            note={change === null ? "Confirmed payments" : `${change >= 0 ? "+" : ""}${change}% vs ${previous.label}`}
          />
          <Stat label="Watches sold" value={periodUnits} note={isMonths ? "This month" : "Last 7 days"} />
          <Stat label="Stock left" value={stockLeft} note={`Across ${products.length} products`} />
          <Stat label="Low stock" value={lowCount} note={`${LOW_STOCK_THRESHOLD} or fewer left`} danger={lowCount > 0} />
        </div>
      </section>

      {ordersLoading || productsLoading ? (
        <PageLoading />
      ) : (
        <div className="stack" style={{ gap: 24, marginTop: 24 }}>
          <RevenuePanel series={series} range={range} setRange={setRange} />
          <InventoryTable products={products} sales={sales} onEdit={edit} />
          <ProductForm editing={editing} onDone={() => setEditing(null)} />
          <OrdersManager orders={orders} />
        </div>
      )}
    </DashboardShell>
  );
}
