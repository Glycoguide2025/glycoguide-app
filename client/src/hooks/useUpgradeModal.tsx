import { createContext, useContext, useState, ReactNode } from "react";

type Need = "pro" | "premium";
type Ctx = {
  open: (need: Need) => void;
  close: () => void;
  isOpen: boolean;
  need: Need | null;
};

const UpgradeCtx = createContext<Ctx | null>(null);

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [need, setNeed] = useState<Need | null>(null);
  const open = (n: Need) => { setNeed(n); setOpen(true); };
  const close = () => { setOpen(false); setNeed(null); };
  return (
    <UpgradeCtx.Provider value={{ open, close, isOpen, need }}>
      {children}
    </UpgradeCtx.Provider>
  );
}

export function useUpgradeModal() {
  const ctx = useContext(UpgradeCtx);
  if (!ctx) throw new Error("useUpgradeModal must be used within <UpgradeProvider/>");
  return ctx;
}