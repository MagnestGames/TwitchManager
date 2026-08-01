> 🌐 **Language / 语言:** [🇯🇵 日本語](Troubleshooting) | [🇺🇸 English](Troubleshooting-EN) | **🇨🇳 简体中文**

---

# 故障排除指南

如果出现问题，请先在“其他”选项卡中查看活动日志，并在重新设置前创建数据备份。

| 问题 | 检查项目 |
| --- | --- |
| 无法在 OBS 中显示 | 自定义浏览器 Dock 的 URL 与本地文件路径 |
| Twitch 操作失败 | 连接账号、Access Token 及 API 权限 (Scope) |
| 外部音效无法播放 | 重新选择音效文件夹 |
| OBS 与普通浏览器数据不同 | 本地存储彼此独立，需要通过备份同步 |
| 无法检测 Raid 或通知 | 身份验证状态、EventSub 连接与功能开关 |

## OBS Studio 无法显示 Dock

- 重新粘贴 `OBS_Dock_URL.txt` 中记录的 URL。
- 在 Windows 中，请确认 URL 格式为 `file:///C:/...`。
- 确认安装目录或解压缩后的文件夹未被移动位置。
- 确认 OBS 上方「Dock」菜单中 `TwitchManager` 已勾选启用。

## Twitch 集成功能无法运行

![验证状态界面](images/features/settings-authentication.png)

1. 确认设置页面中已显示连接的 Twitch 账号名称。
2. 勾选所有必要权限 (Scope) 并重新生成 Token。
3. 查看活动日志中的授权与权限错误消息。

*频道积分兑换记录需要 `channel:read:redemptions` 权限，发起 Raid 需要 `channel:manage:raids` 权限。*

若更新标题后 OBS 原生直播信息 Dock 未同步，请手动重新加载该 Dock。

## 外部音效无法播放

![音效设置界面](images/features/notification-sounds.png)

1. 点击 **「选择音效文件夹」** 并重新选择保存音效的文件夹。
2. 重新指定各通知项目的音效文件。
3. 点击试听并保存。

*受浏览器安全策略限制，重新加载页面或重启 OBS 后需要重新选择文件夹。如果仍无法播放，请检查功能开关、音量、排除 ID、OBS 音频混音器设置，并尝试使用 `.wav` 或 `.mp3` 格式。*

## 数据消失或重置

清理浏览器缓存或网站数据可能会清除本地数据。如果有备份，请在“其他”选项卡中恢复数据。

![备份与恢复界面](images/features/backup-restore-logs.png)

## 问题仍未解决？

请准备 OS 版本、OBS 版本、复现步骤、发生时间、屏幕截图和活动日志。请勿公开分享 Access Token 或个人身份验证信息。
