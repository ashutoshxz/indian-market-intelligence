import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// ---- Routes ----
import marketRoutes   from "./routes/market.routes.js";
import policyRoutes   from "./routes/policy.routes.js";
import earningsRoutes from "./routes/earnings.routes.js";
import alertsRoutes   from "./routes/alerts.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";

// ================================
// Indian Market Intelligence Platform
// backend/src/app.js
// ================================

const app = express();

// ================================
// Security & Core Middleware
// ================================

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin:      process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================================
// Logging
// ================================
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.LOG_FORMAT || "combined"));
}

// ================================
// Rate Limiting
// ================================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

app.use("/api", limiter);

// ================================
// Health Check
// ================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status:      "ok",
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime:      process.uptime(),
  });
});

// ================================
// API Routes
// ================================
app.use("/api/market",    marketRoutes);
app.use("/api/policy",    policyRoutes);
app.use("/api/earnings",  earningsRoutes);
app.use("/api/alerts",    alertsRoutes);
app.use("/api/insights",  insightsRoutes);
app.use("/api/watchlist", watchlistRoutes);

// ================================
// Error Handling
// ================================
app.use(notFound);
app.use(errorHandler);

export default app;
