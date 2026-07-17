# TwitchManager

OBS Studioから、Twitch配信の準備・操作・記録をまとめて行えるカスタムブラウザドックです。

> TwitchおよびOBS Studioの公式ツールではありません。

![TwitchManagerの画面](docs/wiki-mock/images/twitch-manager-dock.png)

## 1. ダウンロード

1. [Releases（ダウンロードページ）](https://github.com/MagnestGames/TwitchManager/releases)を開きます。
2. 一番上のReleaseにある **Assets** を開きます。
3. 使用しているOSのインストーラーを選びます。

| OS | ダウンロードするファイル |
| --- | --- |
| Windows 11 | `TwitchManager-Windows11-Setup.exe` |
| macOS 11以降 | `TwitchManager-macOS.pkg` |

`Source code (zip)`と`Source code (tar.gz)`はインストーラーではありません。

必要に応じて、同名の`.sha256`ファイルでダウンロードしたファイルを確認できます。

## 2. インストール

### Windows 11

1. `TwitchManager-Windows11-Setup.exe`を開きます。
2. インストール先を確認し、「インストール」を押します。
3. 完了画面で、OBS用URLがコピーされたことを確認します。

既定では、Windowsの **ドキュメント** フォルダ内の`TwitchManager`にインストールされます。  
OBS用URLは、インストール先の`OBS_Dock_URL.txt`でも確認できます。

### macOS

1. `TwitchManager-macOS.pkg`を開いてインストールします。
2. `/Applications/TwitchManager`にある「TwitchManagerをOBSに追加」を開きます。
3. OBS用URLがコピーされたことを確認します。

OBS用URLは`/Applications/TwitchManager/OBS_Dock_URL.txt`でも確認できます。

## 3. OBS Studioへ追加する

1. OBS Studio上部の「ドック」から「カスタムブラウザドック」を開きます。

![OBS Studioのドックメニュー](docs/wiki-mock/images/obs-custom-browser-dock-menu.png)

2. 必要なら「＋」で行を追加します。
3. ドック名に`TwitchManager`と入力します。
4. URL欄に、インストール時にコピーされたOBS用URLを貼り付けます。
5. 「適用」を押します。

![カスタムブラウザドックの設定例](docs/wiki-mock/images/obs-custom-browser-dock-settings.png)

追加されたドックは、ドラッグして好きな位置へ移動できます。文字やボタンが切れる場合は、ドックの幅を広げてください。

## 4. Twitch認証

TwitchManager右上の歯車を開き、Twitch認証を設定します。

[認証手順（Wiki）](https://github.com/MagnestGames/TwitchManager/wiki/Authentication)

## 主な機能

- 配信タイトルとカテゴリの保存・反映
- レイド受信時の自動紹介と公式`/shoutout`
- 配信先への`/raid`とレイド先URLの自動送信
- 初見、レイド、フォロー、Bits、サブスク、チャット、ポイント引き換えの記録
- 予測、投票、チャット設定、クリップ、VIPの操作
- 通知音、配信者IDリスト、誕生日・記念日、メモ、バックアップ

[詳しい機能一覧（Wiki）](https://github.com/MagnestGames/TwitchManager/wiki/Feature-Overview)

## データの保存とバックアップ

設定やリストは、TwitchManagerを表示しているOBSまたはブラウザ内に保存されます。PCの移行、OBSのキャッシュ削除、再インストールの前に、「その他」タブからバックアップをコピーしてください。

アクセストークンは、配信画面、GitHubのIssue、SNSなどに載せないでください。

## 対応環境

| OS | 対応 |
| --- | --- |
| Windows | Windows 11 |
| macOS | macOS 11以降 |

OBS Studioの「カスタムブラウザドック」を使用します。

## 困ったとき

- [インストールとOBSへの追加](https://github.com/MagnestGames/TwitchManager/wiki/Getting-Started)
- [よくある質問](https://github.com/MagnestGames/TwitchManager/wiki/Q&A)
- [トラブルシューティング](https://github.com/MagnestGames/TwitchManager/wiki/Troubleshooting)
- [不具合を報告する](https://github.com/MagnestGames/TwitchManager/issues)

不具合報告には、OS、OBS StudioとTwitchManagerのバージョン、再現手順、表示されたエラーを記載してください。アクセストークンなどの秘密情報は貼り付けないでください。

## ライセンス

[MIT License](LICENSE)
