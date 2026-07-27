# Page Pulse - Comprehensive Senior Technical Interview Guide

This guide contains **30 detailed technical interview questions and answers**, followed by deep-dive explanations of core architectural choices, network timing mechanisms, parsing logic, and line-by-line breakdowns of every key function in Page Pulse.

---

## Part 1: Core Architectural & Concept Deep Dives

### 1. Why Express.js?
**Answer**: Express is a minimalist, flexible, and unopinionated Node.js web application framework.
- **Micro-overhead & Speed**: Unlike monolithic frameworks (NestJS/LoopBack), Express introduces virtually zero runtime reflection overhead, making it ideal for low-latency API proxying and auditing services.
- **Middleware Ecosystem**: Enables seamless chaining of battle-tested security modules like `helmet`, `cors`, and `express-rate-limit`.
- **Ecosystem Standard**: Supertest integrates natively with Express app instances without requiring a listening TCP socket during test runs.

### 2. Why Cheerio?
**Answer**: Cheerio is a fast, flexible, and lean implementation of core jQuery designed specifically for the server side.
- **Performance**: Headless browser automation tools (Puppeteer / Playwright / Selenium) spin up full Chromium instances requiring 100MB+ RAM per request and 2-5 seconds startup overhead. Cheerio operates directly on raw HTML strings in memory, parsing DOM trees in under 5 milliseconds.
- **Security**: Cheerio does NOT execute JavaScript or load remote subresources (scripts, CSS, images), completely eliminating browser-based XSS execution risks during page parsing.

### 3. How is Response Time Measured?
**Answer**:
Response time measures the elapsed network round-trip time (RTT) from sending the HTTP GET request to receiving the first byte of response data.
In `httpClient.ts`:
```typescript
const startTime = Date.now();
const response = await axios(config);
const responseTimeMs = Date.now() - startTime;
```
This accurately captures DNS lookup time, TCP handshake, TLS negotiation, server processing time (TTFB), and content download time.

### 4. How HTML Parsing Works in Page Pulse
**Answer**:
1. Raw HTML text string is fetched by Axios.
2. Cheerio loads the string into a virtual DOM tree via `cheerio.load(htmlContent)`.
3. CSS selector queries extract desired nodes:
   - `$('title').first().text()` retrieves the HTML title tag.
   - `$('meta[name="description"]').attr('content')` retrieves meta descriptions.
   - `$('h1').length` counts `<h1>` tags.
   - `$('img')` loop inspects `alt` attribute existence.
   - Text node extraction removes `<script>` and `<style>` tags before splitting text by whitespace regex to compute word counts.

### 5. How Timeout Works
**Answer**:
The backend enforces a strict 10-second timeout limit using Axios `timeout: 10000` backed by Node's underlying `AbortController` / `http.ClientRequest.setTimeout`.
If the remote target server fails to respond within 10,000 milliseconds, Axios aborts the socket connection and throws an `ECONNABORTED` exception.
Our `httpClient.ts` wrapper catches this exception and converts it to a standard `504 Gateway Timeout` JSON response: `{ "success": false, "error": "Request timed out after 10 seconds" }`.

### 6. Why TypeScript?
**Answer**:
- **Compile-Time Safety**: Catches null/undefined dereferences, missing object properties, and type mismatches before runtime.
- **Strong API Contracts**: Interfaces like `AuditSuccessResponse` ensure the backend response strictly matches frontend expectations.
- **Refactoring Confidence**: Renaming properties across services, controllers, or components is automatically validated by the TypeScript compiler (`tsc`).

### 7. Why Jest & Supertest?
**Answer**:
- **Jest**: Zero-config test runner providing fast parallel execution, built-in assertion utilities (`expect`), test isolation, and mock function capabilities (`jest.mock()`).
- **Supertest**: Allows executing HTTP assertions against the Express `app` object directly in memory without binding to an open network port, preventing port collision issues during CI test runs.

### 8. Explain MVC Architecture in Page Pulse
**Answer**:
- **Model / Types & Validators (`types/`, `validators/`)**: Defines the data schema, URL structure constraints, and TypeScript interface contracts.
- **View / Frontend (`frontend/src/`)**: The React SaaS user interface that renders metrics, loading spinners, and error alerts.
- **Controller (`controllers/audit.controller.ts`)**: Receives HTTP requests, validates input using Zod, delegates business logic to services, and formats HTTP JSON responses.

### 9. Explain REST API & Resource Design
**Answer**:
Representational State Transfer (REST) is an architectural style based on standard HTTP verbs, stateless requests, and standardized status codes.
- `POST /api/audit`: Uses POST because the payload requires JSON request body parameters (`{ "url": "..." }`) and initiates a compute task.
- Status Codes: `200 OK` for valid audits, `400 Bad Request` for invalid input/non-HTML, `504 Gateway Timeout` for slow sites, `500 Server Error` for unexpected crashes.

### 10. Explain Core SEO Metrics Tracked
**Answer**:
- **Title Tag**: Crucial for search result titles (SERPs). Ideal length is 50-60 characters.
- **Meta Description**: Summary snippet shown in search results. Ideal length is 150-160 characters.
- **H1 Count**: Search engines expect exactly one primary `<h1>` per page to determine main topic hierarchy.
- **Missing Alt Images**: Critical for accessibility (screen readers) and Google Image SEO indexation.
- **Response Time**: Search engines rank fast pages higher (Core Web Vitals).

---

## Part 2: 30 Senior Engineering Interview Questions & Answers

### Q1. What happens when a user submits a URL in Page Pulse? Trace the entire lifecycle.
**Answer**:
1. User clicks "Analyze" or hits `Enter` in `AuditForm.tsx`.
2. Frontend sends an HTTP POST request to `/api/audit` with JSON payload `{ "url": "https://example.com" }`.
3. Express routes the request through `helmet`, `cors`, and `auditRateLimiter`.
4. `auditController` invokes `auditSchema.safeParse()` (Zod) to validate URL syntax.
5. `auditService.auditUrl()` calls `httpClient.fetchWebpage()` which measures request start time, sets 10s timeout, and fetches HTML string via Axios.
6. `fetchWebpage` checks content-type header and returns status code, response time, and raw HTML.
7. `auditService` calls `parser.parseHtml()` (Cheerio) to extract Title, Description, H1 count, missing alt images, and word count.
8. Controller returns `200 OK` JSON to React frontend.
9. Frontend updates state, renders 8 stat cards, and saves entry to `localStorage`.

### Q2. How do you prevent Server-Side Request Forgery (SSRF) vulnerabilities in a web auditor?
**Answer**:
SSRF occurs when an attacker inputs internal IPs (e.g. `http://167.0.0.1`, `http://169.254.169.254/latest/meta-data/`) forcing the server to read private cloud metadata. We mitigate this by validating URLs via Zod, enforcing `http:` or `https:` protocols, and rejecting non-public DNS target hosts.

### Q3. How does CORS work, and why is it configured in `app.ts`?
**Answer**:
Cross-Origin Resource Sharing (CORS) is a browser security mechanism that blocks web applications on one domain (`http://localhost:5173`) from making fetch requests to an API on another domain (`http://localhost:5000`). We configure `cors()` in `app.ts` to explicitly allow requests from approved frontend origins.

### Q4. How do you prevent memory leaks when parsing massive HTML files (e.g. 50MB)?
**Answer**:
In `httpClient.ts`, we set `maxContentLength: 10 * 1024 * 1024` (10MB limit). If a response exceeds 10MB, Axios aborts stream reception immediately, protecting server RAM from memory overflow.

### Q5. What is the difference between unit testing and integration testing in this project?
**Answer**:
- **Unit Testing**: Testing `parseHtml()` in `parser.ts` directly with mock HTML strings without network calls.
- **Integration Testing**: Testing the `POST /api/audit` HTTP endpoint end-to-end using `supertest(app)` while mocking `fetchWebpage` to simulate happy path, 504 timeouts, and 400 error codes.

### Q6. Why did you use `cheerio.load()` instead of regular expressions to parse HTML?
**Answer**:
HTML is a context-free grammar that cannot be reliably parsed using regular expressions due to nested elements, unclosed tags, attributes containing `>` characters, and arbitrary whitespace. Cheerio builds a true HTML DOM tree handleable via CSS selectors.

### Q7. How does rate limiting protect Page Pulse?
**Answer**:
`express-rate-limit` tracks client IP addresses and enforces a maximum limit (e.g., 60 requests per 15-minute window). This prevents malicious bots from abusing the endpoint, overwhelming server bandwidth, or getting the server IP blacklisted by target websites.

### Q8. What is Helmet middleware, and what security headers does it set?
**Answer**:
Helmet sets standard security HTTP headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security` (HSTS), and disables `X-Powered-By` so attackers cannot identify Express as the backend engine.

### Q9. How do you handle non-HTML response types (e.g., PDF or JSON)?
**Answer**:
In `auditService`, we inspect `response.headers['content-type']`. If it does not contain `text/html`, `application/xhtml+xml`, or `application/xml`, the service throws a `FetchError` returning a `400 Bad Request` explaining that only HTML documents can be audited.

### Q10. How does the frontend handle dark mode persistence?
**Answer**:
Dark mode state is initialized from `localStorage.getItem('page_pulse_theme')` or system preferences via `window.matchMedia('(prefers-color-scheme: dark)')`. A React `useEffect` toggles the `dark` class on `document.documentElement`.

### Q11. Explain how the word count function works.
**Answer**:
`countWords()` strips `<script>` and `<style>` tags via regex, removes all remaining HTML tags, replaces multi-spaces with single spaces, splits by space, and filters out empty strings.

### Q12. How do you handle redirects (e.g., HTTP 301/302) during page audits?
**Answer**:
Axios is configured with `maxRedirects: 5`. It automatically follows up to 5 HTTP redirects, auditing the final destination URL while capturing the ultimate response time and status code.

### Q13. Why use `safeParse()` instead of `parse()` in Zod?
**Answer**:
`parse()` throws a ZodError exception when validation fails, requiring an extra try-catch block. `safeParse()` returns a clean result object `{ success: boolean, data?: T, error?: ZodError }` allowing clean conditional handling in controllers.

### Q14. What is the role of `ts-node-dev` in development?
**Answer**:
`ts-node-dev` executes TypeScript files directly in Node without requiring manual `tsc` compilation to disk, automatically restarting the server whenever code changes are saved.

### Q15. How is `express-rate-limit` deployed safely behind reverse proxies like Nginx or Render?
**Answer**:
In production, Express must set `app.set('trust proxy', 1)` so `express-rate-limit` reads client IP addresses from `X-Forwarded-For` headers accurately.

### Q16. How does Supertest test Express apps without opening network ports?
**Answer**:
Supertest uses Node's internal `http.createServer(app)` API to dispatch mock `http.IncomingMessage` and `http.ServerResponse` objects directly to the Express handler stack in memory.

### Q17. How do you calculate image tags missing `alt` attributes?
**Answer**:
Cheerio iterates over all `img` elements using `$('img').each()`. If `alt` is `undefined`, `null`, or empty string after trimming (`alt.trim() === ''`), the counter increments.

### Q18. Why use `clsx` or `tailwind-merge` in React components?
**Answer**:
`tailwind-merge` resolves conflicting Tailwind class names dynamically (e.g., merging `px-2` and `px-4`), ensuring clean UI component styling without CSS specificity glitches.

### Q19. How do you ensure the backend server never crashes on unhandled promise rejections?
**Answer**:
All async controller logic is wrapped in `try-catch` blocks that forward unexpected errors to `next(error)`, which triggers `errorHandler.ts` to return a `500` response cleanly.

### Q20. How is `process.env` typed and secured in TypeScript?
**Answer**:
Environment variables are managed with `dotenv` and can be strictly typed by extending `NodeJS.ProcessEnv` interface in global type definitions.

### Q21. What is the difference between HTTP status code 400, 404, 502, and 504 in Page Pulse?
**Answer**:
- `400 Bad Request`: User submitted invalid URL or target returned non-HTML data.
- `404 Not Found`: DNS lookup failed for domain name.
- `502 Bad Gateway`: Target web server refused network connection.
- `504 Gateway Timeout`: Target server took over 10 seconds to respond.

### Q22. How does the JSON Export feature work on the frontend?
**Answer**:
`handleExportJson()` converts the `auditResult` state into an encoded data URI (`data:text/json;charset=utf-8,...`), dynamically creates an `<a>` element with a `download` attribute, triggers a programmatic click, and cleans up the DOM node.

### Q23. Why is custom `User-Agent` string required when fetching web pages?
**Answer**:
Many websites block default HTTP client headers (e.g., `axios/1.7.9`) with `403 Forbidden` status codes to prevent web scraping. Adding a standard desktop Chrome User-Agent header ensures accurate audit results.

### Q24. How does Cheerio handle malformed or invalid HTML documents?
**Answer**:
Cheerio uses `htmlparser2` under the hood, which is a forgiving, tolerant HTML parser capable of handling unclosed tags, malformed syntax, and missing headers without crashing.

### Q25. Why keep state in `localStorage` instead of cookies?
**Answer**:
`localStorage` provides 5MB+ of client-side storage per domain and is not automatically transmitted with every HTTP request header (unlike cookies), preserving network efficiency.

### Q26. How do you measure title length recommendations?
**Answer**:
Standard SEO best practices recommend titles between 50 and 60 characters. Shorter titles miss keyword opportunities, while longer titles get truncated with ellipses (`...`) on search engine results pages.

### Q27. What is H1 tag optimal count in modern SEO?
**Answer**:
Modern SEO standards recommend exactly **1 H1 tag** per page representing the main document title. Multiple H1 tags dilute heading hierarchy, while 0 H1 tags hurt accessibility and search engine indexing.

### Q28. How does `jest.mock()` work in `audit.test.ts`?
**Answer**:
`jest.mock('../utils/httpClient')` intercepts calls to `fetchWebpage()` and replaces them with a mock function (`mockResolvedValue` or `mockRejectedValue`), allowing tests to simulate network responses and timeouts deterministically.

### Q29. How is Vercel configured for Single Page Application (SPA) routing?
**Answer**:
Vercel requires a `vercel.json` rewrite rule `[{ "source": "/(.*)", "destination": "/index.html" }]` so client-side routes don't return 404 errors when reloaded directly in browser.

### Q30. How is Render configured for deploying Node/Express backend?
**Answer**:
Render is configured with Build Command `npm run build` (runs `tsc`) and Start Command `npm start` (runs `node dist/server.js`), with environment variables set in the Render Dashboard.

---

## Part 3: Line-by-Line Function Explanations

### Function 1: `fetchWebpage()` in `src/utils/httpClient.ts`
```typescript
export const fetchWebpage = async (targetUrl: string, timeoutMs = 10000): Promise<FetchResult> => { ... }
```
- **Line-by-line**:
  - `const startTime = Date.now();`: Records timestamp right before starting HTTP request.
  - `axios(config)`: Dispatches GET request with 10s timeout, max 5 redirects, custom User-Agent, and 10MB memory safety limits.
  - `validateStatus: () => true`: Tells Axios not to throw error on 404/500 HTTP status codes, allowing us to inspect actual target HTTP status.
  - `Date.now() - startTime`: Computes total round-trip time in milliseconds.
  - `catch (error)`: Intercepts network failures, mapping `ECONNABORTED` to 504 timeouts, `ENOTFOUND` to DNS failures, and `ECONNREFUSED` to connection errors.

### Function 2: `parseHtml()` in `src/utils/parser.ts`
```typescript
export const parseHtml = (htmlContent: string): ExtractedMetrics => { ... }
```
- **Line-by-line**:
  - `const $ = cheerio.load(htmlContent)`: Constructs server-side DOM tree from HTML string.
  - `$('title').first().text().trim()`: Queries `<title>` tag text.
  - `$('meta[name="description"]').attr('content')`: Extracts meta description attribute.
  - `$('h1').length`: Counts all H1 elements.
  - `$('img').each(...)`: Checks every image tag to determine if `alt` attribute is absent or whitespace.
  - `bodyClone.find('script, style, noscript').remove()`: Strips non-visible tags before calculating text length.
  - `countWords(bodyText)`: Executes word counter on cleaned text string.
