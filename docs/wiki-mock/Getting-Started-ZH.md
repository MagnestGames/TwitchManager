> 🌐 **Language / 语言:** [🇯🇵 日本語](Getting-Started) | [🇺🇸 English](Getting-Started-EN) | **🇨🇳 简体中文**

---

# 安装与添加至 OBS

## 安装步骤

### Windows 11

1. 打开 [GitHub 最新发布页面](https://github.com/MagnestGames/TwitchManager/releases/latest)。
2. 从 Assets 下载并运行 `TwitchManager-Windows11-Setup.exe`。
3. 按照安装向导完成安装。

默认安装路径为 Windows“文档”文件夹中的 `TwitchManager`。

### macOS

1. 打开 [GitHub 最新发布页面](https://github.com/MagnestGames/TwitchManager/releases/latest)。
2. 下载 `TwitchManager-macOS.pkg` 并进行安装。

默认安装路径为 `/Applications/TwitchManager`。支持 macOS 11 或更高版本。

## 更新通知

TwitchManager 会在启动时检查最新稳定版本。发现新版本时，对话框会显示目前版本与最新版本。

- **查看**：打开对应的 GitHub 发布页面。
- **3 天后提醒**：暂停提示三天，到期后再次提示同一更新。
- **跳过**：不再提示此版本。发布更高版本后会再次通知。

网络检查最多每 24 小时执行一次。beta 版本不显示更新通知。检查失败时，TwitchManager 仍会正常启动，也不会显示错误对话框。安装更新前，请先从“其他”选项卡创建备份。

## 添加至 OBS Studio

1. 在 OBS Studio 上方菜单选择 **「Dock」** -> **「自定义浏览器 Dock...」**。

![OBS Dock 菜单](images/obs-custom-browser-dock-menu.png)

2. 在 Dock 名称输入 `TwitchManager`。

3. 在 URL 字段粘贴 OBS 专用 URL。可通过以下方式获取 URL：

   - Windows：使用安装完成时自动复制的 URL，或打开 `OBS_Dock_URL.txt` 获取。
   - 使用浏览器打开 `TwitchManagerDock.html`，并复制地址栏中的完整 URL。

4. 点击 **「应用」**。

<img src="images/obs-custom-browser-dock-settings.png" alt="自定义浏览器 Dock 设置范例" width="700">

5. 将新添加的 Dock 拖到合适位置，并调整宽度，确保文字和按钮显示完整。

6. 点击右上角的齿轮图标，设置 [Twitch 身份验证](Authentication-ZH)。

> 若使用 ZIP 版本，请勿将 `TwitchManagerDock.html` 单独取出，请保留原本的文件夹结构与附带文件。

