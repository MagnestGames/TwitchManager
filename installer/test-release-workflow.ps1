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
    '(?m)^  pull_request:$',
    'runs-on: windows-latest',
    'runs-on: macos-latest',
    'dev_1\.0\.2_beta',
    '1\.0\.2_beta',
    '1\.0\.2',
    '\^\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$',
    'scripts/check-localization\.mjs',
    'scripts/check-theme-contrast\.mjs',
    'scripts/test-update-check\.mjs',
    'scripts/test-audio-features\.mjs',
    'installer/build-installer\.ps1',
    'installer/test-installer\.ps1',
    'installer/macos/build-installer\.sh',
    'installer/macos/test-installer\.sh',
    'TwitchManager-Windows11-Setup\.exe',
    'TwitchManager-macOS\.pkg',
    'actions/checkout@v7',
    'actions/upload-artifact@v7',
    'actions/download-artifact@v8',
    '--draft=false',
    '--prerelease=false'
)
foreach ($requirement in $workflowRequirements) {
    if ($workflow -notmatch $requirement) {
        throw "Workflow requirement was not found: $requirement"
    }
}

foreach ($assetName in @(
    "TwitchManager-Windows11-Setup.exe",
    "TwitchManager-macOS.pkg")) {
    if ($releaseBody -notmatch [regex]::Escape($assetName)) {
        throw "Release description does not mention: $assetName"
    }
}

foreach ($placeholder in @("{{WINDOWS_SHA256}}", "{{MACOS_SHA256}}")) {
    if ($releaseBody -notmatch [regex]::Escape($placeholder)) {
        throw "Release description checksum placeholder is missing: $placeholder"
    }
}
$renderedReleaseBody = $releaseBody.Replace(
    "{{WINDOWS_SHA256}}",
    ("a" * 64)).Replace(
    "{{MACOS_SHA256}}",
    ("b" * 64))
if ($renderedReleaseBody -match '\{\{[^}]+\}\}') {
    throw "Release description contains an unresolved placeholder."
}
if ($releaseBody.IndexOf("## macOS", [System.StringComparison]::Ordinal) -gt
    $releaseBody.IndexOf("## Windows 11", [System.StringComparison]::Ordinal)) {
    throw "macOS guidance must appear before Windows guidance."
}
foreach ($workflowReference in @(
    "sha256sum dist/TwitchManager-Windows11-Setup.exe",
    "sha256sum dist/TwitchManager-macOS.pkg",
    "{{WINDOWS_SHA256}}",
    "{{MACOS_SHA256}}")) {
    if ($workflow -notmatch [regex]::Escape($workflowReference)) {
        throw "Release workflow checksum reference is missing: $workflowReference"
    }
}
if ($workflow -match 'TwitchManager-(Windows11-Setup|macOS)\.sha256') {
    throw "Release workflow must not distribute .sha256 files."
}
if ($releaseBody -notmatch 'wiki/Getting-Started') {
    throw "Installation guidance is missing."
}

$forbiddenRepositoryPaths = @(
    (Join-Path $repositoryRoot "VERSION"),
    (Join-Path $repositoryRoot "docs\images"),
    (Join-Path $repositoryRoot "docs\wiki-mock\README.md"),
    (Join-Path $repositoryRoot "docs\wiki-mock\preview.html")
)
foreach ($forbiddenPath in $forbiddenRepositoryPaths) {
    if (Test-Path -LiteralPath $forbiddenPath) {
        throw "Obsolete repository path still exists: $forbiddenPath"
    }
}

$duplicateImages = Get-ChildItem -LiteralPath (Join-Path $repositoryRoot "docs\wiki-mock\images") -Recurse -File |
    Get-FileHash -Algorithm SHA256 |
    Group-Object Hash |
    Where-Object Count -gt 1
if ($duplicateImages) {
    $duplicatePaths = $duplicateImages.Group.Path -join ", "
    throw "Duplicate Wiki images found: $duplicatePaths"
}

$wikiText = Get-ChildItem -LiteralPath (Join-Path $repositoryRoot "docs\wiki-mock") -Filter "*.md" -File |
    ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw } |
    Out-String
if ($wikiText -match '2026-07-25|`VERSION`') {
    throw "Wiki source contains obsolete release or signing guidance."
}

Write-Host "Release workflow and documentation references verified."
