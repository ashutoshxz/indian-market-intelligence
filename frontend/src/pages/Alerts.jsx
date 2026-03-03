import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";
import { SectionCard, Badge, Skeleton } from "@components/common/Card";
import {
  fetchAlerts,
  createAlert,
  deleteAlert,
  updateAlert,
  markAlertsRead,
} from "@services/marketApi";
import { useMarketStore } from "@store/marketStore";
import clsx from "clsx";
import { formatDistanceToNow, parseISO } from "date-fns";
import toast from "react-hot-toast";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/Alerts.jsx
// ================================

// ---- Alert type config ----
const ALERT_TYPES = [
  { key: "price_above",  label: "Price Above",  icon: TrendingUp,  color: "text-emerald-400" },
  { key: "price_below",  label: "Price Below",  icon: TrendingDown, color: "text-red-400"    },
  { key: "volume_spike", label: "Volume Spike", icon: Activity,    color: "text-blue-400"    },
  { key: "event",        label: "Event Alert",  icon: Zap,         color: "text-amber-400"   },
];

// ---- Filter tabs ----
const FILTERS = [
  { key: "all",      label: "All"      },
  { key: "active",   label: "Active"   },
  { key: "triggered",label: "Triggered"},
  { key: "inactive", label: "Inactive" },
];

// ---- Alert type icon ----
function AlertTypeIcon({ type }) {
  const config = ALERT_TYPES.find((t) => t.key === type) || ALERT_TYPES[0];
  const Icon = config.icon;
  return <Icon size={13} className={config.color} />;
}

// ---- Alert Card ----
function AlertCard({ alert, onDelete, onToggle }) {
  const isTriggered = alert.status === "triggered";
  const isActive    = alert.status === "active";

  return (
    <div className={clsx(
      "rounded-xl border p-4 transition-all duration-150",
      isTriggered
        ? "bg-amber-500/5 border-amber-500/20"
        : isActive
        ? "bg-slate-900/60 border-slate-800/60 hover:border-slate-700"
        : "bg-slate-900/30 border-slate-800/40 opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            isTriggered ? "bg-amber-500/10" :
            isActive    ? "bg-slate-800"    : "bg-slate-800/50"
          )}>
            <AlertTypeIcon type={alert.type} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{alert.symbol}</p>
            <p className="text-[11px] text-slate-500">
              {ALERT_TYPES.find((t) => t.key === alert.type)?.label ?? alert.type}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <Badge
          variant={
            isTriggered ? "warning" :
            isActive    ? "success" : "neutral"
          }
        >
          {isTriggered ? "Triggered" : isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Condition */}
      <div className="bg-slate-800/50 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-slate-300 font-mono">
          {alert.symbol} {alert.type === "price_above" ? ">" :
                          alert.type === "price_below" ? "<" :
                          alert.type === "volume_spike" ? "volume >" : "event:"}{" "}
          <span className="text-cyan-400 font-bold">
            {alert.type?.startsWith("price") ? `₹${alert.value?.toLocaleString("en-IN")}` :
             alert.type === "volume_spike"    ? `${alert.value}x avg` :
             alert.value}
          </span>
        </p>
      </div>

      {/* Triggered at */}
      {isTriggered && alert.triggeredAt && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mb-3">
          <CheckCircle2 size={11} />
          <span>Triggered {formatDistanceToNow(parseISO(alert.triggeredAt), { addSuffix: true })}</span>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-[11px] text-slate-500">
          {alert.createdAt
            ? `Created ${formatDistanceToNow(parseISO(alert.createdAt), { addSuffix: true })}`
            : "—"}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(alert)}
            className="text-slate-500 hover:text-slate-200 transition-colors"
            title={isActive ? "Disable alert" : "Enable alert"}
          >
            {isActive
              ? <ToggleRight size={16} className="text-cyan-400" />
              : <ToggleLeft size={16} />
            }
          </button>
          <button
            onClick={() => onDelete(alert.id)}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Delete alert"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Create Alert Modal ----
function CreateAlertModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    symbol:    "",
    type:      "price_above",
    value:     "",
    note:      "",
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.symbol.trim())       e.symbol = "Symbol is required";
    if (!form.value)               e.value  = "Value is required";
    if (isNaN(Number(form.value))) e.value  = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreated({
      symbol:  form.symbol.toUpperCase().trim(),
      type:    form.type,
      value:   Number(form.value),
      note:    form.note.trim(),
      status:  "active",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md z-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Bell size={13} className="text-cyan-400" />
            </div>
            <p className="text-sm font-semibold text-slate-100">Create Alert</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">

          {/* Symbol */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-1.5">
              Symbol
            </label>
            <input
              type="text"
              placeholder="e.g. RELIANCE, NIFTY50"
              value={form.symbol}
              onChange={(e) => set("symbol", e.target.value.toUpperCase())}
              className={clsx(
                "w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors",
                errors.symbol ? "border-red-500" : "border-slate-700"
              )}
            />
            {errors.symbol && <p className="text-[11px] text-red-400 mt-1">{errors.symbol}</p>}
          </div>

          {/* Alert type */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-1.5">
              Alert Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALERT_TYPES.map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => set("type", key)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                    form.type === key
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                  )}
                >
                  <Icon size={12} className={form.type === key ? "text-cyan-400" : color} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-1.5">
              {form.type === "volume_spike" ? "Volume Multiplier (e.g. 2 = 2x avg)" :
               form.type === "event"        ? "Event Keyword" : "Target Price (₹)"}
            </label>
            <input
              type={form.type === "event" ? "text" : "number"}
              placeholder={
                form.type === "volume_spike" ? "e.g. 2" :
                form.type === "event"        ? "e.g. earnings" : "e.g. 2500"
              }
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
              className={clsx(
                "w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors font-mono",
                errors.value ? "border-red-500" : "border-slate-700"
              )}
            />
            {errors.value && <p className="text-[11px] text-red-400 mt-1">{errors.value}</p>}
          </div>

          {/* Note (optional) */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block mb-1.5">
              Note <span className="text-slate-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Breakout above resistance"
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-colors"
          >
            Create Alert
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Skeleton ----
function AlertSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ---- Main Page ----
export default function Alerts() {
  const [filter, setFilter]       = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const { markAlertsRead: markRead } = useMarketStore();
  const queryClient = useQueryClient();

  // ---- Fetch alerts ----
  const { data: alerts = [], isLoading } = useQuery("alerts", fetchAlerts, {
    refetchInterval: 30000,
    onSuccess: markRead,
  });

  // ---- Create ----
  const createMutation = useMutation(createAlert, {
    onSuccess: () => {
      queryClient.invalidateQueries("alerts");
      setShowCreate(false);
      toast.success("Alert created successfully");
    },
    onError: () => toast.error("Failed to create alert"),
  });

  // ---- Delete ----
  const deleteMutation = useMutation(deleteAlert, {
    onSuccess: () => {
      queryClient.invalidateQueries("alerts");
      toast.success("Alert deleted");
    },
    onError: () => toast.error("Failed to delete alert"),
  });

  // ---- Toggle ----
  const toggleMutation = useMutation(
    (alert) =>
      updateAlert(alert.id, {
        status: alert.status === "active" ? "inactive" : "active",
      }),
    {
      onSuccess: () => queryClient.invalidateQueries("alerts"),
      onError:   () => toast.error("Failed to update alert"),
    }
  );

  // ---- Filter ----
  const filtered = alerts.filter((a) =>
    filter === "all" ? true : a.status === filter
  );

  const triggeredCount = alerts.filter((a) => a.status === "triggered").length;
  const activeCount    = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-5">

      {/* ---- Page header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Alert Centre</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Price, volume & event-driven alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries("alerts")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors"
          >
            <Plus size={13} />
            New Alert
          </button>
        </div>
      </div>

      {/* ---- Stats ---- */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Alerts",  value: alerts.length,  color: "text-slate-100"  },
          { label: "Active",        value: activeCount,    color: "text-cyan-400"   },
          { label: "Triggered",     value: triggeredCount, color: "text-amber-400"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
            <p className={clsx("text-xl font-bold font-mono", color)}>{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* ---- Filter tabs ---- */}
      <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800/60 rounded-xl p-1 w-fit">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === key
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            {label}
            {key === "triggered" && triggeredCount > 0 && (
              <span className="ml-1.5 bg-amber-500/20 text-amber-400 text-[10px] px-1 rounded-full">
                {triggeredCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- Alert list ---- */}
      <SectionCard
        title="Your Alerts"
        subtitle={`${filtered.length} ${filter === "all" ? "total" : filter}`}
      >
        {isLoading ? (
          <AlertSkeleton />
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDelete={(id) => deleteMutation.mutate(id)}
                onToggle={(a) => toggleMutation.mutate(a)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <BellOff size={28} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 font-medium">
              {filter === "all" ? "No alerts created yet" : `No ${filter} alerts`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
              >
                <Plus size={12} /> Create your first alert
              </button>
            )}
          </div>
        )}
      </SectionCard>

      {/* ---- Create Modal ---- */}
      {showCreate && (
        <CreateAlertModal
          onClose={() => setShowCreate(false)}
          onCreated={(payload) => createMutation.mutate(payload)}
        />
      )}
    </div>
  );
}
