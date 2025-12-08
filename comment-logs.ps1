$files = @(
    "src/lib/AdminContext.tsx",
    "src/components/LockedFeaturePage.tsx",
    "src/components/FeatureGuard.tsx",
    "src/pages/Admin.tsx",
    "src/pages/dashboard/TradingJournal.tsx",
    "src/pages/dashboard/Dashboard.tsx",
    "src/pages/dashboard/Performance.tsx",
    "src/pages/dashboard/Accounts.tsx",
    "src/pages/dashboard/Payouts.tsx",
    "src/pages/dashboard/TradeCopier.tsx",
    "src/pages/Pricing.tsx",
    "src/pages/NotFound.tsx",
    "src/components/modals/AddJournalDialog.tsx",
    "src/components/modals/AddAccountDialog.tsx",
    "src/components/modals/ConnectFxbookDialog.tsx",
    "src/hooks/useErrorReporting.ts",
    "src/lib/admin-utils.ts",
    "src/lib/auth-helpers.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file"
        $content = Get-Content $fullPath -Raw
        $content = $content -replace '(\s+)(console\.(log|warn|error|info|debug)\()', '$1// $2'
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "  OK - Commented out console statements"
    } else {
        Write-Host "  SKIP - File not found: $fullPath"
    }
}

Write-Host ""
Write-Host "Done commenting out console statements."
