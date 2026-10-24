// Helpers for link previews (Open Graph / Twitter cards): brand fonts, product lookup and
// photo conversion. Used by the opengraph-image routes and generateMetadata.
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { adminDb } from "./firebase-admin";

export const OG_SIZE = { width: 1200, height: 630 };

export const COLORS = { black: "#0E0E0F", ivory: "#F6F2EA", gold: "#C9A45C", goldPale: "#E8D5A6", muted: "#B9B0A0", line: "#2A2620" };

const FONT_DIR = path.join(process.cwd(), "assets/fonts");

// Satori (next/og) needs raw TTF data for every font it draws with.
export async function loadFonts() {
  const [bold, medium, serif, mono, naira] = await Promise.all(
    ["BarlowCondensed-Bold", "BarlowCondensed-Medium", "BodoniModa-Italic", "JetBrainsMono-Medium", "RobotoCondensed-Bold-Naira"].map((f) =>
      readFile(path.join(FONT_DIR, `${f}.ttf`))
    )
  );
  return [
    { name: "Barlow Condensed", data: bold, weight: 700, style: "normal" },
    { name: "Barlow Condensed", data: medium, weight: 500, style: "normal" },
    { name: "Bodoni Moda", data: serif, weight: 500, style: "italic" },
    { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
    // The brand fonts have no ₦ glyph; this tiny subset supplies just that character.
    { name: "Naira", data: naira, weight: 700, style: "normal" },
  ];
}

// A live product for sharing, or null (drafts and missing products get the default preview).
export async function getShareProduct(id) {
  try {
    const snap = await adminDb().collection("products").doc(id).get();
    if (!snap.exists || snap.data().status !== "live") return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("share: product lookup failed", err.message);
    return null;
  }
}

// Downloads a product photo and returns it as a square PNG data URL (Satori can't read WebP).
export async function photoAsPng(url, size = 630) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(size, size, { fit: "cover" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    console.error("share: photo conversion failed", err.message);
    return null;
  }
}

// Gold-on-black watch face drawn as SVG, used on the default preview card.
export function watchMark(size = 260) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const long = i % 3 === 0;
    return `<line x1="110" y1="28" x2="110" y2="${long ? 44 : 37}" transform="rotate(${i * 30} 110 110)"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 220 220">
    <circle cx="110" cy="110" r="104" fill="none" stroke="${COLORS.gold}" stroke-width="2"/>
    <circle cx="110" cy="110" r="90" fill="none" stroke="${COLORS.gold}" stroke-width="0.8" opacity="0.6"/>
    <g stroke="${COLORS.gold}" stroke-width="3">${ticks}</g>
    <line x1="110" y1="116" x2="110" y2="66" stroke="${COLORS.ivory}" stroke-width="5" stroke-linecap="round" transform="rotate(305 110 110)"/>
    <line x1="110" y1="118" x2="110" y2="44" stroke="${COLORS.gold}" stroke-width="3" stroke-linecap="round" transform="rotate(60 110 110)"/>
    <circle cx="110" cy="110" r="5" fill="${COLORS.gold}"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export const siteHost = () => new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wearshop-eosin.vercel.app").host;
