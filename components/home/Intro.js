"use client";

import { useEffect } from "react";

const LETTERS = "WEARSHOP".split("");
const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => i * 30);
export const INTRO_MS = 5800;

// Black-and-gold opening sequence: the watch face draws itself, the name and statement appear,
// then the curtains split to reveal the homepage. Calls onDone when finished or skipped.
export default function Intro({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, INTRO_MS);
    const onKey = (e) => e.key === "Escape" && onDone();
    document.documentElement.classList.add("intro-lock");
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("intro-lock");
    };
  }, [onDone]);

  return (
    <div className="intro" role="presentation">
      <div className="intro__curtain intro__curtain--top" />
      <div className="intro__curtain intro__curtain--bottom" />
      <div className="intro__content" aria-hidden="true">
        <svg className="intro__dial" viewBox="0 0 220 220">
          <circle className="intro__ring" cx="110" cy="110" r="100" />
          <circle className="intro__ring intro__ring--inner" cx="110" cy="110" r="88" />
          <g className="intro__ticks">
            {HOUR_MARKS.map((deg) => (
              <line key={deg} x1="110" y1="28" x2="110" y2={deg % 90 === 0 ? 42 : 36} transform={`rotate(${deg} 110 110)`} />
            ))}
          </g>
          <g className="intro__hand intro__hand--hour">
            <line x1="110" y1="116" x2="110" y2="66" />
          </g>
          <g className="intro__hand intro__hand--minute">
            <line x1="110" y1="118" x2="110" y2="46" />
          </g>
          <circle cx="110" cy="110" r="4" fill="var(--gold)" />
        </svg>
        <div className="intro__word">
          {LETTERS.map((ch, i) => (
            <span key={i} className={`intro__letter ${i >= 4 ? "intro__letter--gold" : ""}`} style={{ animationDelay: `${1.6 + i * 0.08}s` }}>
              {ch}
            </span>
          ))}
          <span className="intro__shine" />
        </div>
        <p className="intro__statement">Precision, heritage, and the quiet confidence of a man who owns his time.</p>
        <p className="intro__offer">Automatic · Chronograph · Diver · Dress · Field</p>
        <div className="intro__progress">
          <span />
        </div>
      </div>
      <p className="sr-only">WearShop. Precision, heritage, and the quiet confidence of a man who owns his time.</p>
      <button type="button" className="intro__skip" onClick={onDone}>
        Skip intro
      </button>
    </div>
  );
}
