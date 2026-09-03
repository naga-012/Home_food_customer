@echo off
echo ========================================================
echo Starting Inti Ruchi Backend Server (FastAPI on Port 8000)...
echo ========================================================
cd /d "%~dp0\backend"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
pause
