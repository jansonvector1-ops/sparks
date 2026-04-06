# ✨ Sparks — AI Chat

A sleek, feature-rich AI chat application powered by free models from OpenRouter.

## 🚀 Features

- **28+ Free AI Models** — Auto-synced from OpenRouter every 30 minutes
- **Model Categories** — Filter by Coding, Reasoning, Vision, Research, Chat
- **Live Code Preview** — HTML/CSS/JS renders instantly in split-view iframe
- **Download Artifacts** — Export code as `.html`, `.py`, `.css`, `.json`
- **Thinking Process** — Collapsible `<think>` tag display for reasoning models
- **Tamil Language Support** — தமிழ் badge on compatible models
- **Language Setting** — Force replies in Tamil, English, or Hindi
- **Custom Models** — Add any OpenRouter/OpenAI compatible model with API key
- **Chat History** — All conversations saved in localStorage
- **Syntax Highlighting** — Multi-language code editor style rendering
- **Dark/Light Theme** — System-aware with manual override

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **AI Backend:** OpenRouter API (free tier)
- **Storage:** localStorage (no database needed)

## ⚙️ Setup

1. Clone the repo
```bash
   git clone https://github.com/Devaraj789/sparks.git
   cd sparks
```

2. Install dependencies
```bash
   npm install
```

3. Add your OpenRouter API key
```bash
   cp .env.example .env
   # Edit .env and add: VITE_OPENROUTER_API_KEY=your_key_here
```

4. Run locally
```bash
   npm run dev
```

## 🌐 Live Demo

> Coming soon on Vercel

## 📁 Project Structure

sparks/
├── src/
│   ├── components/     # UI components
│   ├── lib/            # API, storage, utilities
│   └── App.tsx         # Main app
├── server/             # Express backend
└── public/

## 📄 License

MIT — free to use and modify.
