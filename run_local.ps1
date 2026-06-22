# VeriDeed Local Dev Launcher
# This script initializes the database, provisions local Maven, creates a Python venv,
# and starts the full VeriDeed stack locally on Windows.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Blue
Write-Host "      VERIDEED LOCAL RUNNER INITIALIZER      " -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

# 1. Initialize local PostgreSQL Database
Write-Host "`n[1/4] Setting up Local PostgreSQL..." -ForegroundColor Yellow

$dbConnected = $false
$passwords = @("", "postgres", "verideed_secure_pass123", "admin", "root")

foreach ($pass in $passwords) {
    $env:PGPASSWORD = $pass
    try {
        $dbCheck = psql -h localhost -p 5432 -U postgres -d postgres -w -t -c "SELECT 1" 2>$null
        if ($LastExitCode -eq 0) {
            $dbConnected = $true
            break
        }
    } catch {
        # Continue to next password
    }
}

if ($dbConnected) {
    try {
        # Check if database exists
        $dbExists = psql -h localhost -p 5432 -U postgres -d postgres -w -t -c "SELECT 1 FROM pg_database WHERE datname='verideed'" 2>$null
        if ($dbExists -ne 1) {
            Write-Host "Creating 'verideed' database..." -ForegroundColor Gray
            psql -h localhost -p 5432 -U postgres -d postgres -w -c "CREATE DATABASE verideed" | Out-Null
        }

        # Ensure verideed_user role exists and is owner of the database
        Write-Host "Provisioning 'verideed_user' role..." -ForegroundColor Gray
        $createUserSql = "DO `$$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'verideed_user') THEN CREATE ROLE verideed_user WITH LOGIN PASSWORD 'verideed_secure_pass123'; ELSE ALTER ROLE verideed_user WITH PASSWORD 'verideed_secure_pass123'; END IF; END `$$;"
        psql -h localhost -p 5432 -U postgres -d postgres -w -c $createUserSql | Out-Null
        psql -h localhost -p 5432 -U postgres -d postgres -w -c "ALTER DATABASE verideed OWNER TO verideed_user" | Out-Null
        
        # Run the init.sql schema as verideed_user to ensure correct ownership
        Write-Host "Applying database schema as 'verideed_user'..." -ForegroundColor Gray
        $env:PGPASSWORD = "verideed_secure_pass123"
        psql -h localhost -p 5432 -U verideed_user -d verideed -w -f database/init.sql | Out-Null
        Write-Host "Database initialized successfully." -ForegroundColor Green
    } catch {
        Write-Warning "Database connection succeeded but schema initialization failed."
    }
} else {
    Write-Warning "Could not connect to PostgreSQL without a password prompt. Make sure PostgreSQL is running on port 5432 and try running psql manually."
}

# 2. Provision Python Virtual Env for AI Service
Write-Host "`n[2/4] Initializing FastAPI AI Service..." -ForegroundColor Yellow
if (-not (Test-Path "ai-service\.venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Gray
    python -m venv ai-service\.venv
}

Write-Host "Installing Python dependencies (Uvicorn, FastAPI, OCR)..." -ForegroundColor Gray
& ".\ai-service\.venv\Scripts\pip.exe" install -r .\ai-service\requirements.txt

# Start FastAPI service in background with absolute path
Write-Host "Launching FastAPI AI Service on port 8000..." -ForegroundColor Gray
$pythonAbsPath = Resolve-Path ".\ai-service\.venv\Scripts\python.exe"
$aiServiceAbsDir = Resolve-Path ".\ai-service"
Start-Process -FilePath $pythonAbsPath -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $aiServiceAbsDir

# 3. Provision Maven & Launch Spring Boot Backend
Write-Host "`n[3/4] Initializing Spring Boot Backend..." -ForegroundColor Yellow
$mavenDir = Join-Path (Get-Location) "maven"
$mvnCmd = Join-Path $mavenDir "apache-maven-3.9.6\bin\mvn.cmd"

if (-not (Test-Path $mvnCmd)) {
    Write-Host "Maven not found. Downloading Apache Maven 3.9.6..." -ForegroundColor Gray
    New-Item -ItemType Directory -Force -Path $mavenDir | Out-Null
    $zipPath = Join-Path $mavenDir "maven.zip"
    
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $zipPath
    Write-Host "Extracting Maven package..." -ForegroundColor Gray
    Expand-Archive -Path $zipPath -DestinationPath $mavenDir -Force
    Remove-Item $zipPath
}

Write-Host "Building and starting Spring Boot Backend on port 8085..." -ForegroundColor Gray
$backendAbsDir = Resolve-Path ".\backend"
Start-Process -FilePath $mvnCmd -ArgumentList "spring-boot:run" -WorkingDirectory $backendAbsDir

# 4. Start Frontend Dev Server & Open App
Write-Host "`n[4/4] Finalizing Portal Services..." -ForegroundColor Yellow

$frontendAbsDir = Resolve-Path ".\frontend"
if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $frontendAbsDir -Wait
}

Write-Host "Starting Frontend Dev Server on port 5173..." -ForegroundColor Gray
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory $frontendAbsDir

Write-Host "Services are starting up:" -ForegroundColor Gray
Write-Host "  ➜ Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  ➜ Backend:  http://localhost:8085" -ForegroundColor Green
Write-Host "  ➜ AI Service: http://localhost:8000" -ForegroundColor Green

# Open browser to frontend
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host "`nAll processes spawned successfully!" -ForegroundColor Green
Write-Host "Press Ctrl+C to exit this script. Services will run in the background." -ForegroundColor Gray
