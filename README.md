# TwitchManager

[日本語](README.md) | [English](docs/README.en.md) | [简体中文](docs/README.zh.md)

OBS Studioから、Twitch配信の準備・操作・通知・視聴者記録をまとめて行えるカスタムブラウザドックです。

![TwitchManagerは配信情報、レイド、通知、視聴者記録を一つのドックで管理](docs/wiki-mock/images/twitchmanager-overview.png)

> TwitchManagerは、配信者の活動を少しでも支えたいという思いから、個人が善意で開発・無償公開しているツールです。TwitchおよびOBS Studioの公式ツールではありません。
>
> 無料版と機能・内容が同じ支援版をBOOTHで公開しています。開発を応援していただける場合は、[TwitchManager 支援版（中身は一緒）](https://toumei2suisai.booth.pm/items/8654630)をご利用ください。支援は任意であり、無料版の利用条件や機能に影響しません。

**UI対応言語:** 日本語 / English / 简体中文

最新版は[GitHub Releases](https://github.com/MagnestGames/TwitchManager/releases/latest)で公開しています。[更新履歴](CHANGELOG.md)もあわせて確認できます。

## 主な機能

### 配信タイトル・カテゴリ

よく使うタイトルとカテゴリをセットで保存できます。  
保存した内容を配信前にTwitchへ反映し、毎回の入力を減らします。

### レイドの自動紹介・ID記録

レイド受信時に、相手のチャンネルを自動で紹介できます。  
公式`/shoutout`の実行と、レイド元のTwitch IDの記録にも対応しています。

### チャット・レイド通知音

チャット、初チャット、レイド受信、チャンネルポイント引き換えを音で通知します。

配信中に画面を見続けなくても、大切な反応に気づきやすくなります。
TwitchManagerの音声は、1本のOBSブラウザソースへまとめられます。通知音設定の「🔊 OBSへ通知音をまとめる」からURLをコピーしてください。

「お出迎え通知」を有効にすると、指定したリスナーが配信のチャット参加者一覧に現れたとき、その配信で一度だけ通知音を鳴らせます。コメントをしていないリスナーも対象ですが、入室から通知まで数分かかる場合があります。

### 配信者・視聴者管理

- **サポーターリスト** — 初見、レイド、フォロー、Bits、サブスク、チャット、ポイント引き換えを記録します。
- **サブスクライバー・VIP一覧の取得** — チャンネルのサブスクライバーとVIPを一覧で確認できます。
- **IDリスト** — レイドや紹介に利用する配信者IDを保存・管理できます。

### その他の配信支援

- 配信先への`/raid`とレイド先URLの自動送信
- 予測、投票、チャット設定、クリップ、VIPの操作
- 誕生日・記念日、メモ、設定やリストのバックアップ

## ダウンロード

[最新リリースページ](https://github.com/MagnestGames/TwitchManager/releases/latest)の「Assets」から、使用しているOSのインストーラーをダウンロードしてください。

| OS | ダウンロードするファイル |
| --- | --- |
| Windows 11 | [`TwitchManager-Windows11-Setup.exe`](https://github.com/MagnestGames/TwitchManager/releases/latest/download/TwitchManager-Windows11-Setup.exe) |
| macOS 11以降 | [`TwitchManager-macOS.pkg`](https://github.com/MagnestGames/TwitchManager/releases/latest/download/TwitchManager-macOS.pkg) |

`Source code (zip)`と`Source code (tar.gz)`はインストーラーではありません。

## インストール

### Windows 11

1. `TwitchManager-Windows11-Setup.exe`を開きます。
2. インストール先を確認し、「インストール」を押します。
3. 完了画面で、OBS用URLがコピーされたことを確認します。

既定では、Windowsの**ドキュメント**フォルダ内の`TwitchManager`にインストールされます。OBSドック用URLは`OBS_Dock_URL.txt`、通知音用ブラウザソースURLは`OBS_Audio_Source_URL.txt`で確認できます。

### macOS

1. `TwitchManager-macOS.pkg`を開いてインストールします。
2. `/Applications/TwitchManager`にある「TwitchManagerをOBSに追加」を開きます。
3. OBS用URLがコピーされたことを確認します。

OBSドック用URLは`/Applications/TwitchManager/OBS_Dock_URL.txt`、通知音用ブラウザソースURLは`OBS_Audio_Source_URL.txt`でも確認できます。

## アップデート

TwitchManagerは安定版の起動時に最新リリースを確認し、新しいバージョンがある場合は通知します。「確認」でGitHubのリリースページを開き、「3日後に通知」で3日間保留し、「スキップ」でそのバージョンの通知を停止できます。beta版では通知を表示しません。

「その他」タブでバックアップを取ってから、最新リリースのインストーラーをもう一度実行してください。Windowsでは現在のTwitchManagerインストール先を指定し、macOSでは同じパッケージをインストールします。

同じ場所へインストールした場合、OBSに登録したURLを通常は変更する必要はありません。

## OBS Studioへ追加する

1. OBS Studio上部の「ドック」から「カスタムブラウザドック」を開きます。

   ![OBS Studioのドックメニュー](docs/wiki-mock/images/obs-custom-browser-dock-menu.png)

2. 必要なら「＋」で行を追加します。
3. ドック名に`TwitchManager`と入力します。
4. URL欄に、インストール時にコピーされたOBS用URLを貼り付けます。
5. 「適用」を押します。

![カスタムブラウザドックの設定例](docs/wiki-mock/images/obs-custom-browser-dock-settings.png)

追加されたドックは、ドラッグして好きな位置へ移動できます。文字やボタンが切れる場合は、ドックの幅を広げてください。

## Twitch認証

TwitchManager右上の歯車を開き、Twitch認証を設定します。

[認証手順（Wiki）](https://github.com/MagnestGames/TwitchManager/wiki/Authentication)

## 実際の画面

![TwitchManagerの画面](docs/wiki-mock/images/twitch-manager-dock.png)

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

## クレジット表記

![TwitchManagerロゴ](assets/branding/TwitchManager-logo.png)

ロゴを配信画面や紹介素材で使う場合は、[TwitchManager-logo.png](assets/branding/TwitchManager-logo.png)をダウンロードしてください。配信画面やWebページなどのバナーとしても任意で使用できます。Windows版・macOS版のインストール先にも`assets/branding`フォルダとして同梱されます。

このロゴは、配信画面、SNS、動画、記事などへ、個人・法人、商用・非商用を問わず事前連絡なしで掲載・転載・再配布できます。
クレジット表記は任意です。

```text
TwitchManager
https://github.com/MagnestGames/TwitchManager
```

TwitchまたはOBS Studioの公式製品・公認素材であると誤認させる使い方はしないでください。
詳しくは[ロゴの利用とクレジット（Wiki）](https://github.com/MagnestGames/TwitchManager/wiki/Logo-and-Credits)を参照してください。


## ライセンス

[MIT License](LICENSE)
