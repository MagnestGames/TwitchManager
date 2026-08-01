> 🌐 **Language / 語言:** [🇯🇵 日本語](Authentication) | **🇺🇸 English** | [🇨🇳 简体中文](Authentication-ZH)

---

# Twitch Authentication

An access token is required to update stream info, receive EventSub notifications, and execute chat actions on Twitch.

![Twitch Authentication Settings](images/features/settings-authentication.png)

## Setup Steps

1. Click the gear icon in the top-right corner to open Settings.
2. Click **"Copy Twitch Token Generator URL"**.
3. Open the URL in your default browser and generate a **Custom Scope Token**.
4. Paste the ACCESS TOKEN into TwitchManager and click Save.
5. Verify that your linked Twitch account name is displayed.

## Main Required Scopes

| Feature | Scope |
| --- | --- |
| Title & Category | `channel:manage:broadcast` |
| Chat | `user:read:chat` / `user:write:chat` |
| Notifications | `bits:read` / `channel:read:subscriptions` / `channel:read:redemptions` |
| Welcome Notification | `moderator:read:chatters` |
| Predictions & Polls | `channel:manage:predictions` / `channel:manage:polls` |
| Raids & Shoutouts | `channel:manage:raids` / `moderator:manage:shoutouts` |
| Chat Management | `moderator:manage:announcements` / `moderator:manage:chat_settings` |
| Clips & VIPs | `clips:edit` / `channel:read:vips` / `channel:manage:vips` |

If scopes are missing, only the corresponding features will fail. For example, `channel:read:redemptions` is required for Channel Point reward history, `channel:manage:raids` is required to perform `/raid`, and `moderator:read:chatters` is required for Welcome Notification. When using new features or encountering authorization errors, regenerate a token with all required scopes selected.

## Important Notes

- **Never display or leak your access token** on stream, in GitHub issues, or on social media.
- If you suspect a token leak, click **"Disconnect Twitch Authentication"** and generate a new token immediately.
- Local storage can differ between your default browser and the OBS Browser Dock. Make sure to complete the token setup inside the OBS Browser Dock you use for streaming.
