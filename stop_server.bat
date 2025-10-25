@echo off
echo Stopping Runes of Tir na nOg Servers...
echo.

echo Checking for running Python processes...
tasklist /fi "imagename eq python.exe" 2>nul | find /i "python.exe" >nul
if errorlevel 1 (
    echo No Python processes found running.
) else (
    echo Found Python processes. Attempting to stop them...
    taskkill /f /im python.exe
    if errorlevel 1 (
        echo Failed to stop Python processes. You may need to stop them manually.
    ) else (
        echo Successfully stopped Python processes.
    )
)

echo.
echo Checking if ports are now free...
timeout /t 2 /nobreak >nul

netstat -an | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 8000 is still in use!
) else (
    echo Port 8000 is now free.
)

netstat -an | findstr ":1234" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 1234 is still in use!
) else (
    echo Port 1234 is now free.
)

echo.
echo Server cleanup complete!
pause


