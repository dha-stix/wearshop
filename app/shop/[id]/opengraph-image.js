import { ImageResponse } from "next/og";
import { COLORS, getShareProduct, loadFonts, OG_SIZE, photoAsPng, siteHost, watchMark } from "@/lib/server/share";
import { formatMoney, getCategory } from "@/lib/config";

// Link preview for a single watch: its cover photo beside the name and price.
export const alt = "A watch from WearShop";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }) {
  const { id } = await params;
  const product = await getShareProduct(id);
  const fonts = await loadFonts();
  const photo = product ? await photoAsPng(product.images?.[0]?.url) : null;
  const specs = product ? [product.caseSize && `${product.caseSize}MM`, product.movement, product.strap].filter(Boolean).join(" · ").toUpperCase() : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: COLORS.black, color: COLORS.ivory }}>
        <div style={{ width: 630, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: "#151412" }}>
          <img src={photo || watchMark(360)} width={photo ? 630 : 360} height={photo ? 630 : 360} alt="" style={{ objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px 52px", borderLeft: `2px solid ${COLORS.gold}` }}>
          <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 34, letterSpacing: 8 }}>
            <span>WEAR</span>
            <span style={{ color: COLORS.gold }}>SHOP</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 4, color: COLORS.gold }}>
              {(getCategory(product?.category)?.name || "Luxury watches").toUpperCase()}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: product?.name?.length > 18 ? 62 : 74, lineHeight: 0.95, textTransform: "uppercase" }}>
              {product?.name || "Curated luxury timepieces"}
            </div>
            {specs && <div style={{ display: "flex", marginTop: 18, fontFamily: "JetBrains Mono", fontSize: 17, letterSpacing: 2, color: COLORS.muted }}>{specs}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {product && (
              <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 58, color: COLORS.gold }}>
                {/* Currency symbol in the font that has it, digits in the brand font. */}
                <span style={{ fontFamily: "Naira", fontSize: 52, marginRight: 4 }}>{formatMoney(product.price).replace(/[\d.,\s]/g, "")}</span>
                <span>{formatMoney(product.price).replace(/^[^\d]+/, "")}</span>
              </div>
            )}
            <div style={{ display: "flex", marginTop: 8, fontFamily: "JetBrains Mono", fontSize: 17, color: COLORS.muted }}>
              {product && product.stock > 0 ? "In stock · " : ""}
              {siteHost()}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
