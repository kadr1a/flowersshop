import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./utils/prisma.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";
import cartRoutes from "./routes/cart.js";
import favoritesRoutes from "./routes/favorites.js";
import ordersRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const [flowers, suppliers, sellers] = await Promise.all([
      prisma.flower.count(),
      prisma.supplier.count(),
      prisma.seller.count(),
    ]);
    res.json({
      status: "ok",
      service: "flowershop-backend",
      database: "connected",
      counts: { flowers, suppliers, sellers },
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      service: "flowershop-backend",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
