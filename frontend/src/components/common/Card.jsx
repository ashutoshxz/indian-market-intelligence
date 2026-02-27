import clsx from "clsx";

// ================================
// Indian Market Intelligence Platform
// frontend/src/components/common/Card.jsx
// ================================

/**
 * Base Card
 * Props:
 *  - children
 *  - className
 *  - onClick
 *  - hover      — adds hover highlight
 *  - glass      — glassmorphism style
 *  - padding    — "sm" | "md" | "lg" | "none"  (default "md")
 */
export function Card({ children, className, onClick, hover = false, glass = false, padding = "md" }) {
  const padMap = {
    none: "",
    sm:   "p-3",
    md:   "p-4",
    lg:   "p-6",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-xl border transition-all duration-150",
        glass
          ? "bg-white/5 border-white/10 backdrop-blur-sm"
          : "bg-slate-900/60 border-slate-800/60",
        hover && "hover:border-slate-700 hover:bg-slate-900 cursor-pointer",
        onClick && "cursor-pointer",
        padMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stat Card — for index / metric display
 * Props:
 *  - title
 *  - value
 *  - change       — numeric (pos/neg)
 *  - changePct    — numeric (pos/neg)
 *  - prefix       — e.g. "₹"
 *  - suffix       — e.g. "%"
 *  - icon         — lucide component
 *  - loading
 *  - onClick
 */
export function StatCard({ title, value, change, changePct, prefix = "", suffix = "", icon: Icon, loading = false, onClick }) {
  const isPositive = change >= 0;
  const isNeutral  = change === null || change === undefined;

  return (
    <Card hover={!!onClick} onClick={onClick} padding="md">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
            <Icon size={13} className="text-slate-400" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-6 w-28 bg-slate-800 rounded" />
          <div className="h-3 w-16 bg-slate-800 rounded" />
        </div>
      ) : (
        <>
          <p className="text-xl font-bold text-slate-100 font-mono tracking-tight">
            {prefix}{value ?? "—"}{suffix}
          </p>
          {!isNeutral && (
            <div className={clsx(
              "flex items-center gap-1.5 mt-1.5 text-xs font-mono",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}>
              <span>{isPositive ? "▲" : "▼"}</span>
              <span>{Math.abs(change)}</span>
              {changePct !== undefined && (
                <span className="text-slate-500">({Math.abs(changePct).toFixed(2)}%)</span>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/**
 * Section Card — titled container for dashboard sections
 * Props:
 *  - title
 *  - subtitle
 *  - action       — right-side action element (button/link)
 *  - children
 *  - className
 *  - padding
 */
export function SectionCard({ title, subtitle, action, children, className, padding = "md" }) {
  return (
    <Card padding="none" className={className}>
      {/* Header */}
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
          <div>
            <p className="text-sm font-semibold text-slate-200">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {/* Body */}
      <div className={clsx(padding !== "none" && `p-${padding === "sm" ? "3" : padding === "lg" ? "6" : "4"}`)}>
        {children}
      </div>
    </Card>
  );
}

/**
 * Badge
 * Props:
 *  - variant  — "default" | "success" | "danger" | "warning" | "info" | "neutral"
 *  - size     — "sm" | "md"
 */
export function Badge({ children, variant = "default", size = "sm" }) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    danger:  "bg-red-500/10 text-red-400 border-red-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    neutral: "bg-slate-800/80 text-slate-400 border-slate-700/60",
  };
  return (
    <span className={clsx(
      "inline-flex items-center border rounded-full font-medium",
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
      variants[variant]
    )}>
      {children}
    </span>
  );
}

/**
 * Loader — skeleton shimmer line
 */
export function Skeleton({ className }) {
  return (
    <div className={clsx("animate-pulse bg-slate-800 rounded", className)} />
  );
}

/**
 * Divider
 */
export function Divider({ className }) {
  return <div className={clsx("h-px bg-slate-800/80", className)} />;
}
