import Reveal from "@/components/ui/Reveal";
import Watch from "@/components/ui/Watch";
import SectionHeading from "./SectionHeading";

const FEATURES = [
  { tag: "A", title: "Sapphire crystal", body: "Scratch-resistant glass with anti-reflective coating, so the dial reads clean in any light." },
  { tag: "B", title: "316L steel case", body: "Marine-grade stainless steel that shrugs off sweat, salt water and years of daily wear." },
  { tag: "C", title: "Automatic movement", body: "Powered by the motion of your wrist. No battery, no compromise — just a sweeping seconds hand." },
  { tag: "D", title: "Screw-down crown", body: "Sealed against water and dust, rated for depth on every diver in the collection." },
];

const CRAFT_LOOK = { dial: "#F2EEE4", caseColor: "#C9A45C", strap: "#3A2414", lume: "#141414", accent: "#8A2B1F" };

function Feature({ tag, title, body, side, delay }) {
  return (
    <Reveal className={`craft__feature craft__feature--${side}`} delay={delay}>
      <span className="craft__tag">{side === "left" ? `— ${tag}` : `${tag} —`}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </Reveal>
  );
}

export default function Craft() {
  return (
    <section id="craft" className="section section--tint craft">
      <div className="container">
        <SectionHeading
          number="02"
          eyebrow="The craft"
          center
          intro="Before a watch reaches the shop floor, we inspect the details that separate an heirloom from a fashion piece."
        >
          Every part <span className="serif-accent">earns</span> its place
        </SectionHeading>
        <div className="craft__layout">
          <div className="craft__col">
            <Feature {...FEATURES[0]} side="left" />
            <Feature {...FEATURES[1]} side="left" delay={0.1} />
          </div>
          <Reveal className="craft__center">
            <svg className="craft__lines" viewBox="0 0 400 400" aria-hidden="true">
              <circle className="craft__line craft__line--ring" cx="200" cy="200" r="190" />
              <path className="craft__line" d="M120 120 L40 70 L-20 70" />
              <path className="craft__line" d="M110 260 L40 300 L-20 300" />
              <path className="craft__line" d="M280 140 L360 90 L420 90" />
              <path className="craft__line" d="M300 230 L360 290 L420 290" />
            </svg>
            <div className="craft__watch">
              <Watch look={CRAFT_LOOK} />
            </div>
          </Reveal>
          <div className="craft__col">
            <Feature {...FEATURES[2]} side="right" />
            <Feature {...FEATURES[3]} side="right" delay={0.1} />
          </div>
        </div>
      </div>
    </section>
  );
}
