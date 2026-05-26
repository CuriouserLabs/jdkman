import {
  Activity,
  LayoutDashboard,
  List,
  ScanSearch,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import appLogo from "../assets/app-logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/versions", icon: List, label: "Versions" },
  { to: "/scan", icon: ScanSearch, label: "Scan" },
  { to: "/doctor", icon: Activity, label: "Diagnostics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col app-shell-dark text-white h-full relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute -left-12 top-8 h-40 w-40 rounded-full bg-[rgba(232,120,48,0.16)] blur-3xl" />
        <div className="absolute right-0 top-28 h-48 w-48 rounded-full bg-[rgba(13,122,104,0.18)] blur-3xl" />
      </div>
      <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/8 ring-1 ring-white/12 shadow-[0_10px_24px_rgba(0,0,0,0.18)] flex items-center justify-center flex-shrink-0">
          <img src={appLogo} alt="JDK Manager" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight tracking-wide">JDK Manager</div>
          <div className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--brand-soft)]">Desktop v0.1.0</div>
        </div>
      </div>

      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-white/56 hover:text-white hover:bg-white/6"
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="relative px-5 py-4 border-t border-white/8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-white/35">Cross-platform Java version manager</p>
      </div>
    </aside>
  );
}
