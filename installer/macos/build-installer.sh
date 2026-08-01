#!/bin/bash
set -euo pipefail

version="${1:-1.0.2}"
script_dir="$(cd "$(dirname "$0")" && pwd)"
repository_root="$(cd "$script_dir/../.." && pwd)"
output_directory="${2:-$repository_root/dist}"
build_mode="${3:-package}"
build_root="$repository_root/installer/.build/macos"

if [[ "$build_root" != "$repository_root/installer/.build/"* ]]; then
  echo "Build directory is outside the repository." >&2
  exit 1
fi

package_version="${version%%_*}"
package_version="${package_version%%[-+]*}"
if [[ ! "$version" =~ ^v?[0-9]+(\.[0-9]+){1,3}([_-][0-9A-Za-z.-]+)?$ ]]; then
  echo "Version must use a form such as 1.0.2 or 1.0.2_beta: $version" >&2
  exit 1
fi
if [[ ! "$package_version" =~ ^[0-9]+(\.[0-9]+){1,3}$ ]]; then
  echo "Version must use a numeric form such as 1.0.0: $version" >&2
  exit 1
fi

if [[ "$build_mode" != "package" && "$build_mode" != "prepare-only" ]]; then
  echo "Build mode must be package or prepare-only: $build_mode" >&2
  exit 1
fi

required_commands=(cp sed chmod)
if [[ "$build_mode" == "package" ]]; then
  required_commands+=(pkgbuild shasum awk plutil)
fi
for command_name in "${required_commands[@]}"; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required macOS command was not found: $command_name" >&2
    exit 1
  fi
done

rm -rf "$build_root"
mkdir -p "$build_root" "$output_directory"

payload_root="$build_root/payload"
install_root="$payload_root/Applications/TwitchManager"
mkdir -p "$install_root"

root_files=(
  "TwitchManagerDock.html"
  "TwitchManagerAudio.html"
  "creators.json"
  "twitch_manager_version.js"
  "twitch_manager_locales.js"
  "twitch_manager.css"
)
for file_name in "${root_files[@]}"; do
  source_path="$repository_root/$file_name"
  if [[ ! -f "$source_path" ]]; then
    echo "Required payload file was not found: $source_path" >&2
    exit 1
  fi
  cp "$source_path" "$install_root/"
done

printf 'globalThis.TWITCH_MANAGER_BUILD = Object.freeze({ version: "%s" });\n' "$version" > "$install_root/twitch_manager_version.js"

for directory_name in assets js sounds; do
  source_path="$repository_root/$directory_name"
  if [[ -d "$source_path" ]]; then
    cp -R "$source_path" "$install_root/"
  fi
done

dock_url="file:///Applications/TwitchManager/TwitchManagerDock.html"
audio_url="${dock_url}?audio-source=1"
printf '%s\n' "$dock_url" > "$install_root/OBS_Dock_URL.txt"
printf '%s\n' "$audio_url" > "$install_root/OBS_Audio_Source_URL.txt"
printf '%s\n' "TwitchManagerInstaller-macOS-v1" > "$install_root/.twitchmanager-install"

helper_app="$install_root/TwitchManagerをOBSに追加.app"
mkdir -p "$helper_app/Contents/MacOS"
sed "s/{{VERSION}}/$package_version/g" "$script_dir/app/Info.plist" > "$helper_app/Contents/Info.plist"
cp "$script_dir/app/TwitchManager" "$helper_app/Contents/MacOS/TwitchManager"
chmod 755 "$helper_app/Contents/MacOS/TwitchManager"

if [[ ! -x "$helper_app/Contents/MacOS/TwitchManager" ]]; then
  echo "The macOS helper app launcher is not executable." >&2
  exit 1
fi

if [[ "$build_mode" == "prepare-only" ]]; then
  echo "macOS payload prepared: $payload_root"
  exit 0
fi

plutil -lint "$helper_app/Contents/Info.plist"

output_package="$output_directory/TwitchManager-macOS.pkg"
pkgbuild \
  --root "$payload_root" \
  --identifier "games.magnest.twitchmanager" \
  --version "$package_version" \
  --install-location "/" \
  --ownership recommended \
  "$output_package"

hash_value="$(shasum -a 256 "$output_package" | awk '{print $1}')"
printf '%s  %s\n' "$hash_value" "TwitchManager-macOS.pkg" > "$output_directory/TwitchManager-macOS.sha256"

echo "Installer: $output_package"
echo "SHA256:    $output_directory/TwitchManager-macOS.sha256"
