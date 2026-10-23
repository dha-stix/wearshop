"use client";

import Link from "next/link";
import Icon from "./Icon";
import ProductVisual from "./ProductVisual";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatMoney, getCategory, LOW_STOCK_THRESHOLD } from "@/lib/config";

export default function ProductCard({ product, tag }) {
  const { add } = useCart();
  const toast = useToast();
  const soldOut = (product.stock || 0) <= 0;
  const low = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;
  const href = `/shop/${product.id}`;

  const handleAdd = () => {
    add(product.id);
    toast(`${product.name} added to your cart`);
  };

  return (
    <article className="card card--hover product-card">
      <div className="product-card__top">
        <span className="label">{getCategory(product.category)?.name || "Watch"}</span>
        {soldOut ? (
          <span className="badge badge--muted">Sold out</span>
        ) : low ? (
          <span className="badge badge--danger">{product.stock} left</span>
        ) : tag ? (
          <span className="badge badge--dark">{tag}</span>
        ) : null}
      </div>
      <Link href={href} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <ProductVisual product={product} />
      </Link>
      <h3 className="product-card__name">
        <Link href={href}>{product.name}</Link>
      </h3>
      <p className="product-card__spec">
        {[product.caseSize && `${product.caseSize}mm`, product.movement, product.strap].filter(Boolean).join(" · ")}
      </p>
      <div className="product-card__foot">
        <span className="price">{formatMoney(product.price)}</span>
        <button type="button" className="btn btn--dark btn--sm product-card__add" onClick={handleAdd} disabled={soldOut}>
          <Icon name="plus" size={16} strokeWidth={2} />
          {soldOut ? "Sold out" : "Add"}
          <span className="sr-only"> {product.name} to cart</span>
        </button>
      </div>
    </article>
  );
}
