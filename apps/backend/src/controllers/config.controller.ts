import { Request, Response } from "express";
import { z } from "zod";
import { runtimeConfigService } from "../services/runtime-config.service";

const AIConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().min(1)
});

export class ConfigController {
  getConfig(_req: Request, res: Response): void {
    const current = runtimeConfigService.getAIConfig();
    res.json({ ...current, apiKey: current.apiKey ? "***configured***" : "" });
  }

  setConfig(req: Request, res: Response): void {
    const config = AIConfigSchema.parse(req.body);
    runtimeConfigService.setAIConfig(config);
    res.status(200).json({ message: "AI config updated" });
  }
}
