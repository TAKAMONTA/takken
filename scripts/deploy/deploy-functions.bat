@echo off
echo Firebase Functions Deployment Starting

REM Load environment variables from .env.local
REM Load environment variables from .env.local
if exist "../../.env.local" (
    echo Loading environment variables from .env.local...
    for /f "usebackq tokens=1,2 delims==" %%a in ("../../.env.local") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

REM Check OpenAI API key
echo Checking OpenAI API key...
if not defined OPENAI_API_KEY (
    echo OpenAI API key is not configured
    echo Please set OPENAI_API_KEY in .env.local
    exit /b 1
)
echo OpenAI API key is configured

REM Check functions directory
if not exist "../../functions" (
    echo Functions directory not found
    exit /b 1
)

REM Install dependencies
echo Installing Functions dependencies...
cd ../../functions
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    exit /b 1
)

REM TypeScript build
echo Building TypeScript...
call npm run build
if errorlevel 1 (
    echo TypeScript build failed
    exit /b 1
)

cd ..

REM Check Firebase project
echo Checking Firebase project...
firebase projects:list

REM Set OpenAI API key
echo Setting OpenAI API key...
firebase functions:config:set openai.api_key="%OPENAI_API_KEY%"
echo OpenAI API key configured

REM Deploy Functions
echo Deploying Firebase Functions...
firebase deploy --only functions

if errorlevel 1 (
    echo Firebase Functions deployment failed
    exit /b 1
) else (
    echo Firebase Functions deployment completed!
    echo.
    echo Deployed Functions:
    echo   - aiChat
    echo   - aiExplanation
    echo   - aiMotivation
    echo   - aiRecommendations
    echo.
    echo To run tests:
    echo   npm run test:functions
    echo.
    echo To check logs:
    echo   firebase functions:log
)
