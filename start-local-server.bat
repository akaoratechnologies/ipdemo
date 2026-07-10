@echo off
echo Starting I.P. College Campus-2 website on http://localhost:5500/
echo.
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 5500
) else (
  python -m http.server 5500
)
pause
