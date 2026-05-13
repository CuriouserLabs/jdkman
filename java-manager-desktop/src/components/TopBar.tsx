import { RefreshCw } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { EnvStatus } from "../lib/types";

interface TopBarProps {
  envStatus: EnvStatus | null;
  onRefresh: () => void;
  refreshing: boolean;
}

export function TopBar({ envStatus, onRefresh, refreshing }: TopBarProps) {
  const healthStatus = (() => {
    if (!envStatus) return "inactive";
    if (!envStatus.java_home) return "error";
    if (!envStatus.java_home_valid) return "error";
    if (!envStatus.java_in_path) return "warning";
    return "ok";
  })() as "ok" | "warning" | "error" | "inactive";

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-white/30 dark:bg-white/4 backdrop-blur-xl border-b border-[color:var(--panel-border)]">
      <div className="flex items-center gap-3">
        <StatusBadge status={healthStatus} />
        {envStatus?.current_alias ? (
          <span className="text-sm text-[var(--muted)]">
            Active:{" "}
            <span className="font-semibold text-[var(--ink)] font-mono">
              {envStatus.current_alias}
            </span>
          </span>
        ) : (
          <span className="text-sm text-[var(--muted-soft)]">
            No version selected
          </span>
        )}
        {envStatus?.java_home && (
          <span className="hidden lg:block text-xs text-[var(--muted-soft)] font-mono truncate max-w-xs">
            {envStatus.java_home}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/40 dark:hover:bg-white/8 transition-colors disabled:opacity-40"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}
