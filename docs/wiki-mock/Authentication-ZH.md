> 🌐 **Language / 語言:** [🇯🇵 日本語](Authentication) | [🇺🇸 English](Authentication-EN) | **🇨🇳 繁體中文**

---

# Twitch 身份驗證

若要同步 Twitch 設定、接收事件通知及進行聊天室操作，需要設定 Access Token。

![Twitch 身份驗證設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/settings-authentication.png)

## 設定步驟

1. 點擊右上角的齒輪圖示開啟「設定」。
2. 點擊 **「複製 Twitch Token Generator URL」**。
3. 使用一般瀏覽器開啟該 URL，並建立 **Custom Scope Token**。
4. 將 ACCESS TOKEN 貼入 TwitchManager 並儲存。
5. 確認畫面上已成功顯示連線的 Twitch 帳號名稱。

## 主要權限列表 (Scopes)

| 功能 | 權限 (Scope) |
| --- | --- |
| 標題與分類 | `channel:manage:broadcast` |
| 聊天室 | `user:read:chat` / `user:write:chat` |
| 事件通知 | `bits:read` / `channel:read:subscriptions` / `channel:read:redemptions` |
| 預測與投票 | `channel:manage:predictions` / `channel:manage:polls` |
| Raid 與 頻道介紹 | `channel:manage:raids` / `moderator:manage:shoutouts` |
| 聊天室管理 | `moderator:manage:announcements` / `moderator:manage:chat_settings` |
| 剪輯與 VIP | `clips:edit` / `channel:read:vips` / `channel:manage:vips` |

若缺乏相應權限，僅該功能會操作失敗。例如：點數兌換紀錄需要 `channel:read:redemptions`，執行 `/raid` 需要 `channel:manage:raids`。當使用新功能或出現授權錯誤時，請勾選所有必要權限重新產生 Token。

## 注意事項

- **請勿將 Access Token 展示在實況畫面、Issue 或社群媒體上**。
- 若懷疑 Token 外洩，請點擊「解除 Twitch 身份驗證」並重新產生 Token。
- 一般瀏覽器與 OBS Dock 的資料儲存區可能相互獨立，請務必在實況使用的 OBS Dock 內完成設定。
