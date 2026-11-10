"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface RaAccount {
  username: string;
  apiKey: string;
}

interface RaAccountContextValue {
  account: RaAccount | null;
  connect: (username: string, apiKey: string) => void;
  disconnect: () => void;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const RaAccountContext = createContext<RaAccountContextValue | null>(null);

export function RaAccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<RaAccount | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function connect(username: string, apiKey: string) {
    setAccount({ username, apiKey });
  }

  function disconnect() {
    setAccount(null);
  }

  return (
    <RaAccountContext.Provider
      value={{
        account,
        connect,
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
