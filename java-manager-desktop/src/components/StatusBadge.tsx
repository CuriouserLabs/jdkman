import clsx from "clsx";

type Status = "ok" | "warning" | "error" | "inactive";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

const config: Record<Status, { dot: string; text: string; label: string }> = {
  ok: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30",
    label: "Healthy",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30",
    label: "Warning",
  },
  error: {
    dot: "bg-red-500",
    text: "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30",
    label: "Error",
  },
  inactive: {
    dot: "bg-slate-400",
    text: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
    label: "Inactive",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const cfg = config[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        cfg.text,
        className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {label ?? cfg.label}
    </span>
  );
}
