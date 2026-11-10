"use client";

import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { wtpFoundCount } from "./i18n";
import { UserIcon } from "./icons";
import { useLocale } from "./useLocale";
import { useRaAccount } from "./RaAccountContext";
import { fetchWantToPlay } from "./wantToPlay";

export default function RaAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useLocale();
  const { account, connect, disconnect } = useRaAccount();
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchWantToPlay(apiKey.trim(), username.trim());
      if (data.success) {
        connect(username.trim(), apiKey.trim());
        setSuccessMessage(wtpFoundCount(data.total ?? 0, data.requested ?? 0, locale));
        setApiKey("");
        setUsername("");
      } else {
        setError(data.message || t("ra.connectError"));
      }
    } catch {
      setError(t("ra.connectError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o: boolean) => {
        if (!o) {
          setError("");
          setSuccessMessage("");
          onClose();
        }
      }}
    >
      <DialogContent className="modal-panel" style={{ maxWidth: 420 }} showCloseButton={false}>
        <div className="modal-head">
          <DialogTitle>{t("ra.title")}</DialogTitle>
          <DialogClose className="modal-close" aria-label={t("common.close")}>
            &times;
          </DialogClose>
        </div>
        <div className="modal-body">
          {account ? (
            <div className="ra-account-connected">
              <div className="ra-account-avatar">
                <UserIcon size={20} />
              </div>
              <div className="ra-account-name">
                {t("ra.connectedAs")} <strong>{account.username}</strong>
              </div>
              {successMessage && <p className="ra-account-hint">{successMessage}</p>}
              <button type="button" className="btn-ghost" onClick={disconnect}>
                {t("ra.disconnect")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{t("ra.body")}</p>

              <div className="gcard-field">
                <label htmlFor="ra-api-key">{t("ra.apiKeyLabel")}</label>
                <input
                  id="ra-api-key"
                  className="gcard-select"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t("ra.apiKeyPlaceholder")}
                  required
                />
              </div>

              <div className="gcard-field">
                <label htmlFor="ra-username">{t("ra.usernameLabel")}</label>
                <input
                  id="ra-username"
                  className="gcard-select"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("ra.usernamePlaceholder")}
                  required
                />
              </div>

              <p style={{ margin: 0, fontSize: 11, color: "var(--faint)" }}>
                {t("ra.getApiKeyHint")}
                <a
                  href="https://retroachievements.org/controlpanel.php"
                  target="_blank"
                  rel="noopener"
                  style={{ color: "var(--link)" }}
                >
                  {t("ra.getApiKeyLink")}
                </a>
              </p>

              {error && <p className="empty-hint">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: "flex-start" }}>
                {loading ? t("ra.connecting") : t("ra.connect")}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
