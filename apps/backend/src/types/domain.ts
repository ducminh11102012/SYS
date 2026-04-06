import { CandidateSubmission, Exam } from "@sys/shared";

export type SubmissionGrade = {
  submissionId: string;
  examId: string;
  candidateId: string;
  partScores: Record<string, number>;
  feedback: Record<string, string>;
  totalScore: number;
  gradedAt: string;
};

export type StoredSubmission = CandidateSubmission & {
  id: string;
  createdAt: string;
};

export type Store = {
  exams: Map<string, Exam>;
  submissions: Map<string, StoredSubmission>;
  grades: Map<string, SubmissionGrade>;
};
