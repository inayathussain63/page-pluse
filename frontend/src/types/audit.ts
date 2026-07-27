export interface AuditResponse {
  success: boolean;
  url?: string;
  httpStatus?: number;
  responseTimeMs?: number;
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  imagesWithoutAlt?: number;
  wordCount?: number;
  contentType?: string;
  error?: string;
}

export interface AuditHistoryItem {
  id: string;
  url: string;
  timestamp: string;
  httpStatus: number;
  responseTimeMs: number;
}
