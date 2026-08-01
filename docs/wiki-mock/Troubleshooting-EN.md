> 🌐 **Language / 語言:** [🇯🇵 日本語](Troubleshooting) | **🇺🇸 English** | [🇨🇳 简体中文](Troubleshooting-ZH)

---

# Troubleshooting Guide

When encountering issues, check the Event Log under the "Others" tab and make a backup before changing settings.

| Symptom | Items to Check |
| --- | --- |
| Not showing up in OBS | Custom Browser Dock URL & local installation folder path |
| Twitch operations fail | Linked account, Access Token, and API Scopes |
| External sound alerts silent | Re-selecting the sound folder |
| OBS & standard browser data differ | Independent storage & data backups |
| Raids or alerts not detected | Authentication status, EventSub connection, toggle switches |

## Dock Not Displaying in OBS Studio

- Re-enter the local URL specified in `OBS_Dock_URL.txt`.
- On Windows, ensure the URL starts with `file:///C:/...` format.
- Verify that the installation directory or unzipped folder has not been moved.
- Check if `TwitchManager` is checked under OBS's **Docks** menu.

## Twitch Integration Features Not Working

![Authentication Status](images/features/settings-authentication.png)

1. Verify that your linked Twitch username appears in Settings.
2. Regenerate an Access Token with all necessary **Scopes** checked.
3. Review the Event Log for authorization error details.

*`channel:read:redemptions` scope is required for Channel Point logs, and `channel:manage:raids` is required for launching raids.*

If Twitch's native OBS Stream Information dock doesn't reflect title updates immediately, refresh that dock manually.

## External Sound Alerts Not Playing

![Sound Settings](images/features/notification-sounds.png)

1. Click **"Select Sound Folder"** and re-select your audio folder.
2. Select sound files for each event type.
3. Test play and save.

*Due to web security rules, folders must be re-selected after reloading the page or restarting OBS. If sounds still don't play, check event switches, volume, muted user list, OBS Audio Mixer settings, or test with `.wav`/`.mp3` files.*

## Data Lost or Reset

Clearing browser cache or site data can clear local storage. Restore your data from a previously exported backup file under the "Others" tab.

![Backup and Restore](images/features/backup-restore-logs.png)

## Still Need Help?

Prepare details including your OS, OBS version, steps to reproduce, timestamp, screenshots, and Event Logs. Never share your Access Token or personal authentication credentials publicly.
