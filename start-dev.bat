@echo off
echo Starting Backend...
cd backend
call .venv\Scripts\activate.bat
pip install -r requirements.txt
start "Backend" cmd /k "python run.py"
echo Backend started on http://localhost:5000

echo Starting Frontend...
cd ..\frontend
npm install
start "Frontend" cmd /k "npm run dev"
echo Frontend started (check terminal for port)

echo Both servers running! Open http://localhost:3000 or 3001/register
pause
