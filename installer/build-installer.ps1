[CmdletBinding()]
param(
    [string]$Version = "1.0.2",
    [string]$OutputDirectory = ""
)

$ErrorActionPreference = "Stop"

if ($Version -notmatch '^v?[0-9]+(?:\.[0-9]+){1,3}(?:[_-][0-9A-Za-z.-]+)?$') {
    throw "Version must use a form such as 1.0.2 or 1.0.2_beta: $Version"
}

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$buildRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".build"))
if (-not $buildRoot.StartsWith($repositoryRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Build directory is outside the repository."
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $repositoryRoot "dist"
}
$OutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)

if (Test-Path -LiteralPath $buildRoot) {
    Remove-Item -LiteralPath $buildRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $buildRoot | Out-Null
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

$payloadRoot = Join-Path $buildRoot "payload"
New-Item -ItemType Directory -Path $payloadRoot | Out-Null

$rootFiles = @(
    "TwitchManagerDock.html",
    "TwitchManagerAudio.html",
    "creators.json",
    "twitch_manager_version.js",
    "twitch_manager_locales.js",
    "twitch_manager.css"
)
foreach ($file in $rootFiles) {
    Copy-Item -LiteralPath (Join-Path $repositoryRoot $file) -Destination $payloadRoot
}

$versionScriptContent = "globalThis.TWITCH_MANAGER_BUILD = Object.freeze({ version: `"$Version`" });`n"
[System.IO.File]::WriteAllText(
    (Join-Path $payloadRoot "twitch_manager_version.js"),
    $versionScriptContent,
    [System.Text.UTF8Encoding]::new($false))

$directories = @("assets", "js", "sounds")
foreach ($directory in $directories) {
    $source = Join-Path $repositoryRoot $directory
    if (Test-Path -LiteralPath $source) {
        Copy-Item -LiteralPath $source -Destination $payloadRoot -Recurse
    }
}

$payloadArchive = Join-Path $buildRoot "payload.zip"
Compress-Archive -Path (Join-Path $payloadRoot "*") -DestinationPath $payloadArchive -CompressionLevel Optimal

$versionFile = Join-Path $buildRoot "version.txt"
[System.IO.File]::WriteAllText($versionFile, $Version, [System.Text.UTF8Encoding]::new($false))

$versionNumbers = [regex]::Matches($Version, "\d+") | ForEach-Object { [int]$_.Value }
$assemblyParts = @(0, 0, 0, 0)
for ($index = 0; $index -lt [Math]::Min(4, $versionNumbers.Count); $index++) {
    $assemblyParts[$index] = [Math]::Min(65534, $versionNumbers[$index])
}
$assemblyVersion = $assemblyParts -join "."
$assemblyInfo = Join-Path $buildRoot "AssemblyInfo.cs"
$assemblySource = @"
using System.Reflection;
[assembly: AssemblyTitle("TwitchManager Windows 11 Setup")]
[assembly: AssemblyProduct("TwitchManager Windows 11")]
[assembly: AssemblyCompany("MagnestGames")]
[assembly: AssemblyVersion("$assemblyVersion")]
[assembly: AssemblyFileVersion("$assemblyVersion")]
"@
[System.IO.File]::WriteAllText($assemblyInfo, $assemblySource, [System.Text.UTF8Encoding]::new($false))

$compilerCandidates = @(
    "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$compiler = $compilerCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $compiler) {
    throw "The .NET Framework C# compiler was not found."
}

$windowsManifest = Join-Path $PSScriptRoot "windows\app.manifest"
if (-not (Test-Path -LiteralPath $windowsManifest -PathType Leaf)) {
    throw "Windows 11 application manifest was not found: $windowsManifest"
}

$outputInstaller = Join-Path $OutputDirectory "TwitchManager-Windows11-Setup.exe"
$sourceFiles = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot "src") -Filter "*.cs" -File | Select-Object -ExpandProperty FullName
$compilerArguments = @(
    "/nologo",
    "/target:winexe",
    "/optimize+",
    "/platform:anycpu",
    "/codepage:65001",
    "/out:$outputInstaller",
    "/win32manifest:$windowsManifest",
    "/resource:$payloadArchive,TwitchManager.Payload.zip",
    "/resource:$versionFile,TwitchManager.Version.txt",
    "/reference:System.dll",
    "/reference:System.Core.dll",
    "/reference:System.Drawing.dll",
    "/reference:System.Windows.Forms.dll",
    "/reference:System.IO.Compression.dll"
)

& $compiler @compilerArguments $assemblyInfo $sourceFiles
if ($LASTEXITCODE -ne 0) {
    throw "Installer compilation failed with exit code $LASTEXITCODE."
}

$hash = Get-FileHash -LiteralPath $outputInstaller -Algorithm SHA256
$hashFile = Join-Path $OutputDirectory "TwitchManager-Windows11-Setup.sha256"
[System.IO.File]::WriteAllText(
    $hashFile,
    $hash.Hash.ToLowerInvariant() + "  TwitchManager-Windows11-Setup.exe" + [Environment]::NewLine,
    [System.Text.UTF8Encoding]::new($false))

Write-Host "Installer: $outputInstaller"
Write-Host "SHA256:    $hashFile"
