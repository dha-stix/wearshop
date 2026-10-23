import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Watch from "@/components/ui/Watch";
import { CATEGORIES } from "@/lib/config";
import SectionHeading from "./SectionHeading";

export default function Collections() {
  return (
    <section id="collections" className="section">
      <div className="container">
        <SectionHeading number="03" eyebrow="Collections">
          Choose your discipline
        </SectionHeading>
        <div className="collections">
          {CATEGORIES.slice(0, 4).map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08}>
              <Link href={`/shop?category=${c.id}`} className="collection-tile">
                <span className="collection-tile__num">/0{i + 1}</span>
                <span className="collection-tile__watch">
                  <Watch look={c.look} animated={false} />
                </span>
                <span className="collection-tile__body">
                  <span className="collection-tile__name">{c.name}</span>
                  <span className="collection-tile__blurb">{c.blurb}</span>
                  <span className="collection-tile__cta">Shop {c.name} →</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
