"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";

// Black sidebar + ivory content frame shared by the customer and manager dashboards.
// nav: [{ href, label, icon, badge, exact, match }] — each item is its own page under /dashboard.
export default function DashboardShell({ nav, role, children }) {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (item) =>
    item.match ? item.match(pathname) : item.exact ? pathname === item.href : pathname.startsWith(item.href);

  // Close the mobile drawer whenever the page changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock page scroll and allow Escape while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="dash">
      <aside className={`dash__side ${menuOpen ? "dash__side--open" : ""}`}>
        <div className="dash__brand">
          <Logo dark size={24} />
          {role && <span className="dash__role">{role}</span>}
          <button
            type="button"
            className="icon-btn dash__menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="dash-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={24} />
          </button>
        </div>
        <button type="button" className="dash__scrim" tabIndex={-1} aria-label="Close menu" onClick={() => setMenuOpen(false)} />
        <div id="dash-menu" className="dash__menu">
          <div className="dash__menu-head">
            <Logo dark size={22} />
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <Icon name="close" size={22} />
            </button>
          </div>
        <nav className="dash__nav" aria-label="Dashboard">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item) ? "page" : undefined}>
              <Icon name={item.icon} size={18} />
              {item.label}
              {item.badge > 0 && <span className="dash__badge">{item.badge}</span>}
            </Link>
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
        </div>
      </aside>
      <div className="dash__main">{children}</div>
    </div>
  );
}

export function DashHeader({ eyebrow, title, accent, actions, back }) {
  return (
    <header className="dash__header rise">
      <div>
        {back && (
          <Link href={back.href} className="back-link">
            <Icon name="arrow-left" size={16} /> {back.label}
          </Link>
        )}
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
