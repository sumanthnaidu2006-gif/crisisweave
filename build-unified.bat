@echo off
title CrisisWeave - Unified Build Script
color 0B
echo.
echo  ====================================================
echo    Building CrisisWeave Full-Stack Unified Platform
echo  ====================================================
echo.

echo [1/3] Compiling React Frontend (TypeScript + Vite)...
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (echo [ERROR] Frontend build failed! && pause && exit /b 1)

echo [2/3] Embedding Frontend into Spring Boot Static Resources...
powershell -Command "New-Item -ItemType Directory -Force -Path '..\backend\src\main\resources\static' | Out-Null; Copy-Item -Recurse -Force 'dist\*' '..\backend\src\main\resources\static'"

echo [3/3] Packaging Spring Boot Standalone Executable JAR...
cd /d "%~dp0backend"
set JAVA_HOME=C:\Program Files\Java\jdk-17
call "C:\maven\apache-maven-3.9.6\bin\mvn.cmd" clean package -DskipTests
if errorlevel 1 (echo [ERROR] Maven packaging failed! && pause && exit /b 1)

echo.
echo  ====================================================
echo    SUCCESS! Unified Standalone JAR Created.
echo    Location: backend\target\backend-0.0.1-SNAPSHOT.jar
echo    To launch: run-unified-jar.bat
echo  ====================================================
pause
