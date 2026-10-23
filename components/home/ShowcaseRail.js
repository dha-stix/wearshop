import Link from "next/link";
import ProductVisual from "@/components/ui/ProductVisual";
import Reveal from "@/components/ui/Reveal";
import { CATEGORIES, formatMoney } from "@/lib/config";

// Endless black-and-gold rail of watches. Falls back to one drawn piece per collection
// until the manager has published products.
export default function ShowcaseRail({ products }) {
  const pieces = products.length
    ? products.slice(0, 10).map((p) => ({ key: p.id, href: `/shop/${p.id}`, name: p.name, sub: formatMoney(p.price), product: p }))
    : CATEGORIES.map((c) => ({ key: c.id, href: `/shop?category=${c.id}`, name: c.name, sub: "Collection", product: { category: c.id, name: c.name } }));
  // Rendered twice so the -50% marquee loops seamlessly.
  const loop = [...pieces, ...pieces];

  return (
    <section className="rail section--dark" aria-label="Featured watches">
      <div className="container rail__head">
        <Reveal as="h2" className="title">
          The <span className="serif-accent">vault</span>, on display
        </Reveal>
        <span className="label rail__hint">Hover to pause · click to view</span>
      </div>
      <div className="rail__viewport">
        <div className="rail__track">
          {loop.map((piece, i) => (
            <Link key={`${piece.key}-${i}`} href={piece.href} className="rail__item" tabIndex={i >= pieces.length ? -1 : 0} aria-hidden={i >= pieces.length}>
              <span className="rail__disc">
                <ProductVisual product={piece.product} sizes="220px" watchWidth="54%" />
              </span>
              <span className="rail__name">{piece.name}</span>
              <span className="rail__price">{piece.sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
