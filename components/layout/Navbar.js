"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import NotificationBell from "@/components/orders/NotificationBell";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/#collections", label: "Collections" },
  { href: "/#craft", label: "Craft" },
  { href: "/dashboard/orders", label: "Track order" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu whenever the page changes.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <nav className="container navbar__inner" aria-label="Main">
        <Logo />
        <div className="navbar__links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="navbar__actions">
          <Link href="/shop" className="icon-btn" aria-label="Search watches">
            <Icon name="search" />
          </Link>
          <NotificationBell />
          <Link href="/cart" className="icon-btn" aria-label={`Cart, ${count} items`}>
            <Icon name="cart" />
            {count > 0 && <span className="count-dot">{count}</span>}
          </Link>
          {user ? (
            <Link href="/dashboard" className="navbar__avatar hide-sm" aria-label="Your dashboard">
              {user.photoURL ? (
                <Image src={user.photoURL} alt="" width={36} height={36} />
              ) : (
                <Icon name="user" size={18} />
              )}
            </Link>
          ) : (
            <Link href="/auth/login" className="btn btn--dark btn--sm hide-sm">
              Sign in
            </Link>
          )}
          <button type="button" className="icon-btn navbar__menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Icon name="menu" size={22} />
          </button>
        </div>
      </nav>

      <div className={`drawer ${open ? "drawer--open" : ""}`} aria-hidden={!open}>
        <button type="button" className="drawer__scrim" tabIndex={-1} aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__head">
            <Logo dark size={22} />
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              <Icon name="close" size={22} />
            </button>
          </div>
          <div className="drawer__links">
            {LINKS.map((l, i) => (
              <Link key={l.href} href={l.href} style={{ "--i": i }} tabIndex={open ? 0 : -1}>
                {l.label}
              </Link>
            ))}
            <Link href="/cart" style={{ "--i": LINKS.length }} tabIndex={open ? 0 : -1}>
              Cart ({count})
            </Link>
          </div>
          <div className="drawer__foot">
            {user ? (
              <>
                <Link href="/dashboard" className="btn btn--gold btn--block" tabIndex={open ? 0 : -1}>
                  My dashboard
                </Link>
                <button type="button" className="btn btn--outline-gold btn--block" onClick={signOut} tabIndex={open ? 0 : -1}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn--gold btn--block" tabIndex={open ? 0 : -1}>
                Sign in with Google
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
