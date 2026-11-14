# Zagkas AI 🤖

A responsive, installable Greek/English AI chat app using Groq Cloud with fast-first model routing.

## Features

- Fast default model: `openai/gpt-oss-20b`
- Larger model: `openai/gpt-oss-120b`, selected only for requests that appear complex
- One final answer shown to the user
- Greek text-to-speech using browser voices
- Local browser chat history
- Progressive Web App (PWA) manifest and service worker
- API key stays on the server (never put it in frontend files)

## Free usage

Groq offers a free developer tier subject to account-specific model and rate limits. It is not unlimited, and limits can change. No paid API is required for the default setup, but users must create their own Groq API key.

## Run locally

Requirements: Node.js 20+ and a Groq API key.

1. Copy `.env.example` to `.env`.
2. Set `GROQ_API_KEY` in `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Model routing

- Ordinary questions use `FAST_MODEL` (`openai/gpt-oss-20b`) for lower latency.
- Longer or clearly complex questions use `DEEP_MODEL` (`openai/gpt-oss-120b`).
- The app does not query multiple models for every message, because doing so would increase response time and consume more quota.

Both model IDs can be changed in `.env` if Groq updates availability.

## Deploy as an app (Render)

GitHub stores the code; it does not run the Node.js server by itself. This repository includes `render.yaml` for deployment.

1. Create a free Groq account at https://console.groq.com/ and create an API key at https://console.groq.com/keys.
2. Sign in to Render and create **New + → Blueprint** from this GitHub repository.
3. In the service's Environment settings, add `GROQ_API_KEY` as a secret.
4. Deploy and open the public HTTPS URL Render gives you.

Never commit API keys to GitHub. Free-tier rate limits apply; check the current Groq limits for your account.
