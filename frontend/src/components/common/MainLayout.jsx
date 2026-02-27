import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ScrollText,
  TrendingUp,
  Bell,
  Lightbulb,
  Settings,
  Menu,
  X,
  Wifi,
  WifiOff,
  Loader2,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { useMarketStore } from "@store/marketStore";
import clsx from "clsx";

// ================================
// Indian Market Intelligence Platform
// frontend/src/components/common/MainLayout.jsx
// ================================

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard",  short: "Dash"  },
  { to: "/policy",    icon: ScrollText,      label: "Policy",      short: "Policy" },
  { to: "/earnings",  icon: TrendingUp,      label: "Earnings",    short: "Corp"  },
  { to: "/alerts",    icon: Bell,            label: "Alerts",      short: "Alerts" },
  { to: "/insights",  icon: Lightbulb,       label: "AI Insights", short: "AI"    },
  { to: "/settings",  icon: Settings,        label: "Settings",    short: "Setup" },
];

// ---- Market Status Badge ----
function MarketStatusBadge({ status }) {
  const config = {
    open:     { label: "Market Open",    dot: "bg-emerald-400 animate-pulse", text: "text-emerald-400" },
    "pre-open": { label: "Pre-Open",     dot: "bg-amber-400 animate-pulse",   text: "text-amber-400"  },
    closed:   { label: "Market Closed",  dot: "bg-slate-500",                 text: "text-slate-400"  },
  };
  const c = config[status] || config.closed;
  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx("w-1.5 h-1.5 rounded-full", c.dot)} />
      <span className={clsx("text-xs font-mono tracking-wide", c.text)}>{c.label}</span>
    </div>
  );
}

// ---- Connection Badge ----
function ConnectionBadge({ status }) {
  if (status === "connected") return <Wifi size={13} className="text-emerald-400" />;
  if (status === "reconnecting") return <Loader2 size={13} className="text-amber-400 animate-spin" />;
  return <WifiOff size={13} className="text-red-400" />;
}

// ---- Sidebar Nav Item ----
function SideNavItem({ item, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative",
          isActive
            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r-full" />
          )}
          <Icon size={16} className="shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium tracking-wide truncate">{item.label}</span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { connectionStatus, marketStatus, unreadAlertCount } = useMarketStore();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Current page title
  const currentPage = NAV_ITEMS.find((n) => n.to === location.pathname)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-['DM_Sans',_sans-serif]">

      {/* ==============================
          SIDEBAR — Desktop
      ============================== */}
      <aside
        className={clsx(
          "hidden lg:flex flex-col border-r border-slate-800/60 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 shrink-0",
          sidebarCollapsed ? "w-14" : "w-56"
        )}
      >
        {/* Logo */}
        <div className={clsx(
          "flex items-center gap-2.5 px-3 py-4 border-b border-slate-800/60",
          sidebarCollapsed && "justify-center"
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
            <IndianRupee size={14} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 leading-tight truncate">Market Intel</p>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase">India</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.to} className="relative">
              <SideNavItem item={item} collapsed={sidebarCollapsed} />
              {item.to === "/alerts" && unreadAlertCount > 0 && !sidebarCollapsed && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadAlertCount > 99 ? "99+" : unreadAlertCount}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Market status + collapse toggle */}
        <div className="border-t border-slate-800/60 px-3 py-3 space-y-2">
          {!sidebarCollapsed && <MarketStatusBadge status={marketStatus} />}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <ChevronRight size={14} className={clsx("transition-transform", sidebarCollapsed ? "rotate-0" : "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* ==============================
          SIDEBAR — Mobile Overlay
      ============================== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <IndianRupee size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Market Intel</p>
                  <p className="text-[10px] text-slate-500 tracking-wider uppercase">India</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <div key={item.to} className="relative">
                  <SideNavItem item={item} collapsed={false} onClick={() => setSidebarOpen(false)} />
                  {item.to === "/alerts" && unreadAlertCount > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadAlertCount}
                    </span>
                  )}
                </div>
              ))}
            </nav>
            <div className="border-t border-slate-800 px-4 py-3">
              <MarketStatusBadge status={marketStatus} />
            </div>
          </aside>
        </div>
      )}

      {/* ==============================
          MAIN CONTENT
      ============================== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ---- Topbar ---- */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-slate-800/60 bg-slate-900/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-sm font-semibold text-slate-200 tracking-wide">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-3">
            <MarketStatusBadge status={marketStatus} />
            <div className="w-px h-4 bg-slate-700" />
            <ConnectionBadge status={connectionStatus} />
          </div>
        </header>

        {/* ---- Page Content ---- */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
