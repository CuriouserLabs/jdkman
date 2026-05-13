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
    text: "text-emerald-800 bg-emerald-50/90 border border-emerald-200/70 dark:text-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/40",
    label: "Healthy",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-800 bg-amber-50/90 border border-amber-200/70 dark:text-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40",
    label: "Warning",
  },
  error: {
    dot: "bg-red-500",
    text: "text-red-800 bg-red-50/90 border border-red-200/70 dark:text-red-200 dark:bg-red-900/20 dark:border-red-700/40",
    label: "Error",
  },
  inactive: {
    dot: "bg-[var(--muted-soft)]",
    text: "text-[var(--muted)] bg-white/60 border border-[color:var(--panel-border)] dark:bg-white/6 dark:text-slate-300",
    label: "Inactive",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const cfg = config[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
        cfg.text,
        className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {label ?? cfg.label}
    </span>
  );
}
