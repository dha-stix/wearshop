import Reveal from "@/components/ui/Reveal";

// Numbered eyebrow + big uppercase title used by every homepage section.
export default function SectionHeading({ number, eyebrow, children, intro, center = false, action }) {
  return (
    <Reveal className={`section-heading ${center ? "section-heading--center" : ""}`}>
      <div>
        <p className="eyebrow">
          {number ? `${number} — ` : ""}
          {eyebrow}
        </p>
        <h2 className="title">{children}</h2>
        {intro && <p className="lead section-heading__intro">{intro}</p>}
      </div>
      {action}
    </Reveal>
  );
}
