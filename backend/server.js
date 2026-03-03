import app from "./src/app.js";
import http from "http";
import { Server } from "socket.io";
import { initSocketHandlers } from "./src/sockets/socketHandlers.js";
import { connectDB } from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import logger from "./src/utils/logger.js";

// ================================
// Indian Market Intelligence Platform
// backend/server.js
// ================================

const PORT = process.env.BACKEND_PORT || 5000;
const HOST = process.env.BACKEND_HOST || "0.0.0.0";

// ---- Create HTTP server ----
const httpServer = http.createServer(app);

// ---- Attach Socket.IO ----
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ---- Make io accessible in routes via app ----
app.set("io", io);

// ---- Bootstrap ----
async function bootstrap() {
  try {
    // Connect PostgreSQL via Prisma
    await connectDB();
    logger.info("✓ PostgreSQL connected");

    // Connect Redis
    await connectRedis();
    logger.info("✓ Redis connected");

    // Register Socket.IO event handlers
    initSocketHandlers(io);
    logger.info("✓ WebSocket handlers registered");

    // Start HTTP + WS server
    httpServer.listen(PORT, HOST, () => {
      logger.info(`✓ Server running at http://${HOST}:${PORT}`);
      logger.info(`✓ WebSocket listening on ws://${HOST}:${PORT}`);
      logger.info(`  Environment : ${process.env.NODE_ENV}`);
      logger.info(`  AI Service  : ${process.env.AI_SERVICE_URL}`);
    });

  } catch (err) {
    logger.error("✗ Bootstrap failed:", err);
    process.exit(1);
  }
}

bootstrap();

// ---- Graceful shutdown ----
const shutdown = async (signal) => {
  logger.info(`[${signal}] Graceful shutdown initiated...`);
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("uncaughtException",  (err) => { logger.error("Uncaught Exception:",  err); process.exit(1); });
process.on("unhandledRejection", (err) => { logger.error("Unhandled Rejection:", err); process.exit(1); });
