import { CANCELLED, formatDate, ORDER_STATUSES, statusIndex } from "@/lib/config";

// Vertical tracker: every stage of the order, with the time and note of each update that happened.
export default function OrderTimeline({ order }) {
  const current = statusIndex(order.status);
  const history = new Map((order.timeline || []).map((entry) => [entry.status, entry]));
  const stages = order.status === CANCELLED.id ? [...ORDER_STATUSES.slice(0, 2), CANCELLED] : ORDER_STATUSES;

  return (
    <ol className="timeline">
      {stages.map((stage, i) => {
        const entry = history.get(stage.id);
        const state =
          order.status === CANCELLED.id
            ? entry
              ? "done"
              : "next"
            : i < current
              ? "done"
              : i === current
                ? "now"
                : "next";
        return (
          <li key={stage.id} className={`timeline__item timeline__item--${state}`} aria-current={state === "now" ? "step" : undefined}>
            <div className="timeline__rail">
              <span className="timeline__dot" />
              {i < stages.length - 1 && <span className="timeline__line" />}
            </div>
            <div className="timeline__body">
              <div className="timeline__label">{stage.label}</div>
              <div className="timeline__meta">{entry ? formatDate(entry.at, true) : state === "next" ? "Pending" : ""}</div>
              {entry?.note && state !== "next" && <p className="timeline__note">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
