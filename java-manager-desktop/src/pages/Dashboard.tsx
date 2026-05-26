import { useEffect, useState } from "react";
import {
  AlertTriangle as TriangleAlert,
  CheckCircle,
  Coffee,
  FolderOpen,
  Terminal,
  XCircle,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { getEnvStatus } from "../lib/api";
import type { EnvStatus } from "../lib/types";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { useToast } from "../context/ToastContext";

export function Dashboard() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setStatus(await getEnvStatus());
    } catch (e) {
      showToast("error", String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const overallStatus = (() => {
    if (!status) return "inactive";
    if (!status.java_home || !status.java_home_valid) return "error";
    if (!status.java_in_path) return "warning";
    return "ok";
  })() as "ok" | "warning" | "error" | "inactive";

  const openFolder = async (path: string) => {
    try {
      await open(path);
    } catch {
      showToast("error", "Could not open folder");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Coffee className="w-10 h-10 text-brand-500 mx-auto animate-pulse" />
          <p className="text-slate-500 text-sm">Loading environment status...</p>
        </div>
      </div>
    );
  }

  const borderColor =
    overallStatus === "ok"
      ? "#10b981"
      : overallStatus === "warning"
        ? "#f59e0b"
        : overallStatus === "error"
          ? "#ef4444"
          : "#94a3b8";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Current Java environment overview for {status?.platform ?? "your system"}
        </p>
      </div>

      {status && status.platform === "Windows" && !status.is_elevated && (
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                App is not running as Administrator
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                User environment updates will still work, but system-wide HKLM JAVA_HOME and PATH updates will be skipped until you reopen the app as Administrator.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-l-4" style={{ borderLeftColor: borderColor }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                overallStatus === "ok"
                  ? "bg-emerald-50 dark:bg-emerald-900/30"
                  : overallStatus === "warning"
                    ? "bg-amber-50 dark:bg-amber-900/30"
                    : overallStatus === "error"
                      ? "bg-red-50 dark:bg-red-900/30"
                      : "bg-slate-50 dark:bg-slate-800"
              }`}
            >
              {overallStatus === "ok" && <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              {overallStatus === "warning" && (
                <TriangleAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
              {overallStatus === "error" && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
              {overallStatus === "inactive" && <Coffee className="w-6 h-6 text-slate-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {status?.current_alias ? `Active: ${status.current_alias}` : "No version selected"}
                </h2>
                <StatusBadge status={overallStatus} />
              </div>
              {status?.java_home && (
                <p className="text-sm font-mono text-slate-500 dark:text-slate-400 truncate max-w-xl">
                  {status.java_home}
                </p>
              )}
            </div>
          </div>
          {status?.java_home && (
            <Button variant="ghost" size="sm" onClick={() => openFolder(status.java_home!)}>
              <FolderOpen className="w-4 h-4" /> Open
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-brand-100 dark:bg-brand-900/30 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">J</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">JAVA_HOME</span>
          </div>
          {status?.java_home ? (
            <div className="space-y-1">
              <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all leading-relaxed">
                {status.java_home}
              </p>
              {!status.java_home_valid && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-2">
                  <XCircle className="w-3 h-3" /> Path is not a valid JDK
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Not set
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">java in PATH</span>
          </div>
          {status?.java_in_path ? (
            <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">{status.java_in_path}</p>
          ) : (
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <TriangleAlert className="w-4 h-4" /> Not found in this session
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {status?.platform === "Windows"
                  ? "Open a new terminal to pick up env changes"
                  : "Run jdkman export-shell <alias> in your terminal to apply the selected alias"}
              </p>
            </div>
          )}
        </Card>
      </div>

      {status?.java_version_output && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">java -version output</span>
          </div>
          <pre className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-700">
            {status.java_version_output}
          </pre>
        </Card>
      )}

      {!status?.current_alias && (
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">No Java version selected</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Go to <strong>Versions</strong> to add JDKs, or use <strong>Scan</strong> to auto-discover, then click <strong>Use</strong>.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
