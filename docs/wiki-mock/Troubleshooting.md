> 🌐 **Language / 語言:** **🇯🇵 日本語** | [🇺🇸 English](Troubleshooting-EN) | [🇨🇳 繁體中文](Troubleshooting-ZH)

---

# トラブルシューティング

問題が起きたら「その他」タブのイベントログを確認し、再設定前にバックアップを作成してください。

| 症状 | 確認すること |
| --- | --- |
| OBSに表示されない | カスタムブラウザドックのURLと設置場所 |
| Twitch操作が失敗する | 連携アカウント、トークン、Scope |
| 外部サウンドが鳴らない | 音声フォルダの再選択 |
| OBSと通常ブラウザで内容が違う | 保存領域とバックアップ |
| レイドや通知を検知しない | 認証、EventSub、機能のスイッチ |

## OBSに表示されない

- OBS_Dock_URL.txtのURLを登録し直す
- Windowsではfile:///C:/...形式か確認する
- インストール先やZIPの展開先を移動していないか確認する
- 「ドック」メニューでTwitchManagerが有効か確認する

## Twitch機能が動かない

![認証状態](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/settings-authentication.png)

1. 設定画面の連携アカウントを確認します。
2. 必要な権限（Scope）を付けてトークンを再発行します。
3. イベントログの認証・権限エラーを確認します。

ポイント引き換え履歴には`channel:read:redemptions`、レイド開始には`channel:manage:raids`が必要です。

タイトル反映後にOBS標準の配信情報だけが古い場合は、そのドックを再読み込みします。

## 外部サウンドが鳴らない

![通知音設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds.png)

1. 「音声フォルダを選択」から同じフォルダを再選択します。
2. 各通知の音源を選び直します。
3. 試聴して保存します。

再読み込みやOBS再起動後は再選択が必要です。それでも鳴らない場合は、スイッチ、音量、除外ID、OBSの音声ミキサーを確認し、wavまたはmp3で試してください。

## データが消えた

キャッシュやサイトデータを削除すると、ローカル保存も消えることがあります。バックアップがある場合は「その他」タブから復元します。

![バックアップと復元](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/backup-restore-logs.png)

## 解決しない場合

OS、OBSのバージョン、発生手順、時刻、スクリーンショット、イベントログを控えてください。アクセストークンや個人情報は共有しないでください。
