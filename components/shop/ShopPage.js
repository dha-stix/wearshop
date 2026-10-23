"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { EmptyState, SkeletonGrid } from "@/components/ui/States";
import { useProducts } from "@/components/providers/ProductsProvider";
import { CATEGORIES, formatMoney, MOVEMENTS, STRAPS } from "@/lib/config";
import ShopFilters from "./ShopFilters";

const SORTS = {
  newest: { label: "Newest first", fn: () => 0 },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
};

const EMPTY_FILTERS = { search: "", maxPrice: null, movements: [], straps: [], inStock: false };

export default function ShopPage() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") || "all";
  const { products, loading, error } = useProducts();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const priceCeiling = useMemo(() => Math.max(0, ...products.map((p) => p.price || 0)), [products]);

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return products
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => !q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q))
      .filter((p) => filters.maxPrice === null || p.price <= filters.maxPrice)
      .filter((p) => !filters.movements.length || filters.movements.includes(p.movement))
      .filter((p) => !filters.straps.length || filters.straps.includes(p.strap))
      .filter((p) => !filters.inStock || p.stock > 0)
      .sort(SORTS[sort].fn);
  }, [products, category, filters, sort]);

  const pickCategory = (id) => router.replace(id === "all" ? "/shop" : `/shop?category=${id}`, { scroll: false });
  const activeName = CATEGORIES.find((c) => c.id === category)?.name;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> / <span>{activeName || "Shop"}</span>
          </nav>
          <div className="row row--between row--end shop-head">
            <h1 className="display shop-head__title rise">{activeName || "The collection"}</h1>
            <label className="shop-sort">
              <span className="label">Sort</span>
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([id, s]) => (
                  <option key={id} value={id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="chips shop-chips" role="group" aria-label="Collection">
            {[{ id: "all", name: "All" }, ...CATEGORIES].map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={category === c.id} onClick={() => pickCategory(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container shop-layout">
        <ShopFilters
          filters={filters}
          setFilters={setFilters}
          reset={() => setFilters(EMPTY_FILTERS)}
          priceCeiling={priceCeiling}
          movements={MOVEMENTS}
          straps={STRAPS}
          open={filtersOpen}
          setOpen={setFiltersOpen}
          formatMoney={formatMoney}
        />
        <div className="shop-results">
          <div className="row row--between row--center shop-results__bar">
            <span className="label">
              {loading ? "Loading watches" : `Showing ${visible.length} ${visible.length === 1 ? "watch" : "watches"}`}
            </span>
            <button type="button" className="btn btn--outline btn--sm shop-filter-toggle" onClick={() => setFiltersOpen(true)}>
              Filters
            </button>
          </div>
          {loading ? (
            <SkeletonGrid count={6} />
          ) : error ? (
            <div className="notice notice--error">We couldn't load the collection. Refresh to try again.</div>
          ) : visible.length ? (
            <div className="grid-auto">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="panel">
              <EmptyState title={products.length ? "No watches match" : "The vault is being stocked"}>
                {products.length ? "Try a different collection or clear your filters." : "New watches appear here as soon as they're published."}
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
