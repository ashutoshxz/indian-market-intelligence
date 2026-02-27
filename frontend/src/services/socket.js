import { io } from "socket.io-client";
import { useMarketStore } from "@store/marketStore";

// ================================
// Indian Market Intelligence Platform
// frontend/src/services/socket.js
// ================================

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";

let socket = null;
let reconnectTimer = null;
const MAX_RETRIES = 5;
let retryCount = 0;

// ---- Initialize Socket ----
export const initSocket = () => {
  if (socket?.connected) return socket;

  socket = io(WS_URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: MAX_RETRIES,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 10000,
  });

  // ---- Lifecycle Events ----
  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
    retryCount = 0;
    useMarketStore.getState().setConnectionStatus("connected");

    // Subscribe to default channels on connect
    socket.emit("subscribe", {
      channels: ["indices", "market:breadth", "market:status", "alerts"],
    });
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Socket] Disconnected:", reason);
    useMarketStore.getState().setConnectionStatus("disconnected");
  });

  socket.on("reconnecting", (attempt) => {
    retryCount = attempt;
    console.log(`[Socket] Reconnecting... attempt ${attempt}`);
    useMarketStore.getState().setConnectionStatus("reconnecting");
  });

  socket.on("reconnect_failed", () => {
    console.error("[Socket] Reconnection failed after max retries");
    useMarketStore.getState().setConnectionStatus("disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  // ---- Market Data Events ----
  socket.on("market:update", (data) => {
    useMarketStore.getState().setMarketData(data);
  });

  socket.on("indices:update", (data) => {
    useMarketStore.getState().setIndices(data);
  });

  socket.on("market:breadth", (data) => {
    useMarketStore.getState().setBreadth(data);
  });

  socket.on("market:status", (data) => {
    useMarketStore.getState().setMarketStatus(data.status);
  });

  socket.on("sector:update", (data) => {
    useMarketStore.getState().setSectorData(data);
  });

  // ---- Alert Events ----
  socket.on("alert:triggered", (alert) => {
    useMarketStore.getState().addAlert(alert);
  });

  return socket;
};

// ---- Get existing socket instance ----
export const getSocket = () => socket;

// ---- Subscribe to a symbol's live feed ----
export const subscribeSymbol = (symbol) => {
  if (!socket?.connected) return;
  socket.emit("subscribe:symbol", { symbol });
};

// ---- Unsubscribe from a symbol's live feed ----
export const unsubscribeSymbol = (symbol) => {
  if (!socket?.connected) return;
  socket.emit("unsubscribe:symbol", { symbol });
};

// ---- Subscribe to multiple channels ----
export const subscribeChannels = (channels = []) => {
  if (!socket?.connected) return;
  socket.emit("subscribe", { channels });
};

// ---- Disconnect cleanly ----
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};
