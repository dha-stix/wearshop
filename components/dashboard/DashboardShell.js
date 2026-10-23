"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";

// Black sidebar + ivory content frame shared by the customer and manager dashboards.
// nav: [{ id, label, icon, badge }] — ids are section anchors on the page.
export default function DashboardShell({ nav, role, children }) {
  const { user, profile, signOut } = useAuth();
  const [active, setActive] = useState(nav[0]?.id);

  // Highlight the section currently in view.
  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [nav]);

  return (
    <div className="dash">
      <aside className="dash__side">
        <div className="dash__brand">
          <Logo dark size={24} />
          {role && <span className="dash__role">{role}</span>}
        </div>
        <nav className="dash__nav" aria-label="Dashboard">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? "true" : undefined}>
              <Icon name={item.icon} size={18} />
              {item.label}
              {item.badge > 0 && <span className="dash__badge">{item.badge}</span>}
            </a>
          ))}
          <Link href="/shop">
            <Icon name="external" size={18} />
            {role ? "View store" : "Shop watches"}
          </Link>
        </nav>
        <div className="dash__user">
          <span className="dash__avatar">
            {user?.photoURL ? <Image src={user.photoURL} alt="" width={40} height={40} /> : <Icon name="user" size={18} />}
          </span>
          <div className="dash__who">
            <div className="dash__name">{profile?.name || user?.displayName || "Your account"}</div>
            <div className="dash__email">{user?.email}</div>
          </div>
          <button type="button" className="icon-btn" aria-label="Sign out" onClick={signOut}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
      <div className="dash__main">{children}</div>
    </div>
  );
}

export function DashHeader({ eyebrow, title, accent, actions }) {
  return (
    <header className="dash__header rise">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="title">
          {title} {accent && <span className="serif-accent">{accent}</span>}
        </h1>
      </div>
      {actions}
    </header>
  );
}

export function Stat({ label, value, note, dark, danger }) {
  return (
    <div className={`stat ${dark ? "stat--dark" : ""}`}>
      <div className="label">{label}</div>
      <div className="stat__value" style={danger ? { color: "var(--danger)" } : undefined}>
        {value}
      </div>
      {note && <div className="stat__note">{note}</div>}
    </div>
  );
}
