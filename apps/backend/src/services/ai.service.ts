import { Exam, ExamPart } from "@sys/shared";
import { runtimeConfigService } from "./runtime-config.service";

type AiMessage = { role: "system" | "user"; content: string };

export class AiService {
  // Fallback local parser if AI endpoint isn't configured.
  async generateExamStructure(text: string, sourceFileName: string): Promise<Exam> {
    const prompt = [
      "Hãy chia tài liệu thành đề luyện thi HSG gồm reading, trắc nghiệm, tự luận.",
      "Mỗi phần cần có tiêu đề, prompt và nếu có đáp án thì giữ nguyên.",
      "Tổng điểm phải quy đổi về 20 điểm.",
      "Trả về JSON đúng schema Exam."
    ].join("\n");

    const aiResult = await this.callModel([
      { role: "system", content: "Bạn là AI tạo đề thi chuẩn hóa cho học sinh giỏi." },
      { role: "user", content: `${prompt}\n\nTài liệu:\n${text.slice(0, 12000)}` }
    ]);

    if (!aiResult) {
      return this.fallbackExam(text, sourceFileName);
    }

    try {
      const parsed = JSON.parse(aiResult) as Exam;
      return parsed;
    } catch {
      return this.fallbackExam(text, sourceFileName);
    }
  }

  async gradeWriting(question: string, answer: string, expected?: string): Promise<{ score: number; feedback: string }> {
    const result = await this.callModel([
      { role: "system", content: "Bạn là giám khảo chấm writing nghiêm túc, công bằng." },
      {
        role: "user",
        content: `Chấm câu trả lời theo thang 0-10 và trả JSON {\"score\":number,\"feedback\":string}.\nQuestion:${question}\nAnswer:${answer}\nExpected:${expected ?? "N/A"}`
      }
    ]);

    if (!result) {
      return { score: Math.min(10, Math.max(0, answer.length / 40)), feedback: "Chấm fallback theo độ đầy đủ nội dung." };
    }

    try {
      const parsed = JSON.parse(result) as { score: number; feedback: string };
      return parsed;
    } catch {
      return { score: 5, feedback: "AI trả về sai format, áp dụng điểm trung bình an toàn." };
    }
  }

  private async callModel(messages: AiMessage[]): Promise<string | null> {
    const cfg = runtimeConfigService.getAIConfig();
    if (!cfg.baseUrl || !cfg.apiKey || !cfg.model) {
      return null;
    }

    // Timeout to avoid UI hanging forever when provider is slow/down.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(cfg.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`
        },
        body: JSON.stringify({ model: cfg.model, messages, temperature: 0.2 }),
        signal: controller.signal
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private fallbackExam(text: string, sourceFileName: string): Exam {
    const parts: ExamPart[] = [
      {
        id: "p1",
        title: "Part 1 - Trắc nghiệm",
        type: "multiple_choice",
        maxScore: 6,
        prompt: "Đọc đoạn sau và chọn đáp án đúng.",
        options: ["A", "B", "C", "D"],
        answer: "A"
      },
      {
        id: "p2",
        title: "Part 2 - Reading",
        type: "reading",
        maxScore: 6,
        prompt: text.slice(0, 1200),
        answer: "Tóm tắt ý chính và dẫn chứng."
      },
      {
        id: "p3",
        title: "Part 3 - Writing",
        type: "essay",
        maxScore: 8,
        prompt: "Phân tích chuyên sâu nội dung tài liệu và đưa ra lập luận của em.",
        answer: "Bài viết cần có mở-thân-kết rõ ràng, luận cứ chặt chẽ."
      }
    ];

    return {
      id: `exam-${Date.now()}`,
      sourceFileName,
      language: "vi",
      subject: "Học sinh giỏi",
      parts,
      totalScore: 20,
      createdAt: new Date().toISOString()
    };
  }
}
