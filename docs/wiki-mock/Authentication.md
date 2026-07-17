# Twitch認証

Twitchへの反映、イベント検知、チャット操作などを使うにはアクセストークンが必要です。

![Twitch認証設定](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/features/settings-authentication.png)

## 設定手順

1. 右上の歯車を開きます。
2. 「Twitch Token GeneratorのURLをコピー」を押します。
3. 通常のブラウザでURLを開き、Custom Scope Tokenを作成します。
4. ACCESS TOKENをTwitchManagerへ貼り付けて保存します。
5. 連携アカウントが表示されたことを確認します。

## 主な権限

| 機能 | 権限（Scope） |
| --- | --- |
| タイトル・カテゴリ | channel:manage:broadcast |
| チャット | user:read:chat / user:write:chat |
| 通知 | bits:read / channel:read:subscriptions / channel:read:redemptions |
| 予測・投票 | channel:manage:predictions / channel:manage:polls |
| レイド・チャンネル紹介 | channel:manage:raids / moderator:manage:shoutouts |
| チャット管理 | moderator:manage:announcements / moderator:manage:chat_settings |
| クリップ・VIP | clips:edit / channel:read:vips / channel:manage:vips |

権限不足の場合は、該当機能だけが失敗します。ポイント引き換え履歴には`channel:read:redemptions`、`/raid`の実行には`channel:manage:raids`が必要です。新しい機能を使うときや認証エラーが出たときは、必要な権限（Scope）を付けてトークンを再発行してください。

## 注意

- アクセストークンを配信画面、Issue、SNSへ載せないでください。
- 流出が疑われる場合は「Twitch認証を解除」して再発行してください。
- 通常ブラウザとOBSドックは保存領域が異なる場合があります。配信で使うOBSドック側で設定してください。
