"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import ProductCard from "@/components/ui/ProductCard";
import ProductVisual from "@/components/ui/ProductVisual";
import Reveal from "@/components/ui/Reveal";
import { EmptyState, PageLoading } from "@/components/ui/States";
import { useCart } from "@/components/providers/CartProvider";
import { useProducts } from "@/components/providers/ProductsProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useProduct } from "@/lib/hooks";
import { formatMoney, getCategory, LOW_STOCK_THRESHOLD } from "@/lib/config";

const MAX_QTY = 10;

export default function ProductDetail({ id }) {
  const router = useRouter();
  const { data: product, loading } = useProduct(id);
  const { products } = useProducts();
  const { add } = useCart();
  const toast = useToast();
  const [shot, setShot] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product?.name) document.title = `${product.name} · WearShop`;
  }, [product?.name]);

  if (loading) return <PageLoading />;
  if (!product || product.status === "draft") {
    return (
      <div className="container section">
        <EmptyState title="Watch not found" action="Back to the shop" href="/shop">
          This watch may have sold out or been removed.
        </EmptyState>
      </div>
    );
  }

  const category = getCategory(product.category);
  const images = product.images || [];
  const stock = product.stock || 0;
  const maxQty = Math.min(stock, MAX_QTY);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const specs = [
    ["Case", product.caseSize ? `${product.caseSize}mm` : null],
    ["Movement", product.movement],
    ["Crystal", product.crystal],
    ["Water resistance", product.waterResistance],
    ["Strap", product.strap],
    ["Collection", category?.name],
  ].filter(([, v]) => v);

  const addToCart = (goToCart) => {
    add(product.id, qty);
    if (goToCart) router.push("/cart");
    else toast(`${product.name} added to your cart`);
  };

  return (
    <>
      <div className="container" style={{ paddingTop: 32 }}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href={`/shop?category=${product.category}`}>{category?.name || "Shop"}</Link> /{" "}
          <span>{product.name}</span>
        </nav>
      </div>

      <section className="container product">
        <div className="product__gallery">
          <div className="product__stage">
            <svg className="product__ring orbit" viewBox="0 0 400 400" aria-hidden="true">
              <circle cx="200" cy="200" r="196" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="1 9.26" opacity="0.6" />
            </svg>
            <div key={shot} className="product__shot">
              <ProductVisual product={product} index={shot} sizes="(max-width: 900px) 100vw, 50vw" priority watchWidth="46%" />
            </div>
            {images.length > 1 && (
              <span className="product__counter label">
                {shot + 1} / {images.length}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="product__thumbs" role="group" aria-label="Product images">
              {images.map((img, i) => (
                <button
                  key={img.path || img.url}
                  type="button"
                  className="product__thumb"
                  aria-pressed={i === shot}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setShot(i)}
                >
                  <ProductVisual product={product} index={i} sizes="120px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product__info">
          <div className="row" style={{ gap: 10 }}>
            {category && <span className="badge badge--outline">{category.name}</span>}
            {stock <= 0 ? (
              <span className="badge badge--muted">Sold out</span>
            ) : stock <= LOW_STOCK_THRESHOLD ? (
              <span className="badge badge--danger">Only {stock} left</span>
            ) : (
              <span className="badge badge--outline">In stock</span>
            )}
          </div>
          <h1 className="display product__name rise">{product.name}</h1>
          <div className="price product__price">{formatMoney(product.price)}</div>
          <p className="lead product__desc">{product.description}</p>

          <div className="product__buy">
            <div className="qty" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={stock <= 0}>
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}>
                +
              </button>
            </div>
            <button type="button" className="btn btn--dark product__add" disabled={stock <= 0} onClick={() => addToCart(false)}>
              {stock <= 0 ? "Sold out" : "Add to cart"}
            </button>
            <button type="button" className="btn btn--outline product__add" disabled={stock <= 0} onClick={() => addToCart(true)}>
              Buy now
            </button>
          </div>

          <ul className="product__perks">
            <li>
              <Icon name="truck" size={22} className="gold-icon" />
              Insured delivery
            </li>
            <li>
              <Icon name="lock" size={22} className="gold-icon" />
              Pay with Bachs
            </li>
            <li>
              <Icon name="clock" size={22} className="gold-icon" />
              Live order tracking
            </li>
          </ul>

          {specs.length > 0 && (
            <>
              <h2 className="title-sm product__specs-title">Specifications</h2>
              <dl className="specs">
                {specs.map(([k, v]) => (
                  <div key={k}>
                    <dt className="label">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--tint">
          <div className="container">
            <Reveal as="h2" className="title" style={{ marginBottom: 40 }}>
              You might also wear
            </Reveal>
            <div className="grid-auto">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
