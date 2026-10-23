import Link from "next/link";
import Icon from "./Icon";

export function PageLoading({ label = "Loading" }) {
  return (
    <div className="page-loading" role="status">
      <div className="spinner" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({ icon = "watch", title, children, action, href }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name={icon} size={40} strokeWidth={1.2} />
      </span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action && href && (
        <Link href={href} className="btn btn--dark">
          {action}
        </Link>
      )}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid-auto" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 420 }} />
      ))}
    </div>
  );
}
