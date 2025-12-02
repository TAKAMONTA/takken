# Firebase Functions Deployment Script (PowerShell)
# Windows Environment

Write-Host "Firebase Functions Deployment Starting" -ForegroundColor Green

# Check environment variables
Write-Host "Checking environment variables..." -ForegroundColor Yellow
$hasApiKey = $false

if ($env:OPENAI_API_KEY) {
    Write-Host "OpenAI API key is configured" -ForegroundColor Green
    $hasApiKey = $true
}

if ($env:ANTHROPIC_API_KEY) {
    Write-Host "Anthropic API key is configured" -ForegroundColor Green
    $hasApiKey = $true
}

if ($env:GOOGLE_AI_API_KEY) {
    Write-Host "Google AI API key is configured" -ForegroundColor Green
    $hasApiKey = $true
}

if (-not $hasApiKey) {
    Write-Host "No AI API keys configured" -ForegroundColor Red
    Write-Host "Please set one of the following:" -ForegroundColor Yellow
    Write-Host "  - OPENAI_API_KEY" -ForegroundColor Yellow
    Write-Host "  - ANTHROPIC_API_KEY" -ForegroundColor Yellow
    Write-Host "  - GOOGLE_AI_API_KEY" -ForegroundColor Yellow
    exit 1
}

# Check functions directory
if (-not (Test-Path "../../functions")) {
    Write-Host "Functions directory not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing Functions dependencies..." -ForegroundColor Yellow
Set-Location ../../functions
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# TypeScript build
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "TypeScript build failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Check Firebase project
Write-Host "Checking Firebase project..." -ForegroundColor Yellow
firebase projects:list

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow

if ($env:OPENAI_API_KEY) {
    firebase functions:config:set openai.api_key="$env:OPENAI_API_KEY"
    Write-Host "OpenAI API key configured" -ForegroundColor Green
}

if ($env:ANTHROPIC_API_KEY) {
    firebase functions:config:set anthropic.api_key="$env:ANTHROPIC_API_KEY"
    Write-Host "Anthropic API key configured" -ForegroundColor Green
}

if ($env:GOOGLE_AI_API_KEY) {
    firebase functions:config:set google_ai.api_key="$env:GOOGLE_AI_API_KEY"
    Write-Host "Google AI API key configured" -ForegroundColor Green
}

# Deploy Functions
Write-Host "Deploying Firebase Functions..." -ForegroundColor Yellow
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host "Firebase Functions deployment completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployed Functions:" -ForegroundColor Cyan
    Write-Host "  - aiChat" -ForegroundColor White
    Write-Host "  - aiExplanation" -ForegroundColor White
    Write-Host "  - aiMotivation" -ForegroundColor White
    Write-Host "  - aiRecommendations" -ForegroundColor White
    Write-Host ""
    Write-Host "To run tests:" -ForegroundColor Cyan
    Write-Host "  npm run test:functions" -ForegroundColor White
    Write-Host ""
    Write-Host "To check logs:" -ForegroundColor Cyan
    Write-Host "  firebase functions:log" -ForegroundColor White
}
else {
    Write-Host "Firebase Functions deployment failed" -ForegroundColor Red
    exit 1
}