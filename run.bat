@echo off
echo Installing dependencies...
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..

echo.
echo Starting backend and frontend...
echo.

start "ISS Piss Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
#&& set VITE_BACKEND_URL=http://localhost:8787 
start "ISS Piss Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8787
echo ================================
echo.
echo (Two new terminal windows have opened)
pause
