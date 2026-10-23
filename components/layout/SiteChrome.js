"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Auth screens and dashboards bring their own frame, so the storefront navbar and footer step aside.
const BARE_ROUTES = ["/auth", "/dashboard"];

export default function SiteChrome({ footer, children }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname.startsWith(r));
  return (
    <>
      {!bare && <Navbar />}
      <main id="main">{children}</main>
      {!bare && footer}
    </>
  );
}
