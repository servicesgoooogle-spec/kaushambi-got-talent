# 🎤 Kaushambi Got Talent — Season 2

Live web app for **Kaushambi Got Talent Season 2** — a talent show grand finale held on **2nd October 2026** at **Lakhan Lal Resort, Bharwari, Kaushambi (UP)**.

Presented by **ABC Dance Studio** & **Sachin Pop**  
Celebrity Judge: **Vaishnavi Patil**  
Cash Prize Pool: **₹50,000**

---

## 🌐 Live URLs

| Page | URL |
|---|---|
| Home / Live Stage | https://kaushambi-got-talent.vercel.app |
| Schedule | https://kaushambi-got-talent.vercel.app/schedule |
| Find Me (Queue) | https://kaushambi-got-talent.vercel.app/search |
| Admin Panel | https://kaushambi-got-talent.vercel.app/admin |

---

## ✨ Features

### For the Audience
- 🎬 Live stage dashboard — "Now Performing" + "Up Next"
- 👏 Interactive Cheer button with live counter
- 📅 Categorized schedule (Solo Junior, Solo Senior, Group/Duet, Modelling)
- 🔎 Contestant search — queue position + estimated time
- 📱 Push notifications when a contestant's turn is coming up
- 📲 WhatsApp call-up for backstage readiness

### For Admins
- 🔐 Secure login with SHA-256 + salt
- 🎛 One-tap Start / Done / Skip / Requeue
- 📲 WhatsApp deep-link to notify contestants
- 🔄 Real-time Google Sheets sync
- ⚠️ Reset-all statuses button

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind CSS v4 |
| Icons | Lucide React |
| Backend | Google Apps Script (Web App) |
| Database | Google Sheets |
| Push | OneSignal (Web Push) |
| Hosting | Vercel (free) |
| Repo | GitHub |

**Cost: ₹0 — runs entirely on free tiers.**

---

## 🏗 Architecture
Browser (Next.js on Vercel)
│
│ GET/POST (JSON over HTTPS)
▼
Google Apps Script Web App
│
│ reads/writes
▼
Google Sheets (KGT-S2-DB)
│
├── Contestants (id, name, seq, category, city, phone, status)
├── Admins (username, salt, hash)
├── Settings (event config + now_performing_id)
└── Cheers (contestant_id, count)

Push notifications flow:
Frontend → OneSignal SDK → external_id = contestant ID
Admin clicks "Start"
Apps Script → OneSignal REST API → device buzzes 🎤

## 📁 Project Structure
frontend/
├── app/
│ ├── layout.tsx # Root layout + OneSignal SDK
│ ├── page.tsx # Home / Live Stage
│ ├── globals.css # Tailwind v4 theme
│ ├── schedule/page.tsx # Schedule page
│ ├── search/page.tsx # Find Me page
│ └── admin/page.tsx # Admin panel
├── components/
│ ├── Hero.tsx
│ ├── Countdown.tsx
│ ├── NowPerforming.tsx
│ ├── UpNext.tsx
│ ├── CheerButton.tsx
│ ├── NotifyMe.tsx
│ ├── SponsorStrip.tsx
│ ├── QuickLinks.tsx
│ └── Footer.tsx
├── lib/
│ ├── api.ts # Typed wrapper for Apps Script backend
│ └── poll.ts # Smart jittered polling
└── public/
└── OneSignalSDKWorker.js

## 🔑 Environment Variables

Set both locally (`.env.local`) and on Vercel:

```bash
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/.../exec
NEXT_PUBLIC_EVENT_NAME=Kaushambi Got Talent Season 2
NEXT_PUBLIC_CONTACT=+91 7408751569
NEXT_PUBLIC_ONESIGNAL_APP_ID=<app-id>

