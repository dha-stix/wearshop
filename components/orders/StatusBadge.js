import { getStatus } from "@/lib/config";

const TONE = {
  pending_payment: "outline",
  paid: "gold",
  delivered: "muted",
  cancelled: "danger",
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge--${TONE[status] || "dark"}`}>{getStatus(status).label}</span>;
}
