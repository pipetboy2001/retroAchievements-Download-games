import type { Metadata } from "next";
import { Suspense } from "react";
import GamesView from "./GamesView";
import HomeIntro from "./HomeIntro";

// Las búsquedas (/?q=mario) consolidan en la home: Google no quiere páginas de resultados internos indexadas.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      {/* Fuera del Suspense a propósito: GamesView usa useSearchParams y no se pre-renderiza, esto sí llega en el HTML. */}
      <HomeIntro />
      <Suspense fallback={null}>
        <GamesView />
      </Suspense>
    </>
  );
}
