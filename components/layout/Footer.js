import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { CATEGORIES } from "@/lib/config";
import ReplayIntroButton from "@/components/home/ReplayIntroButton";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Logo dark size={28} />
          <p>Luxury wristwatches, curated and delivered.</p>
        </div>
        <div className="footer__cols">
          <div>
            <span className="footer__head">Shop</span>
            <Link href="/shop">All watches</Link>
            {CATEGORIES.slice(0, 4).map((c) => (
              <Link key={c.id} href={`/shop?category=${c.id}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div>
            <span className="footer__head">Account</span>
            <Link href="/auth/login">Sign in</Link>
            <Link href="/dashboard/orders">My orders</Link>
            <Link href="/cart">Cart</Link>
          </div>
          {SUPPORT_EMAIL && (
            <div>
              <span className="footer__head">Support</span>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </div>
          )}
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} WearShop</span>
        <ReplayIntroButton />
        <span>Payments secured by Bachs</span>
        <span className="footer__credit">
          Built by{" "}
          <a href="https://www.linkedin.com/in/david-asaolu234/" target="_blank" rel="noopener noreferrer">
            David Asaolu
          </a>
        </span>
      </div>
    </footer>
  );
}
