[CmdletBinding()]
param(
    [string]$InstallerPath = "",
    [string]$ExpectedVersion = ""
)

$ErrorActionPreference = "Stop"

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
if ([string]::IsNullOrWhiteSpace($InstallerPath)) {
    $InstallerPath = Join-Path $repositoryRoot "dist\TwitchManager-Windows11-Setup.exe"
}
$InstallerPath = [System.IO.Path]::GetFullPath($InstallerPath)

if (-not (Test-Path -LiteralPath $InstallerPath -PathType Leaf)) {
    throw "Installer not found: $InstallerPath"
}

$hashPath = [System.IO.Path]::ChangeExtension($InstallerPath, ".sha256")
if (-not (Test-Path -LiteralPath $hashPath -PathType Leaf)) {
    throw "SHA256 file not found: $hashPath"
}

$expectedHash = ((Get-Content -LiteralPath $hashPath -Raw).Trim() -split '\s+')[0]
$actualHash = (Get-FileHash -LiteralPath $InstallerPath -Algorithm SHA256).Hash
if (-not [string]::Equals($expectedHash, $actualHash, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "SHA256 mismatch. Expected $expectedHash, actual $actualHash"
}

Add-Type -AssemblyName System.IO.Compression
$assembly = [System.Reflection.Assembly]::LoadFile($InstallerPath)
$resourceNames = $assembly.GetManifestResourceNames()
$requiredResources = @(
    "TwitchManager.Payload.zip",
    "TwitchManager.Version.txt"
)
foreach ($resourceName in $requiredResources) {
    if ($resourceNames -notcontains $resourceName) {
        throw "Embedded resource not found: $resourceName"
    }
}

$payload = $assembly.GetManifestResourceStream("TwitchManager.Payload.zip")
if ($null -eq $payload) {
    throw "Unable to open embedded installer payload."
}

try {
    $archive = [System.IO.Compression.ZipArchive]::new(
        $payload,
        [System.IO.Compression.ZipArchiveMode]::Read,
        $false)
    try {
        $entryNames = @($archive.Entries | ForEach-Object { $_.FullName.Replace("\", "/") })
        $requiredEntries = @(
            "TwitchManagerDock.html",
            "TwitchManagerAudio.html",
            "js/creators.json",
            "js/version.js",
            "js/locales.js",
            "css/twitch_manager.css",
            "assets/branding/TwitchManager-logo.png",
            "js/update-check.js",
            "js/audio-source.js",
            "js/ui.js",
            "sounds/chat_1.wav",
            "sounds/chat_2.wav",
            "sounds/chat_3.wav",
            "sounds/chat_4.wav",
            "sounds/first_1.wav",
            "sounds/first_3.wav",
            "sounds/first_4.wav",
            "sounds/raid_1.wav",
            "sounds/raid_2.wav"
        )
        foreach ($entryName in $requiredEntries) {
            if ($entryNames -notcontains $entryName) {
                throw "Payload entry not found: $entryName"
            }
        }

        $forbiddenEntries = @(
            "README.md",
            "LICENSE"
        )
        foreach ($entryName in $forbiddenEntries) {
            if ($entryNames -contains $entryName) {
                throw "Unnecessary payload entry found: $entryName"
            }
        }
        if ($entryNames | Where-Object { $_.StartsWith("docs/", [System.StringComparison]::OrdinalIgnoreCase) }) {
            throw "Documentation files must not be included in the installer payload."
        }
    }
    finally {
        $archive.Dispose()
    }
}
finally {
    $payload.Dispose()
}

$versionStream = $assembly.GetManifestResourceStream("TwitchManager.Version.txt")
if ($null -eq $versionStream) {
    throw "Unable to open embedded version resource."
}
try {
    $reader = [System.IO.StreamReader]::new($versionStream, [System.Text.Encoding]::UTF8, $true)
    try {
        $version = $reader.ReadToEnd().Trim()
    }
    finally {
        $reader.Dispose()
    }
}
finally {
    $versionStream.Dispose()
}

if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Embedded version is empty."
}
if ((-not [string]::IsNullOrWhiteSpace($ExpectedVersion)) -and
    (-not [string]::Equals($version, $ExpectedVersion, [System.StringComparison]::Ordinal))) {
    throw "Unexpected embedded version. Expected $ExpectedVersion, actual $version"
}

$installerStrings = $assembly.GetType("TwitchManagerInstaller.InstallerStrings", $true)
$stringPropertyFlags = [System.Reflection.BindingFlags]::Public -bor [System.Reflection.BindingFlags]::Static
$setupTitleProperty = $installerStrings.GetProperty("SetupWindowTitle", $stringPropertyFlags)
if ($null -eq $setupTitleProperty) {
    throw "Installer localization property was not found."
}
$previousLanguageOverride = [Environment]::GetEnvironmentVariable("TWITCHMANAGER_INSTALLER_LANGUAGE")
try {
    [Environment]::SetEnvironmentVariable("TWITCHMANAGER_INSTALLER_LANGUAGE", "ja")
    $japaneseSetupTitle = [string]$setupTitleProperty.GetValue($null, $null)
    [Environment]::SetEnvironmentVariable("TWITCHMANAGER_INSTALLER_LANGUAGE", "en")
    $englishSetupTitle = [string]$setupTitleProperty.GetValue($null, $null)
}
finally {
    [Environment]::SetEnvironmentVariable("TWITCHMANAGER_INSTALLER_LANGUAGE", $previousLanguageOverride)
}
if ($japaneseSetupTitle -notmatch '[^\x00-\x7F]') {
    throw "Japanese installer text could not be selected."
}
if ($englishSetupTitle -notmatch "Setup") {
    throw "English installer text could not be selected."
}
if ([string]::Equals($japaneseSetupTitle, $englishSetupTitle, [System.StringComparison]::Ordinal)) {
    throw "Japanese and English installer text must differ."
}

$temporaryBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$extractionRoot = [System.IO.Path]::GetFullPath((Join-Path $temporaryBase ("TwitchManagerInstallerTest-" + [Guid]::NewGuid().ToString("N"))))
if (-not $extractionRoot.StartsWith($temporaryBase, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Extraction test directory is outside the temporary directory."
}

try {
    New-Item -ItemType Directory -Path $extractionRoot | Out-Null
    $installService = $assembly.GetType("TwitchManagerInstaller.InstallService", $true)
    $publicStaticFlags = [System.Reflection.BindingFlags]::Public -bor [System.Reflection.BindingFlags]::Static
    $defaultDirectoryProperty = $installService.GetProperty("DefaultInstallDirectory", $publicStaticFlags)
    if ($null -eq $defaultDirectoryProperty) {
        throw "Installer default directory property was not found."
    }
    $expectedDefaultDirectory = Join-Path ([Environment]::GetFolderPath([Environment+SpecialFolder]::MyDocuments)) "TwitchManager"
    $actualDefaultDirectory = [string]$defaultDirectoryProperty.GetValue($null, $null)
    if (-not [string]::Equals(
        [System.IO.Path]::GetFullPath($expectedDefaultDirectory),
        [System.IO.Path]::GetFullPath($actualDefaultDirectory),
        [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Unexpected default install directory: $actualDefaultDirectory"
    }

    $bindingFlags = [System.Reflection.BindingFlags]::NonPublic -bor [System.Reflection.BindingFlags]::Static
    $extractMethod = $installService.GetMethod("ExtractPayload", $bindingFlags)
    if ($null -eq $extractMethod) {
        throw "Installer extraction method was not found."
    }
    try {
        $extractMethod.Invoke($null, @($extractionRoot)) | Out-Null
    }
    catch [System.Reflection.TargetInvocationException] {
        throw $_.Exception.InnerException
    }

    foreach ($entryName in $requiredEntries) {
        $extractedPath = Join-Path $extractionRoot $entryName.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        if (-not (Test-Path -LiteralPath $extractedPath -PathType Leaf)) {
            throw "Extracted payload entry not found: $entryName"
        }
    }
    $versionScriptPath = Join-Path $extractionRoot "js/version.js"
    $versionScriptText = Get-Content -LiteralPath $versionScriptPath -Raw
    if ($versionScriptText -notmatch 'TWITCH_MANAGER_BUILD' -or $versionScriptText -notmatch 'version:\s*"[^"]+"') {
        throw "The extracted update-check version script is invalid."
    }
    if ((-not [string]::IsNullOrWhiteSpace($ExpectedVersion)) -and
        (-not $versionScriptText.Contains("version: `"$ExpectedVersion`""))) {
        throw "The extracted update-check version does not match $ExpectedVersion."
    }
}
finally {
    if (Test-Path -LiteralPath $extractionRoot) {
        Remove-Item -LiteralPath $extractionRoot -Recurse -Force
    }
}

$fileVersion = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($InstallerPath)
if ($fileVersion.ProductName -ne "TwitchManager Windows 11") {
    throw "Unexpected Windows installer product name: $($fileVersion.ProductName)"
}

$manifestPath = Join-Path $PSScriptRoot "windows\app.manifest"
[xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw
$manifestText = $manifest.OuterXml
if ($manifestText -notmatch '8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a') {
    throw "Windows 10/11 compatibility identifier is missing from the manifest."
}
if ($manifestText -notmatch 'requestedExecutionLevel[^>]+level="asInvoker"') {
    throw "The Windows installer must run without administrator elevation."
}
if ($manifestText -notmatch '<longPathAware[^>]*>true</longPathAware>') {
    throw "Windows long-path awareness is missing from the manifest."
}

Add-Type -TypeDefinition @"
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

public static class TwitchManagerPeManifestReader
{
    private const uint LoadLibraryAsDataFile = 0x00000002;

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr LoadLibraryEx(string fileName, IntPtr reserved, uint flags);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr FindResource(IntPtr module, IntPtr name, IntPtr type);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr LoadResource(IntPtr module, IntPtr resourceInfo);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint SizeofResource(IntPtr module, IntPtr resourceInfo);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr LockResource(IntPtr resourceData);

    [DllImport("kernel32.dll")]
    private static extern bool FreeLibrary(IntPtr module);

    public static string Read(string fileName)
    {
        IntPtr module = LoadLibraryEx(fileName, IntPtr.Zero, LoadLibraryAsDataFile);
        if (module == IntPtr.Zero)
            throw new Win32Exception(Marshal.GetLastWin32Error());

        try
        {
            IntPtr info = FindResource(module, new IntPtr(1), new IntPtr(24));
            if (info == IntPtr.Zero)
                throw new Win32Exception(Marshal.GetLastWin32Error(), "RT_MANIFEST resource was not found.");

            uint size = SizeofResource(module, info);
            IntPtr loaded = LoadResource(module, info);
            IntPtr pointer = LockResource(loaded);
            if (size == 0 || loaded == IntPtr.Zero || pointer == IntPtr.Zero)
                throw new Win32Exception(Marshal.GetLastWin32Error(), "RT_MANIFEST resource could not be loaded.");

            byte[] bytes = new byte[size];
            Marshal.Copy(pointer, bytes, 0, bytes.Length);
            return Encoding.UTF8.GetString(bytes).Trim('\0', '\uFEFF');
        }
        finally
        {
            FreeLibrary(module);
        }
    }
}
"@

$embeddedManifestText = [TwitchManagerPeManifestReader]::Read($InstallerPath)
if ($embeddedManifestText -notmatch '8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a') {
    throw "The built EXE does not contain the Windows 10/11 compatibility identifier."
}
if ($embeddedManifestText -notmatch 'requestedExecutionLevel[^>]+level="asInvoker"') {
    throw "The built EXE has an unexpected execution level."
}
if ($embeddedManifestText -notmatch '<longPathAware[^>]*>true</longPathAware>') {
    throw "The built EXE is missing long-path awareness."
}

Write-Host "Windows 11 installer package verified."
Write-Host "Version: $version"
Write-Host "SHA256: $($actualHash.ToLowerInvariant())"
Write-Host "Payload entries: $($entryNames.Count)"
