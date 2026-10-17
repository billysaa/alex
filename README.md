# Zagkas AI 🤖

A responsive, installable web app for Zagkas AI, powered by the OpenAI Responses API.

## Features

- Responsive Greek/English chat interface
- Greek text-to-speech using the browser's available voices
- Local browser chat history
- Web search through the OpenAI Responses API
- Progressive Web App (PWA) manifest and service worker
- Install button in supported browsers
- API key stays on the server (never put it in frontend files)

## Deploy as an app (recommended: Render)

GitHub stores the code; it does not run the Node.js server by itself. This repository includes `render.yaml` to make deployment easier.

1. Push/keep these files on the `13` branch.
2. Sign in to Render and create a **New + → Blueprint** from this GitHub repository.
3. Render will read `render.yaml` and create the web service.
4. In the service's Environment settings, set `OPENAI_API_KEY` to your secret API key. Do not put the key in GitHub.
5. Confirm `OPENAI_MODEL` is set to a model available to your API project, then deploy.
6. Open the public HTTPS URL Render gives you.
7. In Chrome or Edge, use the browser's **Install app** option or the **📲 Εγκατάσταση** button when it appears.

**Important:** OpenAI API usage may require billing/credits. ChatGPT subscription does not automatically include API usage. Never commit `.env` or any API key.

## Run locally

Requirements: Node.js 20+ and an OpenAI API key.

1. Copy `.env.example` to `.env`.
2. Set `OPENAI_API_KEY` in `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Architecture

Browser/PWA → Express server → OpenAI Responses API → web search → answer.

The server serves the app from `public/`. The Progressive Web App install option requires a secure HTTPS deployment (or localhost for local testing).
