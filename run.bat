@echo off
echo Starting Voting System Application...
echo.
echo Starting Backend Server...
start cmd /k "cd backend && node server.js"
echo.
echo Starting Frontend...
start cmd /k "npm start"
echo.
echo Both servers are now starting! Wait for them to initialize...
echo - The backend will be available at: http://localhost:5000
echo - The frontend will be available at: http://localhost:3000
echo.
echo When you're finished, close both command windows to stop the servers. 