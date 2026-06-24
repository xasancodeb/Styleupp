"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
interface ConfirmState {
  message: string;
  resolve: (ok: boolean) => void;
}

interface ToastApi {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const confirm = useCallback(
    (message: string) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ message, resolve });
      }),
    []
  );

  function resolveConfirm(ok: boolean) {
    confirmState?.resolve(ok);
    setConfirmState(null);
  }

  const colors: Record<ToastType, string> = {
    success: "#2f5d3a",
    error: "#b3261e",
    info: "var(--dark)",
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      <div
        aria-live="polite"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", gap: "0.6rem", maxWidth: 360 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-up"
            style={{
              background: "var(--card)",
              borderLeft: `4px solid ${colors[t.type]}`,
              borderRadius: "0.6rem",
              boxShadow: "0 8px 28px rgba(26,22,18,0.15)",
              padding: "0.85rem 1.1rem",
              fontSize: "0.92rem",
              color: "var(--dark)",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(26,22,18,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
          onClick={() => resolveConfirm(false)}
        >
          <div className="card" style={{ padding: "1.75rem", maxWidth: 420, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: "1rem", lineHeight: 1.5 }}>{confirmState.message}</p>
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button className="btn btn-outline" onClick={() => resolveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => resolveConfirm(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
