# ⚡ Intelligent Email Assistant — Autonomous AI-Powered Email Platform

> A full-stack, enterprise-grade AI email management platform built with **Next.js 16**, **Node.js / Express**, **TypeScript**, **MongoDB**, and **Google Gemini / OpenRouter**.

![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Node](https://img.shields.io/badge/Node.js-20+-green)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black)

---

## 🌐 Live Deployments & Demo Links

- **🚀 Live Frontend Application (Vercel)**: **[https://email-agent-lime.vercel.app](https://email-agent-lime.vercel.app)**
- **⚡ Live Backend API Server (Render)**: **[https://email-agent-zdec.onrender.com](https://email-agent-zdec.onrender.com)**
- **📊 Health Check Endpoint**: [https://email-agent-zdec.onrender.com/api/health](https://email-agent-zdec.onrender.com/api/health)
- **💻 GitHub Source Code**: [https://github.com/ajaymanyam/Email-Agent](https://github.com/ajaymanyam/Email-Agent)

---

## 🎯 Problem Statement

Modern professionals and students receive dozens to hundreds of emails daily. Critical action items, follow-up deadlines, and meeting schedules frequently get buried beneath low-priority promotional messages and clutter. Furthermore, manually summarizing lengthy email threads, verifying phishing links, drafting polite responses across multiple accounts, and transferring deadlines into calendars consumes hours of productive time every week.

**The Solution:** The **Intelligent Email Assistant** solves this by providing a unified, multi-account productivity workspace that connects directly to real email providers (Gmail & Outlook) using secure OAuth 2.0. It leverages Google Gemini AI to autonomously summarize threads, extract deliverables into Google Calendar, scan for phishing threats, compile natural language search queries, and prepare context-aware response drafts for instant review.

---

## 🌟 Key Features & Capabilities

### 📬 1. Multi-Account Unified Inbox
- **Multi-Account OAuth**: Connect multiple Gmail and Microsoft Outlook accounts simultaneously.
- **Unified Multi-Stream**: View all messages from all connected inboxes in a merged stream or switch dynamically between individual accounts.
- **Thread Archival Export**: 1-click full thread conversation export as `.EML` (standard email backup) or structured `.JSON`.

### 🧠 2. Core AI Intelligence Layer
- **Executive Summaries**: 1-2 sentence high-level overviews and key bullet points.
- **Explain in Plain English**: Demystifies technical, legal, and dense jargon into simple language.
- **Phishing & Security Scanner**: Real-time evaluation of sender headers, URLs, credential harvesting traps, and risk score computation (0-100%).
- **Action Item Extraction**: Identifies deliverables, assignees, and deadlines with 1-click Google Calendar integration.
- **Priority Classification**: Intelligent scoring algorithm assigning priority tiers (70%+ High Priority).

### ✍️ 3. AI-Powered Composer & Smart Drafting
- **Tone-Aware Smart Replies**: Contextual replies in Professional, Friendly, Urgent, or Concise tones.
- **AI Subject Line Generator**: High-converting subject line suggestions based on body draft.
- **Smart Rewriter**: 1-click polish, grammar correction, formalization, or conciseness adjustments.
- **Voice-to-Text Input**: Native voice recognition support for hands-free email drafting.
- **Attachment Processing**: Drag-and-drop file uploader with base64 attachment dispatch.

### 🤖 4. Autonomous AI Copilot Command Center (`/copilot`)
- **Autonomous Auto-Drafting**: In the background, Gemini AI analyzes priority messages and prepares ready-to-dispatch response cards for 1-click user review.
- **Scheduled Deliveries Queue**: Schedule email delivery for tomorrow morning, afternoon, next Monday, or any custom ISO timestamp with background queue polling.
- **Conversational Semantic Search**: Query emails in plain conversational English (e.g. *"Show urgent sponsorship proposals from Google"*) with automatic intent compilation and multi-field regex filtering.

### ⚡ 5. Automation, Templates & Productivity Analytics
- **Smart Automation Rules (`/rules`)**: User-defined condition-action workflows (auto-star, folder assignment, auto-categorization).
- **Reusable Templates Engine (`/templates`)**: Dynamic template cards with `{{recipient_name}}`, `{{user_name}}`, and custom variables.
- **Productivity & Email Analytics (`/analytics`)**: Interactive volume trends, response time metrics, priority distribution, and top contact charts.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Frontend: Next.js 16 + React 19          │
│  TailwindCSS • Zustand • Lucide • Recharts • Toasts   │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTP / REST API (JWT Authenticated)
┌─────────────────────────▼──────────────────────────────┐
│           Backend Server: Express + TypeScript         │
│  Helmet • Rate Limiters • Input Validation • Crypto    │
├─────────────┬─────────────┬─────────────┬──────────────┤
│ Auth & Users│ Email Engine│ AI Engine   │ Copilot &    │
│ & AES-256   │ Sync/Send   │ OpenRouter  │ Scheduled    │
│ Encryption  │ Multi-Acc   │ & Gemini    │ Queue Worker │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬───────┘
       │             │             │             │
┌──────▼──────┐┌─────▼──────┐┌─────▼──────┐┌─────▼───────┐
│   MongoDB   ││ Gmail API /││ OpenRouter/││ Google Cal  │
│  Database   ││ MS Graph   ││ Google AI  ││ Integration │
└─────────────┘└────────────┘└────────────┘└─────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or MongoDB Atlas URI.
- **Google Cloud Console**: OAuth 2.0 Web Application client ID and client secret with Gmail API enabled.

---

### 2. Environment Configuration

#### Backend Setup (`server/.env`):
```bash
cd server
cp .env.example .env
```
Fill in your credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/email_assistant
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
CREDENTIAL_ENCRYPTION_KEY=your_32_character_encryption_key_here_123456

# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/calendar/google/callback

# AI API Providers (OpenRouter / Gemini)
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

#### Frontend Setup (`client/.env.local`):
```bash
cd client
cp .env.example .env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 3. Install Dependencies & Run

#### In Terminal 1 (Backend Server):
```bash
cd server
npm install
npm run dev
```
*Backend runs on **http://localhost:5000***

#### In Terminal 2 (Frontend Client):
```bash
cd client
npm install
npm run dev
```
*Frontend runs on **http://localhost:3000***

---

## 🧪 Automated Testing

Execute the comprehensive system integration & cryptographic audit test runners:
```bash
# 1. System Integration Test Suite
cd server
npx ts-node --transpile-only src/tests/system.test.ts

# 2. Comprehensive Security, AEAD Tamper Resistance & Reliability Suite
npx ts-node --transpile-only src/tests/comprehensive_audit.test.ts
```

---

## 🛡️ Security & Privacy Hardening

- **OAuth At Rest**: All OAuth access tokens and refresh tokens are encrypted at rest using **`AES-256-GCM`** (AEAD) with 128-bit authentication tags and per-operation IVs to guarantee both confidentiality and cryptographic integrity.
- **Sensitive Log Stripping**: Custom logger automatically redacts passwords, tokens, API keys, and authorization headers before outputting logs.
- **XSS Sanitizer**: Real-time DOM sanitization stripping scripts, inline event handlers, and malicious URIs before rendering email HTML bodies.
- **Production Helmet**: Content Security Policy (CSP), HSTS, no-sniff, and frameguard protections enabled.
- **Granular Rate Limiters**: Dedicated rate limiters for authentication endpoints (15 min), AI completions (30 req/min), and general API operations.
- **Multi-Tenant Data Isolation**: Every MongoDB query strictly enforces `{ owner: userId }`, preventing Insecure Direct Object References (IDOR).

---

## 📄 License
Released under the [MIT License](LICENSE).
