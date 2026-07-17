[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$workflowPath = Join-Path $repositoryRoot ".github\workflows\publish-installer.yml"
$releaseBodyPath = Join-Path $repositoryRoot ".github\release-body-ja.md"

$workflow = Get-Content -LiteralPath $workflowPath -Raw
$releaseBody = Get-Content -LiteralPath $releaseBodyPath -Raw
$workflow = $workflow.Replace("`r`n", "`n")
$releaseBody = $releaseBody.Replace("`r`n", "`n")

if ($workflow.Contains("`t")) {
    throw "The GitHub Actions workflow contains tab indentation."
}

$workflowRequirements = @(
    '(?m)^  metadata:$',
    '(?m)^  build-windows:$',
    '(?m)^  build-macos:$',
    '(?m)^  publish:$',
    'runs-on: windows-latest',
    'runs-on: macos-latest',
    'installer/build-installer\.ps1',
    'installer/test-installer\.ps1',
    'installer/macos/build-installer\.sh',
    'installer/macos/test-installer\.sh',
    'TwitchManager-Windows11-Setup\.exe',
    'TwitchManager-Windows11-Setup\.sha256',
    'TwitchManager-macOS\.pkg',
    'TwitchManager-macOS\.sha256',
    'actions/upload-artifact@v4',
    'actions/download-artifact@v4'
)
foreach ($requirement in $workflowRequirements) {
    if ($workflow -notmatch $requirement) {
        throw "Workflow requirement was not found: $requirement"
    }
}

foreach ($assetName in @(
    "TwitchManager-Windows11-Setup.exe",
    "TwitchManager-Windows11-Setup.sha256",
    "TwitchManager-macOS.pkg",
    "TwitchManager-macOS.sha256")) {
    if ($releaseBody -notmatch [regex]::Escape($assetName)) {
        throw "Release description does not mention: $assetName"
    }
}

if ($releaseBody -notmatch '\{\{VERSION\}\}') {
    throw "Release description version placeholder is missing."
}
if ($releaseBody -notmatch 'GitHub Wiki') {
    throw "GitHub Wiki guidance is missing."
}

Write-Host "Release workflow and documentation references verified."
