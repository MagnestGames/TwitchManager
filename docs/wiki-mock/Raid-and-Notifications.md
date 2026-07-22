# 通知と紹介・通知音

「通知と紹介」タブでは、チャンネル紹介、レイド時の自動処理、紹介文、通知音を設定します。

## 手動紹介・レイド開始

Twitch IDまたはチャンネルURLを入力し、次の操作を行います。

- `/shoutout`: 公式のチャンネル紹介を実行
- `/raid`: 入力したチャンネルへのレイドを開始
- 「紹介文を送信」: 保存した手動紹介文をチャットへ送信

![手動チャンネル紹介](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/twitch-manager-dock.png)

IDリストに登録済みの配信者は入力候補に表示されます。`/raid`を押す前に、入力したTwitch IDと配信先を必ず確認してください。

## 自動レイド紹介

![レイド紹介設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/raid-auto-introduction.png)

- レイド受信後に紹介文を自動送信
- 送信までの待ち時間を0～600秒で指定
- 公式のチャンネル紹介（`/shoutout`）を同時実行
- 手動で`/raid`を実行したとき、レイド先URLをチャットへ自動送信
- 指定コマンドから紹介文を送信
- コマンド利用者を配信者、モデレーター、VIP、サブスクライバー、全員から選択

## 紹介文

受信レイド用、手動紹介用、送信レイド用の文面を別々に保存できます。送信レイド用の文面は、`/raid`実行後にレイド先URLを案内するときに使います。

![紹介文テンプレート](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/raid-message-templates.png)

| 記法 | 内容 |
| --- | --- |
| {displayName} | 表示名 |
| {username} | Twitch ID |
| {viewers} | レイド人数 |
| {url} | チャンネルURL |
| {game} | 直近のカテゴリ |
| {title} | 直近のタイトル |

送信レイド用の文面では`{url}`がレイド先のチャンネルURLに置き換わります。

## 通知音

レイド、コメント、ポイント引換、初回コメントごとに、オン・オフ、音源、音量を設定します。

![通知音の基本設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds.png)

![チャンネルポイント通知音](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds-channel-points.png)

![初回コメント通知音](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/notification-sounds-first-comment.png)

### 外部サウンドフォルダ

1. 「音声フォルダを選択」を押します。
2. 音源が入ったフォルダを選びます。
3. 各通知の音源を選び、試聴して保存します。

推奨形式はwavまたはmp3です。ページ再読み込みやOBS再起動後は、ブラウザの制限により同じフォルダを再選択する必要があります。

自動応答用アカウントなどへ通知音を鳴らしたくない場合は、「通知音を鳴らさないユーザー」にTwitchログインIDを登録します。
