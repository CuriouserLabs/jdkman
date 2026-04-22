import { Moon, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { StatusBadge } from "./StatusBadge";
import type { EnvStatus } from "../lib/types";

interface TopBarProps {
  envStatus: EnvStatus | null;
  onRefresh: () => void;
  refreshing: boolean;
}

export function TopBar({ envStatus, onRefresh, refreshing }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  const healthStatus = (() => {
    if (!envStatus) return "inactive";
    if (!envStatus.java_home) return "error";
    if (!envStatus.java_home_valid) return "error";
    if (!envStatus.java_in_path) return "warning";
    return "ok";
  })() as "ok" | "warning" | "error" | "inactive";

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60">
      <div className="flex items-center gap-3">
        <StatusBadge status={healthStatus} />
        {envStatus?.current_alias ? (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Active:{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
              {envStatus.current_alias}
            </span>
          </span>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500">
            No version selected
          </span>
        )}
        {envStatus?.java_home && (
          <span className="hidden lg:block text-xs text-slate-400 font-mono truncate max-w-xs">
            {envStatus.java_home}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
