import { useState } from "react";
import { CheckCircle, PackagePlus, ScanSearch, Sparkles } from "lucide-react";
import { addAllDiscovered, addDiscoveredJdk, scanJdks } from "../lib/api";
import type { DiscoveredJdk, ScanResult } from "../lib/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useToast } from "../context/ToastContext";
import clsx from "clsx";

export function Scan() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [addingAll, setAddingAll] = useState(false);
  const [addedPaths, setAddedPaths] = useState<Set<string>>(new Set());
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    setAddedPaths(new Set());
    try {
      const r = await scanJdks();
      setResult(r);
      if (r.found.length === 0) showToast("info", "No JDKs found in common install locations.");
    } catch (e) { showToast("error", String(e)); }
    finally { setScanning(false); }
  };

  const handleAddOne = async (jdk: DiscoveredJdk) => {
    setBusyPath(jdk.path);
    try {
      const alias = await addDiscoveredJdk(jdk.path, jdk.suggested_alias);
      setAddedPaths((prev) => new Set([...prev, jdk.path]));
      showToast("success", `Added as '${alias}'`);
    } catch (e) { showToast("error", String(e)); }
    finally { setBusyPath(null); }
  };

  const handleAddAll = async () => {
    if (!result) return;
    const toAdd = result.found.filter((j) => !j.already_configured && !addedPaths.has(j.path));
    if (toAdd.length === 0) { showToast("info", "All discovered JDKs are already configured."); return; }
    setAddingAll(true);
    try {
      const added = await addAllDiscovered(toAdd);
      setAddedPaths((prev) => { const n = new Set(prev); toAdd.forEach((j) => n.add(j.path)); return n; });
      showToast("success", `Added ${added.length} JDK(s): ${added.join(", ")}`);
    } catch (e) { showToast("error", String(e)); }
    finally { setAddingAll(false); }
  };

  const newCount = result ? result.found.filter((j) => !j.already_configured && !addedPaths.has(j.path)).length : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Scan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Discover installed JDKs on your system</p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">Auto-discover JDK installations</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
              Searches common install locations for your platform, plus JAVA_HOME when it is already set.
          </p>
        </div>
          <Button variant="primary" size="md" onClick={handleScan} loading={scanning} className="flex-shrink-0">
            <ScanSearch className="w-4 h-4" />
            {scanning ? "Scanning…" : "Scan Now"}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Found <span className="text-brand-600 dark:text-brand-400 font-bold">{result.found.length}</span> JDK{result.found.length !== 1 ? "s" : ""}
              {result.found.length > 0 && <span className="text-slate-400"> ({newCount} new)</span>}
            </p>
            {newCount > 0 && (
              <Button variant="primary" size="sm" onClick={handleAddAll} loading={addingAll}>
                <Sparkles className="w-4 h-4" /> Add All New ({newCount})
              </Button>
            )}
          </div>

          {result.found.length === 0 ? (
            <Card className="text-center py-10">
              <ScanSearch className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No JDKs found</p>
              <p className="text-sm text-slate-400 mt-1">Try adding a JDK manually using the Versions page.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {result.found.map((jdk) => (
                <DiscoveredCard
                  key={jdk.path}
                  jdk={jdk}
                  isAdded={addedPaths.has(jdk.path)}
                  busy={busyPath === jdk.path}
                  onAdd={() => handleAddOne(jdk)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !scanning && (
        <Card className="text-center py-12">
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ScanSearch className="w-7 h-7 text-brand-500" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">Ready to scan</p>
          <p className="text-sm text-slate-500">Click "Scan Now" to find all JDKs installed on this machine.</p>
        </Card>
      )}
    </div>
  );
}

function DiscoveredCard({ jdk, isAdded, busy, onAdd }: {
  jdk: DiscoveredJdk; isAdded: boolean; busy: boolean; onAdd: () => void;
}) {
  const isConfigured = jdk.already_configured || isAdded;
  return (
    <Card padding="sm" className={clsx("transition-colors", isConfigured && "opacity-70")}>
      <div className="flex items-center gap-3">
        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isConfigured ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-brand-50 dark:bg-brand-900/30")}>
          {isConfigured
            ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            : <PackagePlus className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono truncate">{jdk.path}</span>
            {isConfigured
              ? <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{isAdded ? "Just added" : "Already configured"}</span>
              : <span className="text-xs text-slate-400 dark:text-slate-500">Suggested alias: <code>{jdk.suggested_alias}</code></span>}
          </div>
          {(jdk.vendor || jdk.detected_version) && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{jdk.vendor} {jdk.detected_version}</p>
          )}
        </div>
        {!isConfigured && <Button variant="secondary" size="sm" onClick={onAdd} loading={busy}>Add</Button>}
      </div>
    </Card>
  );
}
