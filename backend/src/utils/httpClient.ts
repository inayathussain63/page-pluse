import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds timeout limit
const MAX_RESPONSE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB maximum safety limit

export interface FetchResult {
  data: string;
  status: number;
  contentType: string;
  responseTimeMs: number;
}

export class FetchError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = 'FetchError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}


/**
 * Executes a GET request with strict timeout, user-agent headers, and response size guards.
 * Returns response body string, HTTP status code, content-type header, and measured response time in ms.
 */
export const fetchWebpage = async (targetUrl: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<FetchResult> => {
  const startTime = Date.now();

  const config: AxiosRequestConfig = {
    method: 'GET',
    url: targetUrl,
    timeout: timeoutMs,
    maxContentLength: MAX_RESPONSE_SIZE_BYTES,
    maxBodyLength: MAX_RESPONSE_SIZE_BYTES,
    maxRedirects: 5,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PagePulseAuditBot/1.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    validateStatus: () => true, // Capture all HTTP status codes (200, 404, 500 etc.)
    responseType: 'text',
  };

  try {
    const response: AxiosResponse<string> = await axios(config);
    const responseTimeMs = Date.now() - startTime;
    const contentType = (response.headers['content-type'] || 'text/html').toString();

    return {
      data: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      status: response.status,
      contentType,
      responseTimeMs,
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;

    if (axios.isCancel(error) || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new FetchError(`Request timed out after ${timeoutMs / 1000} seconds`, 504, 'TIMEOUT');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      throw new FetchError('DNS resolution failed. Target domain could not be found.', 404, 'DNS_FAILURE');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      throw new FetchError('Connection refused or reset by server.', 502, 'CONNECTION_FAILURE');
    }

    if (error.code === 'ERR_INVALID_URL') {
      throw new FetchError('Invalid URL address supplied.', 400, 'INVALID_URL');
    }

    throw new FetchError(error.message || 'Failed to connect to target URL', 500, 'FETCH_FAILED');
  }
};
