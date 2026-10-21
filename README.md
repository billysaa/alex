# Zagkas AI 🤖

A responsive, installable Greek/English AI chat app powered by Llama models through the Groq API.

## Features

- Responsive Greek/English chat interface
- Llama model through Groq
- Greek text-to-speech using browser voices
- Local browser chat history
- Progressive Web App (PWA) manifest and service worker
- Install button in supported browsers
- API key stays on the server (never put it in frontend files)

## Deploy as an app (Render)

GitHub stores the code; it does not run the Node.js server by itself. This repository includes `render.yaml` for deployment.

1. Create a free Groq account at https://console.groq.com/ and create an API key at https://console.groq.com/keys.
2. Sign in to Render and create **New + → Blueprint** from this GitHub repository.
3. In the service's Environment settings, add `GROQ_API_KEY` and paste your Groq key as its secret value.
4. Keep `LLAMA_MODEL` set to `llama-3.3-70b-versatile` (or another model available to your Groq account).
5. Deploy and open the public HTTPS URL Render gives you.
6. In Chrome or Edge, use the browser's **Install app** option or the **📲 Εγκατάσταση** button when it appears.

Never commit API keys to GitHub. Usage limits depend on your Groq account and the selected model.

## Run locally

Requirements: Node.js 20+ and a Groq API key.

1. Copy `.env.example` to `.env`.
2. Set `GROQ_API_KEY` in `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Architecture

Browser/PWA → Express server → Groq API → Llama model → answer.

The server serves the app from `public/`. The PWA install option requires HTTPS deployment (or localhost for local testing).
