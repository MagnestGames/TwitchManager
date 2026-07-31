#!/bin/bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repository_root="$(cd "$script_dir/../.." && pwd)"
installer_path="${1:-$repository_root/dist/TwitchManager-macOS.pkg}"
hash_path="${installer_path%.pkg}.sha256"

if [[ ! -f "$installer_path" ]]; then
  echo "Installer not found: $installer_path" >&2
  exit 1
fi
if [[ ! -f "$hash_path" ]]; then
  echo "SHA256 file not found: $hash_path" >&2
  exit 1
fi

expected_hash="$(awk '{print $1}' "$hash_path")"
actual_hash="$(shasum -a 256 "$installer_path" | awk '{print $1}')"
if [[ "$expected_hash" != "$actual_hash" ]]; then
  echo "SHA256 mismatch. Expected $expected_hash, actual $actual_hash" >&2
  exit 1
fi

payload_files="$(pkgutil --payload-files "$installer_path" | sed 's#^\./##')"
required_entries=(
  "Applications/TwitchManager/TwitchManagerDock.html"
  "Applications/TwitchManager/TwitchManagerAudio.html"
  "Applications/TwitchManager/creators.json"
  "Applications/TwitchManager/twitch_manager_version.js"
  "Applications/TwitchManager/twitch_manager_locales.js"
  "Applications/TwitchManager/twitch_manager.css"
  "Applications/TwitchManager/assets/branding/TwitchManager-logo.png"
  "Applications/TwitchManager/js/update-check.js"
  "Applications/TwitchManager/js/audio-source.js"
  "Applications/TwitchManager/js/ui.js"
  "Applications/TwitchManager/sounds/chat_1.wav"
  "Applications/TwitchManager/sounds/chat_2.wav"
  "Applications/TwitchManager/sounds/chat_3.wav"
  "Applications/TwitchManager/sounds/chat_4.wav"
  "Applications/TwitchManager/sounds/first_1.wav"
  "Applications/TwitchManager/sounds/first_3.wav"
  "Applications/TwitchManager/sounds/first_4.wav"
  "Applications/TwitchManager/sounds/raid_1.wav"
  "Applications/TwitchManager/sounds/raid_2.wav"
  "Applications/TwitchManager/OBS_Dock_URL.txt"
  "Applications/TwitchManager/OBS_Audio_Source_URL.txt"
  "Applications/TwitchManager/.twitchmanager-install"
  "Applications/TwitchManager/TwitchManagerをOBSに追加.app/Contents/Info.plist"
  "Applications/TwitchManager/TwitchManagerをOBSに追加.app/Contents/MacOS/TwitchManager"
)
for entry_name in "${required_entries[@]}"; do
  if ! grep -Fqx "$entry_name" <<< "$payload_files"; then
    echo "Payload entry not found: $entry_name" >&2
    exit 1
  fi
done

for entry_name in \
  "Applications/TwitchManager/README.md" \
  "Applications/TwitchManager/LICENSE"; do
  if grep -Fqx "$entry_name" <<< "$payload_files"; then
    echo "Unnecessary payload entry found: $entry_name" >&2
    exit 1
  fi
done
if grep -Fq "Applications/TwitchManager/docs/" <<< "$payload_files"; then
  echo "Documentation files must not be included in the installer payload." >&2
  exit 1
fi

temporary_root="$(mktemp -d "${TMPDIR:-/tmp}/twitchmanager-pkg-test.XXXXXX")"
trap 'rm -rf "$temporary_root"' EXIT
pkgutil --expand "$installer_path" "$temporary_root/expanded"
package_info="$temporary_root/expanded/PackageInfo"
if ! grep -Fq 'identifier="games.magnest.twitchmanager"' "$package_info"; then
  echo "Unexpected package identifier." >&2
  exit 1
fi
if ! grep -Fq 'install-location="/"' "$package_info"; then
  echo "Unexpected package install location." >&2
  exit 1
fi

echo "macOS installer package verified."
echo "SHA256: $actual_hash"
echo "Payload entries: $(printf '%s\n' "$payload_files" | wc -l | tr -d ' ')"
pkgutil --check-signature "$installer_path" || true
