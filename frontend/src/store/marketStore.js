import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

// ================================
// Indian Market Intelligence Platform
// frontend/src/store/marketStore.js
// ================================

export const useMarketStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({

      // ---- Connection ----
      connectionStatus: "disconnected", // "connected" | "disconnected" | "reconnecting"
      setConnectionStatus: (status) => set({ connectionStatus: status }),

      // ---- Indices ----
      indices: {
        NIFTY50:   { value: null, change: null, changePct: null },
        SENSEX:    { value: null, change: null, changePct: null },
        BANKNIFTY: { value: null, change: null, changePct: null },
        NIFTYMID:  { value: null, change: null, changePct: null },
        INDIA_VIX: { value: null, change: null, changePct: null },
      },
      setIndices: (indices) => set({ indices }),

      // ---- Live Market Data (from WebSocket) ----
      marketData: {},
      setMarketData: (data) =>
        set((state) => ({
          marketData: { ...state.marketData, ...data },
        })),

      // ---- Sector Heatmap ----
      sectorData: [],
      setSectorData: (sectors) => set({ sectorData: sectors }),

      // ---- Market Breadth ----
      breadth: {
        advances: null,
        declines: null,
        unchanged: null,
        advanceDeclineRatio: null,
      },
      setBreadth: (breadth) => set({ breadth }),

      // ---- Watchlist ----
      watchlist: [],
      addToWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol],
        })),
      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        })),

      // ---- Alerts ----
      alerts: [],
      unreadAlertCount: 0,
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
          unreadAlertCount: state.unreadAlertCount + 1,
        })),
      markAlertsRead: () => set({ unreadAlertCount: 0 }),

      // ---- Selected Symbol (for detail views) ----
      selectedSymbol: null,
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

      // ---- Market Status ----
      marketStatus: "closed", // "open" | "closed" | "pre-open"
      setMarketStatus: (status) => set({ marketStatus: status }),

      // ---- Loading States ----
      loading: {
        indices: false,
        sectors: false,
        breadth: false,
        alerts: false,
      },
      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),

      // ---- Errors ----
      errors: {},
      setError: (key, message) =>
        set((state) => ({
          errors: { ...state.errors, [key]: message },
        })),
      clearError: (key) =>
        set((state) => {
          const errors = { ...state.errors };
          delete errors[key];
          return { errors };
        }),

      // ---- Reset ----
      reset: () =>
        set({
          marketData: {},
          sectorData: [],
          alerts: [],
          unreadAlertCount: 0,
          selectedSymbol: null,
          errors: {},
        }),
    })),
    { name: "MarketStore" }
  )
);
