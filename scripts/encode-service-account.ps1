# サービスアカウントキーをBASE64エンコードするスクリプト
# 使用方法: .\scripts\encode-service-account.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile
)

if (-not (Test-Path $InputFile)) {
    Write-Host "エラー: ファイルが見つかりません: $InputFile" -ForegroundColor Red
    exit 1
}

Write-Host "サービスアカウントキーをBASE64エンコードしています..." -ForegroundColor Yellow

# JSONファイルを読み込んでproject_idを確認
$jsonContent = Get-Content $InputFile -Raw | ConvertFrom-Json
$projectId = $jsonContent.project_id

Write-Host "`nプロジェクトID: $projectId" -ForegroundColor Cyan

if ($projectId -ne "takken-d3a2b") {
    Write-Host "`n⚠️  警告: プロジェクトIDが一致しません！" -ForegroundColor Yellow
    Write-Host "   期待値: takken-d3a2b" -ForegroundColor Yellow
    Write-Host "   実際の値: $projectId" -ForegroundColor Yellow
    Write-Host "`nこのキーを使用すると認証エラーが発生する可能性があります。" -ForegroundColor Yellow
    $continue = Read-Host "続行しますか？ (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# BASE64エンコード
$bytes = [System.IO.File]::ReadAllBytes($InputFile)
$base64 = [Convert]::ToBase64String($bytes)

Write-Host "`n✅ BASE64エンコード完了！" -ForegroundColor Green
Write-Host "`n以下の内容を .env.local の FIREBASE_SERVICE_ACCOUNT_KEY に設定してください:" -ForegroundColor Cyan
Write-Host "`nFIREBASE_SERVICE_ACCOUNT_KEY=$base64" -ForegroundColor White

# クリップボードにコピー
$clipboardText = "FIREBASE_SERVICE_ACCOUNT_KEY=$base64"
Set-Clipboard -Value $clipboardText
Write-Host "`n✅ クリップボードにコピーしました！" -ForegroundColor Green
Write-Host "   .env.local を開いて、FIREBASE_SERVICE_ACCOUNT_KEY= の後に貼り付けてください。" -ForegroundColor Cyan





