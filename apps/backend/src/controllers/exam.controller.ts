import { CandidateSubmissionSchema, ExamSchema } from "@sys/shared";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AiService } from "../services/ai.service";
import { DocumentService } from "../services/document.service";
import { GradingService } from "../services/grading.service";
import { store } from "../services/store.service";
import { SubmissionGrade } from "../types/domain";

const aiService = new AiService();
const docService = new DocumentService();
const gradingService = new GradingService(aiService);

export class ExamController {
  async uploadExam(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ message: "Missing exam file" });
      return;
    }

    const text = await docService.extractText(req.file.originalname, req.file.buffer);
    const examDraft = await aiService.generateExamStructure(text, req.file.originalname);
    const exam = ExamSchema.parse(examDraft);

    store.exams.set(exam.id, exam);
    res.status(201).json({ exam });
  }

  async listExams(_: Request, res: Response): Promise<void> {
    res.json({ exams: Array.from(store.exams.values()) });
  }

  async getExam(req: Request, res: Response): Promise<void> {
    const examId = Array.isArray(req.params.examId) ? req.params.examId[0] : req.params.examId;
    const exam = store.exams.get(examId);
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    res.json({ exam });
  }


  async getExamForCandidate(req: Request, res: Response): Promise<void> {
    const examId = Array.isArray(req.params.examId) ? req.params.examId[0] : req.params.examId;
    const exam = store.exams.get(examId);

    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    const safeExam = {
      ...exam,
      parts: exam.parts.map((part) => ({
        id: part.id,
        title: part.title,
        type: part.type,
        maxScore: part.maxScore,
        prompt: part.prompt,
        options: part.options
      }))
    };

    res.json({ exam: safeExam });
  }

  async submitExam(req: Request, res: Response): Promise<void> {
    const submission = CandidateSubmissionSchema.parse(req.body);
    const exam = store.exams.get(submission.examId);

    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    const submissionId = uuidv4();
    store.submissions.set(submissionId, {
      ...submission,
      id: submissionId,
      createdAt: new Date().toISOString()
    });

    const partScores: Record<string, number> = {};
    const feedback: Record<string, string> = {};
    let total = 0;

    for (const part of exam.parts) {
      const answer = submission.answers[part.id] ?? "";
      const graded = await gradingService.gradePart(part, answer);
      partScores[part.id] = graded.score;
      feedback[part.id] = graded.feedback;
      total += graded.score;
    }

    const grade: SubmissionGrade = {
      submissionId,
      examId: exam.id,
      candidateId: submission.candidateId,
      partScores,
      feedback,
      totalScore: Number(Math.min(20, total).toFixed(2)),
      gradedAt: new Date().toISOString()
    };

    store.grades.set(submissionId, grade);
    res.status(201).json({ submissionId, grade });
  }

  async getGrade(req: Request, res: Response): Promise<void> {
    const submissionId = Array.isArray(req.params.submissionId) ? req.params.submissionId[0] : req.params.submissionId;
    const grade = store.grades.get(submissionId);

    if (!grade) {
      res.status(404).json({ message: "Grade not found" });
      return;
    }

    res.json({ grade });
  }
}
