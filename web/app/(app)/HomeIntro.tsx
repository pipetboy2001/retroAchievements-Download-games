"use client";

import { useLocale } from "./useLocale";

export default function HomeIntro() {
  const { t } = useLocale();
  return (
    <div className="home-intro">
      <h1>{t("home.heading")}</h1>
      <p>{t("home.tagline")}</p>
    </div>
  );
}
