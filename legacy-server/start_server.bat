@echo off
echo Starting Runes of Tir na nOg Multiplayer Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Install dependencies if needed
echo Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo WARNING: Some dependencies may not have installed correctly
    echo Continuing anyway...
)

echo.
echo Starting WebSocket server on ws://localhost:1234
echo Press Ctrl+C to stop the server
echo.

REM Start the multiplayer server
python multiplayer_server.py

pause
