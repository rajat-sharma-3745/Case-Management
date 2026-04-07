import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

export type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
