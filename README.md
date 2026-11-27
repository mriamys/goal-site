<p align="center">
  <b>🇬🇧 English</b> • <a href="README.ru.md">Русский</a> • <a href="README.uk.md">🇺🇦 Українська</a>
</p>

# GOAL — Savings & Financial Goal Tracker

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](#tech-stack)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](#tech-stack)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](#tech-stack)
[![SQLite](https://img.shields.io/badge/SQLite-Knex-003B57?logo=sqlite&logoColor=white)](#tech-stack)

A full-stack web application for tracking personal savings goals, visual progress, and deposit history with a React frontend and an Express + SQLite backend.

---

## Overview

**GOAL** lets you create visual savings cards (with custom title, target amount, currency, and cover image URL), log dated deposits, edit or delete past transactions with automatic balance recalculation, and download a live backup of the SQLite database directly from the header.

---

## Features

- **Goal management** — create, edit, and delete savings goals (`title`, `target_amount`, `current_amount`, `currency` defaulting to `UAH`, optional `image_url`).
- **Animated progress tracking** — live progress percentage (`0%–100%`) with animated neon progress bars powered by Framer Motion.
- **Deposit & transaction history** — record deposits with custom dates, edit or delete any transaction, and automatically recalculate `current_amount` inside atomic SQLite transactions (`db.transaction`).
- **Database backup export** — one-click download of `data.sqlite` via `GET /api/download-db`.
- **Auto-initialized SQLite schema** — automatically creates `goals` and `transactions` tables (with `ON DELETE CASCADE`) on startup.

---

## Tech Stack

- **Frontend (`client/`):** React 19, TypeScript, Vite 8, Framer Motion, Lucide React
- **Backend (`server/`):** Node.js, Express 5, TypeScript (`ts-node`), Knex, `sqlite3`, CORS, `dotenv`
- **CI/CD:** GitHub Actions SSH deployment

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/goals` | List all goals ordered by `id` |
| `POST` | `/api/goals` | Create a new goal |
| `PUT` | `/api/goals/:id` | Update goal details or manual `current_amount` |
| `DELETE` | `/api/goals/:id` | Delete a goal and its cascaded transactions |
| `POST` | `/api/goals/:id/deposit` | Add a dated deposit transaction and increment `current_amount` |
| `GET` | `/api/goals/:id/transactions` | List transactions for a specific goal |
| `PUT` | `/api/transactions/:id` | Update a transaction and adjust `current_amount` |
| `DELETE` | `/api/transactions/:id` | Delete a transaction and decrement `current_amount` |
| `GET` | `/api/download-db` | Download the SQLite database file (`data.sqlite`) |

---

## Setup & Deployment

### Environment Variables (`server/.env`)
Create an optional `.env` file in `server/` if you want to override the default port:

```env
PORT=3001
```

### Local Development

1. **Start the backend (`server/`):**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The API listens on `http://localhost:3001` by default (use `npm start` for non-watch execution).

2. **Start the frontend (`client/`):**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Note: the frontend sends requests to `/api`, so in production (or with a reverse proxy) route `/api/*` to the backend server on port `3001`.

### Production Build & CI/CD
- Build the frontend bundle into `client/dist/`:
  ```bash
  cd client
  npm run build
  ```
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) deploys automatically on push to `main` via SSH (`SSH_HOST`, `SSH_PASSWORD`), building `client/` into `/var/www/goal-site-client/`, updating `server/` dependencies, and restarting the `goal-site` systemd service.

---

## Project Structure

```text
.
├── .github/workflows/deploy.yml   # GitHub Actions SSH deploy workflow
├── client/
│   ├── public/                    # Static icons
│   ├── src/
│   │   ├── App.tsx                # Main React UI, modals & API calls
│   │   ├── App.css                # Component styling
│   │   ├── index.css              # Base styles
│   │   └── main.tsx               # React entry point
│   ├── index.html                 # HTML shell
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.ts             # Vite configuration
├── server/
│   ├── src/
│   │   ├── db.ts                  # Knex SQLite connection & schema init
│   │   └── index.ts               # Express REST API server
│   ├── package.json               # Backend dependencies & scripts
│   └── tsconfig.json              # TypeScript configuration
├── LICENSE                        # Apache-2.0 License
└── NOTICE                         # Attribution notice
```

---

## License & Attribution

Licensed under the **Apache License, Version 2.0** — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

If you find this project useful, please consider **forking** the repository on GitHub and linking back to [https://github.com/mriamys/goal-site](https://github.com/mriamys/goal-site).
