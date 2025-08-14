# PowerShell Cleanup Script for Viral Views Rollout
# Removes unnecessary files/folders before build/deploy

$pathsToRemove = @(
    "src\__tests__",
    "notebooks",
    "scripts\deploy-production.sh",
    "scripts\optimize-firestore.sh",
    "scripts\setup-verification.sh",
    "cypher-test.js"
)

foreach ($path in $pathsToRemove) {
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        Write-Host "Removed: $path"
    } else {
        Write-Host "Not found (skipped): $path"
    }
}

Write-Host "Cleanup complete. Ready for build and deployment."
