> 🌐 **Language / 語言:** [🇯🇵 日本語](Commands) | [🇺🇸 English](Commands-EN) | **🇨🇳 繁體中文**

---

# 指令設定

分類整理開播中常用的 Twitch 指令，方便快速操作。

- **標有 ✦ 的按鈕**: 透過 Twitch API 直接執行。
- **其他按鈕**: 複製指令模板至剪貼簿，方便貼入聊天室並填寫參數。

直接執行需完成 [Twitch 身份驗證](Authentication-ZH) 並取得相對應的 API 權限 (Scope)。

## 實況管理

![實況管理指令](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/commands-stream.png)

操作實況標題、分類、實況標記、Raid 及播送廣告。若要在 Raid 時自動於聊天室貼出目標網址，請使用 [通知與 Raid 介紹](Raid-and-Notifications-ZH) 中的 `/raid` 按鈕。

## 聊天室設定

![聊天室設定指令](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/commands-chat.png)

操作聊天室公告、清空聊天室、聊天模式、僅限追隨者與慢速模式。

## 使用者管理

![使用者管理指令](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/commands-users.png)

快速執行 Ban、暫時禁言 (Timeout)、MOD、VIP、監控、限制、封鎖與私訊 (Whisper)。

## 互動指令

![互動指令介面](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/commands-interaction.png)

操作投票、預測、釘選訊息與 Shoutout。詳細預測與投票請使用 [Twitch 工具](Twitch-Tools-ZH)，介紹文請使用 [通知與 Raid 介紹](Raid-and-Notifications-ZH)。

> 執行 Ban、Raid、廣告與權限變更前，請務必確認目標對象與內容。開始 Raid 需要 `channel:manage:raids` 權限。
