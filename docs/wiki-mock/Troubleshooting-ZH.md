> 🌐 **Language / 語言:** [🇯🇵 日本語](Troubleshooting) | [🇺🇸 English](Troubleshooting-EN) | **🇨🇳 繁體中文**

---

# 疑難排解指南

若發生問題，請先至「其他」分頁查看活動日誌，並於重新設定前建立資料備份。

| 異常狀況 | 確認項目 |
| --- | --- |
| 無法顯示於 OBS | 自訂瀏覽器 Dock 之 URL 與本機檔案路徑 |
| Twitch 操作失敗 | 連線帳號、Access Token 及 API 權限 (Scope) |
| 外部音效無法播放 | 重新選擇音效資料夾 |
| OBS 與一般瀏覽器資料不同 | 本機儲存區相互獨立與資料備份 |
| 未能偵測 Raid 或通知 | 身份驗證狀態、EventSub 連線與功能開關 |

## OBS Studio 無法顯示 Dock

- 重新貼上 `OBS_Dock_URL.txt` 內記載的網址。
- Windows 環境請確認網址格式為 `file:///C:/...`。
- 確認安裝目錄或解壓縮後的資料夾未被移動位置。
- 確認 OBS 上方「Dock」選單中 `TwitchManager` 已勾選啟用。

## Twitch 整合功能無法運作

![驗證狀態介面](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/settings-authentication.png)

1. 確認設定頁面中已顯示連線的 Twitch 帳號名稱。
2. 勾選所有必要權限 (Scope) 並重新產生 Token。
3. 檢視活動日誌中的授權與權限錯誤訊息。

*點數兌換紀錄需要 `channel:read:redemptions` 權限，發起 Raid 需要 `channel:manage:raids` 權限。*

若更新標題後 OBS 原生實況資訊 Dock 未同步，請手動重新載入該 Dock。

## 外部音效無法播放

![音效設定介面](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds.png)

1. 點擊 **「選擇音效資料夾」** 並重新選擇儲存音效的資料夾。
2. 重新指定各通知項目的音效檔案。
3. 點擊試聽並儲存。

*受限於瀏覽器安全政策，重新載入頁面或重啟 OBS 後需重新選擇資料夾。若仍無法播放，請檢查功能開關、音量、排除 ID、OBS 音量混音器設定，並嘗試使用 `.wav` 或 `.mp3` 格式。*

## 資料消失或重置

清理瀏覽器快取或網站資料可能導致本機快取遭清除。若有備份，請至「其他」分頁進行資料還原。

![備份與還原介面](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/backup-restore-logs.png)

## 問題仍未解決？

請準備您的 OS 版本、OBS 版本、發生步驟、時間點、螢幕截圖及活動日誌。請勿將 Access Token 或個人驗證資訊公開分享。
