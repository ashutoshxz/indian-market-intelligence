import { useEffect } from "react";
import { useQuery } from "react-query";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { StatCard, SectionCard, Badge, Skeleton } from "@components/common/Card";
import { useMarketStore } from "@store/marketStore";
import { fetchIndices, fetchBreadth, fetchSectors, fetchTopMovers } from "@services/marketApi";
import clsx from "clsx";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/Dashboard.jsx
// ================================

// ---- Sector Heatmap Tile ----
function SectorTile({ name, change }) {
  const isPositive = change >= 0;
  const intensity  = Math.min(Math.abs(change) / 3, 1); // normalize 0–1

  const bg = isPositive
    ? `rgba(34, 197, 94, ${0.08 + intensity * 0.22})`
    : `rgba(239, 68, 68, ${0.08 + intensity * 0.22})`;

  const border = isPositive
    ? `rgba(34, 197, 94, ${0.15 + intensity * 0.3})`
    : `rgba(239, 68, 68, ${0.15 + intensity * 0.3})`;

  return (
    <div
      className="rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <p className="text-[11px] font-medium text-slate-300 leading-tight truncate">{name}</p>
      <p className={clsx(
        "text-sm font-bold font-mono mt-1",
        isPositive ? "text-emerald-400" : "text-red-400"
      )}>
        {isPositive ? "+" : ""}{change.toFixed(2)}%
      </p>
    </div>
  );
}

// ---- Top Mover Row ----
function MoverRow({ symbol, name, price, changePct, volume }) {
  const isPositive = changePct >= 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] px-1 rounded transition-colors cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-100">{symbol}</p>
        <p className="text-[11px] text-slate-500 truncate">{name}</p>
      </div>
      <div className="text-right ml-4 shrink-0">
        <p className="text-sm font-mono font-semibold text-slate-200">₹{price.toLocaleString("en-IN")}</p>
        <p className={clsx(
          "text-xs font-mono",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? "+" : ""}{changePct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

// ---- Breadth Bar ----
function BreadthBar({ advances, declines, unchanged }) {
  const total = advances + declines + unchanged || 1;
  const advPct = (advances / total) * 100;
  const decPct = (declines / total) * 100;
  const unchPct = (unchanged / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-2 bg-slate-800">
        <div className="bg-emerald-500 transition-all" style={{ width: `${advPct}%` }} />
        <div className="bg-slate-600 transition-all" style={{ width: `${unchPct}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${decPct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-emerald-400">▲ {advances} Adv</span>
        <span className="text-slate-500">{unchanged} Unch</span>
        <span className="text-red-400">▼ {declines} Dec</span>
      </div>
    </div>
  );
}

// ---- Main Dashboard ----
export default function Dashboard() {
  const {
    indices, setIndices,
    breadth, setBreadth,
    sectorData, setSectorData,
    marketStatus, connectionStatus,
    setLoading,
  } = useMarketStore();

  // ---- Fetch Indices ----
  const { data: indicesData, isLoading: indicesLoading, refetch: refetchIndices } = useQuery(
    "indices",
    fetchIndices,
    {
      refetchInterval: 15000,
      onSuccess: (data) => setIndices(data),
    }
  );

  // ---- Fetch Breadth ----
  const { data: breadthData, isLoading: breadthLoading } = useQuery(
    "breadth",
    fetchBreadth,
    {
      refetchInterval: 30000,
      onSuccess: (data) => setBreadth(data),
    }
  );

  // ---- Fetch Sectors ----
  const { data: sectors, isLoading: sectorsLoading } = useQuery(
    "sectors",
    fetchSectors,
    {
      refetchInterval: 60000,
      onSuccess: (data) => setSectorData(data),
    }
  );

  // ---- Fetch Top Movers ----
  const { data: movers, isLoading: moversLoading } = useQuery(
    "topMovers",
    fetchTopMovers,
    { refetchInterval: 30000 }
  );

  const INDICES = [
    { key: "NIFTY50",   label: "NIFTY 50",    icon: TrendingUp  },
    { key: "SENSEX",    label: "SENSEX",       icon: BarChart2   },
    { key: "BANKNIFTY", label: "BANK NIFTY",  icon: Activity    },
    { key: "INDIA_VIX", label: "INDIA VIX",   icon: TrendingDown },
  ];

  return (
    <div className="space-y-5">

      {/* ---- Header row ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Market Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={marketStatus === "open" ? "success" : marketStatus === "pre-open" ? "warning" : "neutral"}>
            {marketStatus === "open" ? "Live" : marketStatus === "pre-open" ? "Pre-Open" : "Closed"}
          </Badge>
          <button
            onClick={refetchIndices}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ---- Index Cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {INDICES.map(({ key, label, icon }) => {
          const data = indices[key] || {};
          return (
            <StatCard
              key={key}
              title={label}
              value={data.value?.toLocaleString("en-IN")}
              change={data.change}
              changePct={data.changePct}
              icon={icon}
              loading={indicesLoading}
            />
          );
        })}
      </div>

      {/* ---- Middle Row: Breadth + Sectors ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Market Breadth */}
        <SectionCard
          title="Market Breadth"
          subtitle="NSE listed stocks"
          className="lg:col-span-1"
        >
          {breadthLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : breadthData ? (
            <BreadthBar
              advances={breadthData.advances}
              declines={breadthData.declines}
              unchanged={breadthData.unchanged}
            />
          ) : (
            <p className="text-xs text-slate-500">No data available</p>
          )}

          {!breadthLoading && breadthData && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">A/D Ratio</p>
                <p className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                  {breadthData.advanceDeclineRatio?.toFixed(2) ?? "—"}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total</p>
                <p className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                  {(breadthData.advances + breadthData.declines + breadthData.unchanged)?.toLocaleString("en-IN") ?? "—"}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Sector Heatmap */}
        <SectionCard
          title="Sector Heatmap"
          subtitle="% change today"
          className="lg:col-span-2"
          action={
            <Badge variant="info">NSE</Badge>
          }
        >
          {sectorsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : sectors?.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {sectors.map((s) => (
                <SectorTile key={s.name} name={s.name} change={s.change} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No sector data available</p>
          )}
        </SectionCard>
      </div>

      {/* ---- Bottom Row: Top Gainers + Losers ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Gainers */}
        <SectionCard
          title="Top Gainers"
          action={
            <a href="/insights" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View all <ArrowUpRight size={11} />
            </a>
          }
        >
          {moversLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
            </div>
          ) : movers?.gainers?.length ? (
            movers.gainers.slice(0, 5).map((s) => (
              <MoverRow key={s.symbol} {...s} />
            ))
          ) : (
            <p className="text-xs text-slate-500 py-2">No data available</p>
          )}
        </SectionCard>

        {/* Top Losers */}
        <SectionCard
          title="Top Losers"
          action={
            <a href="/insights" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View all <ArrowUpRight size={11} />
            </a>
          }
        >
          {moversLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
            </div>
          ) : movers?.losers?.length ? (
            movers.losers.slice(0, 5).map((s) => (
              <MoverRow key={s.symbol} {...s} />
            ))
          ) : (
            <p className="text-xs text-slate-500 py-2">No data available</p>
          )}
        </SectionCard>
      </div>

    </div>
  );
}
