import { useEffect, useState } from "react";
import { ExternalLink, FileJson, FolderOpen, Info, Settings as SettingsIcon } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { addJdk, getConfigDir, getConfigPath, getEnvStatus, importJavaHome } from "../lib/api";
import { Card, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { useToast } from "../context/ToastContext";

export function Settings() {
  const [configPath, setConfigPath] = useState("");
  const [configDir, setConfigDir] = useState("");
  const [isElevated, setIsElevated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cp, cd, envStatus] = await Promise.all([getConfigPath(), getConfigDir(), getEnvStatus()]);
        setConfigPath(cp);
        setConfigDir(cd);
        setIsElevated(envStatus.is_elevated);
      } catch (e) { showToast("error", String(e)); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openPath = async (path: string) => {
    try { await open(path); } catch { showToast("error", "Could not open path"); }
  };

  const handleImportJavaHome = async () => {
    setImporting(true);
    try {
      const result = await importJavaHome();
      if (!result) { showToast("info", "No valid JAVA_HOME found in the current environment."); return; }
      const [alias, path] = result;
      await addJdk(alias, path);
      showToast("success", `Imported JAVA_HOME as '${alias}' (${path})`);
    } catch (e) { showToast("error", String(e)); }
    finally { setImporting(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configuration and app information</p>
      </div>

      {!loading && !isElevated && (
        <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Administrator mode is off</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                JDK Manager can still update your user environment, but system-wide HKLM JAVA_HOME and PATH changes require reopening the app as Administrator.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Config File</h2>
          </div>
        </CardHeader>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Config file</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                  {configPath}
                </code>
                <Button variant="ghost" size="sm" onClick={() => openPath(configDir)} title="Open config folder">
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => openPath(configPath)}>
                <ExternalLink className="w-4 h-4" /> Open Config File
              </Button>
              <Button variant="secondary" size="sm" onClick={() => openPath(configDir)}>
                <FolderOpen className="w-4 h-4" /> Open Config Folder
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Import</h2>
          </div>
        </CardHeader>
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">Import existing JAVA_HOME</p>
          <p className="text-xs text-slate-500 mb-3">
            If JAVA_HOME is already set in your user environment, import it as a managed alias.
          </p>
          <Button variant="secondary" size="sm" onClick={handleImportJavaHome} loading={importing}>
            Import JAVA_HOME
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">About</h2>
          </div>
        </CardHeader>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>App version</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>Platform</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">Windows</span>
          </div>
          <div className="flex justify-between">
            <span>Built with</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">Rust + Tauri + React</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">How it works</h2>
          </div>
        </CardHeader>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-brand-500 font-bold mt-0.5">1.</span>
            Changes are written to your <strong>user environment</strong> (HKCU\Environment), not system-wide.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-500 font-bold mt-0.5">2.</span>
            A <code>WM_SETTINGCHANGE</code> broadcast notifies new processes immediately.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-500 font-bold mt-0.5">3.</span>
            Already-open terminals won't reflect the change — open a new one.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-500 font-bold mt-0.5">4.</span>
            Use <code>jdkman export-shell &lt;alias&gt;</code> to apply inline in the current terminal.
          </li>
        </ul>
      </Card>
    </div>
  );
}
