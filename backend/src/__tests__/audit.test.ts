import request from 'supertest';
import app from '../app';
import * as httpClient from '../utils/httpClient';
import { parseHtml } from '../utils/parser';

// Mock httpClient to prevent real external HTTP calls during unit/integration tests
jest.mock('../utils/httpClient');

describe('Page Pulse Audit API & Parser Test Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Parser Unit Tests (Cheerio)', () => {
    it('1. Parsing Title - should extract standard title element text', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head><title>Test Page Title for SEO</title></head>
          <body><h1>Main Heading</h1></body>
        </html>
      `;
      const result = parseHtml(html);
      expect(result.title).toBe('Test Page Title for SEO');
    });

    it('1b. Parsing Title - should fallback to og:title if title tag is absent', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta property="og:title" content="Open Graph Title"></head>
          <body></body>
        </html>
      `;
      const result = parseHtml(html);
      expect(result.title).toBe('Open Graph Title');
    });

    it('2. Parsing H1 count - should accurately count multiple H1 headings', () => {
      const html = `
        <html>
          <body>
            <h1>First H1 Heading</h1>
            <p>Content</p>
            <h1>Second H1 Heading</h1>
            <h1>Third H1 Heading</h1>
          </body>
        </html>
      `;
      const result = parseHtml(html);
      expect(result.h1Count).toBe(3);
    });

    it('2b. Parsing H1 count - should return 0 when no H1 elements exist', () => {
      const html = `<html><body><h2>Only H2 tag</h2></body></html>`;
      const result = parseHtml(html);
      expect(result.h1Count).toBe(0);
    });

    it('3. Parsing Missing Alt - should count images without alt or with whitespace-only alt', () => {
      const html = `
        <html>
          <body>
            <img src="pic1.png" alt="Valid Alt Text" />
            <img src="pic2.png" />
            <img src="pic3.png" alt="" />
            <img src="pic4.png" alt="   " />
          </body>
        </html>
      `;
      const result = parseHtml(html);
      expect(result.imagesWithoutAlt).toBe(3);
    });

    it('4. Word count calculation - should ignore scripts and style tags', () => {
      const html = `
        <html>
          <head>
            <style>body { color: red; margin: 0; }</style>
          </head>
          <body>
            <script>const x = 100;</script>
            <h1>Hello World</h1>
            <p>This is a test paragraph for word counting.</p>
          </body>
        </html>
      `;
      const result = parseHtml(html);
      expect(result.wordCount).toBe(10);
    });
  });

  describe('POST /api/audit API Integration Tests', () => {
    it('1. Happy Path - should return 200 and complete audit report for valid HTML webpage', async () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Digital Heroes Training</title>
            <meta name="description" content="Empowering future software engineers." />
          </head>
          <body>
            <h1>Welcome to Digital Heroes</h1>
            <img src="hero.png" alt="Hero Image" />
            <img src="missing.png" />
            <p>Learning modern web app development with React, Node, and TypeScript.</p>
          </body>
        </html>
      `;

      (httpClient.fetchWebpage as jest.Mock).mockResolvedValue({
        data: sampleHtml,
        status: 200,
        contentType: 'text/html; charset=utf-8',
        responseTimeMs: 145,
      });

      const response = await request(app)
        .post('/api/audit')
        .send({ url: 'https://digitalheroesco.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        url: 'https://digitalheroesco.com',
        httpStatus: 200,
        responseTimeMs: 145,
        title: 'Digital Heroes Training',
        metaDescription: 'Empowering future software engineers.',
        h1Count: 1,
        imagesWithoutAlt: 1,
        wordCount: 14,
        contentType: 'text/html; charset=utf-8',
      });
    });

    it('2. Invalid URL - should reject malformed or non-http URLs with 400 Bad Request', async () => {
      const response = await request(app)
        .post('/api/audit')
        .send({ url: 'invalid_url_with_no_domain' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('3. Non-HTML Response - should return error when target URL returns JSON or image', async () => {
      (httpClient.fetchWebpage as jest.Mock).mockResolvedValue({
        data: '{"key": "value"}',
        status: 200,
        contentType: 'application/json',
        responseTimeMs: 90,
      });

      const response = await request(app)
        .post('/api/audit')
        .send({ url: 'https://api.example.com/data.json' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('non-HTML content type');
    });

    it('4. Timeout - should return 504 Gateway Timeout when webpage takes longer than 10 seconds', async () => {
      const timeoutError: any = new Error('Request timed out after 10 seconds');
      timeoutError.statusCode = 504;
      timeoutError.code = 'TIMEOUT';

      (httpClient.fetchWebpage as jest.Mock).mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/audit')
        .send({ url: 'https://slow-responding-website.com' });

      expect(response.status).toBe(504);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('timed out');
    });
  });
});
