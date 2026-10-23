import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function CtaBand() {
  return (
    <section className="cta-band">
      <Reveal className="container">
        <div className="cta-band__inner">
          <svg className="cta-band__rings orbit" viewBox="0 0 400 400" aria-hidden="true">
            <circle cx="200" cy="200" r="190" fill="none" stroke="var(--gold)" strokeWidth="16" strokeDasharray="1.5 18.4" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="var(--gold-line)" strokeWidth="1" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="var(--gold-line)" strokeWidth="1" />
          </svg>
          <h2 className="title">
            Your next watch is <span className="serif-accent">already waiting.</span>
          </h2>
          <Link href="/shop" className="btn btn--gold">
            Find yours
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
