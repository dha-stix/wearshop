"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { isDemoMode, resetDemoData } from "@/lib/firebase-actions";

// Floating reminder that the store is running on demo data, with quick account switching.
export default function DemoBadge() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  if (!isDemoMode) return null;

  const reset = () => {
    if (!window.confirm("Reset all demo orders, products and notifications?")) return;
    resetDemoData();
    toast("Demo data reset");
    setOpen(false);
  };

  return (
    <div className={`demo-badge ${open ? "demo-badge--open" : ""}`}>
      {open && (
        <div className="demo-badge__menu">
          <p>
            {user ? (
              <>
                Signed in as <strong>{user.displayName}</strong>
              </>
            ) : (
              "Not signed in"
            )}
          </p>
          <Link href="/auth/login?next=/dashboard" onClick={async () => user && (await signOut())}>
            Switch demo account
          </Link>
          <Link href="/dashboard">Open dashboard</Link>
          <button type="button" onClick={reset}>
            Reset demo data
          </button>
        </div>
      )}
      <button type="button" className="demo-badge__pill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="demo-badge__dot" /> Demo mode
      </button>
    </div>
  );
}
