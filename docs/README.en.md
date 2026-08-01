# TwitchManager

[日本語](../README.md) | [English](README.en.md) | [简体中文](README.zh.md)

A custom browser dock for OBS Studio that brings together stream preparation, management, notifications, and viewer tracking for Twitch broadcasts.

![TwitchManager manages stream info, raids, notifications, and supporter logs in a single dock](wiki-mock/images/twitchmanager-overview.png)

> TwitchManager is an independently developed tool created and shared free of charge in good faith, with the hope of supporting streamers. It is not an official Twitch or OBS Studio product.
>
> If you would like to support its continued development, the [TwitchManager Support Edition (identical content)](https://toumei2suisai.booth.pm/items/8654630) is available on BOOTH. Support is optional and does not affect the features or terms of the free edition.

**Supported UI languages:** Japanese / English / Simplified Chinese

The latest version is available on [GitHub Releases](https://github.com/MagnestGames/TwitchManager/releases/latest). You can also review the [change history](../CHANGELOG.md).

## Main Features

### Stream Title & Category
Save frequently used titles and categories as presets. Apply saved presets to Twitch before streaming to reduce setup time.

### Automatic Raid Shoutout & ID Logging
Automatically introduce raiding channels upon receiving a raid. Supports executing official `/shoutout` and logging raiding Twitch IDs.

### Chat & Raid Notification Sounds
Play sound alerts for chat, first-time chat, raids, and channel point redemptions. Stay informed of important viewer interactions without constantly watching the screen.
TwitchManager audio can be routed through a single OBS Browser Source. Copy its URL from “🔊 Route sounds to OBS” in Notification Sounds.

When Welcome Notification is enabled, a selected viewer can trigger one sound per stream when they appear in the stream's chat participant list—even if they have not posted a message. Detection may take a few minutes after they join.

### Streamer & Viewer Management
- **Supporter List** — Record first-timers, raids, follows, Bits, subscriptions, chat activity, and channel point redemptions.
- **Subscriber & VIP Lists** — View channel subscribers and VIPs in a consolidated list.
- **ID List** — Save and manage streamer IDs for raids and shoutouts.

### Additional Streaming Support
- Automatic `/raid` command and raid destination URL sending.
- Manage predictions, polls, chat settings, clips, and VIP status.
- Birthdays & anniversaries tracker, notes, and full settings/list backup & restore.

## Download

Download the installer for your operating system from the "Assets" section on the [Latest Release Page](https://github.com/MagnestGames/TwitchManager/releases/latest).

| OS | File to Download |
| --- | --- |
| Windows 11 | [`TwitchManager-Windows11-Setup.exe`](https://github.com/MagnestGames/TwitchManager/releases/latest/download/TwitchManager-Windows11-Setup.exe) |
| macOS 11+ | [`TwitchManager-macOS.pkg`](https://github.com/MagnestGames/TwitchManager/releases/latest/download/TwitchManager-macOS.pkg) |

`Source code (zip)` and `Source code (tar.gz)` are not installers.

## Installation

### Windows 11

1. Open `TwitchManager-Windows11-Setup.exe`.
2. Confirm destination and click "Install".
3. Verify that the OBS URL has been copied to your clipboard on the completion screen.

By default, it installs to the `TwitchManager` folder inside Windows **Documents**. The dock URL is in `OBS_Dock_URL.txt`, and the OBS Browser Source URL for notification audio is in `OBS_Audio_Source_URL.txt`.

### macOS

1. Open `TwitchManager-macOS.pkg` to install.
2. Run "Add TwitchManager to OBS" located in `/Applications/TwitchManager`.
3. Confirm that the OBS URL is copied to your clipboard.

The dock URL is stored in `/Applications/TwitchManager/OBS_Dock_URL.txt`, and the OBS Browser Source URL for notification audio is in `OBS_Audio_Source_URL.txt`.

## Updating

Stable builds check for the latest release at startup. When an update is available, the dialog provides three choices:

- **Check** — Open the matching GitHub release page.
- **Remind in 3 days** — Postpone the same update notification for three days.
- **Skip** — Stop showing that version. A later release will still be announced.

Beta builds do not show update notifications. Before updating, back up your settings from the "Misc" tab, then run the installer for the latest release again. On Windows, select your current TwitchManager install path; on macOS, install the updated package over the existing installation.

When installing to the same location, you usually do not need to update the URL registered in OBS Studio.

## Adding to OBS Studio

1. In OBS Studio, open "Docks" -> "Custom Browser Docks..." from the top menu.

   ![OBS Studio Docks Menu](wiki-mock/images/obs-custom-browser-dock-menu.png)

2. Add a new row with "+" if necessary.
3. Enter `TwitchManager` as the Dock Name.
4. Paste the OBS URL copied during installation into the URL field.
5. Click "Apply".

![Custom Browser Dock Settings Example](wiki-mock/images/obs-custom-browser-dock-settings.png)

You can drag the added dock to any position in OBS. If text or buttons are cut off, widen the dock window.

## Twitch Authentication

Open the gear icon (Settings) in the top-right of TwitchManager to configure Twitch Authentication.

[Authentication Guide (Wiki)](https://github.com/MagnestGames/TwitchManager/wiki/Authentication)

## Screenshot

![TwitchManager Dock Interface](wiki-mock/images/twitch-manager-dock.png)

## Data Storage & Backup

Settings and lists are stored locally within OBS / browser storage. Before migrating PCs, clearing OBS cache, or reinstalling, copy your backup from the "Misc" tab.

Do not share your Access Token in streams, GitHub Issues, or social media.

## System Requirements

| OS | Supported Version |
| --- | --- |
| Windows | Windows 11 |
| macOS | macOS 11 or later |

Requires OBS Studio's "Custom Browser Docks" feature.

## Troubleshooting & Support

- [Installation & Adding to OBS](https://github.com/MagnestGames/TwitchManager/wiki/Getting-Started)
- [Frequently Asked Questions (Q&A)](https://github.com/MagnestGames/TwitchManager/wiki/Q&A)
- [Troubleshooting](https://github.com/MagnestGames/TwitchManager/wiki/Troubleshooting)
- [Report an Issue](https://github.com/MagnestGames/TwitchManager/issues)

When reporting an issue, please include your OS, versions of OBS Studio and TwitchManager, reproduction steps, and any error messages displayed. Do not include access tokens or private credentials.

## Creddit

![TwitchManager logo](../assets/branding/TwitchManager-logo.png)

To use the logo in a stream layout or promotional material, download [TwitchManager-logo.png](../assets/branding/TwitchManager-logo.png). You may also use it as an optional banner on stream layouts and web pages. It is included in the `assets/branding` folder of Windows and macOS installations.

Anyone may display, copy, and redistribute the logo without prior permission in stream layouts, social posts, videos, articles, and other materials, for commercial or noncommercial use. Credit is optional. If you include credit, these two lines are enough:

```text
TwitchManager
https://github.com/MagnestGames/TwitchManager
```

Do not present the logo as an official or endorsed Twitch or OBS Studio asset. See [Logo Usage and Credits](https://github.com/MagnestGames/TwitchManager/wiki/Logo-and-Credits) for details.

## License

[MIT License](../LICENSE)
