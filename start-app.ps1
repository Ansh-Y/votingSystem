Write-Host "Starting Voting System Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PWD\backend'; node server.js"

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PWD'; npm start"

Write-Host ""
Write-Host "Both servers are now starting! Wait for them to initialize..." -ForegroundColor Green
Write-Host "- The backend will be available at: http://localhost:5000" -ForegroundColor Yellow
Write-Host "- The frontend will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "When you're finished, close both PowerShell windows to stop the servers." -ForegroundColor Magenta 