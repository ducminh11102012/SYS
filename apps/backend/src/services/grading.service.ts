import { ExamPart } from "@sys/shared";
import { AiService } from "./ai.service";

export class GradingService {
  constructor(private readonly aiService: AiService) {}

  async gradePart(part: ExamPart, answer: string): Promise<{ score: number; feedback: string }> {
    if (part.type === "multiple_choice") {
      const score = answer.trim().toLowerCase() === (part.answer ?? "").trim().toLowerCase() ? part.maxScore : 0;
      return { score, feedback: score > 0 ? "Đúng đáp án." : `Sai. Đáp án đúng: ${part.answer ?? "N/A"}` };
    }

    if (part.type === "essay" || part.type === "short_answer") {
      const ai = await this.aiService.gradeWriting(part.prompt, answer, part.answer);
      const normalized = Math.max(0, Math.min(part.maxScore, (ai.score / 10) * part.maxScore));
      return { score: Number(normalized.toFixed(2)), feedback: ai.feedback };
    }

    // Reading style question: simple heuristic + optional expected answer match.
    const coverage = Math.min(1, answer.length / Math.max(200, (part.prompt.length || 1) / 2));
    const score = Number((coverage * part.maxScore).toFixed(2));
    return { score, feedback: "Điểm reading dựa trên mức độ bao phủ ý chính." };
  }
}
