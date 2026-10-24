import Script from "next/script";
import { Barlow, Barlow_Condensed, Bodoni_Moda, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/providers/Providers";
import SiteChrome from "@/components/layout/SiteChrome";
import Footer from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/config";
import logoMark from "@/images/logo-mark.svg";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/animations.css";
import "@/styles/components.css";
import "@/styles/layout.css";
import "@/styles/home.css";
import "@/styles/shop.css";
import "@/styles/auth.css";
import "@/styles/dashboard.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-barlow" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow-condensed" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], style: ["italic"], weight: ["500"], variable: "--font-bodoni" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

const DESCRIPTION =
  "Curated automatic, chronograph, diver and dress watches for men. Pay securely in Naira with Bachs and track every step of delivery.";

// Site-wide link-preview tags. Every page inherits these; app/opengraph-image.js supplies the default
// preview picture, and product pages override title, description and image with their own.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "WearShop",
  title: { default: "WearShop — Luxury wristwatches", template: "%s · WearShop" },
  description: DESCRIPTION,
  keywords: ["luxury watches", "wristwatches", "men's watches", "automatic watch", "chronograph", "diver watch", "Nigeria", "WearShop"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "WearShop",
    locale: "en_NG",
    url: "/",
    title: "WearShop — Luxury wristwatches",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "WearShop — Luxury wristwatches", description: DESCRIPTION },
  icons: { icon: logoMark.src, apple: logoMark.src },
};

export const viewport = {
  themeColor: "#0E0E0F",
};

// Runs before the first paint so a first-time visitor to "/" sees the black intro straight away,
// instead of the page flashing and then being covered once React loads.
const INTRO_GATE = `(function(){try{var d=document.documentElement,l=location;if(l.pathname!=="/")return;
var replay=new URLSearchParams(l.search).get("intro")==="replay";
var seen=sessionStorage.getItem("wearshop-intro-seen")==="1";
var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(replay||(!seen&&!reduced))d.classList.add("intro-pending");}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} ${bodoni.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="intro-gate" strategy="beforeInteractive">
          {INTRO_GATE}
        </Script>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <SiteChrome footer={<Footer />}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
