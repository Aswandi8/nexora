"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Toast,
  type ToastItem,
  type ToastVariant,
} from "@/components/ui/toast";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 4000,
    }: ToastInput) => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          description,
          variant,
        },
      ]);

      window.setTimeout(() => {
        dismiss(id);
      }, duration);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toast,
      dismiss,
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
