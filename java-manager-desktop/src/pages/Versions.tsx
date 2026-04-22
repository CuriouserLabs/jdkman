import { useEffect, useState } from "react";
import {
  CheckCircle,
  FolderOpen,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { open as openShell } from "@tauri-apps/plugin-shell";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import {
  addJdk,
  getSuggestedAlias,
  listVersions,
  probeJdkMetadata,
  removeJdk,
  useJdk,
  verifyJdk,
} from "../lib/api";
import type { JavaVersion, VerifyResult } from "../lib/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ConfirmModal } from "../components/ConfirmModal";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import clsx from "clsx";

export function Versions() {
  const [versions, setVersions] = useState<JavaVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAlias, setBusyAlias] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try { setVersions(await listVersions()); } catch (e) { showToast("error", String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUse = async (alias: string) => {
    setBusyAlias(alias);
    try {
      await useJdk(alias);
      showToast("success", `Switched to ${alias}. Open a new terminal for changes to take effect.`);
      await load();
    } catch (e) { showToast("error", String(e)); }
    finally { setBusyAlias(null); }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeJdk(removeTarget);
      showToast("success", `Removed ${removeTarget}`);
      setRemoveTarget(null);
      await load();
    } catch (e) { showToast("error", String(e)); }
  };

  const handleVerify = async (alias: string) => {
    setBusyAlias(alias);
    try { setVerifyResult(await verifyJdk(alias)); }
    catch (e) { showToast("error", String(e)); }
    finally { setBusyAlias(null); }
  };

  const openFolder = async (path: string) => {
    try { await openShell(path); } catch { showToast("error", "Could not open folder"); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Versions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {versions.length} JDK{versions.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={load} loading={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add JDK
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><div className="h-16 bg-slate-100 dark:bg-slate-700 rounded" /></Card>
          ))}
        </div>
      ) : versions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">No JDKs configured</p>
          <p className="text-sm text-slate-500 mb-4">Add a JDK path manually or use Scan to auto-discover</p>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add JDK
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <VersionCard
              key={v.alias}
              version={v}
              busy={busyAlias === v.alias}
              onUse={() => handleUse(v.alias)}
              onRemove={() => setRemoveTarget(v.alias)}
              onVerify={() => handleVerify(v.alias)}
              onOpenFolder={() => openFolder(v.path)}
            />
          ))}
        </div>
      )}

      {verifyResult && <VerifyModal result={verifyResult} onClose={() => setVerifyResult(null)} />}
      {showAdd && <AddJdkModal onClose={() => setShowAdd(false)} onAdded={async () => { setShowAdd(false); await load(); }} />}
      <ConfirmModal
        open={!!removeTarget}
        title={`Remove ${removeTarget}?`}
        message="This removes the alias from JDK Manager config. It does not uninstall the JDK from your system."
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function VersionCard({ version: v, busy, onUse, onRemove, onVerify, onOpenFolder }: {
  version: JavaVersion; busy: boolean;
  onUse: () => void; onRemove: () => void; onVerify: () => void; onOpenFolder: () => void;
}) {
  return (
    <Card className={clsx("transition-colors", v.is_current && "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900")}>
      <div className="flex items-center gap-4">
        <div className={clsx("w-2 h-2 rounded-full flex-shrink-0",
          v.is_current ? "bg-brand-500" : v.is_valid ? "bg-slate-300 dark:bg-slate-600" : "bg-red-500")} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{v.alias}</span>
            {v.is_current && <StatusBadge status="ok" label="Current" />}
            {!v.is_valid && <StatusBadge status="error" label="Invalid path" />}
            {v.detected_version && <span className="text-xs text-slate-500 dark:text-slate-400">Java {v.detected_version}</span>}
            {v.vendor && <span className="text-xs text-slate-400 dark:text-slate-500">{v.vendor}</span>}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">{v.path}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onOpenFolder} title="Open folder">
            <FolderOpen className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onVerify} loading={busy} title="Verify JDK">
            <ShieldCheck className="w-3.5 h-3.5" />
          </Button>
          {!v.is_current && (
            <Button variant="primary" size="sm" onClick={onUse} loading={busy}>
              <Zap className="w-3.5 h-3.5" /> Use
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRemove}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function VerifyModal({ result, onClose }: { result: VerifyResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Verify: {result.alias}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {result.path_valid
              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
              : <XCircle className="w-4 h-4 text-red-500" />}
            <span className="text-sm text-slate-700 dark:text-slate-200">Path {result.path_valid ? "is valid" : "is invalid"}</span>
          </div>
          {result.java_version_output && (
            <div>
              <p className="text-xs text-slate-500 mb-1">java -version:</p>
              <pre className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">{result.java_version_output}</pre>
            </div>
          )}
          {result.javac_version_output && (
            <div>
              <p className="text-xs text-slate-500 mb-1">javac -version:</p>
              <pre className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">{result.javac_version_output}</pre>
            </div>
          )}
          {!result.java_version_output && !result.javac_version_output && (
            <p className="text-sm text-slate-500">Could not run java -version</p>
          )}
        </div>
        <div className="flex justify-end mt-5">
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function AddJdkModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [path, setPath] = useState("");
  const [alias, setAlias] = useState("");
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [probeInfo, setProbeInfo] = useState<{ ver: string | null; vendor: string | null } | null>(null);
  const { showToast } = useToast();

  const browse = async () => {
    try {
      const selected = await openDialog({ directory: true, title: "Select JDK root folder" });
      if (typeof selected === "string") {
        setPath(selected);
        setError(null);
        setProbeInfo(null);
        await probePath(selected);
      }
    } catch (e) { showToast("error", String(e)); }
  };

  const probePath = async (p: string) => {
    if (!p.trim()) return;
    setProbing(true);
    setError(null);
    try {
      const [ver, vendor] = await probeJdkMetadata(p);
      setProbeInfo({ ver, vendor });
      const suggested = await getSuggestedAlias(p, ver ?? undefined);
      setAlias((prev) => prev || suggested);
    } catch (e) {
      setError(String(e));
      setProbeInfo(null);
    } finally { setProbing(false); }
  };

  const handleAdd = async () => {
    if (!path.trim() || !alias.trim()) return;
    setAdding(true);
    try {
      await addJdk(alias.trim(), path.trim());
      showToast("success", `Added ${alias.trim()} successfully`);
      onAdded();
    } catch (e) { showToast("error", String(e)); }
    finally { setAdding(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Add JDK</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">JDK Path</label>
            <div className="flex gap-2">
              <input type="text"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                placeholder={`C:\\Program Files\\Java\\jdk-21`}
                value={path}
                onChange={(e) => { setPath(e.target.value); setError(null); setProbeInfo(null); }}
                onBlur={() => probePath(path)}
              />
              <Button variant="secondary" size="sm" onClick={browse}>Browse</Button>
            </div>
          </div>
          {probing && <p className="text-xs text-slate-500 animate-pulse">Probing JDK…</p>}
          {probeInfo && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300">
                Valid JDK — {probeInfo.vendor ?? "Unknown"} {probeInfo.ver ?? ""}
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Alias</label>
            <input type="text"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              placeholder="java21"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Short name used with 'jdkman use'</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleAdd} loading={adding}
            disabled={!path.trim() || !alias.trim() || !!error}>
            Add JDK
          </Button>
        </div>
      </div>
    </div>
  );
}
