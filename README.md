# Alex AI 🤖

A full starter AI assistant for the web, powered by the OpenAI Responses API.

## What it includes

- Modern responsive chat UI
- Greek + English conversations
- Conversation history saved locally in the browser
- Server-side OpenAI API key
- Current-information web search through the Responses API
- Health/configuration endpoint
- Node.js + Express backend
- Easy extension point for more tools later

## Setup

Requirements: Node.js 20+ and an OpenAI API key.

1. Copy `.env.example` to `.env`.
2. Put your API key in `OPENAI_API_KEY`.
3. Install packages: `npm install`
4. Start: `npm start`
5. Open `http://localhost:3000`.

**Never commit `.env` or an API key to GitHub.**

## Architecture

Browser → Express server → OpenAI Responses API → optional web search → answer.

The project uses the Responses API for new integrations. The Assistants API was sunset on August 26, 2026.

## Next extensions

File search, image generation, GitHub actions, authentication, databases, voice and automation can be added without exposing secrets in the browser.
