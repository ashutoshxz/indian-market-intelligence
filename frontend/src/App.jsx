import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Layout
import MainLayout from "@components/common/MainLayout";

// Pages
import Dashboard from "@pages/Dashboard";
import Policy from "@pages/Policy";
import Earnings from "@pages/Earnings";
import Alerts from "@pages/Alerts";
import Insights from "@pages/Insights";
import Settings from "@pages/Settings";
import NotFound from "@pages/NotFound";

// Store
import { useMarketStore } from "@store/marketStore";

// WebSocket
import { initSocket } from "@services/socket";

// ================================
// Indian Market Intelligence Platform
// frontend/src/App.jsx
// ================================

export default function App() {
  const { setMarketData, setConnectionStatus } = useMarketStore();

  // Initialize WebSocket connection on app mount
  useEffect(() => {
    const socket = initSocket();

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("market:update", (data) => {
      setMarketData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [setMarketData, setConnectionStatus]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Core pages */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="policy" element={<Policy />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="insights" element={<Insights />} />
        <Route path="settings" element={<Settings />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
