# VEIL — Hackathon Pitch Deck

## Tagline
**Trust, before settlement.**

## The Problem
Financial institutions today validate transactions, but they don't understand them. Traditional fraud detection is reactive, static, and blind to human context. Every day, legitimate transactions are flagged, coerced payments slip through, and regulators demand explanations that current systems cannot provide.

## The Solution
VEIL is an **AI-native financial governance infrastructure** — an autonomous trust layer that sits between humans and money. It is a **swarm intelligence system** of 8 specialized AI agents that collaboratively evaluate whether a transaction *makes sense for this human, right now* before settlement.

## How It Works

1. **Transaction arrives** → 7 agents analyze in parallel:
   - Behavioral Agent (timing + patterns)
   - Device Agent (trust + fingerprint)
   - Fraud Agent (suspicious patterns) [Gemini + Featherless]
   - Intent Agent (coercion detection)
   - Compliance Agent (AML + sanctions)
   - Explainability Agent (narrative generation)
   - Voice Agent (conversational interface)

2. **Orchestrator aggregates** → One of four decisions:
   - ✅ **APPROVE** — All checks pass
   - ⏸️ **HOLD** — Needs human review
   - 🚨 **ESCALATE** — High-risk intervention
   - 🔍 **VERIFY** — Identity verification needed

3. **Regulator-ready explanation** → Every decision comes with a transparent, auditable narrative

## Why VEIL Wins

### Best Use of Vultr
- Production deployment on Vultr VPS with NGINX reverse proxy
- systemd service with auto-restart and journal logging
- UFW firewall + SSL via Certbot
- Scalable architecture ready for Vultr Kubernetes

### Best Use of Gemini
- **Gemini Flash** powers fast agent analysis (behavioral, device, intent, compliance)
- **Gemini Pro** handles high-stakes orchestration and explainability
- Structured JSON output for reliable multi-agent coordination

### Best Use of Speechmatics
- Conversational "Ask VEIL" interface
- Typewriter UI responses for real-time feel
- SSE streaming for live agent activity feed

### Best Enterprise Agent
- Multi-agent swarm architecture
- AI-native governance, not fraud detection
- Regulator-ready explainability
- Real-time streaming orchestration

## Demo Script

1. **Landing** — Dashboard displays the VEIL interface (dark, cinematic, Bloomberg-meets-OpenAI)
2. **New Transaction** — Click "New Transaction" to generate mock data
3. **Analyze** — Click "Analyze" to trigger the swarm
4. **Live Feed** — Watch agents analyze in the Center Panel activity feed
5. **Risk Gauge** — See the radial gauge animate to the risk score
6. **Decision Banner** — APPROVE / HOLD / ESCALATE / VERIFY with glow effects
7. **Ask VEIL** — Type "Why was this decision made?" and see the typewriter response
8. **Intent Graph** — Watch the animated edge flow between nodes

## Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                    VEIL Orchestrator                        │
├───────────┬──────────┬───────────┬──────────┬──────────────┤
│ Behavioral│ Device   │  Fraud    │  Intent  │  Compliance  │
│   Agent   │  Agent   │  Agent    │  Agent   │    Agent     │
├───────────┴──────────┴───────────┴──────────┴──────────────┤
│                   Explainability Agent                     │
├────────────────────────────────────────────────────────────┤
│                      Voice Agent                           │
└────────────────────────────────────────────────────────────┘
         ↓
  APPROVE | HOLD | ESCALATE | VERIFY
```

## UI Design System

- **Primary Background:** `#050816`
- **Accent Cyan:** `#22D3EE`
- **Electric Blue:** `#2563EB`
- **Fonts:** Inter + JetBrains Mono
- **Style:** Bloomberg Terminal meets OpenAI
- **Theme:** Dark cyber-finance, cinematic minimalism

## Team

VEIL was built for the **AI Agent Olympics** at **Milan AI Week**.

---

*"The operating system of financial trust."*
