import { env } from "../config/env";

export type RuntimeAIConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

class RuntimeConfigService {
  private aiConfig: RuntimeAIConfig = {
    baseUrl: env.AI_BASE_URL ?? "",
    apiKey: env.AI_API_KEY ?? "",
    model: env.AI_MODEL ?? ""
  };

  getAIConfig(): RuntimeAIConfig {
    return this.aiConfig;
  }

  setAIConfig(config: RuntimeAIConfig): RuntimeAIConfig {
    this.aiConfig = config;
    return this.aiConfig;
  }
}

export const runtimeConfigService = new RuntimeConfigService();
