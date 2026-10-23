import Link from "next/link";
import Watch from "@/components/ui/Watch";

export default function NotFound() {
  return (
    <section className="container success">
      <div style={{ width: 160, margin: "0 auto 24px" }}>
        <Watch />
      </div>
      <p className="eyebrow" style={{ justifyContent: "center" }}>
        404
      </p>
      <h1>Lost track of time</h1>
      <p className="lead">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/shop" className="btn btn--dark">
        Browse watches
      </Link>
    </section>
  );
}
