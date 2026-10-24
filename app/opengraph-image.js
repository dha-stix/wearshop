import { ImageResponse } from "next/og";
import { COLORS, loadFonts, OG_SIZE, siteHost, watchMark } from "@/lib/server/share";

// Default link preview for every page that doesn't set its own (home, shop, collections…).
export const alt = "WearShop: luxury wristwatches, curated and delivered";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: COLORS.black, color: COLORS.ivory, position: "relative" }}>
        {/* Gold tick ring bleeding off the right edge */}
        <div
          style={{
            position: "absolute",
            right: -150,
            top: -60,
            width: 750,
            height: 750,
            borderRadius: 375,
            border: `2px solid ${COLORS.line}`,
            display: "flex",
          }}
        />
        <div style={{ position: "absolute", right: 70, top: 125, display: "flex" }}>
          <img src={watchMark(380)} width={380} height={380} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 80px", width: 760 }}>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 22, letterSpacing: 6, color: COLORS.gold }}>
            CURATED LUXURY TIMEPIECES
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 132, letterSpacing: 14, lineHeight: 1 }}>
              <span>WEAR</span>
              <span style={{ color: COLORS.gold }}>SHOP</span>
            </div>
            <div style={{ display: "flex", marginTop: 26, fontFamily: "Bodoni Moda", fontStyle: "italic", fontSize: 40, lineHeight: 1.25, color: COLORS.goldPale }}>
              Precision, heritage, and the quiet confidence of a man who owns his time.
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontSize: 20, letterSpacing: 3, color: COLORS.muted }}>
            <span>AUTOMATIC · CHRONOGRAPH · DIVER · DRESS</span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 80, bottom: 64, display: "flex", fontFamily: "JetBrains Mono", fontSize: 20, color: COLORS.gold }}>
          {siteHost()}
        </div>
      </div>
    ),
    { ...size, fonts: await loadFonts() }
  );
}
