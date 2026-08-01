> 🌐 **Language / 语言:** [🇯🇵 日本語](Commands) | [🇺🇸 English](Commands-EN) | **🇨🇳 简体中文**

---

# 指令设置

按类别整理直播中常用的 Twitch 命令，方便快速操作。

- **带有 ✦ 的按钮**：通过 Twitch API 直接执行。
- **其他按钮**：将命令模板复制到剪贴板，方便粘贴到聊天室并填写参数。

直接执行前，需要完成 [Twitch 身份验证](Authentication-ZH) 并获取相应的 API 权限 (Scope)。

## 直播管理

![直播管理指令](images/features/commands-stream.png)

可操作直播标题、分类、直播标记、Raid 和广告。若要在 Raid 时自动向聊天室发送目标频道 URL，请使用 [通知与 Raid 介绍](Raid-and-Notifications-ZH) 中的 `/raid` 按钮。

## 聊天室设置

![聊天室设置指令](images/features/commands-chat.png)

操作聊天室公告、清空聊天室、聊天模式、仅限关注者与慢速模式。

## 用户管理

![用户管理命令](images/features/commands-users.png)

可快速执行封禁 (Ban)、临时禁言 (Timeout)、MOD、VIP、监控、限制、屏蔽和私信 (Whisper) 等操作。

## 互动指令

![互动指令界面](images/features/commands-interaction.png)

可操作投票、预测、置顶消息和 Shoutout。预测与投票的详细功能位于 [Twitch 工具](Twitch-Tools-ZH)，介绍文设置位于 [通知与 Raid 介绍](Raid-and-Notifications-ZH)。

> 执行 Ban、Raid、广告与权限变更前，请务必确认目标对象与内容。开始 Raid 需要 `channel:manage:raids` 权限。
