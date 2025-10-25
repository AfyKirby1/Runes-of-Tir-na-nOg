@echo off
echo Starting Diamond Clad Studio Web Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if port 8000 is already in use
echo Checking if port 8000 is available...
netstat -an | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 8000 is already in use!
    echo Please close any existing servers or restart your computer.
    echo.
    echo You can try to kill existing Python processes:
    echo taskkill /f /im python.exe
    echo.
    pause
    exit /b 1
)

echo Port 8000 is available!
echo.
echo Starting HTTP server on http://localhost:8000
echo.
echo Open your browser and go to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Start the HTTP server
python server.py

pause
