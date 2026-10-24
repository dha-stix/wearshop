import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { EmptyState, SkeletonGrid } from "@/components/ui/States";
import SectionHeading from "./SectionHeading";

export default function NewArrivals({ products, loading }) {
  const latest = products.slice(0, 4);
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          number="01"
          eyebrow="New arrivals"
          action={
            <Link href="/shop" className="text-link">
              View all watches <Icon name="arrow-right" size={18} strokeWidth={2} className="gold-icon" />
            </Link>
          }
        >
          Just landed in the vault
        </SectionHeading>
        {loading ? (
          <SkeletonGrid />
        ) : latest.length ? (
          <div className="grid-auto">
            {latest.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} tag="New" />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="panel">
            <EmptyState title="The vault is being stocked">
              New watches land here as soon as they&apos;re published. Check back shortly.
            </EmptyState>
          </div>
        )}
      </div>
    </section>
  );
}
