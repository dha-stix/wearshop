"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ProductVisual from "@/components/ui/ProductVisual";
import { useToast } from "@/components/providers/ToastProvider";
import { deleteProduct, restockProduct } from "@/lib/firebase-actions";
import { formatMoney, LOW_STOCK_THRESHOLD } from "@/lib/config";

function RestockControl({ product }) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = Math.floor(Number(amount));
    if (!(n > 0)) return;
    setBusy(true);
    try {
      await restockProduct(product.id, n);
      toast(`Added ${n} to ${product.name}`);
      setAmount("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="restock" onSubmit={submit}>
      <label className="sr-only" htmlFor={`restock-${product.id}`}>
        Units to add to {product.name}
      </label>
      <input id={`restock-${product.id}`} className="input" type="number" min="1" inputMode="numeric" placeholder="+0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button type="submit" className="btn btn--outline btn--sm" disabled={busy || !(Number(amount) > 0)}>
        Restock
      </button>
    </form>
  );
}

export default function InventoryTable({ products, sales, onEdit }) {
  const toast = useToast();
  const [lowOnly, setLowOnly] = useState(false);
  const meterMax = Math.max(12, ...products.map((p) => p.stock || 0));
  const rows = products.filter((p) => !lowOnly || (p.stock || 0) <= LOW_STOCK_THRESHOLD);

  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.name}? Its photos will be removed too. Orders that include it are kept.`)) return;
    try {
      await deleteProduct(product);
      toast(`${product.name} deleted`);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <section id="inventory" className="panel" aria-label="Stock and sales">
      <div className="panel__head">
        <div>
          <h2 className="title-sm">Stock &amp; sales by product</h2>
          <p className="muted" style={{ fontSize: 15, marginTop: 4 }}>
            Stock drops automatically when a Bachs payment is confirmed.
          </p>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>
      {rows.length === 0 ? (
        <p className="panel__body muted">{products.length ? "Nothing is low on stock." : "Add your first product below."}</p>
      ) : (
        <div className="table-wrap">
          <table className="table" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Price</th>
                <th scope="col" className="num">
                  Sold
                </th>
                <th scope="col" className="num">
                  Revenue
                </th>
                <th scope="col" style={{ width: 200 }}>
                  Stock left
                </th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const stock = p.stock || 0;
                const low = stock <= LOW_STOCK_THRESHOLD;
                const sale = sales.get(p.id) || { revenue: 0, units: 0 };
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="inv-product">
                        <span className="inv-product__thumb">
                          <ProductVisual product={p} sizes="44px" animated={false} watchWidth="50%" />
                        </span>
                        <span>
                          <strong>{p.name}</strong>
                          {p.status === "draft" && <span className="badge badge--outline" style={{ marginLeft: 8 }}>Draft</span>}
                        </span>
                      </div>
                    </td>
                    <td className="mono">{formatMoney(p.price)}</td>
                    <td className="num">{sale.units}</td>
                    <td className="num">{formatMoney(sale.revenue)}</td>
                    <td>
                      <div className="meter">
                        <div className="meter__track">
                          <div className={`meter__fill ${low ? "meter__fill--low" : ""}`} style={{ width: `${(stock / meterMax) * 100}%` }} />
                        </div>
                        <span className="mono">{stock}</span>
                      </div>
                      {low && (
                        <div className="low-flag">
                          <Icon name="alert" size={14} strokeWidth={2} />
                          {stock === 0 ? "Sold out" : "Low stock"}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="inv-actions">
                        <RestockControl product={p} />
                        <button type="button" className="icon-btn icon-btn--boxed" aria-label={`Edit ${p.name}`} onClick={() => onEdit(p)}>
                          <Icon name="edit" size={18} />
                        </button>
                        <button type="button" className="icon-btn icon-btn--boxed" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
