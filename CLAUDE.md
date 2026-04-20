# Sparks — AI Chat App | CLAUDE.md

## 🧠 Project Overview
Sparks is a sleek AI chat web application built with React + TypeScript.
It uses **OpenRouter free tier** to access 28+ AI models — no paid API needed.
Live URL: https://sparks-gamma.vercel.app

---

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **AI Backend:** OpenRouter API (free tier models)
- **Database:** Supabase (PostgreSQL via Drizzle ORM)
- **Storage:** localStorage (chat history)
- **Backend:** Express.js (server/)
- **Deploy:** Vercel (frontend) + Railway (backend)

---

## 📁 Project Structure
```
Sparks/
├── src/
│   ├── components/        # All UI components (chat, sidebar, model selector, etc.)
│   ├── lib/               # API calls, storage helpers, utilities
│   └── App.tsx            # Root component
├── server/                # Express backend (API routes)
├── shared/                # Shared types between frontend & backend
├── supabase/              # Supabase migrations & config
├── drizzle/               # Drizzle ORM schema & migrations
├── .agents/skills/        # Agent skill definitions
├── .bolt/                 # Bolt config
├── index.html             # Entry HTML
├── vite.config.ts         # Vite build config
├── tailwind.config.js     # Tailwind config
├── drizzle.config.ts      # Drizzle DB config
├── package.json           # Dependencies & scripts
└── CLAUDE.md              # This file
```

---

## ✨ Key Features
- **28+ Free AI Models** — Auto-synced from OpenRouter every 30 minutes
- **Model Categories** — Coding, Reasoning, Vision, Research, Chat filters
- **Live Code Preview** — HTML/CSS/JS renders in split-view iframe instantly
- **Download Artifacts** — Export as `.html`, `.py`, `.css`, `.json`
- **Thinking Process** — Collapsible `<think>` tag display for reasoning models
- **Tamil Language Support** — தமிழ் badge on compatible models
- **Language Setting** — Force replies in Tamil, English, or Hindi
- **Custom Models** — Add any OpenRouter/OpenAI-compatible model manually
- **Chat History** — Saved in localStorage
- **Syntax Highlighting** — Multi-language code rendering
- **Dark/Light Theme** — System-aware with manual toggle

---

## ⚙️ Local Dev Setup
```bash
git clone https://github.com/Devaraj789/Sparks.git
cd Sparks
npm install
cp .env.example .env
# .env-la add pannu:
# VITE_OPENROUTER_API_KEY=your_openrouter_key
npm run dev
```

---

## 🌿 Branch & Commit Convention
- `main` — stable/production branch
- Feature changes direct commit to main (small solo project)
- Commit messages: short and descriptive in English

---

## 🔑 Environment Variables
| Variable | Purpose |
|----------|---------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter free API key for AI models |
| Supabase vars | DB connection (if backend features enabled) |

---

## 🚀 Deployment
- **Frontend:** Vercel (auto-deploy on push to main)
- **Backend:** Railway (`railway.json` config present)
- **DB Migrations:** `drizzle` folder — run via `npm run db:push`

---

## 📌 Current Goals / Active Work
- [ ] **[PRIORITY] Fix model fetch error** — OpenRouter model list fetch pannum pothu error varuthu, debug & fix pannanum
  - Check: API key correct-a `.env`-la irukka
  - Check: OpenRouter `/api/v1/models` endpoint response handling
  - Check: 429 rate limit error graceful-a handle aaguthuva
  - Check: network error / CORS issue irukka
  - Check: 30-min auto-sync timer logic சரியா work aaguthuva
- [ ] Fix any chat UI bugs
- [ ] Enhance live code preview stability
- [ ] Add more Tamil-compatible model badges
- [ ] Performance improvements for low-RAM devices

---

## ⚠️ Important Notes for Claude Code
- This is a **solo project** — no team conventions needed
- OpenRouter free models have **daily rate limits** — handle 429 errors gracefully
- localStorage is used for chat — **no backend auth** for chat history
- Supabase is used only for specific backend features, not core chat
- Keep bundle size small — target users may have **low-end devices**
- Tamil language support is a **core feature**, don't break it
- When editing components, check `src/components/` first before creating new files
