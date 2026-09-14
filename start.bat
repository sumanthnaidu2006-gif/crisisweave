@echo off
title CrisisWeave Startup
color 0B
echo.
echo  =============================================
echo    CRISISWEAVE - Starting All Services
echo  =============================================
echo.
REM CHECK JAVA
java -version >nul 2>&1
if errorlevel 1 (echo [ERROR] Java not found! && pause && exit /b 1)
echo [OK] Java 17 found.
REM CHECK/SETUP MAVEN
where mvn >nul 2>&1
if errorlevel 1 (
    echo [INFO] Maven not in PATH. Checking C:\maven...
    if not exist "C:\maven\apache-maven-3.9.6\bin\mvn.cmd" (
        echo [INFO] Downloading Maven 3.9.6...
        powershell -Command "Invoke-WebRequest -Uri 'https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip' -OutFile '%TEMP%\maven.zip'; Expand-Archive '%TEMP%\maven.zip' -DestinationPath 'C:\maven' -Force"
        echo [OK] Maven installed to C:\maven
    ) else (
        echo [OK] Maven found at C:\maven
    )
    set MAVEN_CMD=C:\maven\apache-maven-3.9.6\bin\mvn.cmd
) else (
    set MAVEN_CMD=mvn
    echo [OK] Maven found in PATH.
)
echo.
echo [INFO] Starting Spring Boot backend on port 8080...
cd /d "%~dp0backend"
start "CrisisWeave Backend" cmd /k "%MAVEN_CMD% spring-boot:run"
echo [INFO] Waiting 25 seconds for backend to start...
timeout /t 25 /nobreak >nul
echo [INFO] Starting React frontend on port 5173...
cd /d "%~dp0frontend"
start "CrisisWeave Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo  =============================================
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8080/api/health
echo  =============================================
pause
