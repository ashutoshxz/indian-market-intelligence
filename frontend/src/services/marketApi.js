import axios from "axios";

// ================================
// Indian Market Intelligence Platform
// frontend/src/services/marketApi.js
// ================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request Interceptor (attach auth token) ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("imip_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor (handle errors globally) ----
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  }
);

// ============================================================
// MARKET — Indices, Breadth, Sectors, Movers
// ============================================================

/** Fetch live index data — NIFTY50, SENSEX, BANKNIFTY, INDIA_VIX */
export const fetchIndices = () =>
  api.get("/market/indices");

/** Fetch market breadth — advances, declines, unchanged */
export const fetchBreadth = () =>
  api.get("/market/breadth");

/** Fetch sector performance heatmap */
export const fetchSectors = () =>
  api.get("/market/sectors");

/** Fetch top gainers and losers */
export const fetchTopMovers = () =>
  api.get("/market/movers");

/** Fetch OHLCV data for a symbol
 * @param {string} symbol — e.g. "RELIANCE"
 * @param {string} interval — "1m" | "5m" | "15m" | "1h" | "1d"
 * @param {number} limit — number of candles
 */
export const fetchOHLCV = (symbol, interval = "5m", limit = 100) =>
  api.get("/market/ohlcv", { params: { symbol, interval, limit } });

/** Fetch quote for a single symbol */
export const fetchQuote = (symbol) =>
  api.get(`/market/quote/${symbol}`);

/** Search symbols */
export const searchSymbols = (query) =>
  api.get("/market/search", { params: { q: query } });

// ============================================================
// POLICY — RBI, SEBI, Budget
// ============================================================

/** Fetch latest policy updates */
export const fetchPolicyUpdates = (params = {}) =>
  api.get("/policy", { params });

/** Fetch a single policy item by id */
export const fetchPolicyById = (id) =>
  api.get(`/policy/${id}`);

/** Fetch RBI announcements */
export const fetchRBIAnnouncements = () =>
  api.get("/policy/rbi");

/** Fetch SEBI circulars */
export const fetchSEBICirculars = () =>
  api.get("/policy/sebi");

// ============================================================
// EARNINGS — Corporate tracker
// ============================================================

/** Fetch earnings calendar */
export const fetchEarningsCalendar = (params = {}) =>
  api.get("/earnings/calendar", { params });

/** Fetch earnings result for a symbol */
export const fetchEarningsResult = (symbol) =>
  api.get(`/earnings/result/${symbol}`);

/** Fetch corporate actions (dividends, splits, buybacks) */
export const fetchCorporateActions = (params = {}) =>
  api.get("/earnings/corporate-actions", { params });

/** Fetch shareholding changes */
export const fetchShareholding = (symbol) =>
  api.get(`/earnings/shareholding/${symbol}`);

/** Fetch insider trades */
export const fetchInsiderTrades = (params = {}) =>
  api.get("/earnings/insider-trades", { params });

// ============================================================
// ALERTS
// ============================================================

/** Fetch all alerts for current user */
export const fetchAlerts = () =>
  api.get("/alerts");

/** Create a new alert */
export const createAlert = (payload) =>
  api.post("/alerts", payload);

/** Update an alert */
export const updateAlert = (id, payload) =>
  api.put(`/alerts/${id}`, payload);

/** Delete an alert */
export const deleteAlert = (id) =>
  api.delete(`/alerts/${id}`);

/** Mark all alerts as read */
export const markAlertsRead = () =>
  api.patch("/alerts/read-all");

// ============================================================
// AI INSIGHTS
// ============================================================

/** Fetch latest AI-generated news summaries */
export const fetchAISummaries = (params = {}) =>
  api.get("/insights/summaries", { params });

/** Fetch sentiment score for a symbol or sector */
export const fetchSentiment = (target, type = "symbol") =>
  api.get("/insights/sentiment", { params: { target, type } });

/** Fetch event impact analysis */
export const fetchEventImpact = (eventId) =>
  api.get(`/insights/impact/${eventId}`);

/** Fetch macro overview */
export const fetchMacroOverview = () =>
  api.get("/insights/macro");

// ============================================================
// WATCHLIST
// ============================================================

/** Fetch user watchlist */
export const fetchWatchlist = () =>
  api.get("/watchlist");

/** Add symbol to watchlist */
export const addToWatchlist = (symbol) =>
  api.post("/watchlist", { symbol });

/** Remove symbol from watchlist */
export const removeFromWatchlist = (symbol) =>
  api.delete(`/watchlist/${symbol}`);

export default api;
