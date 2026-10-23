"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useProducts } from "@/components/providers/ProductsProvider";
import Intro from "./Intro";
import Hero from "./Hero";
import ShowcaseRail from "./ShowcaseRail";
import NewArrivals from "./NewArrivals";
import Craft from "./Craft";
import Collections from "./Collections";
import HowItWorks from "./HowItWorks";
import TrackingTeaser from "./TrackingTeaser";
import CtaBand from "./CtaBand";
import { REPLAY_EVENT } from "./ReplayIntroButton";

const SEEN_KEY = "wearshop-intro-seen";
const HERO_DELAY_AFTER_INTRO = 5.1;

export default function HomePage() {
  const { products, loading } = useProducts();
  // null until we know whether this visitor has already seen the intro this session.
  const [intro, setIntro] = useState(null);
  const [run, setRun] = useState(0);
  const decided = useRef(false);

  useEffect(() => {
    // Decide once per mount, even when React re-runs effects in development.
    if (!decided.current) {
      decided.current = true;
      const replay = new URLSearchParams(window.location.search).get("intro") === "replay";
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setIntro(replay || (!seen && !reduced));
      if (replay) window.history.replaceState(null, "", "/");
    }

    const onReplay = () => {
      setRun((n) => n + 1);
      setIntro(true);
    };
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);

  const finishIntro = useCallback(() => setIntro(false), []);
  const featured = products.find((p) => p.featured) || products[0];

  return (
    <>
      {intro && <Intro key={`intro-${run}`} onDone={finishIntro} />}
      <div style={{ visibility: intro === null ? "hidden" : "visible" }}>
        <Hero key={`hero-${run}`} featured={featured} delay={intro ? HERO_DELAY_AFTER_INTRO : 0} />
      </div>
      <ShowcaseRail products={products} />
      <NewArrivals products={products} loading={loading} />
      <Craft />
      <Collections />
      <HowItWorks />
      <TrackingTeaser />
      <CtaBand />
    </>
  );
}
