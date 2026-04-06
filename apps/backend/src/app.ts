import cors from "cors";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import configRoutes from "./routes/config.routes";
import examRoutes from "./routes/exam.routes";
import { errorMiddleware } from "./middleware/error.middleware";

function resolvePublicDir(): string {
  const distPublic = path.join(__dirname, "public");
  if (fs.existsSync(distPublic)) {
    return distPublic;
  }

  // Dev mode fallback (`tsx src/server.ts`): serve files directly from src/public.
  return path.join(process.cwd(), "apps/backend/src/public");
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));
  app.use(express.static(resolvePublicDir()));

  app.get("/health", (_req, res) => res.json({ status: "ok", service: "sys-backend" }));
  app.use("/api/config", configRoutes);
  app.use("/api/exams", examRoutes);

  app.use(errorMiddleware);

  return app;
}
