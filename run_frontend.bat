@echo off
echo ========================================================
echo Starting Inti Ruchi Frontend Server (Vite on Port 5173)...
echo ========================================================
cd /d "%~dp0\frontend"
npm run dev -- --port 5173
pause
