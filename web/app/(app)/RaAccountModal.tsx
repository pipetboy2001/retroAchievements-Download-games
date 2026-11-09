"use client";

import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { UserIcon } from "./icons";
import { useLocale } from "./useLocale";

export default function RaAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="modal-panel" style={{ maxWidth: 420 }} showCloseButton={false}>
        <div className="modal-head">
          <DialogTitle>{t("ra.title")}</DialogTitle>
          <DialogClose className="modal-close" aria-label={t("common.close")}>
            &times;
          </DialogClose>
        </div>
        <div className="modal-body">
          <div className="soon-panel">
            <UserIcon size={32} />
            <h3>{t("common.soon")}</h3>
            <p>{t("ra.body")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
