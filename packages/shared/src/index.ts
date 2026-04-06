import { z } from "zod";

export const PartTypeSchema = z.enum(["multiple_choice", "reading", "essay", "short_answer"]);

export const ExamPartSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: PartTypeSchema,
  maxScore: z.number().int().positive(),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional()
});

export const ExamSchema = z.object({
  id: z.string(),
  sourceFileName: z.string(),
  language: z.string().default("vi"),
  subject: z.string(),
  parts: z.array(ExamPartSchema),
  totalScore: z.number().default(20),
  createdAt: z.string()
});

export const CandidateSubmissionSchema = z.object({
  examId: z.string(),
  candidateId: z.string(),
  answers: z.record(z.string(), z.string())
});

export type PartType = z.infer<typeof PartTypeSchema>;
export type ExamPart = z.infer<typeof ExamPartSchema>;
export type Exam = z.infer<typeof ExamSchema>;
export type CandidateSubmission = z.infer<typeof CandidateSubmissionSchema>;
