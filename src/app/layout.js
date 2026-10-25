import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "./theme.css";
import "./globals.css";

import { MusicProvider } from "@/context/MusicContext";
import GoldDust from "@/components/effects/GoldDust";
import MusicToggle from "@/components/music/MusicToggle";

// Used to build absolute URLs for the link-preview image. Set NEXT_PUBLIC_SITE_URL once you have your domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "For Kuyilu 🤍",
  description: "A little something, just for you.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "For Kuyilu 🤍",
    description: "A little something, just for you.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/images/og-image.jpg"] },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink antialiased">
        <MusicProvider>
          <GoldDust />
          <MusicToggle />
          {children}
        </MusicProvider>
      </body>
    </html>
  );
}
