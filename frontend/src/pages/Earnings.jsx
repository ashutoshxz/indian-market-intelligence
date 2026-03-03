import { useState } from "react";
import { useQuery } from "react-query";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  DollarSign,
  BarChart2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { SectionCard, Badge, Skeleton } from "@components/common/Card";
import {
  fetchEarningsCalendar,
  fetchCorporateActions,
  fetchInsiderTrades,
} from "@services/marketApi";
import clsx from "clsx";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/Earnings.jsx
// ================================

// ---- Tab config ----
const TABS = [
  { key: "calendar",   label: "Earnings Calendar", icon: Calendar  },
  { key: "actions",    label: "Corporate Actions",  icon: Building2 },
  { key: "insider",    label: "Insider Trades",     icon: Users     },
];

// ---- Estimate vs Actual badge ----
function VsEstimate({ actual, estimate }) {
  if (!actual || !estimate) return null;
  const beat = actual >= estimate;
  return (
    <span className={clsx(
      "text-[10px] font-mono px-1.5 py-0.5 rounded",
      beat
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-red-500/10 text-red-400"
    )}>
      {beat ? "▲ Beat" : "▼ Miss"}
    </span>
  );
}

// ---- Earnings Calendar Row ----
function EarningsRow({ item }) {
  const date     = item.date ? parseISO(item.date) : null;
  const isNow    = date && isToday(date);
  const isTmrw   = date && isTomorrow(date);
  const isDone   = date && isPast(date) && !isNow;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] px-1 rounded transition-colors cursor-pointer group">
      {/* Left: symbol + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={clsx(
          "w-1.5 h-8 rounded-full shrink-0",
          isNow   ? "bg-cyan-400 animate-pulse" :
          isTmrw  ? "bg-amber-400" :
          isDone  ? "bg-slate-600" : "bg-slate-700"
        )} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-100">{item.symbol}</p>
            {isNow  && <Badge variant="info">Today</Badge>}
            {isTmrw && <Badge variant="warning">Tomorrow</Badge>}
            {isDone && <Badge variant="neutral">Done</Badge>}
          </div>
          <p className="text-[11px] text-slate-500 truncate">{item.companyName}</p>
        </div>
      </div>

      {/* Right: date + EPS */}
      <div className="text-right ml-4 shrink-0 space-y-0.5">
        <p className="text-xs font-mono text-slate-400">
          {date ? format(date, "dd MMM") : "—"}
        </p>
        {item.eps && (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] text-slate-500">EPS</span>
            <span className="text-xs font-mono text-slate-200">₹{item.eps}</span>
            <VsEstimate actual={item.eps} estimate={item.epsEstimate} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Corporate Action Row ----
function ActionRow({ item }) {
  const ACTION_COLORS = {
    dividend:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    split:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
    buyback:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
    bonus:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rights:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    default:   "bg-slate-800 text-slate-400 border-slate-700",
  };

  const colorClass = ACTION_COLORS[item.type?.toLowerCase()] || ACTION_COLORS.default;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] px-1 rounded transition-colors cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0", colorClass)}>
          {item.type}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">{item.symbol}</p>
          <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
        </div>
      </div>
      <div className="text-right ml-4 shrink-0">
        {item.value && (
          <p className="text-sm font-mono font-semibold text-slate-200">{item.value}</p>
        )}
        {item.exDate && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
            <Clock size={9} />
            Ex: {format(parseISO(item.exDate), "dd MMM")}
          </p>
        )}
      </div>
    </div>
  );
}

// ---- Insider Trade Row ----
function InsiderRow({ item }) {
  const isBuy = item.tradeType?.toLowerCase() === "buy";
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] px-1 rounded transition-colors cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <div className={clsx(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
          isBuy ? "bg-emerald-500/10" : "bg-red-500/10"
        )}>
          {isBuy
            ? <ArrowUpRight size={13} className="text-emerald-400" />
            : <ArrowDownRight size={13} className="text-red-400" />
          }
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-100">{item.symbol}</p>
            <Badge variant={isBuy ? "success" : "danger"}>
              {isBuy ? "Buy" : "Sell"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 truncate">{item.insiderName} · {item.designation}</p>
        </div>
      </div>
      <div className="text-right ml-4 shrink-0">
        <p className="text-sm font-mono font-semibold text-slate-200">
          ₹{item.value?.toLocaleString("en-IN") ?? "—"}
        </p>
        <p className="text-[11px] text-slate-500">
          {item.quantity?.toLocaleString("en-IN")} shares
        </p>
      </div>
    </div>
  );
}

// ---- Empty State ----
function EmptyState({ message = "No data available" }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <AlertCircle size={26} className="text-slate-600 mb-3" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

// ---- Skeleton loader ----
function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-1.5 h-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="h-3 w-14 ml-auto" />
            <Skeleton className="h-2.5 w-10 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Upcoming count badge ----
function UpcomingBadge({ items }) {
  const upcoming = items?.filter((i) => {
    const d = i.date ? parseISO(i.date) : null;
    return d && (isToday(d) || isTomorrow(d));
  }).length ?? 0;

  if (!upcoming) return null;
  return (
    <span className="ml-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
      {upcoming} upcoming
    </span>
  );
}

// ---- Main Page ----
export default function Earnings() {
  const [activeTab, setActiveTab] = useState("calendar");

  // ---- Queries ----
  const { data: calendarData, isLoading: calLoading, refetch: refetchCal } = useQuery(
    "earningsCalendar",
    fetchEarningsCalendar,
    { refetchInterval: 300000 }
  );

  const { data: actionsData, isLoading: actLoading, refetch: refetchAct } = useQuery(
    "corporateActions",
    fetchCorporateActions,
    { refetchInterval: 300000 }
  );

  const { data: insiderData, isLoading: insLoading, refetch: refetchIns } = useQuery(
    "insiderTrades",
    fetchInsiderTrades,
    { refetchInterval: 300000 }
  );

  const handleRefresh = () => {
    refetchCal(); refetchAct(); refetchIns();
  };

  const isLoading =
    activeTab === "calendar" ? calLoading :
    activeTab === "actions"  ? actLoading : insLoading;

  const items =
    activeTab === "calendar" ? calendarData ?? [] :
    activeTab === "actions"  ? actionsData  ?? [] :
    insiderData ?? [];

  return (
    <div className="space-y-5">

      {/* ---- Page header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Earnings & Corporate Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Earnings calendar, corporate actions & insider activity
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ---- Summary stat cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Results Today",
            value: calendarData?.filter((i) => i.date && isToday(parseISO(i.date))).length ?? "—",
            icon: Calendar,
            color: "text-cyan-400",
          },
          {
            label: "This Week",
            value: calendarData?.length ?? "—",
            icon: BarChart2,
            color: "text-blue-400",
          },
          {
            label: "Corporate Actions",
            value: actionsData?.length ?? "—",
            icon: Building2,
            color: "text-purple-400",
          },
          {
            label: "Insider Trades",
            value: insiderData?.length ?? "—",
            icon: Users,
            color: "text-amber-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
              <Icon size={13} className={color} />
            </div>
            <p className={clsx("text-xl font-bold font-mono", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* ---- Tabs ---- */}
      <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800/60 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeTab === key
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Icon size={12} />
            {label}
            {key === "calendar" && <UpcomingBadge items={calendarData} />}
          </button>
        ))}
      </div>

      {/* ---- Content ---- */}
      <SectionCard
        title={TABS.find((t) => t.key === activeTab)?.label}
        subtitle={`${items.length} records`}
      >
        {isLoading ? (
          <TableSkeleton />
        ) : items.length > 0 ? (
          <div>
            {activeTab === "calendar" &&
              items.map((item) => <EarningsRow key={item.id ?? item.symbol} item={item} />)}
            {activeTab === "actions" &&
              items.map((item) => <ActionRow key={item.id ?? item.symbol} item={item} />)}
            {activeTab === "insider" &&
              items.map((item) => <InsiderRow key={item.id} item={item} />)}
          </div>
        ) : (
          <EmptyState
            message={
              activeTab === "calendar" ? "No earnings scheduled" :
              activeTab === "actions"  ? "No corporate actions found" :
              "No insider trades reported"
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
