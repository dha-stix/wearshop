"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import LoadMore, { usePaged } from "@/components/ui/LoadMore";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { CATEGORIES, LOW_STOCK_THRESHOLD } from "@/lib/config";
import { DashHeader, Stat } from "../DashboardShell";
import InventoryTable from "./InventoryTable";
import { useManagerData } from "./ManagerData";

const STOCK_FILTERS = {
  all: { label: "All products", match: () => true },
  low: { label: "Low stock", match: (p) => (p.stock || 0) > 0 && p.stock <= LOW_STOCK_THRESHOLD },
  out: { label: "Sold out", match: (p) => !(p.stock > 0) },
  drafts: { label: "Drafts", match: (p) => p.status === "draft" },
};

const SORTS = {
  newest: { label: "Newest first", fn: () => 0 },
  name: { label: "Name A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
  "stock-asc": { label: "Stock: lowest first", fn: (a, b) => (a.stock || 0) - (b.stock || 0) },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
};

export default function ProductsPage() {
  const params = useSearchParams();
  const { products, sales, loading } = useManagerData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState(STOCK_FILTERS[params.get("stock")] ? params.get("stock") : "all");
  const [sort, setSort] = useState("newest");

  const bestSort = sort === "best" ? (a, b) => (sales.get(b.id)?.units || 0) - (sales.get(a.id)?.units || 0) : SORTS[sort].fn;
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .filter((p) => category === "all" || p.category === category)
      .filter(STOCK_FILTERS[stock].match)
      .sort(bestSort);
  }, [products, search, category, stock, bestSort]);
  const paged = usePaged(rows, 20, JSON.stringify([search, category, stock, sort]));
  const meterMax = Math.max(12, ...products.map((p) => p.stock || 0));

  if (loading) return <PageLoading />;

  const totalStock = products.reduce((n, p) => n + (p.stock || 0), 0);
  const low = products.filter(STOCK_FILTERS.low.match).length;
  const out = products.filter(STOCK_FILTERS.out.match).length;

  return (
    <>
      <DashHeader
        eyebrow="Store management"
        title="Products"
        actions={
          <Link href="/dashboard/products/new" className="btn btn--dark btn--sm">
            <Icon name="plus" size={16} strokeWidth={2} /> Add product
          </Link>
        }
      />
      <div className="stats" style={{ marginTop: 32 }}>
        <Stat label="Products" value={products.length} note={`${products.filter((p) => p.status === "draft").length} drafts`} />
        <Stat label="Units in stock" value={totalStock} />
        <Stat label="Low stock" value={low} note={`${LOW_STOCK_THRESHOLD} or fewer left`} danger={low > 0} />
        <Stat label="Sold out" value={out} danger={out > 0} />
      </div>

      <section className="panel" style={{ marginTop: 24 }} aria-label="Products">
        <div className="toolbar">
          <label className="toolbar__search">
            <Icon name="search" size={18} />
            <span className="sr-only">Search products</span>
            <input className="input" type="search" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className="toolbar__field">
            <span className="sr-only">Collection</span>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All collections</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="toolbar__field">
            <span className="sr-only">Stock</span>
            <select className="select" value={stock} onChange={(e) => setStock(e.target.value)}>
              {Object.entries(STOCK_FILTERS).map(([id, f]) => (
                <option key={id} value={id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="toolbar__field">
            <span className="sr-only">Sort</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([id, s]) => (
                <option key={id} value={id}>
                  {s.label}
                </option>
              ))}
              <option value="best">Best sellers</option>
            </select>
          </label>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon="watch" title={products.length ? "No products match" : "No products yet"} action={products.length ? undefined : "Add a product"} href="/dashboard/products/new">
            {products.length ? "Try another search or filter." : "Add your first watch to start selling."}
          </EmptyState>
        ) : (
          <>
            <InventoryTable rows={paged.page} sales={sales} meterMax={meterMax} />
            <div className="panel__body">
              <LoadMore paged={paged} noun="products" />
            </div>
          </>
        )}
      </section>
    </>
  );
}
