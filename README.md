# VEIL

**Trust, before settlement.**

VEIL is an **AI-native financial governance infrastructure** and **autonomous trust layer for global finance**. It is a multi-agent governance system that evaluates whether a transaction *makes sense for this human, right now* before settlement occurs.

VEIL is not a fraud detector. It is an intelligence layer between humans and money — a swarm intelligence system that analyses behavioral patterns, device trust, transaction context, and human intent in real-time.

---

## Core Architecture

VEIL consists of 7 specialized AI agents coordinated by an orchestrator:

| Agent | Role |
|---|---|
| **Behavioral Agent** | Analyses transaction timing and behavioral anomalies |
| **Device Agent** | Evaluates device trust and fingerprint integrity |
| **Fraud Agent** | Detects suspicious transaction patterns (dual model: Gemini + Featherless) |
| **Intent Agent** | Detects coercion or manipulation |
| **Compliance Agent** | Checks AML, sanctions, jurisdiction risk |
| **Explainability Agent** | Produces regulator-ready reasoning narratives |
| **Voice Agent** | Powers conversational "Ask VEIL" explanations |
| **Orchestrator** | Aggregates all outputs → **APPROVE / HOLD / ESCALATE / VERIFY** |

---

## Tech Stack

**Frontend:** Next.js 15, TypeScript, TailwindCSS, Recharts, Framer Motion, Lucide React  
**Backend:** FastAPI, Python 3.11, Gemini API, Featherless AI, Supabase, SSE Streaming  
**Deployment:** Vultr VPS, Ubuntu 22.04, NGINX, systemd  

---

## UI Design

The interface is designed as *the operating system of financial trust* — Bloomberg Terminal meets OpenAI. Dark cyber-finance aesthetic with:

- Cyan glow accents (`#22D3EE`) on an ultra-dark canvas (`#050816`)
- Glassmorphism panels (`#0B1220` with `backdrop-filter: blur`)
- Animated risk gauge, pulsing decision banners, and SSE-powered activity feed
- Canvas-based Intent Graph visualization

### Color System

| Token | Value |
|---|---|
| Background | `#050816` |
| Panel | `#0B1220` |
| Accent Cyan | `#22D3EE` |
| Electric Blue | `#2563EB` |
| Danger | `#EF4444` |
| Warning | `#F59E0B` |
| Success | `#10B981` |
| Borders | `#1E293B` |

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend/veil-dashboard
npm install
npm run dev
```

### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/transaction/mock` | Generate mock transaction |
| POST | `/api/analyze` | Full transaction analysis |
| POST | `/api/full-analysis` | Detailed analysis with raw data |
| POST | `/api/demo` | One-click demo (mock + analyze) |
| POST | `/api/voice-query` | Conversational query |
| GET | `/api/history` | Transaction history |
| GET | `/api/stream` | SSE event stream |

---

## Deployment

### Vultr VPS Setup

```bash
chmod +x deployment/setup.sh
./deployment/setup.sh
```

Or use the deploy script from your local machine:

```bash
./deploy.sh <vultr-ip> <user> <ssh-key>
```

---

## Hackathon Track Alignment

- **Collaborative Systems** — Multi-agent swarm intelligence
- **Enterprise Utility** — Financial governance infrastructure
- **Agentic Workflows** — Autonomous orchestration pipeline

### Sponsor Alignment

- **Vultr** — Primary deployment on Vultr VPS
- **Google Gemini** — Flash (agents) + Pro (orchestration/explainability)
- **Featherless AI** — Specialized financial fraud analysis
- **Speechmatics** — Voice interaction pipeline

---

## Product Positioning

VEIL is **never** described as a fraud detector, banking dashboard, or AI assistant.  
VEIL **always** described as:

- AI-native financial governance infrastructure
- Autonomous trust layer for global finance
- Intelligence layer between humans and money
- Swarm intelligence for financial trust

---

**License:** MIT
**Built for:** AI Agent Olympics @ Milan AI Week
