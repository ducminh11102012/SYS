import cors from "cors";
import express from "express";
import configRoutes from "./routes/config.routes";
import examRoutes from "./routes/exam.routes";
import { errorMiddleware } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.get("/", (_req, res) => {
    res.type("html").send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><title>SYS Exam Platform</title></head>
<body style="font-family:Arial,sans-serif;max-width:900px;margin:30px auto;line-height:1.4">
  <h1>SYS - Nền tảng luyện thi HSG online</h1>
  <p>1) Cấu hình AI endpoint trước khi upload đề.</p>
  <form id="cfg" style="display:grid;gap:10px;max-width:560px">
    <input name="baseUrl" placeholder="AI Base URL" required />
    <input name="apiKey" placeholder="AI API Key" required />
    <input name="model" placeholder="Model" required />
    <button type="submit">Lưu cấu hình AI</button>
  </form>
  <p id="status"></p>
  <script>
    document.getElementById('cfg').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const body = Object.fromEntries(form.entries());
      const r = await fetch('/api/config', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
      document.getElementById('status').textContent = r.ok ? '✅ Đã lưu cấu hình AI' : '❌ Lưu thất bại';
    });
  </script>
</body>
</html>`);
  });

  app.get("/health", (_req, res) => res.json({ status: "ok", service: "sys-backend" }));
  app.use("/api/config", configRoutes);
  app.use("/api/exams", examRoutes);

  app.use(errorMiddleware);

  return app;
}
