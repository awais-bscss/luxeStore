# MongoDB Service Starter Script
# This script starts the MongoDB service with administrator privileges

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Service Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or right-click this script and select 'Run with PowerShell as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Check if MongoDB service exists
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if (-not $mongoService) {
    Write-Host "ERROR: MongoDB service not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "MongoDB might not be installed as a Windows service." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try starting MongoDB manually:" -ForegroundColor Yellow
    Write-Host "  mongod --dbpath C:\data\db" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ MongoDB service found" -ForegroundColor Green
Write-Host ""

# Check current status
if ($mongoService.Status -eq 'Running') {
    Write-Host "MongoDB is already running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status: $($mongoService.Status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your backend should connect automatically now." -ForegroundColor Green
    Write-Host ""
    pause
    exit 0
}

# Start the service
Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
Write-Host ""

try {
    Start-Service MongoDB -ErrorAction Stop
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! MongoDB is now running" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✓ MongoDB service started successfully" -ForegroundColor Green
    Write-Host "✓ Your backend will now connect automatically!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "  1. Test connection: npm run test:db" -ForegroundColor White
    Write-Host "  2. Start backend: npm run dev" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR: Could not start MongoDB" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these solutions:" -ForegroundColor Yellow
    Write-Host "  1. Check if MongoDB is properly installed" -ForegroundColor White
    Write-Host "  2. Try starting manually: mongod --dbpath C:\data\db" -ForegroundColor White
    Write-Host "  3. Check Windows Services for MongoDB" -ForegroundColor White
    Write-Host ""
}

pause
