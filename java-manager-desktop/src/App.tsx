import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { getEnvStatus } from "./lib/api";
import type { EnvStatus } from "./lib/types";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ToastContainer } from "./components/Toast";
import { Dashboard } from "./pages/Dashboard";
import { Versions } from "./pages/Versions";
import { Scan } from "./pages/Scan";
import { Doctor } from "./pages/Doctor";
import { Settings } from "./pages/Settings";

export function App() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      setEnvStatus(await getEnvStatus());
    } catch {
      // silent — top bar just shows no status
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 15_000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <div className="flex h-screen overflow-hidden text-[var(--ink)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 bg-transparent">
        <TopBar envStatus={envStatus} onRefresh={refreshStatus} refreshing={refreshing} />
        <main className="flex-1 overflow-hidden flex flex-col bg-transparent">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/versions" element={<Versions />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
