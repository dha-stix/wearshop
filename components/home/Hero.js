import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Watch from "@/components/ui/Watch";
import { formatMoney } from "@/lib/config";

const HERO_LOOK = { dial: "#0E0E0F", caseColor: "#C9A45C", strap: "#141414", lume: "#E8D5A6", accent: "#C9A45C" };

// `delay` holds the entrance back until the intro curtains have opened.
export default function Hero({ featured, delay = 0 }) {
  return (
    <section className="hero container" style={{ "--hero-delay": `${delay}s` }}>
      <div className="hero__copy">
        <p className="eyebrow eyebrow--line hero__in">Curated luxury timepieces</p>
        <h1 className="display hero__in hero__in--2">
          Time,
          <br />
          forged in
          <br />
          <span className="serif-accent">gold.</span>
        </h1>
        <p className="lead hero__lead hero__in hero__in--3">
          Automatic, chronograph and diver watches chosen for men who mean it. Order in minutes, pay securely, and
          follow your watch from our vault to your wrist.
        </p>
        <div className="hero__ctas hero__in hero__in--3">
          <Link href="/shop" className="btn btn--dark">
            Shop the collection <Icon name="arrow-right" size={18} strokeWidth={2} className="gold-icon" />
          </Link>
          <Link href="/#collections" className="btn btn--outline">
            Explore collections
          </Link>
        </div>
        <ul className="hero__trust hero__in hero__in--3">
          <li>
            <Icon name="lock" size={16} className="gold-icon" /> Secure payment · Bachs
          </li>
          <li>
            <Icon name="truck" size={16} className="gold-icon" /> Live delivery tracking
          </li>
          <li>
            <Icon name="shield" size={16} className="gold-icon" /> Authenticity checked
          </li>
        </ul>
      </div>

      <div className="hero__stage">
        <div className="hero__disc" />
        <svg className="hero__ring orbit" viewBox="0 0 600 600" aria-hidden="true">
          <circle cx="300" cy="300" r="292" fill="none" stroke="var(--gold-deep)" strokeWidth="1" strokeDasharray="1 14.2" />
          <circle cx="300" cy="300" r="246" fill="none" stroke="var(--gold)" strokeWidth="10" strokeDasharray="1 24.7" opacity="0.55" />
        </svg>
        <svg className="hero__ring hero__ring--text orbit--reverse" viewBox="0 0 600 600" aria-hidden="true">
          <circle cx="300" cy="300" r="290" fill="none" stroke="var(--gold-line)" strokeWidth="1" />
          <text x="300" y="24" textAnchor="middle" fill="var(--gold)" fontFamily="var(--font-mono)" fontSize="15" letterSpacing="7">
            AUTOMATIC · SAPPHIRE · GOLD TONE · 316L STEEL
          </text>
        </svg>
        <div className="hero__watch">
          <div className="float">
            <Watch look={HERO_LOOK} label="Gold WearShop automatic watch" />
          </div>
        </div>
        {featured && (
          <Link href={`/shop/${featured.id}`} className="hero__featured hero__in hero__in--3">
            <span className="label">Featured</span>
            <strong>{featured.name}</strong>
            <span className="mono">
              {[featured.caseSize && `${featured.caseSize}MM`, featured.movement?.toUpperCase(), formatMoney(featured.price)]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
