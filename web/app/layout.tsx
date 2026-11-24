import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "./site";

const title = `${SITE_NAME} — ROMs compatibles con RetroAchievements`;
const description =
  "ROMs verificadas por hash contra RetroAchievements, para que los logros (cheevos) funcionen. Buscá por nombre o hash y descargá desde archive.org.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s · ${SITE_NAME}` },
  description,
  openGraph: {
    title,
    description,
    siteName: SITE_NAME,
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// Le dice a Google el nombre del sitio; alternateName cubre errores de tipeo y el nombre viejo.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: ["CheevoRoms", "Cheevos Roms", "RA Downloader"],
  url: `${SITE_URL}/`,
  description,
  inLanguage: ["es", "en", "pt", "fr"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
