@echo off
setlocal
cd /d "%~dp0"
title ZAGKAS AI

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required.
  echo Download it from https://nodejs.org/
  pause
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo.
  echo Created .env from .env.example
  echo Open .env and add your GROQ_API_KEY before continuing.
  echo.
  notepad ".env"
  pause
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed. Check Node.js and your internet connection.
    pause
    exit /b 1
  )
)

echo Starting Zagkas AI...
echo Keep this window open while using the app.
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3000"
call npm start
pause
