# Twitch連携機能

「Twitch」タブには、配信中と配信後に使うTwitch連携機能があります。

## サポーターリスト

初見、レイド、フォロー、Bits、サブスク、ギフト、チャット、チャンネルポイント引き換えを集計し、お礼文としてコピーします。

![サポーターリスト](images/features/twitch-supporter-list.png)

ポイント引き換えには、カスタム報酬に加えて、スタンプ巨大化、メッセージエフェクト、画面全体のお祝い、メッセージ強調などの自動報酬も記録されます。Twitchのパワーアップで使われたBitsも「ビッツ（Cheer）」へ反映されます。

不要な項目と自動応答用アカウントを除外し、配信開始時の自動リセットを設定できます。「過去ログを開く」から、保存された以前の集計を確認できます。

## 予測・投票

![予測と投票](images/features/twitch-prediction-poll.png)

- 予測: 2～10件の選択肢、30～1800秒
- 投票: 最大5件の選択肢、15～1800秒
- 作成、取得、終了、プリセット保存

## チャット設定

![チャット設定](images/features/twitch-chat-control.png)

チャットクリア、エモート限定、サブスク限定、重複制限、フォロー限定、スローモードを操作します。

## API操作・クリップ

![API操作とクリップ](images/features/twitch-api-clips.png)

配信マーカーと告知を作成できます。クリップは作成、一覧取得、お気に入り登録に対応します。

## コラボURL

![コラボURL生成](images/features/twitch-collab-url.png)

複数のTwitch IDから、multistre.amまたはTwitchTheaterの同時視聴URLを生成します。

## サブスクライバー・VIP

![サブスクライバーとVIP](images/features/twitch-subscribers-vip.png)

サブスクライバー一覧を取得できます。VIPは一覧と利用枠を取得し、ログインIDで追加・削除します。

機能ごとに必要な権限（Scope）が異なります。失敗する場合は[Twitch認証](Authentication)とイベントログを確認してください。
