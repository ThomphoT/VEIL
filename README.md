# VEIL

**Trust, before settlement.**

VEIL is AI-native financial governance infrastructure: an autonomous trust layer between humans and money. It uses a swarm of specialized agents to evaluate whether a transaction makes sense for this human, right now, before settlement occurs.

## Architecture

- `apps/veil/frontend` - Next.js 15, TypeScript, TailwindCSS, Recharts, Framer Motion, Lucide React
- `backend` - FastAPI, Python 3.11, async agent orchestration, Gemini, Featherless AI, Supabase, SSE streaming
- `deploy/vultr` - NGINX reverse proxy and systemd service for Ubuntu 22.04 on Vultr
- `supabase/schema.sql` - audit persistence schema

## Local Run

Backend:

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd apps/veil/frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## API Contracts

- `GET /health`
- `GET /api/transaction/mock`
- `POST /api/analyze`
- `POST /api/full-analysis`
- `POST /api/demo` - SSE stream for the live hackathon flow
- `POST /api/voice-query`
- `GET /api/history`

Every specialist agent returns:

```json
{
  "score": 88,
  "confidence": 91,
  "finding": "Behavioral timing is outside the customer baseline.",
  "recommendation": "Pause settlement and verify human intent."
}
```

## Demo Script

Modern financial systems ask whether a transaction is valid. VEIL asks whether it makes sense for this human, right now.

1. Trigger the suspicious transaction.
2. Watch the swarm reason live across behavior, device, intent, compliance and explainability.
3. Show the orchestrator decision: `ESCALATE`.
4. Ask: `Why should settlement pause right now?`
5. Close with: VEIL is the autonomous trust layer for global finance.

## Vultr Deployment

Use an Ubuntu 22.04 VPS on Vultr:

```bash
bash scripts/vultr_setup.sh
```

Then copy the repository to `/opt/veil`, fill `backend/.env`, and follow the printed systemd, NGINX and Certbot commands.

## Vercel + Railway Deployment

Use these exact project roots:

- Vercel frontend root directory: `apps/veil/frontend`
- Railway backend root directory: `backend`

Vercel environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app
```

Railway environment variables:

```bash
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
GEMINI_API_KEY=
FEATHERLESS_API_KEY=
SPEECHMATICS_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
```

Railway can also deploy from the repository root because `railway.json` points to `backend`, but the simplest setup is to set Railway's root directory to `backend`.
