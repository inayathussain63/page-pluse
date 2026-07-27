export interface AuditRequestDTO {
  url: string;
}

export interface AuditSuccessResponse {
  success: true;
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  imagesWithoutAlt: number;
  wordCount: number;
  contentType: string;
}

export interface AuditErrorResponse {
  success: false;
  error: string;
}

export type AuditResponse = AuditSuccessResponse | AuditErrorResponse;

export interface ExtractedMetrics {
  title: string;
  metaDescription: string;
  h1Count: number;
  imagesWithoutAlt: number;
  wordCount: number;
}
