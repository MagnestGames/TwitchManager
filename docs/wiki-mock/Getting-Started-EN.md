> 🌐 **Language / 語言:** [🇯🇵 日本語](Getting-Started) | **🇺🇸 English** | [🇨🇳 简体中文](Getting-Started-ZH)

---

# Installation & OBS Setup

## Installation

### Windows 11

1. Open the [Latest GitHub Release](https://github.com/MagnestGames/TwitchManager/releases/latest).
2. Download `TwitchManager-Windows11-Setup.exe` under Assets and run it.
3. Complete the installation wizard.

The default installation path is the `TwitchManager` folder inside your Windows "Documents" directory.

### macOS

1. Open the [Latest GitHub Release](https://github.com/MagnestGames/TwitchManager/releases/latest).
2. Download `TwitchManager-macOS.pkg` and install it.

The default installation path is `/Applications/TwitchManager`. Supported on macOS 11 or later.

## Update Notifications

TwitchManager checks for the latest stable release at startup. When a newer version is available, a dialog shows the installed and latest versions.

- **Check**: Opens the matching GitHub release page.
- **Remind in 3 days**: Defers the notice for three days, then shows the same update again.
- **Skip**: Stops notifications for that version. A later release will be shown again.

The network check runs at most once every 24 hours. Update notices are disabled in beta builds. If the check fails, TwitchManager starts normally without displaying an error dialog. Create a backup from the **Other** tab before installing an update.

## Adding to OBS Studio

1. In OBS Studio, open **Docks** -> **Custom Browser Docks...** from the top menu.

![OBS Dock Menu](images/obs-custom-browser-dock-menu.png)

2. Set the Dock Name to `TwitchManager`.

3. Paste the local OBS URL into the URL field. You can obtain the URL in one of the following ways:

   - On Windows, use the URL copied automatically upon installation or found inside `OBS_Dock_URL.txt`.
   - Open `TwitchManagerDock.html` in your web browser and copy the address bar URL.

4. Click **Apply**.

<img src="images/obs-custom-browser-dock-settings.png" alt="Custom Browser Dock Settings Example" width="700">

5. Drag the newly created dock to embed it into OBS, adjusting its width so buttons and text are clearly visible.

6. Click the gear icon in the top right to configure [Twitch Authentication](Authentication-EN).

> If using the ZIP version, do not move `TwitchManagerDock.html` out of its folder. Keep all included files in the original directory structure.

