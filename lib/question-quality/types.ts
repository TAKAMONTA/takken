export type QualityPriority = "critical" | "high" | "medium" | "low";

export interface QualityIssue {
  questionId: number;
  category: string;
  priority: QualityPriority;
  code: string;
  reason: string;
  sourceHint?: string;
}

export interface QualityAuditResult {
  scannedAt: string;
  totalQuestions: number;
  issueCount: number;
  byPriority: Record<QualityPriority, number>;
  issues: QualityIssue[];
}

export interface PreparedQuestionStats {
  input: number;
  quarantined: number;
  deduped?: number;
  published: number;
  enriched: number;
  graded: number;
}
