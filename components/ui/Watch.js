import { DEFAULT_LOOK } from "@/lib/config";

const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => i * 30);

// Drawn wristwatch with ticking hands. Used for hero art and as a stand-in until a product has photos.
export default function Watch({ look = DEFAULT_LOOK, animated = true, className, label }) {
  const { dial, caseColor, strap, lume, accent } = { ...DEFAULT_LOOK, ...look };
  return (
    <svg
      className={className}
      viewBox="0 0 200 260"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
    >
      <rect x="70" y="0" width="60" height="78" rx="6" fill={strap} />
      <rect x="70" y="182" width="60" height="78" rx="6" fill={strap} />
      <line x1="74" y1="24" x2="126" y2="24" stroke="#000" strokeOpacity="0.25" />
      <line x1="74" y1="236" x2="126" y2="236" stroke="#000" strokeOpacity="0.25" />
      <rect x="60" y="54" width="80" height="152" rx="20" fill={caseColor} />
      <rect x="174" y="121" width="12" height="18" rx="3" fill={caseColor} />
      <circle cx="100" cy="130" r="80" fill={caseColor} />
      <circle cx="100" cy="130" r="80" fill="#000" fillOpacity="0.18" />
      <circle cx="100" cy="130" r="74" fill={caseColor} />
      <circle cx="100" cy="130" r="70" fill="#0B0C0E" />
      <circle cx="100" cy="130" r="65" fill="none" stroke={lume} strokeOpacity="0.35" strokeWidth="5" strokeDasharray="0.8 33.23" />
      <circle cx="100" cy="130" r="61" fill={dial} />
      <circle cx="100" cy="130" r="57" fill="none" stroke={lume} strokeOpacity="0.45" strokeWidth="3" strokeDasharray="0.6 5.37" />
      <g stroke={lume} strokeWidth="3.5">
        {HOUR_MARKS.map((deg) => (
          <line key={deg} x1="100" y1="76" x2="100" y2={deg % 90 === 0 ? 90 : 86} transform={`rotate(${deg} 100 130)`} />
        ))}
      </g>
      <text x="100" y="106" textAnchor="middle" fill={lume} fontFamily="var(--font-display)" fontWeight="700" fontSize="9" letterSpacing="2.5">
        WEARSHOP
      </text>
      <text x="100" y="164" textAnchor="middle" fill={accent} fontFamily="var(--font-mono)" fontSize="5.5" letterSpacing="1.5">
        AUTOMATIC
      </text>
      <circle cx="100" cy="150" r="9" fill="none" stroke={lume} strokeOpacity="0.3" strokeWidth="0.8" />
      <g transform="rotate(305 100 130)">
        <line x1="100" y1="136" x2="100" y2="98" stroke={lume} strokeWidth="5" strokeLinecap="round" />
      </g>
      <g className={animated ? "watch-min" : undefined}>
        <g transform="rotate(60 100 130)">
          <line x1="100" y1="138" x2="100" y2="82" stroke={lume} strokeWidth="3.2" strokeLinecap="round" />
        </g>
      </g>
      <g className={animated ? "watch-sec" : undefined}>
        <line x1="100" y1="144" x2="100" y2="76" stroke={accent} strokeWidth="1.2" />
        <circle cx="100" cy="88" r="2.4" fill={accent} />
      </g>
      <circle cx="100" cy="130" r="4" fill={accent} />
      <circle cx="100" cy="130" r="1.5" fill="#0B0C0E" />
      <path d="M58 96 A52 52 0 0 1 118 76" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}
