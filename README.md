# ⚡ Page Pulse - Webpage SEO & Page Audit Tool

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-cyan?style=flat-square&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest%20%26%20Supertest-red?style=flat-square&logo=jest)](https://jestjs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Built for Digital Heroes Training Task** &bull; [https://digitalheroesco.com](https://digitalheroesco.com)

Page Pulse is a production-quality full-stack web auditing application designed to audit any webpage URL and deliver instant, actionable technical SEO metrics, page performance timings, heading hierarchies, accessibility image validation, and content statistics.

---

## 🌟 Features

### 🔍 Core Audit Engine
- **HTTP Status Code Verification**: Captures HTTP status (200 OK, 301/302 Redirects, 404 Not Found, 500 Server Errors).
- **Exact Response Timing**: Measures network round-trip time (RTT) in milliseconds.
- **HTML Title Extraction**: Extracts `<title>` tag content with character count and SEO length status.
- **Meta Description Extraction**: Extracts `<meta name="description">` content with recommended length warnings.
- **H1 Heading Analysis**: Counts primary `<h1>` tags to verify SEO optimal single-H1 structure.
- **Image Accessibility Check**: Identifies `<img>` elements missing descriptive `alt` attributes.
- **Visible Word Counter**: Computes body word count excluding script and style tags.
- **MIME Content-Type Validation**: Identifies server Content-Type headers and safely rejects non-HTML payloads.

### 🎨 SaaS Dashboard UI
- **Modern Dark & Light Mode**: Seamless theme toggling with automatic browser setting detection and `localStorage` state persistence.
- **8 Dynamic Metric Cards**: Color-coded status badges (Success, Warning, Error, Info) based on industry-standard SEO thresholds.
- **Keyboard Enter Support**: Instant URL submission upon pressing `Enter`.
- **One-Click JSON Copy**: Copies formatted raw JSON audit payload to clipboard.
- **Export Report as JSON**: Downloads full report JSON file directly to local storage.
- **Local Audit History**: Persists recent search history in browser `localStorage` for one-click re-auditing.
- **Animated Loading & Defensive Alerts**: Animated spinners and user-friendly error alerts for offline, timeout, or invalid URL inputs.

---

## 🏗️ Architecture

Page Pulse follows clean separation of concerns and modular layered architecture:

```
                  ┌─────────────────────────────────────────┐
                  │          React 18 SaaS Frontend          │
                  │   Vite + TypeScript + TailwindCSS       │
                  └────────────────────┬────────────────────┘
                                       │ HTTP POST /api/audit
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          Express Security Layer         │
                  │     Helmet + CORS + Rate Limiter        │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │           Zod URL Validator             │
                  │      (Input Validation & Protocol)      │
                  └────────────────────┬────────────────────┘
                                       │ Validated URL
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Audit Controller             │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │              Audit Service              │
                  └──────────┬───────────────────┬──────────┘
                             │                   │
                             ▼                   ▼
              ┌─────────────────────┐     ┌─────────────────────┐
              │  HTTP Client Engine │     │ Cheerio HTML Parser │
              │  Axios 10s Timeout  │     │   Metrics Extractor │
              └─────────────────────┘     └─────────────────────┘
```

---

## 📁 Directory Structure

```
d:\Digital_heroes\
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── audit.controller.ts      # HTTP request handling & status serialization
│   │   ├── services/
│   │   │   └── audit.service.ts         # Business logic & workflow orchestration
│   │   ├── utils/
│   │   │   ├── httpClient.ts            # Axios fetcher with 10s timeout & memory limits
│   │   │   ├── parser.ts                # Cheerio HTML DOM parsing engine
│   │   │   └── wordCounter.ts           # Visible text word counting utility
│   │   ├── validators/
│   │   │   └── audit.validator.ts       # Zod schema validation & URL normalizer
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts           # express-rate-limit protection
│   │   │   └── errorHandler.ts          # Centralized error handler
│   │   ├── types/
│   │   │   └── audit.types.ts           # TypeScript interfaces & DTOs
│   │   ├── routes/
│   │   │   └── audit.routes.ts          # Express API route mapping
│   │   ├── __tests__/
│   │   │   └── audit.test.ts            # Jest & Supertest integration suite
│   │   ├── app.ts                       # Express app configuration
│   │   └── server.ts                    # Backend server entry point
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx               # Top navigation with dark mode toggle
│   │   │   ├── AuditForm.tsx            # Input bar with quick presets & enter key logic
│   │   │   ├── StatCard.tsx             # Metric card with color badges
│   │   │   ├── ResultsDashboard.tsx     # 8 Stat cards grid with Export/Copy buttons
│   │   │   ├── SearchHistory.tsx        # Local audit history drawer
│   │   │   └── Footer.tsx               # Mandatory Digital Heroes link footer
│   │   ├── types/
│   │   │   └── audit.ts                 # Frontend type definitions
│   │   ├── App.tsx                      # Root application container & state manager
│   │   ├── main.tsx                     # React DOM entry point
│   │   └── index.css                    # Tailwind CSS & glassmorphic styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── DESIGN_DECISIONS.md                  # 3 key design decisions, rationale & error strategy
├── INTERVIEW_PREP.md                    # 30 interview Q&A + technical deep-dives
└── LOOM_SCRIPT.md                       # 5-minute video presentation script
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
REQUEST_TIMEOUT_MS=10000
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/page-pulse.git
cd page-pulse

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Backend API Server
```bash
cd backend
npm run dev
```
The backend API server will start on `http://localhost:5000`.

### 3. Start Frontend App
```bash
cd frontend
npm run dev
```
The React SaaS application will open at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

The test suite uses **Jest and Supertest** to verify API contracts, error boundaries, parser logic, timeouts, and validation rules.

```bash
cd backend
npm test
```

### Test Coverage Highlights
- ✅ **Happy Path**: Returns 200 OK and parsed SEO payload for valid web pages.
- ✅ **Invalid URL Validation**: Rejects malformed strings with `400 Bad Request`.
- ✅ **Non-HTML Rejection**: Rejects API JSON or image URLs with clean `400` errors.
- ✅ **10-Second Timeout**: Converts standard network timeouts into `504 Gateway Timeout` JSON payloads.
- ✅ **Title Parsing**: Correctly extracts HTML title tags and og:title fallbacks.
- ✅ **H1 Tag Counting**: Accurately counts 0, 1, or multiple H1 tags.
- ✅ **Missing Alt Attribute Counting**: Detects image elements missing `alt` attributes.

---

## 📖 API Documentation

### Audit Webpage Endpoint
- **URL**: `/api/audit`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Example Request Body
```json
{
  "url": "https://example.com"
}
```

#### Example Success Response (`200 OK`)
```json
{
  "url": "https://example.com",
  "httpStatus": 200,
  "responseTimeMs": 180,
  "title": "Example Domain",
  "metaDescription": "This domain is for use in illustrative examples in documents.",
  "h1Count": 1,
  "imagesWithoutAlt": 0,
  "wordCount": 125,
  "contentType": "text/html; charset=UTF-8",
  "success": true
}
```

#### Example Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "error": "Invalid URL format. Must be a valid HTTP or HTTPS web address"
}
```

#### Example Error Response (`504 Gateway Timeout`)
```json
{
  "success": false,
  "error": "Request timed out after 10 seconds"
}
```

---

## 🌐 Deployment Guide

### 1. Backend Deployment (Render)
1. Push code to GitHub repository.
2. Log in to [Render Dashboard](https://dashboard.render.com) and click **New Web Service**.
3. Connect your GitHub repository and select the `backend` root folder.
4. Set runtime options:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `PORT`: `5000` (or leave default assigned by Render)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`

### 2. Frontend Deployment (Vercel)
1. Log in to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository and set Root Directory to `frontend`.
3. Set Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com`
5. Click **Deploy**.

---

## 🛠️ Design Decisions & Internship Artifacts

For in-depth technical documentation, please review:
- 📄 [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md): Architectural decisions, library rationale, error handling strategy, and folder structure justification.
- 🎓 [INTERVIEW_PREP.md](INTERVIEW_PREP.md): 30 interview questions with detailed answers, network timing deep-dives, and line-by-line function explanations.
- 📹 [LOOM_SCRIPT.md](LOOM_SCRIPT.md): 5-minute timed video submission script.

---

## 🔮 Future Improvements

1. **Lighthouse API Integration**: Add Google PageSpeed Insights API score for Performance, Accessibility, and Best Practices.
2. **Broken Link Detection**: Scan internal anchors (`<a href="...">`) to detect 404 broken links.
3. **PDF Export**: Generate downloadable PDF audit summary sheets for digital marketing client presentations.

---

## 📄 Footer Attribution Requirement

Built for **[Digital Heroes Training Task](https://digitalheroesco.com)**.
