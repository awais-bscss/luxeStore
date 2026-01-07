@echo off
echo ========================================
echo Starting MongoDB Service
echo ========================================
echo.

net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    echo.
    
    echo Checking MongoDB service status...
    sc query MongoDB | find "RUNNING" >nul
    if %errorLevel% == 0 (
        echo MongoDB is already running!
        echo.
        pause
        exit /b 0
    )
    
    echo Starting MongoDB service...
    net start MongoDB
    
    if %errorLevel% == 0 (
        echo.
        echo ========================================
        echo SUCCESS! MongoDB is now running
        echo ========================================
        echo.
        echo Your backend will now connect automatically!
        echo.
    ) else (
        echo.
        echo ========================================
        echo ERROR: Could not start MongoDB service
        echo ========================================
        echo.
        echo Try these solutions:
        echo 1. Make sure MongoDB is installed
        echo 2. Check Windows Services for MongoDB
        echo 3. Or start manually: mongod --dbpath C:\data\db
        echo.
    )
) else (
    echo ========================================
    echo ERROR: Administrator privileges required
    echo ========================================
    echo.
    echo Please right-click this file and select
    echo "Run as administrator"
    echo.
)

pause
