> 🌐 **Language / 語言:** [🇯🇵 日本語](Raid-and-Notifications) | **🇺🇸 English** | [🇨🇳 繁體中文](Raid-and-Notifications-ZH)

---

# Notifications & Raid Management

Under the **"Notifications & Raids"** tab, you can configure channel shoutouts, automatic raid handling, shoutout templates, and sound alert settings.

## Manual Shoutouts & Raid Launch

Enter a Twitch ID or channel URL to trigger the following actions:

- `/shoutout`: Send Twitch's official channel shoutout.
- `/raid`: Initiate a raid to the specified channel.
- **"Send Shoutout Message"**: Send your saved custom shoutout template to chat.

![Manual Channel Shoutout](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/twitch-manager-dock.png)

Streamers registered in your ID List will appear as auto-complete suggestions. Always double-check the target Twitch ID before clicking `/raid`.

## Automatic Raid Shoutout

![Auto Raid Introduction Settings](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/raid-auto-introduction.png)

- Automatically send a shoutout message after receiving an incoming raid.
- Set a delay timer (0 to 600 seconds) before sending.
- Simultaneously trigger Twitch's official `/shoutout`.
- Automatically post the target channel's URL to chat when you manually execute `/raid`.
- Allow chat commands (e.g., `!so`) to trigger shoutout messages.
- Restrict command permissions (Broadcaster, Moderators, VIPs, Subscribers, Everyone).

## Shoutout Templates

You can save separate templates for incoming raids, manual shoutouts, and outgoing raids. The outgoing raid template is used when sharing the destination channel's URL in chat after launching a raid.

![Shoutout Templates](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/raid-message-templates.png)

| Variable | Description |
| --- | --- |
| `{displayName}` | Target's Display Name |
| `{username}` | Target's Twitch ID |
| `{viewers}` | Raid Viewer Count |
| `{url}` | Target Channel URL |
| `{game}` | Target's Last Played Category |
| `{title}` | Target's Last Stream Title |

In outgoing raid templates, `{url}` is replaced with the raided channel's URL.

## Sound Alerts

Configure the sound toggle, audio file, and volume for Raids, Chat Comments, Channel Point Redemptions, and First-time Chat Messages. Sounds play directly in TwitchManager.

![Sound Alert Settings](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds.png)

### External Sound Folder Setup

1. Click **"Select Sound Folder"**.
2. Pick the folder containing your audio files.
3. Select sound files for each event, preview, and save.

*Recommended formats: `.wav` or `.mp3`. Due to browser security policies, you may need to re-select the folder after reloading the page or restarting OBS.*

To mute alerts for bot accounts, register their Twitch IDs under **"Muted Users"**.
