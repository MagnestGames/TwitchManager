[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$buildScript = Join-Path $PSScriptRoot "build-installer.sh"
$testScript = Join-Path $PSScriptRoot "test-installer.sh"
$launcherScript = Join-Path $PSScriptRoot "app\TwitchManager"
$infoPlist = Join-Path $PSScriptRoot "app\Info.plist"
$storageScript = Join-Path $repositoryRoot "js\storage.js"
$uiScript = Join-Path $repositoryRoot "js\ui.js"
$updateCheckScript = Join-Path $repositoryRoot "js\update-check.js"
$versionScript = Join-Path $repositoryRoot "twitch_manager_version.js"
$logoFile = Join-Path $repositoryRoot "assets\branding\TwitchManager-logo.png"
$defaultSoundFiles = @(
    "chat_1.wav",
    "chat_2.wav",
    "chat_3.wav",
    "chat_4.wav",
    "first_1.wav",
    "first_3.wav",
    "first_4.wav",
    "raid_1.wav",
    "raid_2.wav"
)

$requiredFiles = @(
    $buildScript,
    $testScript,
    $launcherScript,
    $infoPlist,
    (Join-Path $repositoryRoot "TwitchManagerDock.html"),
    $logoFile,
    $storageScript,
    $uiScript,
    $updateCheckScript,
    $versionScript
)
$requiredFiles += $defaultSoundFiles | ForEach-Object {
    Join-Path $repositoryRoot "sounds\$_"
}
foreach ($requiredFile in $requiredFiles) {
    if (-not (Test-Path -LiteralPath $requiredFile -PathType Leaf)) {
        throw "Required macOS installer source was not found: $requiredFile"
    }
}

foreach ($shellFile in @($buildScript, $testScript, $launcherScript)) {
    $contents = [System.IO.File]::ReadAllText($shellFile)
    if ($contents.Contains("`r`n")) {
        throw "Shell script must use LF line endings: $shellFile"
    }
}

[xml]$plist = Get-Content -LiteralPath $infoPlist -Raw
$plistText = $plist.OuterXml
if ($plistText -notmatch 'games\.magnest\.twitchmanager\.helper') {
    throw "Unexpected macOS helper bundle identifier."
}
if ($plistText -notmatch '<string>11\.0</string>') {
    throw "The macOS minimum version must be 11.0."
}
if ($plistText -notmatch '\{\{VERSION\}\}') {
    throw "The macOS app version placeholder is missing."
}

$launcherText = Get-Content -LiteralPath $launcherScript -Raw
if ($launcherText -notmatch 'file:///Applications/TwitchManager/TwitchManagerDock\.html') {
    throw "The macOS OBS dock URL is missing from the helper app."
}
if ($launcherText -notmatch '/usr/bin/pbcopy') {
    throw "The macOS helper app does not copy the OBS dock URL."
}

$storageText = Get-Content -LiteralPath $storageScript -Raw
foreach ($soundFile in $defaultSoundFiles) {
    if ($storageText -notmatch [regex]::Escape("sounds/$soundFile")) {
        throw "Default sound file is not referenced by storage settings: $soundFile"
    }
}

$uiText = Get-Content -LiteralPath $uiScript -Raw
foreach ($defaultSound in @(
    "raidSoundFile: `"sounds/raid_1.wav`"",
    "commentSoundFile: `"sounds/chat_1.wav`"",
    "channelPointSoundFile: `"sounds/chat_1.wav`"",
    "firstCommentSoundFile: `"sounds/first_1.wav`"",
    "soundFiles: [...RAIDSO_DEFAULT_SOUND_FILES]")) {
    if (-not $uiText.Contains($defaultSound)) {
        throw "UI sound default is missing: $defaultSound"
    }
}

$bashCandidates = @()
$bashCommand = Get-Command bash.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if ($bashCommand) {
    $bashCandidates += $bashCommand.Source
}
foreach ($programFilesPath in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
    if (-not [string]::IsNullOrWhiteSpace($programFilesPath)) {
        $bashCandidates += Join-Path $programFilesPath "Git\bin\bash.exe"
    }
}
$bashCandidates = $bashCandidates | Select-Object -Unique
$bash = $bashCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if ($bash) {
    foreach ($shellFile in @($buildScript, $testScript, $launcherScript)) {
        & $bash -n $shellFile
        if ($LASTEXITCODE -ne 0) {
            throw "Shell syntax validation failed: $shellFile"
        }
    }
    Write-Host "Shell syntax verified with Git Bash."
}
else {
    Write-Host "Git Bash was not found; shell syntax validation was skipped."
}

$sourceTestRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot "installer\.build\macos-source-test"))
$allowedBuildRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot "installer\.build")) + [System.IO.Path]::DirectorySeparatorChar
if (-not $sourceTestRoot.StartsWith($allowedBuildRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "macOS source test directory is outside the repository build directory."
}
if (Test-Path -LiteralPath $sourceTestRoot) {
    Remove-Item -LiteralPath $sourceTestRoot -Recurse -Force
}

$preparedRoot = Join-Path $sourceTestRoot "payload\Applications\TwitchManager"
New-Item -ItemType Directory -Path $preparedRoot -Force | Out-Null
foreach ($fileName in @("TwitchManagerDock.html", "creators.json", "twitch_manager_version.js", "twitch_manager_locales.js", "twitch_manager.css")) {
    Copy-Item -LiteralPath (Join-Path $repositoryRoot $fileName) -Destination $preparedRoot
}
foreach ($directoryName in @("assets", "js", "sounds")) {
    Copy-Item -LiteralPath (Join-Path $repositoryRoot $directoryName) -Destination $preparedRoot -Recurse
}
[System.IO.File]::WriteAllText(
    (Join-Path $preparedRoot "twitch_manager_version.js"),
    "globalThis.TWITCH_MANAGER_BUILD = Object.freeze({ version: `"0.2.0`" });`n",
    [System.Text.UTF8Encoding]::new($false))

$preparedUrlPath = Join-Path $preparedRoot "OBS_Dock_URL.txt"
[System.IO.File]::WriteAllText(
    $preparedUrlPath,
    "file:///Applications/TwitchManager/TwitchManagerDock.html`n",
    [System.Text.UTF8Encoding]::new($false))

$preparedApp = Join-Path $preparedRoot "TwitchManagerをOBSに追加.app\Contents"
New-Item -ItemType Directory -Path (Join-Path $preparedApp "MacOS") -Force | Out-Null
$plistTemplate = Get-Content -LiteralPath $infoPlist -Raw
[System.IO.File]::WriteAllText(
    (Join-Path $preparedApp "Info.plist"),
    $plistTemplate.Replace("{{VERSION}}", "0.2.0"),
    [System.Text.UTF8Encoding]::new($false))
Copy-Item -LiteralPath $launcherScript -Destination (Join-Path $preparedApp "MacOS\TwitchManager")

$preparedFiles = @(
    (Join-Path $preparedRoot "TwitchManagerDock.html"),
    (Join-Path $preparedRoot "creators.json"),
    (Join-Path $preparedRoot "twitch_manager_version.js"),
    (Join-Path $preparedRoot "twitch_manager_locales.js"),
    (Join-Path $preparedRoot "twitch_manager.css"),
    (Join-Path $preparedRoot "assets\branding\TwitchManager-logo.png"),
    (Join-Path $preparedRoot "js\update-check.js"),
    (Join-Path $preparedRoot "js\ui.js"),
    $preparedUrlPath,
    (Join-Path $preparedApp "Info.plist"),
    (Join-Path $preparedApp "MacOS\TwitchManager")
)
$preparedFiles += $defaultSoundFiles | ForEach-Object {
    Join-Path $preparedRoot "sounds\$_"
}
foreach ($preparedFile in $preparedFiles) {
    if (-not (Test-Path -LiteralPath $preparedFile -PathType Leaf)) {
        throw "Prepared macOS payload entry was not found: $preparedFile"
    }
}

foreach ($unnecessaryPath in @(
    (Join-Path $preparedRoot "README.md"),
    (Join-Path $preparedRoot "LICENSE"),
    (Join-Path $preparedRoot "docs"))) {
    if (Test-Path -LiteralPath $unnecessaryPath) {
        throw "Unnecessary macOS payload entry found: $unnecessaryPath"
    }
}

$preparedUrl = (Get-Content -LiteralPath $preparedUrlPath -Raw).Trim()
if ($preparedUrl -ne "file:///Applications/TwitchManager/TwitchManagerDock.html") {
    throw "Unexpected URL in the prepared macOS payload: $preparedUrl"
}
$preparedPlist = Get-Content -LiteralPath (Join-Path $preparedApp "Info.plist") -Raw
if ($preparedPlist -notmatch '<string>0\.2\.0</string>' -or $preparedPlist -match '\{\{VERSION\}\}') {
    throw "The prepared macOS helper app has an invalid version."
}
$preparedVersionScript = Get-Content -LiteralPath (Join-Path $preparedRoot "twitch_manager_version.js") -Raw
if (-not $preparedVersionScript.Contains('version: "0.2.0"')) {
    throw "The prepared macOS update-check version is invalid."
}
Write-Host "macOS payload layout verified."

Write-Host "macOS installer sources verified."
