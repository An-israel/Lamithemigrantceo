"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

export interface CartLine {
  id: string; // wholesale product id
  slug: string;
  name: string;
  price_gbp: number;
  image: string | null;
  stock: number;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQuantity: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gbg-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration so we don't clobber storage with []).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage may be unavailable (private mode) — cart just won't persist
    }
  }, [lines, hydrated]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.id === line.id);
        if (existing) {
          return prev.map((l) =>
            l.id === line.id
              ? { ...l, quantity: Math.min(l.quantity + qty, l.stock) }
              : l
          );
        }
        return [...prev, { ...line, quantity: Math.min(qty, line.stock) }];
      });
      setOpen(true);
    },
    []
  );

  const setQuantity = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) =>
            l.id === id ? { ...l, quantity: Math.min(qty, l.stock) } : l
          )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((n, l) => n + l.quantity * l.price_gbp, 0);
    return { lines, count, subtotal, open, setOpen, add, setQuantity, remove, clear };
  }, [lines, open, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
