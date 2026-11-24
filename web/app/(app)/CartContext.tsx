"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  consoles: string[];
  image_icon: string | null;
  achievements: number | null;
  hash: string;
  rom_path: string;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ra-downloader-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  // Arranca vacío y lee localStorage después de montar: si lo leyera en el primer render,
  // el contador del topbar no coincidiría con el HTML del servidor (error de hidratación).
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage (sistema externo) una vez al montar
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // carrito corrupto en storage: se ignora y queda vacío
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    // Sin este guard, el primer efecto pisaría el carrito guardado con [] antes de cargarlo.
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function add(item: CartItem) {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clear() {
    setItems([]);
  }

  function has(id: string) {
    return items.some((i) => i.id === id);
  }

  return <CartContext.Provider value={{ items, add, remove, clear, has }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
