# 🇮🇳 Indian Market Intelligence Platform

An AI-powered, real-time market intelligence platform for Indian equity markets — integrating live market data, macroeconomic indicators, policy updates, corporate disclosures, and sentiment analytics into a single decision-support dashboard.

---

## 🎯 Vision

Prioritize **actionable intelligence** over raw data. Help retail investors, traders, portfolio managers, and analysts interpret Indian market developments efficiently.

---

## 👥 Target Users

- Retail Investors
- Active Traders
- Portfolio Managers
- Research Analysts
- Finance & MBA Students

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│   AI Service    │
│  React + Vite   │     │ Node.js+Express │     │ Python+FastAPI  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │Ingestion Service│
                        │ Python+Scheduler│
                        └─────────────────┘
```

| Service               | Tech Stack                  | Responsibility                        |
|-----------------------|-----------------------------|---------------------------------------|
| `frontend`            | React, Vite, Zustand        | UI, dashboards, real-time charts      |
| `backend`             | Node.js, Express, Prisma    | REST API, WebSockets, alert engine    |
| `ai-service`          | Python, FastAPI             | NLP, sentiment scoring, summarization |
| `ingestion-service`   | Python, APScheduler         | Live data feeds, event processing     |

---

## 📦 Core Modules (MVP)

### A. Real-Time Market Dashboard
- NSE & BSE live data
- Sector heatmaps
- Market breadth indicators
- Index & volatility tracking

### B. Policy & Regulatory Monitor
- RBI announcement tracking
- SEBI circular updates
- Budget & government policy highlights
- AI-generated summaries & impact tagging

### C. Earnings & Corporate Tracker
- Earnings calendar
- Corporate actions
- Shareholding changes
- Insider trades monitoring

### D. Alert System
- Price & volume spike alerts
- Event-driven alerts
- Custom watchlists

### E. AI Intelligence Layer
- News summarization
- Sentiment scoring
- Sector impact mapping
- Event correlation analysis

---

## 🚀 Phase 2 Features

- Derivatives analytics (OI buildup, PCR, Max Pain)
- FII/DII flow tracking
- India Macro Stress Index
- Bond yield curve visualization
- Custom portfolio risk dashboard
- Backtesting engine
- Strategy simulation tools

---

## 🛠️ Local Development Setup

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/indian-market-intelligence.git
cd indian-market-intelligence
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Fill in your API keys and DB credentials
```

### 3. Run with Docker (Recommended)

```bash
docker-compose -f infrastructure/docker-compose.yml up --build
```

### 4. Or Run Services Individually

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev

# AI Service
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload

# Ingestion Service
cd ingestion-service && pip install -r requirements.txt && python scheduler.py
```

---

## 📁 Project Structure

```
indian-market-intelligence/
├── frontend/               # React + Vite UI
├── backend/                # Node.js + Express API
├── ai-service/             # Python FastAPI AI layer
├── ingestion-service/      # Data feed ingestion
├── infrastructure/         # Docker, Nginx config
├── docs/                   # Architecture & API docs
└── scripts/                # Setup & seed utilities
```

---

## 💰 Revenue Model

| Tier                  | Description                              |
|-----------------------|------------------------------------------|
| Free                  | Basic dashboard, delayed data            |
| Pro                   | Real-time data, advanced analytics, alerts |
| Institutional         | Custom licensing, API access             |
| Education             | Partnerships with colleges & platforms  |

---

## 📊 Success Metrics

- Daily Active Users (DAU)
- Alert engagement rate
- User retention & subscription conversion
- AI impact tagging accuracy

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

> Built with ❤️ for the Indian markets. Powered by AI.
