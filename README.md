# SUOP — Full repo

This repository contains the SUOP desktop app prototype (Electron frontend, Express + Socket.IO backend, MongoDB).

Quick start (local)
1. Copy backend/.env.example to backend/.env and set MONGO_URI and JWT_SECRET.
2. From repo root: npm run install:all
3. Start dev: npm run dev

Backend quick start (only)
cd backend
npm ci
export MONGO_URI="mongodb://localhost:27017/suop"
export JWT_SECRET="localdevsecret"
npm start

Deploy notes
- For Railway/Render: set project root/build context to backend, build command `npm ci --omit=dev`, start command `npm start` and add MONGO_URI and JWT_SECRET as environment variables.

Security
- Use a strong JWT_SECRET and do not commit .env files.

License: MIT
