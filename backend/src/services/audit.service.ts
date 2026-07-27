import { AuditSuccessResponse } from '../types/audit.types';
import { fetchWebpage, FetchError } from '../utils/httpClient';
import { parseHtml } from '../utils/parser';
import { normalizeUrl } from '../validators/audit.validator';

export class AuditService {
  /**
   * Main audit service method. Validates content type, fetches webpage, parses HTML structure,
   * and returns full SEO statistics payload.
   */
  public async auditUrl(rawUrl: string): Promise<AuditSuccessResponse> {
    const normalizedUrl = normalizeUrl(rawUrl);

    // Fetch raw HTML & response statistics
    const fetchResult = await fetchWebpage(normalizedUrl);

    // Verify content type is HTML
    const contentTypeLower = fetchResult.contentType.toLowerCase();
    const isHtml =
      contentTypeLower.includes('text/html') ||
      contentTypeLower.includes('application/xhtml+xml') ||
      contentTypeLower.includes('text/xml') ||
      contentTypeLower.includes('application/xml');

    if (!isHtml) {
      const err: any = new Error(
        `Target URL returned non-HTML content type (${fetchResult.contentType}). Only HTML documents can be audited.`
      );
      err.statusCode = 400;
      err.code = 'NON_HTML_RESPONSE';
      throw err;
    }


    // Extract metrics using Cheerio parser
    const metrics = parseHtml(fetchResult.data);

    return {
      success: true,
      url: normalizedUrl,
      httpStatus: fetchResult.status,
      responseTimeMs: fetchResult.responseTimeMs,
      title: metrics.title,
      metaDescription: metrics.metaDescription,
      h1Count: metrics.h1Count,
      imagesWithoutAlt: metrics.imagesWithoutAlt,
      wordCount: metrics.wordCount,
      contentType: fetchResult.contentType,
    };
  }
}

export const auditService = new AuditService();
