import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Endpoints JSON/redirect de Flask: sin valor para un buscador, y /dl dispara descargas.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dl", "/search", "/get_game_versions"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
