"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { DashHeader } from "../DashboardShell";
import ProductForm from "./ProductForm";
import { useManagerData } from "./ManagerData";

// Full page for adding a product (no id) or editing one.
export default function ProductEditor({ id }) {
  const router = useRouter();
  const { products, loading } = useManagerData();
  const live = id ? products.find((p) => p.id === id) : null;
  // Keep the version that was opened, so live stock updates don't wipe unsaved edits.
  const [product, setProduct] = useState(null);
  if (live && !product) setProduct(live);
  const back = { href: "/dashboard/products", label: "All products" };

  if (id && (loading || (live && !product))) return <PageLoading />;
  if (id && !live) {
    return (
      <>
        <DashHeader eyebrow="Products" title="Not found" back={back} />
        <div className="panel" style={{ marginTop: 24 }}>
          <EmptyState title="This product doesn't exist" action="Back to products" href="/dashboard/products">
            It may have been deleted.
          </EmptyState>
        </div>
      </>
    );
  }

  return (
    <>
      <DashHeader eyebrow={product ? "Edit product" : "New product"} title={product ? product.name : "Add a watch"} back={back} />
      <div style={{ marginTop: 32 }}>
        <ProductForm key={product?.id || "new"} editing={product} onDone={() => router.push("/dashboard/products")} />
      </div>
    </>
  );
}
