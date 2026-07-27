> 🌐 **Language / 語言:** [🇯🇵 日本語](Raid-and-Notifications) | [🇺🇸 English](Raid-and-Notifications-EN) | **🇨🇳 繁體中文**

---

# 通知與 Raid 介紹・音效設定

在 **「通知與介紹」** 分頁中，可以設定頻道宣傳、Raid 自動處理、介紹文模板及通知音效。

## 手動介紹與發射 Raid

輸入 Twitch ID 或頻道網址後，可執行以下操作：

- `/shoutout`: 執行 Twitch 官方頻道介紹。
- `/raid`: 開始 Raid 至指定頻道。
- **「發送介紹文」**: 將預存的手動介紹文發送至聊天室。

![手動頻道介紹介面](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/twitch-manager-dock.png)

已在 ID 列表中註冊的實況主會顯示於自動完成選單中。在點擊 `/raid` 前，請務必確認輸入的 Twitch ID。

## 自動 Raid 介紹

![自動 Raid 介紹設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/raid-auto-introduction.png)

- 收到 Raid 後自動發送介紹文。
- 設定發送延遲時間 (0 至 600 秒)。
- 同時自動觸發 Twitch 官方 `/shoutout`。
- 手動執行 `/raid` 時，自動在聊天室張貼 Raid 目標頻道網址。
- 支援透過指令 (如 `!so`) 發送介紹文。
- 可限定指令權限 (實況主、MOD、VIP、訂閱者、所有人)。

## 介紹文模板

可分別儲存接收 Raid、手動介紹及發送 Raid 的介紹文。發送 Raid 介紹文用於執行 `/raid` 後在聊天室附上目標頻道連結。

![介紹文模板設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/raid-message-templates.png)

| 變數 | 說明 |
| --- | --- |
| `{displayName}` | 顯示名稱 |
| `{username}` | Twitch ID |
| `{viewers}` | Raid 人數 |
| `{url}` | 頻道網址 |
| `{game}` | 最近分類 |
| `{title}` | 最近標題 |

發送 Raid 的模板中，`{url}` 會自動替換為 Raid 目標頻道的網址。

## 通知音效與播放模式

可針對 Raid、聊天留言、點數兌換與首次留言個別設定開關、音源與音量。
全域播放模式支援 **「音訊檔案 (瀏覽器播放)」** 與 **「OBS 媒體來源 (obs-websocket)」** 兩種。

![通知音效基本設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds.png)

### 1. 音訊檔案 (瀏覽器播放)

直接於 Dock (瀏覽器) 容器內播放音訊。

#### 外部音效資料夾設定：
1. 點擊 **「選擇音效資料夾」**。
2. 選擇儲存音效的資料夾。
3. 指定各通知事件的音效，試聽後儲存。

*推薦格式為 `.wav` 或 `.mp3`。受限於瀏覽器安全政策，重新載入頁面或重啟 OBS 後可能需要重新選擇資料夾。*

### 2. OBS 媒體來源 (obs-websocket 5.x)

透過 obs-websocket 控制 OBS 內部的「媒體來源」重新播放。適合需要透過 OBS 音量混音器或獨立音訊軌管理音效的情境。

#### 設定步驟：
1. 將播放模式切換為 **「OBS 媒體來源 (obs-websocket)」**。
2. 輸入 WebSocket 主機 (預設: `localhost`)、連接埠 (預設: `4455`) 及密碼。
3. 點擊 **「取得 OBS 來源列表」** 確認連線。
4. 於各通知項目選單中選擇對應的 OBS 媒體來源。
5. 點擊 **「試聽」** 確認 OBS 內的媒體來源成功重新播放。

#### 注意事項與防止重複播放：
- **防止重複播放**: 選擇 OBS 媒體來源模式時，TwitchManager 會停用瀏覽器端音訊，僅傳送播放請求至 OBS。
- **音訊監聽**: 若 OBS 內該媒體來源設為「監聽並輸出」，實況主耳機內亦會聽到音效。請依需求在 OBS 音量混音器中微調。

若不希望自動回應機器人帳號觸發音效，可將其 Twitch ID 新增至 **「不播放音效的使用者」**。
