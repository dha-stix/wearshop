import Link from "next/link";

export default function Logo({ dark = false, size = 26 }) {
  return (
    <Link href="/" className={`logo ${dark ? "logo--dark" : ""}`} aria-label="WearShop home">
      <svg aria-hidden="true" width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="14" cy="14" r="11" />
        <path d="M14 7v7l5 3" />
      </svg>
      <span style={{ fontSize: size }}>
        WEAR<span className="logo__accent">SHOP</span>
      </span>
    </Link>
  );
}
