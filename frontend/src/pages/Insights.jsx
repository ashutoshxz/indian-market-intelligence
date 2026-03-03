import { useState } from "react";
import { useQuery } from "react-query";
import {
  Lightbulb,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  Newspaper,
  BarChart2,
  Globe,
  ChevronRight,
  ExternalLink,
  Zap,
  Activity,
} from "lucide-react";
import { SectionCard, Badge, Skeleton } from "@components/common/Card";
import {
  fetchAISummaries,
  fetchSentiment,
  fetchMacroOverview,
} from "@services/marketApi";
import clsx from "clsx";
import { formatDistanceToNow, parseISO } from "date-fns";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/Insights.jsx
// ================================

// ---- Tab config ----
const TABS = [
  { key: "summaries", label: "News Summaries", icon: Newspaper },
  { key: "sentiment", label: "Sentiment",      icon: Activity  },
  { key: "macro",     label: "Macro Overview", icon: Globe     },
];

// ---- Sentiment config ----
const SENTIMENT_MAP = {
  bullish:  { label: "Bullish",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: TrendingUp   },
  bearish:  { label: "Bearish",  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     icon: TrendingDown },
  neutral:  { label: "Neutral",  color: "text-slate-400",   bg: "bg-slate-800/50",   border: "border-slate-700",      icon: Minus        },
};

// ---- Sentiment Gauge ----
function SentimentGauge({ score }) {
  // score: 0–100 (0 = extreme bearish, 50 = neutral, 100 = extreme bullish)
  const pct     = Math.max(0, Math.min(100, score ?? 50));
  const label   = pct >= 60 ? "bullish" : pct <= 40 ? "bearish" : "neutral";
  const config  = SENTIMENT_MAP[label];
  const Icon    = config.icon;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Arc gauge */}
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full border-4 border-slate-800" />
        <div
          className={clsx("absolute inset-0 rounded-t-full border-4 transition-all duration-700", config.border.replace("border-", "border-t-"))}
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <p className={clsx("text-2xl font-black font-mono", config.color)}>{pct}</p>
        </div>
      </div>
      <div className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold", config.bg, config.border, config.color)}>
        <Icon size={12} />
        {config.label}
      </div>
    </div>
  );
}

// ---- Sentiment Bar (for sectors/stocks) ----
function SentimentBar({ label, score, volume }) {
  const pct    = Math.max(0, Math.min(100, score ?? 50));
  const sentiment = pct >= 60 ? "bullish" : pct <= 40 ? "bearish" : "neutral";
  const config = SENTIMENT_MAP[sentiment];

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
      <p className="text-xs text-slate-300 w-24 shrink-0 truncate">{label}</p>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", {
            "bg-emerald-500": sentiment === "bullish",
            "bg-red-500":     sentiment === "bearish",
            "bg-slate-500":   sentiment === "neutral",
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={clsx("text-xs font-mono font-bold w-8 text-right shrink-0", config.color)}>
        {pct}
      </span>
    </div>
  );
}

// ---- News Summary Card ----
function SummaryCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const sentiment = SENTIMENT_MAP[item.sentiment] || SENTIMENT_MAP.neutral;
  const SentIcon  = sentiment.icon;

  return (
    <div
      className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 hover:border-slate-700 transition-all duration-150 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
            {item.source}
          </span>
          {/* Sentiment */}
          <span className={clsx(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
            sentiment.bg, sentiment.border, sentiment.color
          )}>
            <SentIcon size={9} />
            {sentiment.label}
          </span>
          {/* Impact */}
          {item.impact === "high" && (
            <Badge variant="danger">
              <Zap size={9} className="mr-1" /> High Impact
            </Badge>
          )}
        </div>
        <ChevronRight
          size={13}
          className={clsx(
            "text-slate-600 shrink-0 transition-transform",
            expanded && "rotate-90"
          )}
        />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-2">
        {item.title}
      </h3>

      {/* AI Summary pill */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Brain size={10} className="text-cyan-400" />
        </div>
        <p className={clsx(
          "text-xs text-slate-400 leading-relaxed",
          !expanded && "line-clamp-2"
        )}>
          {item.summary}
        </p>
      </div>

      {/* Sector tags */}
      {item.sectors?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.sectors.map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-[11px] text-slate-500">
          {item.publishedAt
            ? formatDistanceToNow(parseISO(item.publishedAt), { addSuffix: true })
            : "—"}
        </p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-cyan-500 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Read full <ExternalLink size={9} />
          </a>
        )}
      </div>
    </div>
  );
}

// ---- Macro Metric Card ----
function MacroCard({ label, value, unit, change, description, trend }) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        {trend && (
          <div className={clsx(
            "w-6 h-6 rounded-lg flex items-center justify-center",
            isUp   ? "bg-emerald-500/10" :
            isDown ? "bg-red-500/10"     : "bg-slate-800"
          )}>
            {isUp   && <TrendingUp   size={11} className="text-emerald-400" />}
            {isDown && <TrendingDown size={11} className="text-red-400"     />}
            {!isUp && !isDown && <Minus size={11} className="text-slate-500" />}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2 mb-1">
        <p className="text-2xl font-black font-mono text-slate-100">{value}</p>
        {unit && <p className="text-xs text-slate-500 mb-1">{unit}</p>}
        {change && (
          <p className={clsx(
            "text-xs font-mono mb-1",
            isUp   ? "text-emerald-400" :
            isDown ? "text-red-400"     : "text-slate-500"
          )}>
            {change}
          </p>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

// ---- Skeletons ----
function SummarySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function SentimentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="space-y-2.5 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-2.5 w-full" />
        </div>
      ))}
    </div>
  );
}

// ---- Empty state ----
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <AlertCircle size={26} className="text-slate-600 mb-3" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

// ---- Main Page ----
export default function Insights() {
  const [activeTab, setActiveTab] = useState("summaries");

  const { data: summaries,   isLoading: sumLoading,  refetch: refetchSum  } = useQuery(
    "aiSummaries",   fetchAISummaries,   { refetchInterval: 300000 }
  );
  const { data: sentimentData, isLoading: sentLoading, refetch: refetchSent } = useQuery(
    "sentiment",
    () => fetchSentiment("market", "market"),
    { refetchInterval: 300000 }
  );
  const { data: macro, isLoading: macroLoading, refetch: refetchMacro } = useQuery(
    "macroOverview", fetchMacroOverview, { refetchInterval: 600000 }
  );

  const handleRefresh = () => {
    refetchSum(); refetchSent(); refetchMacro();
  };

  const isLoading =
    activeTab === "summaries" ? sumLoading  :
    activeTab === "sentiment" ? sentLoading : macroLoading;

  return (
    <div className="space-y-5">

      {/* ---- Page header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">AI Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            News summaries, sentiment scoring & macro indicators
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ---- AI Stats row ---- */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Summaries Today",
              value: summaries?.length ?? "—",
              icon: Newspaper,
              color: "text-cyan-400",
            },
            {
              label: "Market Sentiment",
              value: sentimentData?.overall?.score ?? "—",
              icon: Brain,
              color:
                sentimentData?.overall?.score >= 60 ? "text-emerald-400" :
                sentimentData?.overall?.score <= 40 ? "text-red-400" :
                "text-slate-400",
            },
            {
              label: "Macro Indicators",
              value: macro?.indicators?.length ?? "—",
              icon: BarChart2,
              color: "text-purple-400",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                <Icon size={13} className={color} />
              </div>
              <p className={clsx("text-xl font-bold font-mono", color)}>{value}</p>
            </div>
          ))}
        </div>
      )}

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
          </button>
        ))}
      </div>

      {/* ---- Tab Content ---- */}

      {/* News Summaries */}
      {activeTab === "summaries" && (
        <SectionCard
          title="AI News Summaries"
          subtitle="Summarised & tagged by sector impact"
          action={
            <div className="flex items-center gap-1 text-[10px] text-cyan-500">
              <Brain size={10} /> AI powered
            </div>
          }
        >
          {sumLoading ? <SummarySkeleton /> :
           summaries?.length ? (
             <div className="space-y-3">
               {summaries.map((item) => (
                 <SummaryCard key={item.id} item={item} />
               ))}
             </div>
           ) : <EmptyState message="No summaries available yet" />}
        </SectionCard>
      )}

      {/* Sentiment */}
      {activeTab === "sentiment" && (
        <div className="space-y-4">

          {/* Overall market sentiment */}
          <SectionCard title="Overall Market Sentiment" subtitle="Composite NLP score across all sources">
            {sentLoading ? <SentimentSkeleton /> :
             sentimentData ? (
               <>
                 <SentimentGauge score={sentimentData.overall?.score} />
                 <div className="grid grid-cols-3 gap-2 mt-2">
                   {[
                     { label: "Positive",  value: sentimentData.overall?.positive ?? 0, color: "text-emerald-400" },
                     { label: "Neutral",   value: sentimentData.overall?.neutral  ?? 0, color: "text-slate-400"   },
                     { label: "Negative",  value: sentimentData.overall?.negative ?? 0, color: "text-red-400"     },
                   ].map(({ label, value, color }) => (
                     <div key={label} className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                       <p className={clsx("text-base font-bold font-mono", color)}>{value}%</p>
                       <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                     </div>
                   ))}
                 </div>
               </>
             ) : <EmptyState message="Sentiment data unavailable" />}
          </SectionCard>

          {/* Sector sentiment */}
          <SectionCard title="Sector Sentiment" subtitle="NLP-scored across NSE sectors">
            {sentLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-1.5 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                ))}
              </div>
            ) : sentimentData?.sectors?.length ? (
              <div>
                {sentimentData.sectors.map((s) => (
                  <SentimentBar key={s.name} label={s.name} score={s.score} />
                ))}
              </div>
            ) : <EmptyState message="Sector sentiment unavailable" />}
          </SectionCard>
        </div>
      )}

      {/* Macro */}
      {activeTab === "macro" && (
        <SectionCard
          title="Macro Indicators"
          subtitle="Key India & global economic indicators"
          action={
            <Badge variant="info">Live</Badge>
          }
        >
          {macroLoading ? <MacroSkeleton /> :
           macro?.indicators?.length ? (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
               {macro.indicators.map((m) => (
                 <MacroCard
                   key={m.label}
                   label={m.label}
                   value={m.value}
                   unit={m.unit}
                   change={m.change}
                   description={m.description}
                   trend={m.trend}
                 />
               ))}
             </div>
           ) : <EmptyState message="Macro data unavailable" />}
        </SectionCard>
      )}
    </div>
  );
}
