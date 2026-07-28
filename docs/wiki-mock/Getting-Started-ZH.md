> 🌐 **Language / 語言:** [🇯🇵 日本語](Getting-Started) | [🇺🇸 English](Getting-Started-EN) | **🇨🇳 繁體中文**

---

# 安裝與新增至 OBS

## 安裝步驟

### Windows 11

1. 開啟 [GitHub 最新 Release 頁面](https://github.com/MagnestGames/TwitchManager/releases/latest)。
2. 從 Assets 下載 `TwitchManager-Windows11-Setup.exe` 並執行。
3. 完成安裝精靈。

預設安裝路徑為 Windows「文件」資料夾內的 `TwitchManager`。

### macOS

1. 開啟 [GitHub 最新 Release 頁面](https://github.com/MagnestGames/TwitchManager/releases/latest)。
2. 下載 `TwitchManager-macOS.pkg` 並進行安裝。

預設安裝路徑為 `/Applications/TwitchManager`。支援 macOS 11 或更新版本。

## 新增至 OBS Studio

1. 在 OBS Studio 上方選單選擇 **「Dock」** -> **「自訂瀏覽器 Dock...」**。

![OBS Dock 選單](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/obs-custom-browser-dock-menu.png)

2. 在 Dock 名稱輸入 `TwitchManager`。

3. 在 URL 欄位貼上 OBS 專用 URL。可透過以下方式取得 URL：

   - Windows 環境：使用安裝完成時自動複製的 URL，或開啟 `OBS_Dock_URL.txt` 取得。
   - 使用瀏覽器開啟 `TwitchManagerDock.html`，並複製網址列的完整 URL。

4. 點擊 **「套用」**。

<img src="https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/obs-custom-browser-dock-settings.png" alt="自訂瀏覽器 Dock 設定範例" width="700">

5. 拖曳新新增的 Dock 放置於 OBS 介面中，並調整適當寬度以利閱讀文字與按鈕。

6. 點擊右上角齒輪設定 [Twitch 身份驗證](Authentication-ZH)。

> 若使用 ZIP 版本，請勿將 `TwitchManagerDock.html` 單獨取出，請保留原本的資料夾結構與附帶檔案。

