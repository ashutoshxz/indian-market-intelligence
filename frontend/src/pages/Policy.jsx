import { useState } from "react";
import { useQuery } from "react-query";
import {
  ScrollText,
  Building2,
  Landmark,
  ChevronRight,
  ExternalLink,
  Calendar,
  Tag,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Filter,
} from "lucide-react";
import { SectionCard, Badge, Skeleton } from "@components/common/Card";
import {
  fetchPolicyUpdates,
  fetchRBIAnnouncements,
  fetchSEBICirculars,
} from "@services/marketApi";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/Policy.jsx
// ================================

// ---- Source config ----
const SOURCES = [
  { key: "all",  label: "All",  icon: ScrollText  },
  { key: "rbi",  label: "RBI",  icon: Landmark    },
  { key: "sebi", label: "SEBI", icon: Building2   },
];

// ---- Impact badge config ----
const IMPACT_CONFIG = {
  high:    { label: "High Impact",    variant: "danger",  icon: TrendingUp   },
  medium:  { label: "Medium Impact",  variant: "warning", icon: Minus        },
  low:     { label: "Low Impact",     variant: "neutral", icon: TrendingDown },
  neutral: { label: "Neutral",        variant: "neutral", icon: Minus        },
};

// ---- Sentiment badge config ----
const SENTIMENT_CONFIG = {
  positive: { label: "Positive", variant: "success" },
  negative: { label: "Negative", variant: "danger"  },
  neutral:  { label: "Neutral",  variant: "neutral" },
};

// ---- Policy Card ----
function PolicyCard({ item, onClick }) {
  const impact    = IMPACT_CONFIG[item.impact]    || IMPACT_CONFIG.neutral;
  const sentiment = SENTIMENT_CONFIG[item.sentiment] || SENTIMENT_CONFIG.neutral;
  const ImpactIcon = impact.icon;

  return (
    <div
      onClick={() => onClick?.(item)}
      className={clsx(
        "group rounded-xl border bg-slate-900/60 border-slate-800/60 p-4",
        "hover:border-slate-700 hover:bg-slate-900 transition-all duration-150 cursor-pointer"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 shrink-0">
          {/* Source badge */}
          <span className={clsx(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
            item.source === "rbi"
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
          )}>
            {item.source?.toUpperCase()}
          </span>

          {/* Impact */}
          <Badge variant={impact.variant}>
            <ImpactIcon size={9} className="mr-1" />
            {impact.label}
          </Badge>
        </div>

        {/* Sentiment */}
        <Badge variant={sentiment.variant}>{sentiment.label}</Badge>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
        {item.title}
      </h3>

      {/* AI Summary */}
      {item.summary && (
        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {item.summary}
        </p>
      )}

      {/* Sector tags */}
      {item.sectors?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.sectors.slice(0, 4).map((sector) => (
            <span
              key={sector}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              {sector}
            </span>
          ))}
          {item.sectors.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
              +{item.sectors.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Calendar size={10} />
          <span>
            {item.publishedAt
              ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })
              : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-cyan-500 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Source <ExternalLink size={9} />
            </a>
          )}
          <ChevronRight
            size={13}
            className="text-slate-600 group-hover:text-slate-300 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

// ---- Detail Drawer ----
function PolicyDrawer({ item, onClose }) {
  if (!item) return null;
  const impact    = IMPACT_CONFIG[item.impact]    || IMPACT_CONFIG.neutral;
  const sentiment = SENTIMENT_CONFIG[item.sentiment] || SENTIMENT_CONFIG.neutral;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant={impact.variant}>{impact.label}</Badge>
            <Badge variant={sentiment.variant}>{sentiment.label}</Badge>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors text-xs"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-5 flex-1">
          {/* Source + date */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className={clsx(
              "font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px]",
              item.source === "rbi"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            )}>
              {item.source?.toUpperCase()}
            </span>
            <div className="flex items-center gap-1">
              <Calendar size={11} />
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "—"}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-slate-100 leading-snug">
            {item.title}
          </h2>

          {/* AI Summary */}
          {item.summary && (
            <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2">
                AI Summary
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{item.summary}</p>
            </div>
          )}

          {/* Full content */}
          {item.content && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Full Details
              </p>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          )}

          {/* Sectors */}
          {item.sectors?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Tag size={10} /> Sectors Impacted
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.sectors.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Link */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink size={13} /> View official source
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}

// ---- Empty State ----
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle size={28} className="text-slate-600 mb-3" />
      <p className="text-sm text-slate-400 font-medium">No policy updates found</p>
      <p className="text-xs text-slate-600 mt-1">Check back later or try a different filter</p>
    </div>
  );
}

// ---- Skeleton loader ----
function PolicySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ---- Main Page ----
export default function Policy() {
  const [activeSource, setActiveSource] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  // ---- Queries ----
  const { data: allUpdates, isLoading: allLoading, refetch } = useQuery(
    ["policy", activeSource],
    () => {
      if (activeSource === "rbi")  return fetchRBIAnnouncements();
      if (activeSource === "sebi") return fetchSEBICirculars();
      return fetchPolicyUpdates();
    },
    { refetchInterval: 300000 } // 5 minutes
  );

  const items = allUpdates || [];
  const isLoading = allLoading;

  return (
    <div className="space-y-5">

      {/* ---- Page header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Policy & Regulatory Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            RBI, SEBI & government updates — AI summarised
          </p>
        </div>
        <button
          onClick={refetch}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ---- Source filter tabs ---- */}
      <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800/60 rounded-xl p-1 w-fit">
        {SOURCES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSource(key)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeSource === key
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ---- Stats row ---- */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Updates", value: items.length, color: "text-slate-100" },
            {
              label: "High Impact",
              value: items.filter((i) => i.impact === "high").length,
              color: "text-red-400",
            },
            {
              label: "Positive Sentiment",
              value: items.filter((i) => i.sentiment === "positive").length,
              color: "text-emerald-400",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center"
            >
              <p className={clsx("text-xl font-bold font-mono", color)}>{value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ---- Feed ---- */}
      <SectionCard
        title="Latest Updates"
        subtitle={`${items.length} items`}
        action={
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter size={10} />
            <span>AI tagged</span>
          </div>
        }
      >
        {isLoading ? (
          <PolicySkeleton />
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <PolicyCard
                key={item.id}
                item={item}
                onClick={setSelectedItem}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </SectionCard>

      {/* ---- Detail Drawer ---- */}
      {selectedItem && (
        <PolicyDrawer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
