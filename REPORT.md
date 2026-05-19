# VEIL — Full Deployment Guide

## Prerequisites

| Tool | Version | Check Command |
|---|---|---|
| Python | ≥ 3.11 | `python --version` |
| Node.js | ≥ 20 | `node --version` |
| npm | ≥ 10 | `npm --version` |
| Git | latest | `git --version` |

You also need accounts for these services (all free tiers work):

- **Google AI Studio** — get Gemini API key at https://aistudio.google.com/apikey
- **Featherless AI** — get API key at https://featherless.ai
- **Supabase** — create a project at https://supabase.com (free tier)
- **Vultr** — deploy VPS (free credits for hackathon)
- **Speechmatics** — API key (optional, for voice)

---

## Step 1 — Clone & Branch

```bash
git clone https://github.com/ThomphoT/VEIL.git
cd VEIL
git checkout veil-project
```

---

## Step 2 — Backend Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows (Git Bash):
source venv/Scripts/activate
# Windows (CMD):
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure `.env`

```bash
cp .env.example .env
```

Edit `backend/.env` with your real keys:

```ini
VEIL_ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
FEATHERLESS_API_KEY=your_featherless_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
SPEECHMATICS_API_KEY=your_speechmatics_key_here
LOG_LEVEL=INFO
```

### Run Backend Locally

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify at http://localhost:8000/health

Expected response:
```json
{"status":"healthy","service":"VEIL","version":"1.0.0","timestamp":"..."}
```

---

## Step 3 — Frontend Environment

```bash
cd frontend/veil-dashboard
npm install
```

### Configure `.env.local`

File `frontend/veil-dashboard/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change this to your production URL when deploying.

### Run Frontend Locally

```bash
npm run dev
```

Open http://localhost:3000

You should see:
- The geometric globe background rotating
- Glassmorphism dashboard panels
- "New Transaction" / "Analyze" / "Run Demo" buttons
- Full 3-column layout (transaction details, activity feed, risk gauge)

---

## Step 4 — Deploy Backend to Vultr

### 4a — Provision Vultr VPS

1. Log in to [Vultr](https://vultr.com)
2. Deploy a new instance:
   - **Type:** Intel High Performance or Regular Cloud
   - **CPU:** 1-2 vCPUs
   - **RAM:** 2-4 GB
   - **OS:** Ubuntu 22.04 LTS
   - **Location:** closest to you
   - **Auto Backups:** optional

3. Note the IP address and root password from Vultr dashboard.

### 4b — SSH Into Server

```bash
ssh root@<your-vultr-ip>
```

### 4c — Run Setup Script

From your local machine, copy files up:

```bash
# From your local VEIL directory
scp -r backend/ root@<your-vultr-ip>:/opt/veil/
scp deployment/setup.sh root@<your-vultr-ip>:/opt/veil/
scp deployment/systemd/veil.service root@<your-vultr-ip>:/opt/veil/
```

Or run the automated deploy script:

```bash
# From local VEIL directory
chmod +x deploy.sh
./deploy.sh <your-vultr-ip> root ~/.ssh/id_rsa
```

### 4d — Manual Server Setup (if not using deploy.sh)

SSH into the server and run:

```bash
# System updates
apt update && apt upgrade -y

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3-pip

# Install NGINX
apt install -y nginx

# Create veil user
useradd -m -s /bin/bash -d /opt/veil veil

# Set up Python venv
cd /opt/veil/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

### 4e — Configure Environment on Server

```bash
nano /opt/veil/backend/.env
```

Paste the same values from Step 2. Make sure `VEIL_ENVIRONMENT=production`.

### 4f — Set Up systemd Service

```bash
cp /opt/veil/deployment/systemd/veil.service /etc/systemd/system/veil.service
systemctl daemon-reload
systemctl enable veil
systemctl start veil
systemctl status veil
```

Verify:

```bash
curl http://127.0.0.1:8000/health
```

### 4g — Set Up NGINX Reverse Proxy

```bash
cp /opt/veil/deployment/nginx/veil.conf /etc/nginx/sites-available/veil
ln -sf /etc/nginx/sites-available/veil /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 4h — Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 4i — Set Up SSL with Certbot

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

If you only have an IP (no domain), you can skip SSL or use a service like nip.io.

### 4j — Verify Backend is Live

```bash
curl http://<your-vultr-ip>/health
# or https://your-domain.com/health
```

---

## Step 5 — Deploy Frontend

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend/veil-dashboard
vercel --prod
```

Set environment variable in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Option B: Static Export (serve via NGINX on same VPS)

```bash
cd frontend/veil-dashboard

# Build
npm run build

# The static files will be in ./out/
# Copy them to the VPS:
scp -r out/* root@<your-vultr-ip>:/var/www/veil/
```

Then add a second `server` block in `/etc/nginx/sites-available/veil`:

```nginx
server {
    listen 80;
    server_name veil.your-domain.com;

    root /var/www/veil;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option C: Standalone Next.js on VPS (with Node)

```bash
cd frontend/veil-dashboard

# Build
npm run build

# Copy to server
scp -r .next package.json public next.config.js root@<your-vultr-ip>:/opt/veil/frontend/

# On server:
cd /opt/veil/frontend
npm install --production
npm install next
```

Create a second systemd service `/etc/systemd/system/veil-frontend.service`:

```ini
[Unit]
Description=VEIL Frontend
After=network.target

[Service]
Type=simple
User=veil
WorkingDirectory=/opt/veil/frontend
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000
Restart=always
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_API_URL=https://your-domain.com

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable veil-frontend
systemctl start veil-frontend
```

Update NGINX config to proxy frontend:

```nginx
server {
    listen 80;
    server_name veil.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Step 6 — Supabase Schema

1. Go to your Supabase project → SQL Editor
2. Paste the contents of `supabase_schema.sql`
3. Run the query

This creates:
- `transactions` table with indexes and RLS
- `agent_audit_log` table
- `voice_queries` table
- `updated_at` trigger

---

## Step 7 — Full Deployment Checklist

| Item | Done |
|---|---|
| Gemini API key added to `.env` | ☐ |
| Featherless API key added to `.env` | ☐ |
| Supabase URL + key added to `.env` | ☐ |
| Backend running on Vultr, port 8000 | ☐ |
| NGINX reverse proxy configured | ☐ |
| SSL via Certbot | ☐ |
| systemd service enabled + started | ☐ |
| UFW firewall active | ☐ |
| Frontend deployed (Vercel or VPS) | ☐ |
| `NEXT_PUBLIC_API_URL` points to prod backend | ☐ |
| Supabase SQL schema applied | ☐ |
| Health endpoint returns 200 | ☐ |

---

## Step 8 — Verification

### Backend API

```bash
# Health
curl https://your-domain.com/health

# Mock transaction
curl https://your-domain.com/api/transaction/mock

# Demo (end-to-end analysis)
curl -X POST https://your-domain.com/api/demo

# History
curl https://your-domain.com/api/history
```

### Frontend

Visit https://veil.your-domain.com (or Vercel URL).

You should see:
1. Rotating geometric globe background with neon blue nodes
2. Glassmorphism panels
3. Click **New Transaction** → generates mock data
4. Click **Analyze** → swarm runs, activity feed populates
5. Risk gauge animates, decision banner glows
6. Intent Graph nodes pulse with flowing edges
7. **Ask VEIL** → type questions, get AI responses

---

## Troubleshooting

### Backend won't start

```bash
systemctl status veil
journalctl -u veil -n 50 --no-pager
```

Common fixes:
- Missing `.env` file → `cp .env.example .env` and fill keys
- Port conflict → change port in `veil.service` or kill other process
- Dependency issue → `source venv/bin/activate && pip install -r requirements.txt`

### NGINX 502 Bad Gateway

```bash
nginx -t
systemctl status veil
# Backend not running? Restart it:
systemctl restart veil
```

### CORS errors in browser

Ensure `NEXT_PUBLIC_API_URL` in frontend `.env.local` matches your backend URL exactly (including https://). The backend already has CORS wide open in development.

### Frontend build fails

```bash
cd frontend/veil-dashboard
rm -rf .next node_modules
npm install
npm run build
```

---

## Quick Reference

### Server Management

```bash
systemctl start veil        # Start backend
systemctl stop veil         # Stop backend
systemctl restart veil      # Restart backend
systemctl status veil       # Check status
journalctl -u veil -f       # Follow logs
```

### Update Deployment

```bash
# From local machine:
./deploy.sh <vultr-ip> root ~/.ssh/id_rsa
```

Or manually:

```bash
rsync -avz --delete -e "ssh -i ~/.ssh/id_rsa" ./backend/ root@<ip>:/opt/veil/backend/
ssh root@<ip> "systemctl restart veil"
```

---

## Architecture Summary

```
User Browser
     │
     ▼  HTTPS
  ┌─────────────────────┐
  │  NGINX (:443)       │  ← SSL termination
  │  Reverse Proxy       │
  └────┬────────────────┘
       │
  ┌────▼────────────────┐
  │  VEIL Backend       │  ← systemd service on :8000
  │  FastAPI + Agents   │
  │  Gemini / Featherless│
  └────┬────────────────┘
       │
  ┌────▼────┐  ┌─────────┐
  │ Supabase │  │  Vultr   │
  │ (cloud)  │  │  Storage │
  └──────────┘  └─────────┘
```
