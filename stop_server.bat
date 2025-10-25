@echo off
echo Stopping Runes of Tir na nOg Servers...
echo.

echo ============================================
echo FORCEFULLY STOPPING PROCESSES ON PORTS 8000 AND 1234
echo ============================================
echo.

REM Kill processes using port 8000
echo Checking for processes using port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    if not "%%a"=="0" (
        echo Found process %%a using port 8000. Killing it...
        taskkill /f /pid %%a >nul 2>&1
        if errorlevel 1 (
            echo Failed to kill process %%a
        ) else (
            echo Successfully killed process %%a
        )
    )
)

REM Kill processes using port 1234
echo Checking for processes using port 1234...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":1234"') do (
    if not "%%a"=="0" (
        echo Found process %%a using port 1234. Killing it...
        taskkill /f /pid %%a >nul 2>&1
        if errorlevel 1 (
            echo Failed to kill process %%a
        ) else (
            echo Successfully killed process %%a
        )
    )
)

echo.
echo Waiting for processes to fully terminate...
timeout /t 3 /nobreak >nul

REM Also kill any remaining Python processes
echo Checking for any remaining Python processes...
tasklist /fi "imagename eq python.exe" 2>nul | find /i "python.exe" >nul
if not errorlevel 1 (
    echo Found remaining Python processes. Force killing them...
    taskkill /f /im python.exe >nul 2>&1
    echo Python processes terminated.
) else (
    echo No Python processes found.
)

echo.
echo ============================================
echo FINAL PORT STATUS CHECK
echo ============================================

netstat -an | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 8000 is STILL in use! You may need to restart your computer.
    echo Attempting one more forceful cleanup...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
        if not "%%a"=="0" (
            echo Force killing stubborn process %%a...
            taskkill /f /pid %%a >nul 2>&1
        )
    )
) else (
    echo SUCCESS: Port 8000 is now free!
)

netstat -an | findstr ":1234" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 1234 is STILL in use!
) else (
    echo SUCCESS: Port 1234 is now free!
)

echo.
echo ============================================
echo SERVER CLEANUP COMPLETE!
echo ============================================
pause


