# ZAGKAS AI — Intelligence Studio

A responsive Greek/English AI assistant with fast cloud chat, image understanding, voice input and an optional Windows desktop shell with wake-word listening and safe app launching.

## Features

- Professional responsive dark interface
- Fast-first xAI / Grok cloud chat (no local Ollama model required)
- Image uploads: up to 12 images per message, processed in batches of up to 3 by xAI / Grok's vision model
- Ask the AI to describe, compare, inspect or otherwise analyze uploaded images
- Microphone button for speech-to-text where supported by the browser
- Optional read-aloud setting: replies are spoken ONLY when the user enables it
- Adjustable speech rate and Greek browser voice when available
- Local conversation history and PWA install support
- API key stays on the server

## Requirements

- Node.js 20+
- A xAI / Grok API key (free tier subject to changing rate limits)
- Internet connection

## Windows desktop assistant\n\n1. Install Node.js 20 or later.\n2. Copy `.env.example` to `.env` and add your `XAI_API_KEY`.\n3. Double-click `START_ZAGKAS_DESKTOP.bat` (or run `npm install` then `npm run desktop`).\n4. In Settings, enable **Wake word «Ζάγκα»** and allow microphone access.\n5. Say **«Ζάγκα»**, wait for the listening confirmation, then say a command. Supported app commands include opening Notepad, Calculator, File Explorer, Task Manager, VS Code, Chrome and Spotify.\n\nThe wake-word listener uses the Chromium Web Speech Recognition service in Greek (`el-GR`); it is not fully offline and requires a compatible Electron/Windows environment and internet access. Keep the desktop app open for wake-word listening. App launching is restricted to a fixed allowlist; arbitrary shell commands are not executed.\n\n## Run locally

1. Copy `.env.example` to `.env`.
2. Add your xAI / Grok API key to `XAI_API_KEY`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

Windows users can run `START_ZAGKAS_AI.bat`.

## Models

- Text fast: `grok-4.7`
- Text deep: `grok-4.7` for longer/complex questions
- Vision: `grok-4.7`

Grok API usage is billed by tokens. Check current model availability and pricing in the official xAI documentation.

## Important voice / desktop limitations

The browser version supports push-to-talk speech recognition (browser-dependent) and optional text-to-speech. It does NOT continuously listen for a wake word such as “Zagka” while running in the background. That requires a native desktop application, a local wake-word engine, explicit microphone permission and an always-running background process.

A normal browser page also cannot freely launch arbitrary installed Windows applications. Opening Spotify or other desktop apps by voice requires a native desktop wrapper and a carefully restricted allowlist of apps/commands. This browser version does not pretend to have those OS-level permissions.

## Security

Never commit `.env` or API keys to GitHub. Uploaded images are sent to xAI / Grok for analysis when you submit the message. Avoid uploading sensitive/private images.
