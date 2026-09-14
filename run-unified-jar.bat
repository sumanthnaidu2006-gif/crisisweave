@echo off
title CrisisWeave - Unified Full-Stack Single Server (Port 8080)
color 0A
echo.
echo  ======================================================
echo    CRISISWEAVE - Standalone Unified Platform
echo    Embedded React Frontend + 10-Agent Spring Boot API
echo    Single Port: http://localhost:8080
echo  ======================================================
echo.

set JAVA_EXE="C:\Program Files\Java\jdk-17\bin\java.exe"
if not exist %JAVA_EXE% set JAVA_EXE=java

if not exist "%~dp0backend\target\backend-0.0.1-SNAPSHOT.jar" (
    echo [INFO] Building unified JAR package with embedded frontend...
    cd /d "%~dp0frontend"
    call npm run build
    powershell -Command "Copy-Item -Recurse -Force 'dist\*' '..\backend\src\main\resources\static'"
    cd /d "%~dp0backend"
    call "C:\maven\apache-maven-3.9.6\bin\mvn.cmd" clean package -DskipTests
)

echo [INFO] Starting Spring Boot standalone server with embedded UI...
cd /d "%~dp0backend"
start "CrisisWeave Unified Server" cmd /k "%JAVA_EXE% -jar target\backend-0.0.1-SNAPSHOT.jar"

echo [INFO] Waiting 6 seconds for server to start...
timeout /t 6 /nobreak >nul
start "" "http://localhost:8080"
echo.
echo  ======================================================
echo    App UI (Dual-View + Mobile): http://localhost:8080
echo    Health API:                 http://localhost:8080/api/health
echo  ======================================================
pause
