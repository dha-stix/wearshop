import Reveal from "@/components/ui/Reveal";
import SectionHeading from "./SectionHeading";

const STEPS = [
  { title: "Browse & pick", body: "Filter by style, size and price. Every listing shows real photos from every angle." },
  { title: "Sign in with Google", body: "One tap. No passwords to remember — your cart is saved to your account." },
  { title: "Pay with Bachs", body: "Checkout is handled by Bachs, so your card details never touch our servers." },
  { title: "Track to your door", body: "Watch each status update land in your dashboard until it is on your wrist." },
];

export default function HowItWorks() {
  return (
    <section className="section section--tint">
      <div className="container">
        <SectionHeading number="04" eyebrow="How it works">
          From vault to wrist in four moves
        </SectionHeading>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} className="step" delay={i * 0.1}>
              <span className="step__num">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
