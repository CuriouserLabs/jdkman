import { useState } from "react";
import {
  Activity,
  AlertTriangle as TriangleAlert,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { runDiagnostics } from "../lib/api";
import type { DiagnosticCheck, DiagnosticResult } from "../lib/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useToast } from "../context/ToastContext";
import clsx from "clsx";

export function Doctor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const { showToast } = useToast();

  const run = async () => {
    setLoading(true);
    try { setResult(await runDiagnostics()); }
    catch (e) { showToast("error", String(e)); }
    finally { setLoading(false); }
  };

  const okCount = result?.checks.filter((c) => c.status === "Ok").length ?? 0;
  const warnCount = result?.checks.filter((c) => c.status === "Warning").length ?? 0;
  const errCount = result?.checks.filter((c) => c.status === "Error").length ?? 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Diagnostics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Check the health of your Java environment</p>
        </div>
        <Button variant="primary" size="sm" onClick={run} loading={loading}>
          <RefreshCw className="w-4 h-4" />
          {result ? "Re-run" : "Run Diagnostics"}
        </Button>
      </div>

      {result && (
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard count={okCount} label="Passed" variant="ok" />
          <SummaryCard count={warnCount} label="Warnings" variant="warning" />
          <SummaryCard count={errCount} label="Errors" variant="error" />
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse" padding="sm">
              <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-2">
          {result.checks.map((check, i) => <CheckCard key={i} check={check} />)}
        </div>
      )}

      {!result && !loading && (
        <Card className="text-center py-14">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-7 h-7 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">Ready to diagnose</p>
          <p className="text-sm text-slate-500 mb-4">Click "Run Diagnostics" to check your Java environment health.</p>
          <Button variant="primary" size="sm" onClick={run}>
            <Activity className="w-4 h-4" /> Run Diagnostics
          </Button>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ count, label, variant }: { count: number; label: string; variant: "ok" | "warning" | "error" }) {
  const styles = {
    ok: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  };
  const textStyles = {
    ok: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    error: "text-red-700 dark:text-red-300",
  };
  return (
    <div className={clsx("rounded-xl border p-4 text-center", styles[variant])}>
      <p className={clsx("text-3xl font-bold", textStyles[variant])}>{count}</p>
      <p className={clsx("text-sm font-medium mt-0.5", textStyles[variant])}>{label}</p>
    </div>
  );
}

function CheckCard({ check }: { check: DiagnosticCheck }) {
  const [expanded, setExpanded] = useState(false);

  const icon = {
    Ok: <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    Warning: <TriangleAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    Error: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
  }[check.status];

  const borderColor = {
    Ok: "border-l-emerald-500",
    Warning: "border-l-amber-500",
    Error: "border-l-red-500",
  }[check.status];

  return (
    <Card padding="sm"
      className={clsx("border-l-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors", borderColor)}
      onClick={() => check.suggestion && setExpanded((e) => !e)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{check.name}</span>
            {check.suggestion && (
              <ChevronRight className={clsx("w-4 h-4 text-slate-400 flex-shrink-0 transition-transform", expanded && "rotate-90")} />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{check.message}</p>
          {expanded && check.suggestion && (
            <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">{check.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
