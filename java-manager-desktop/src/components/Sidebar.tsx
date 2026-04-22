import {
  Activity,
  Coffee,
  LayoutDashboard,
  List,
  ScanSearch,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/versions", icon: List, label: "Versions" },
  { to: "/scan", icon: ScanSearch, label: "Scan" },
  { to: "/doctor", icon: Activity, label: "Diagnostics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-slate-900 dark:bg-slate-950 h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Coffee className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">JDK Manager</div>
          <div className="text-slate-400 text-xs">v0.1.0</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">Windows Java version manager</p>
      </div>
    </aside>
  );
}
