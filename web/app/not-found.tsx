"use client";

import Link from "next/link";
import { useLocale } from "./(app)/useLocale";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="notfound-page">
      <div className="code">404</div>
      <h1>{t("notfound.title")}</h1>
      <p>{t("notfound.body")}</p>
      <Link href="/" className="btn-primary" style={{ marginTop: 8 }}>
        {t("common.backHome")}
      </Link>
    </div>
  );
}
