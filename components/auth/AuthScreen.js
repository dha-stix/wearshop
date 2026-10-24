"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Icon, { GoogleMark } from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import Watch from "@/components/ui/Watch";
import { useAuth } from "@/components/providers/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";

const COPY = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in",
    body: "Pick up where you left off — your cart, orders and delivery updates are waiting.",
    button: "Sign in with Google",
    switchText: "New to WearShop?",
    switchLabel: "Create an account",
    switchHref: "/auth/register",
    tagline: ["Your orders, your watches, ", "one account."],
    look: { dial: "#0E0E0F", caseColor: "#C9A45C", strap: "#141414", lume: "#E8D5A6", accent: "#C9A45C" },
  },
  register: {
    eyebrow: "Join WearShop",
    title: "Create account",
    body: "One tap with Google and you're in. Save your cart, check out with Bachs and get notified at every step of delivery.",
    button: "Sign up with Google",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/auth/login",
    tagline: ["Start your collection, ", "one account."],
    look: { dial: "#F2EEE4", caseColor: "#C9A45C", strap: "#3A2414", lume: "#141414", accent: "#8A2B1F" },
  },
};

const PERKS = ["No new password to create or forget", "We only read your name, email and photo", "Order updates arrive in your dashboard"];

function friendlyError(err) {
  const code = err?.code || "";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return null;
  if (code.includes("popup-blocked")) return "Your browser blocked the sign-in window. Allow pop-ups and try again.";
  if (code.includes("network")) return "Couldn't reach Google. Check your connection and try again.";
  return err?.message || "Sign-in failed. Try again.";
}

export default function AuthScreen({ mode }) {
  const copy = COPY[mode];
  const { user, signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace(destination);
  }, [user, router, destination]);

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signIn();
    } catch (err) {
      const message = friendlyError(err);
      if (message) setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__art">
        <Logo dark />
        <div className="auth__stage" aria-hidden="true">
          <svg className="auth__ring orbit" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="290" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="1 14.18" />
            <circle cx="300" cy="300" r="250" fill="none" stroke="var(--gold-line)" strokeWidth="12" strokeDasharray="1 25.18" />
          </svg>
          <svg className="auth__ring auth__ring--small orbit--reverse" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="290" fill="none" stroke="var(--gold-line)" strokeWidth="1" />
            <text x="300" y="24" textAnchor="middle" fill="var(--gold)" fontFamily="var(--font-mono)" fontSize="16" letterSpacing="8">
              WEARSHOP · MEMBERS · WEARSHOP · MEMBERS
            </text>
          </svg>
          <div className="auth__watch float">
            <Watch look={copy.look} />
          </div>
        </div>
        <p className="auth__tagline">
          {copy.tagline[0]}
          <span className="serif-accent">{copy.tagline[1]}</span>
        </p>
      </div>

      <div className="auth__panel">
        <div className="auth__card rise">
          <p className="eyebrow">— {copy.eyebrow}</p>
          <h1 className="auth__title">{copy.title}</h1>
          <p className="lead auth__body">{copy.body}</p>

          {!isFirebaseConfigured && (
            <p className="notice notice--error" style={{ marginBottom: 16 }}>
              Sign-in isn&apos;t available yet: the store&apos;s Firebase keys haven&apos;t been added.
            </p>
          )}
          <button type="button" className="btn btn--dark btn--block auth__google" onClick={handleGoogle} disabled={busy || !isFirebaseConfigured}>
            <GoogleMark />
            {busy ? "Opening Google…" : copy.button}
          </button>
          {error && (
            <p className="field__error" role="alert" style={{ marginTop: 12 }}>
              {error}
            </p>
          )}

          <div className="auth__divider">
            <span>Why Google?</span>
          </div>
          <ul className="auth__perks">
            {PERKS.map((p) => (
              <li key={p}>
                <Icon name="check" size={18} strokeWidth={2} className="gold-icon" />
                {p}
              </li>
            ))}
          </ul>
          <p className="auth__switch">
            {copy.switchText}{" "}
            <Link href={`${copy.switchHref}${next ? `?next=${encodeURIComponent(next)}` : ""}`}>{copy.switchLabel}</Link>
          </p>
          <Link href="/" className="auth__back">
            <Icon name="arrow-left" size={16} /> Back to the store
          </Link>
        </div>
      </div>
    </div>
  );
}
