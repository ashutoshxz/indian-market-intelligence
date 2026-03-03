import { useNavigate } from "react-router-dom";
import { IndianRupee, Home, ArrowLeft } from "lucide-react";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/NotFound.jsx
// ================================

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mb-6">
        <IndianRupee size={28} className="text-cyan-400" />
      </div>

      {/* 404 */}
      <p className="text-7xl font-black font-mono text-slate-800 mb-2 select-none">404</p>

      {/* Message */}
      <h2 className="text-lg font-bold text-slate-200 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-xs mb-8 leading-relaxed">
        This page doesn't exist or may have moved. Head back to the dashboard to continue trading.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold transition-colors"
        >
          <Home size={14} /> Dashboard
        </button>
      </div>
    </div>
  );
}
