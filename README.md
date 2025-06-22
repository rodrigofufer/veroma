# 🌍 Veroma – International Civic Platform

**Veroma** is a multilingual civic platform that lets anyone raise issues, submit proposals and vote — from local neighborhoods to global movements.

---

## ✨ Key Features

- 🗳️ **10 weekly votes** per user to support the best ideas
- ✍️ Submit ideas **anonymously or publicly**
- 🏛️ **Official proposals** from verified representatives
- 🔎 Predictive country selection (accent-insensitive)
- 📧 Email verification flow for new accounts
- 📱 Fully responsive design (mobile + desktop)
- 🌎 English UI (with multilingual support coming soon)
- 🍪 Simple session cookie to stay logged in

---

## 🚧 Coming Soon

- 🛡️ Secure identity verification (blockchain-compatible)  
- 🗺️ Tiered voting by location (local → city → national → global)  
- 🌍 Full internationalization (85+ languages via Lingo)  
- 🚨 Reporting and moderation system  
- 🧪 Real-world pilot launch in selected regions  

---

## 🧠 Tech Stack

- React with TypeScript  
- Tailwind CSS  
- Supabase (Auth + Database)  
- Framer Motion (UI animation)  
- Netlify (Deployment)  
- Bolt.new (UI logic / builder)  
- Lingo (Translation engine – coming soon)  

## 🛠 Local Development

1. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```
   If the login button stays on **"Signing in..."**, these environment variables are likely missing or incorrect.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

---

## 💡 Why Veroma?

Most civic platforms are constrained by geography, bureaucracy, or politics. Veroma is different. It was built to be:

- 🌐 Borderless  
- 🗳️ Democratic  
- 👥 Inclusive  
- 💬 Community-driven  

Whether it’s fixing a broken streetlight or proposing a global climate resolution — every voice matters.

---

## 🍪 Cookies

Veroma uses a lightweight cookie called `veroma_session` to keep you logged in after you authenticate. This cookie contains no personal data and expires when you sign out.

---


**Veroma** is an evolving project aiming to empower communities everywhere.
