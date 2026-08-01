# TwitchManager

[日本語](../README.md) | [English](README.en.md) | [简体中文](README.zh.md)

这是一个适用于 OBS Studio 的自定义浏览器面板，集成了 Twitch 直播准备、操作、通知和观众记录功能。

![TwitchManager 在单个面板中管理直播信息、突袭、通知和支持者记录](wiki-mock/images/twitchmanager-overview.png)

> TwitchManager 由个人出于支持主播的初衷开发并免费发布。本工具并非 Twitch 或 OBS Studio 的官方产品。
>
> 如果您希望支持持续开发，可在 BOOTH 获取 [TwitchManager 赞助版（内容相同）](https://toumei2suisai.booth.pm/items/8654630)。赞助完全自愿，不会影响免费版的功能或使用条件。

**界面支持语言：** 日语 / 英语 / 简体中文

最新版本已在 [GitHub Releases](https://github.com/MagnestGames/TwitchManager/releases/latest) 发布。您也可以查看[更新记录](../CHANGELOG.md)。

## 主要功能

### 直播标题与分类
可将常用的标题和分类保存为预设。在开播前一键应用至 Twitch，减少重复输入。

### 自动突袭介绍与 ID 记录
收到突袭（Raid）时，可自动发送频道介绍文案。支持同时执行官方 `/shoutout` 指令及记录对方 Twitch ID。

### 聊天与突袭通知音
为聊天消息、首次发言、突袭及频道积分兑换播放声音提示。无需时刻盯紧屏幕即可掌握重要的观众互动。
TwitchManager 的音频可以汇总到一个 OBS 浏览器源中播放。请在通知音设置的“🔊 通过 OBS 统一播放通知音”中复制 URL。

启用“欢迎通知”后，当指定观众出现在直播的聊天参与者列表中时，每场直播可播放一次通知音。即使对方没有发言也可以检测到，但从进入直播间到收到通知可能需要几分钟。

### 主播与观众管理
- **支持者列表** — 自动记录首次发言、突袭、关注、Bits 赞赏、订阅、聊天互动及频道积分兑换。
- **订阅者与 VIP 列表获取** — 集中查看频道订阅者与 VIP 成员。
- **ID 列表** — 保存与管理用于突袭和介绍的主播 ID。

### 其他辅助功能
- 自动发送 `/raid` 指令及目标频道 URL。
- 管理预测、投票、聊天设置、剪辑及 VIP 身份。
- 生日与纪念日追踪、备忘录及全量设置/列表备份与恢复。

## 下载

请从 [最新发布页面](https://github.com/MagnestGames/TwitchManager/releases/latest) 的 "Assets" 区域下载适用于您操作系统的安装程序。

| 操作系统 | 下载文件 |
| --- | --- |
| Windows 11 | [`TwitchManager-Windows11-Setup.exe`](https://github.com/MagnestGames/TwitchManager/releases/latest/download/TwitchManager-Windows11-Setup.exe) |
| macOS 11+ | [`TwitchManager-macOS.pkg`](https://github.com/MagnestGames/TwitchManager/releases/latest/download/TwitchManager-macOS.pkg) |

`Source code (zip)` 和 `Source code (tar.gz)` 并非安装程序。

## 安装

### Windows 11

1. 打开 `TwitchManager-Windows11-Setup.exe`。
2. 确认安装路径并点击 "Install"。
3. 完成界面将自动将 OBS URL 复制至剪贴板。

默认安装位置为 Windows **文档** 文件夹下的 `TwitchManager` 目录。面板 URL 位于 `OBS_Dock_URL.txt`，通知音浏览器源 URL 位于 `OBS_Audio_Source_URL.txt`。

### macOS

1. 打开 `TwitchManager-macOS.pkg` 进行安装。
2. 运行位于 `/Applications/TwitchManager` 的 "Add TwitchManager to OBS"。
3. 确认 OBS URL 已复制至剪贴板。

面板 URL 保存在 `/Applications/TwitchManager/OBS_Dock_URL.txt`，通知音浏览器源 URL 保存在 `OBS_Audio_Source_URL.txt`。

## 更新

稳定版会在启动时检查最新发布版本。有可用更新时，弹窗会提供以下三个选项：

- **查看** — 打开对应的 GitHub Release 页面。
- **3天后提醒** — 暂缓本次通知，并在三天后再次提醒。
- **跳过** — 不再提醒该版本；发布更新版本后仍会再次通知。

Beta 版不会显示更新通知。更新前，请先在“其他”选项卡中备份设置，然后重新运行最新版本的安装程序。Windows 上请选择当前的 TwitchManager 安装路径；macOS 上直接覆盖安装新软件包。

安装在同一位置时，通常无需更新在 OBS Studio 中已注册的 URL。

## 添加至 OBS Studio

1. 在 OBS Studio 顶部菜单中打开 “面板” -> “自定义浏览器面板...”。

   ![OBS Studio 面板菜单](wiki-mock/images/obs-custom-browser-dock-menu.png)

2. 如有需要，点击 “+” 添加新行。
3. 面板名称输入 `TwitchManager`。
4. 将安装时复制的 OBS URL 粘贴至 URL 栏中。
5. 点击 “应用”。

![自定义浏览器面板设置示例](wiki-mock/images/obs-custom-browser-dock-settings.png)

您可以将添加的面板拖拽至 OBS 的任意位置。如果文字或按钮显示不全，请拉宽面板窗口。

## Twitch 身份验证

点击 TwitchManager 右上角的齿轮图标（设置）以配置 Twitch 身份验证。

[身份验证指南 (Wiki)](https://github.com/MagnestGames/TwitchManager/wiki/Authentication)

## 界面截图

![TwitchManager 面板界面](wiki-mock/images/twitch-manager-dock.png)

## 数据存储与备份

设置和列表存储在 OBS / 浏览器本地存储中。在迁移电脑、清理 OBS 缓存或重新安装前，请在“其他”选项卡中导出备份。

请勿在直播、GitHub Issue 或社交媒体中泄露您的 Access Token。

## 系统要求

| 操作系统 | 支持版本 |
| --- | --- |
| Windows | Windows 11 |
| macOS | macOS 11 或更高版本 |

需要 OBS Studio 的“自定义浏览器面板”功能。

## 故障排除与支持

- [安装与添加至 OBS](https://github.com/MagnestGames/TwitchManager/wiki/Getting-Started)
- [常见问题 (Q&A)](https://github.com/MagnestGames/TwitchManager/wiki/Q&A)
- [故障排除](https://github.com/MagnestGames/TwitchManager/wiki/Troubleshooting)
- [提交问题 (Issues)](https://github.com/MagnestGames/TwitchManager/issues)

提交 Issue 时，请附上您的操作系统、OBS Studio 和 TwitchManager 的版本、复现步骤及显示的任何错误信息。请勿包含 Token 或私密凭据。

## 鸣谢

![TwitchManager 徽标](../assets/branding/TwitchManager-logo.png)

如需在直播布局或宣传素材中使用徽标，请下载 [TwitchManager-logo.png](../assets/branding/TwitchManager-logo.png)。您也可以选择将其用作直播画面或网页中的横幅。Windows 和 macOS 安装目录中的 `assets/branding` 文件夹也包含此文件。

任何人均可在直播画面、社交媒体、视频、文章等素材中，无需事先许可地展示、转载和再分发此徽标，商业与非商业用途均可。署名并非强制要求；如需标注，以下两行即可：

```text
TwitchManager
https://github.com/MagnestGames/TwitchManager
```

请勿将其表述为 Twitch 或 OBS Studio 的官方或认可素材。详情请参阅[徽标使用与署名说明](https://github.com/MagnestGames/TwitchManager/wiki/Logo-and-Credits)。

## 许可协议

[MIT License](../LICENSE)
