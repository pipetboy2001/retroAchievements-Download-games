"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { disconnectRaAccount, getRaStatus } from "./wantToPlay";

export interface RaAccount {
  username: string;
}

interface RaAccountContextValue {
  account: RaAccount | null;
  statusLoading: boolean;
  setConnected: (username: string) => void;
  disconnect: () => void;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const RaAccountContext = createContext<RaAccountContextValue | null>(null);

export function RaAccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<RaAccount | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // La API Key vive solo en una cookie HttpOnly del servidor (ver
  // /api/ra/connect) -- el browser nunca la tiene, así que al montar hay que
  // preguntarle al servidor si ya hay una sesión activa (en vez de leer algo
  // propio del cliente).
  useEffect(() => {
    getRaStatus()
      .then((data) => {
        if (data.connected && data.username) setAccount({ username: data.username });
      })
      .finally(() => setStatusLoading(false));
  }, []);

  function setConnected(username: string) {
    setAccount({ username });
  }

  function disconnect() {
    setAccount(null);
    void disconnectRaAccount();
  }

  return (
    <RaAccountContext.Provider
      value={{
        account,
        statusLoading,
        setConnected,
        disconnect,
        modalOpen,
        openModal: () => setModalOpen(true),
        closeModal: () => setModalOpen(false),
      }}
    >
      {children}
    </RaAccountContext.Provider>
  );
}

export function useRaAccount() {
  const ctx = useContext(RaAccountContext);
  if (!ctx) throw new Error("useRaAccount debe usarse dentro de RaAccountProvider");
  return ctx;
}
