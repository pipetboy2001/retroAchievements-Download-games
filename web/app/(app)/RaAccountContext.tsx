"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
// Riesgo aceptado (CodeQL "Clear text storage of sensitive information"):
// guardamos la Web API Key de RA en localStorage, igual que el carrito, para
// no pedirla en cada visita. Nunca sale del navegador salvo hacia nuestro
// propio backend (ver /api/want_to_play) -- decisión explícita del usuario,
// no un descuido.
const STORAGE_KEY = "ra-downloader-account";

export function RaAccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<RaAccount | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (account) localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    else localStorage.removeItem(STORAGE_KEY);
  }, [account]);

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
