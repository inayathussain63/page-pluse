# Page Pulse - Architectural Design Decisions & Strategy

This document provides in-depth technical justifications for the architectural design decisions, library selections, error-handling strategy, and directory structure of **Page Pulse**.

---

## 1. Three Key Design Decisions

### Decision 1: Separation of HTTP Fetching Engine and DOM Parsing Pipeline
- **Context & Problem**: In web audit tools, mixing network requests with HTML DOM extraction leads to tight coupling, making unit testing difficult, error boundary handling messy, and timeout management unpredictable.
- **Decision**: Decouple network execution into `httpClient.ts` and DOM parsing into `parser.ts`, orchestrated by `audit.service.ts`.
- **Reasoning**:
  - `httpClient.ts` focuses exclusively on HTTP protocols, status codes, timeout enforcement (10s AbortSignal), user-agent header rotation, and Content-Type verification.
  - `parser.ts` operates purely on string input using Cheerio, making it 100% deterministic and unit-testable without network dependencies.
  - Test suites can mock `httpClient` while testing `parser` directly with fixture HTML strings, enabling fast, isolated tests.

### Decision 2: Fail-Safe Input Validation & Normalization with Zod
- **Context & Problem**: Users may input URLs in various formats (`example.com`, `http://example.com`, `https://example.com/path?query=1`), or invalid strings (`ftp://server`, `javascript:alert(1)`).
- **Decision**: Combine Zod schema validation with automatic URL protocol normalization (`normalizeUrl`).
- **Reasoning**:
  - Zod enforces strict type safety and schema validation at runtime before reaching application logic.
  - Auto-prepending `https://` when protocol is omitted improves UX without failing user requests needlessly.
  - Disallowing non-HTTP/HTTPS protocols prevents SSRF (Server-Side Request Forgery) attacks targeting local resources (e.g. `file:///etc/passwd`).

### Decision 3: Stateless Backend Architecture with Local Storage Client History
- **Context & Problem**: Internship assessment apps often over-engineer history features by adding database dependencies (e.g., MongoDB / PostgreSQL), adding deployment complexity on free-tier hosting services like Render.
- **Decision**: Keep backend REST API strictly stateless and performant, while persisting recent user audits on the frontend using browser `localStorage`.
- **Reasoning**:
  - Ensures 100% backend scalability and zero database connection latency.
  - Zero deployment overhead on Render free tier.
  - Enhances privacy: User search history stays strictly inside their own browser.

---

## 2. Library Selection Rationale

| Library | Category | Why Selected over Alternatives |
|---|---|---|
| **Express** | Backend Framework | Lightweight, battle-tested standard in Node.js ecosystem. Provides seamless middleware chaining (Helmet, CORS, Rate Limit) and minimal latency compared to heavier frameworks like NestJS. |
| **Cheerio** | HTML Parser | Fast, lightweight server-side jQuery implementation. Operates on raw HTML strings without spinning up a headless browser (like Puppeteer/Playwright), resulting in **100x faster parsing** and dramatically lower RAM/CPU consumption. |
| **Axios** | HTTP Client | Superior timeout handling (`timeout` setting + AbortController), request/response interceptors, automatic JSON handling, and clean error classification (`ECONNABORTED`, `ENOTFOUND`) compared to native `fetch`. |
| **Zod** | Validation | Type-safe schema declaration with automatic TypeScript type inference (`z.infer<typeof schema>`). Provides clear human-readable error messages for API consumers. |
| **Helmet** | Security | Automatically configures essential HTTP response security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) to shield against common web vulnerabilities. |
| **express-rate-limit** | Security | Protects backend against Denial of Service (DoS) and abuse by limiting IP request rates within specified time windows. |
| **Jest & Supertest** | Testing | De-facto standard for Node/TS testing. Supertest allows executing HTTP requests against Express apps without binding to a physical network port. |
| **Vite & React** | Frontend | Lightning-fast Hot Module Replacement (HMR) and optimized rollup production bundles. |
| **TailwindCSS** | Styling | Utility-first CSS framework enabling rapid, highly customizable modern SaaS dashboard UI with built-in dark mode support. |

---

## 3. Comprehensive Error Handling Strategy

Page Pulse uses a **multi-layered defensive error handling strategy** so the Node.js server **NEVER crashes**:

1. **Input Validation Layer**:
   - Zod intercepts malformed inputs upfront at controller entry.
   - Returns `400 Bad Request` with `{ "success": false, "error": "Invalid URL format..." }`.

2. **Network Execution Layer (`httpClient.ts`)**:
   - Catches Axios network exceptions and transforms low-level system error codes into human-readable `FetchError` instances:
     - `ECONNABORTED` / Timeout $\rightarrow$ `504 Gateway Timeout` ("Request timed out after 10 seconds").
     - `ENOTFOUND` $\rightarrow$ `404 Not Found` ("DNS resolution failed").
     - `ECONNREFUSED` $\rightarrow$ `502 Bad Gateway` ("Connection refused by server").

3. **Content-Type Validation Layer (`audit.service.ts`)**:
   - Checks HTTP `Content-Type` header before parsing. If response is JSON, PDF, or Image, it returns `400 Bad Request` ("Target URL returned non-HTML content type").

4. **DOM Parsing Layer (`parser.ts`)**:
   - Cheerio loads HTML inside safe try-catch wrappers. If an element is missing (e.g. no `<title>` tag), it returns empty string `""` or `0` instead of throwing null dereference errors.

5. **Global Express Middleware (`errorHandler.ts`)**:
   - Catches any unexpected unhandled runtime exception and responds with structured `500 Internal Server Error` JSON payload without process crash.

---

## 4. Directory Structure Explanation

```
d:\Digital_heroes\
├── backend/
│   ├── src/
│   │   ├── controllers/      # Handles HTTP request/response logic & DTO formatting
│   │   ├── services/         # Core business logic (orchestrates fetch & parse)
│   │   ├── utils/            # Reusable pure helpers (httpClient, parser, wordCounter)
│   │   ├── validators/       # Input schemas & URL sanitizers (Zod)
│   │   ├── middleware/       # Express middlewares (rateLimiter, errorHandler)
│   │   ├── types/            # TypeScript interfaces & DTO type declarations
│   │   ├── routes/           # REST API endpoint definitions
│   │   ├── __tests__/        # Jest & Supertest automated test suites
│   │   ├── app.ts            # Express application setup & middleware wiring
│   │   └── server.ts         # Server bootstrap entry point
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Header, StatCard, AuditForm, ResultsDashboard, Footer)
│   │   ├── types/            # Frontend TypeScript interface definitions
│   │   ├── App.tsx           # Main application container & state manager
│   │   ├── main.tsx          # React DOM entry point
│   │   └── index.css         # Tailwind & custom CSS styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
```

**Why this structure?**
- **Clean Architecture & Separation of Concerns**: Controllers only handle HTTP status codes & JSON serialization; Services handle business rules; Utils handle pure calculations.
- **Single Responsibility Principle**: Each module has one clear reason to change.
- **Deployment Efficiency**: Frontend and backend can be hosted independently on Vercel and Render without build script conflicts.
