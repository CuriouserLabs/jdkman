import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useToast } from "../context/ToastContext";
import type { Toast as ToastType } from "../lib/types";
import clsx from "clsx";

const icons: Record<ToastType["type"], React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-brand-500" />,
};

const borderColors: Record<ToastType["type"], string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-brand-500",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto flex items-start gap-3 app-paper-strong",
            "border-l-4 rounded-2xl px-4 py-3 w-80 max-w-sm",
            "animate-in slide-in-from-right fade-in duration-200",
            borderColors[toast.type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <p className="flex-1 text-sm text-[var(--ink-soft)] leading-relaxed">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
