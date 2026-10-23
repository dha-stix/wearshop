import Icon from "@/components/ui/Icon";
import { formatMoney } from "@/lib/config";

// Right-hand totals panel shared by the cart and checkout pages.
export default function OrderSummary({ lines, subtotal, showItems = false, children }) {
  return (
    <aside className="panel summary" aria-label="Order summary">
      <h2 className="title-sm" style={{ marginBottom: 24 }}>
        Order summary
      </h2>
      {showItems && (
        <div className="summary__items">
          {lines.map((l) => (
            <div key={l.productId} className="summary__item">
              <span>
                {l.product.name} <span className="muted">× {l.quantity}</span>
              </span>
              <span className="mono">{formatMoney(l.product.price * l.quantity)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="summary__row">
        <span>Subtotal</span>
        <span className="mono">{formatMoney(subtotal)}</span>
      </div>
      <div className="summary__row">
        <span>Insured shipping</span>
        <span className="mono">Free</span>
      </div>
      <div className="summary__total">
        <span className="title-sm" style={{ fontSize: 22 }}>
          Total
        </span>
        <strong>{formatMoney(subtotal)}</strong>
      </div>
      {children}
      <p className="summary__secure">
        <Icon name="lock" size={14} strokeWidth={2} /> Payment processed securely by Bachs
      </p>
    </aside>
  );
}
