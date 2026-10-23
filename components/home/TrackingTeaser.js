import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import OrderTimeline from "@/components/orders/OrderTimeline";

// A sample order showing customers what tracking looks like.
const SAMPLE_ORDER = {
  status: "shipped",
  timeline: [
    { status: "pending_payment", note: "", at: "2026-10-20T09:14:00" },
    { status: "paid", note: "", at: "2026-10-20T09:15:00" },
    { status: "packed", note: "", at: "2026-10-21T16:40:00" },
    { status: "shipped", note: "Your watch has left our vault with the courier.", at: "2026-10-22T08:02:00" },
  ],
};

export default function TrackingTeaser() {
  return (
    <section className="section">
      <div className="container split">
        <Reveal className="split__copy">
          <p className="eyebrow">05 — Always in the loop</p>
          <h2 className="title">Know where your watch is. Every hour.</h2>
          <p className="lead" style={{ margin: "24px 0 36px", maxWidth: 480 }}>
            Each time our team updates your order, you get a notification in your dashboard — payment confirmed,
            packed, shipped, out for delivery.
          </p>
          <Link href="/dashboard" className="btn btn--outline">
            Track an order
          </Link>
        </Reveal>
        <Reveal className="panel tracking-card" delay={0.15}>
          <div className="tracking-card__head">
            <div>
              <span className="label">Example order</span>
              <div className="mono" style={{ fontSize: 18 }}>
                #WS-10428
              </div>
            </div>
            <span className="badge badge--dark">In transit</span>
          </div>
          <OrderTimeline order={SAMPLE_ORDER} />
        </Reveal>
      </div>
    </section>
  );
}
