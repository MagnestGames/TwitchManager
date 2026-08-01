> 🌐 **Language / 语言:** [🇯🇵 日本語](Authentication) | [🇺🇸 English](Authentication-EN) | **🇨🇳 简体中文**

---

# Twitch 身份验证

要同步 Twitch 设置、接收事件通知或执行聊天操作，需要设置 Access Token。

![Twitch 身份验证设置](images/features/settings-authentication.png)

## 设置步骤

1. 点击右上角的齿轮图标打开“设置”。
2. 点击 **「复制 Twitch Token Generator URL」**。
3. 使用默认浏览器打开该 URL，并创建 **Custom Scope Token**。
4. 将 ACCESS TOKEN 粘贴到 TwitchManager 并保存。
5. 确认界面中已显示关联的 Twitch 账号名称。

## 主要权限列表 (Scopes)

| 功能 | 权限 (Scope) |
| --- | --- |
| 标题与分类 | `channel:manage:broadcast` |
| 聊天室 | `user:read:chat` / `user:write:chat` |
| 事件通知 | `bits:read` / `channel:read:subscriptions` / `channel:read:redemptions` |
| 欢迎通知 | `moderator:read:chatters` |
| 预测与投票 | `channel:manage:predictions` / `channel:manage:polls` |
| Raid 与频道介绍 | `channel:manage:raids` / `moderator:manage:shoutouts` |
| 聊天室管理 | `moderator:manage:announcements` / `moderator:manage:chat_settings` |
| 剪辑与 VIP | `clips:edit` / `channel:read:vips` / `channel:manage:vips` |

缺少权限时，只有相应功能会操作失败。例如，频道积分兑换记录需要 `channel:read:redemptions`，执行 `/raid` 需要 `channel:manage:raids`，欢迎通知需要 `moderator:read:chatters`。使用新功能或遇到授权错误时，请勾选所需权限并重新生成 Token。

## 注意事项

- **请勿在直播画面、GitHub Issue 或社交媒体上显示 Access Token**。
- 如果怀疑 Token 已泄露，请点击“解除 Twitch 身份验证”并重新生成 Token。
- 默认浏览器与 OBS Dock 的本地存储区可能彼此独立。请务必在直播所用的 OBS Dock 中完成设置。
