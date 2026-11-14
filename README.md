# ZAGKAS AI — Intelligence Studio

A responsive Greek/English AI assistant with fast cloud chat, image understanding, voice input and optional spoken replies.

## Features

- Professional responsive dark interface
- Fast-first Groq cloud chat (no local Ollama model required)
- Image uploads: up to 12 images per message, processed in batches of up to 3 by Groq's vision model
- Ask the AI to describe, compare, inspect or otherwise analyze uploaded images
- Microphone button for speech-to-text where supported by the browser
- Optional read-aloud setting: replies are spoken ONLY when the user enables it
- Adjustable speech rate and Greek browser voice when available
- Local conversation history and PWA install support
- API key stays on the server

## Requirements

- Node.js 20+
- A Groq API key (free tier subject to changing rate limits)
- Internet connection

## Run locally

1. Copy `.env.example` to `.env`.
2. Add your Groq API key to `GROQ_API_KEY`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

Windows users can run `START_ZAGKAS_AI.bat`.

## Models

- Text fast: `openai/gpt-oss-20b`
- Text deep: `openai/gpt-oss-120b` for longer/complex questions
- Vision: `qwen/qwen3.8-27b`

Model availability and free-tier quotas can change. Check Groq's current model and rate-limit documentation.

## Important voice / desktop limitations

The browser version supports push-to-talk speech recognition (browser-dependent) and optional text-to-speech. It does NOT continuously listen for a wake word such as “Zagka” while running in the background. That requires a native desktop application, a local wake-word engine, explicit microphone permission and an always-running background process.

A normal browser page also cannot freely launch arbitrary installed Windows applications. Opening Spotify or other desktop apps by voice requires a native desktop wrapper and a carefully restricted allowlist of apps/commands. This browser version does not pretend to have those OS-level permissions.

## Security

Never commit `.env` or API keys to GitHub. Uploaded images are sent to Groq for analysis when you submit the message. Avoid uploading sensitive/private images.
