## TwitchManager {{VERSION}}

OBS Studioのカスタムブラウザドックで、Twitch配信の管理をまとめて行える非公式ツールです。

### できること

- 配信タイトルとプリセットの管理
- レイド時の自動紹介と `/shoutout`
- 配信先への `/raid` とレイド先URLの自動送信
- レイド・コメント・チャンネルポイントなどの通知音
- チャンネルポイント引き換え履歴と過去ログの保存
- 任意のサウンドフォルダからの音源選択
- コマンド、配信者IDリスト、メモの管理

### 代表的な使い方

- **配信前:** 保存したプリセットから配信タイトルを素早く設定する
- **レイド受信時:** 紹介文、公式 `/shoutout`、通知音を自動実行する
- **コメント受信時:** 初回コメントや通常コメントを好みの音で知らせる

### Windows 11用インストーラー

1. 下のAssetsから **`TwitchManager-Windows11-Setup.exe`** をダウンロードします。
2. EXEを起動してインストールします。
3. 完了時にコピーされるローカルURLを、OBSの「ドック」→「カスタムブラウザドック」へ登録します。

既定のインストール先は、Windowsの「ドキュメント」フォルダ内にある `TwitchManager` です。

SHA256は `TwitchManager-Windows11-Setup.sha256` で確認できます。

### macOS用インストーラー

1. 下のAssetsから **`TwitchManager-macOS.pkg`** をダウンロードします。
2. PKGを開いてインストールします。対応バージョンはmacOS 11以降です。
3. `/Applications/TwitchManager` の「TwitchManagerをOBSに追加」を開きます。
4. コピーされたURLをOBSの「ドック」→「カスタムブラウザドック」へ登録します。

SHA256は `TwitchManager-macOS.sha256` で確認できます。

> 現在のインストーラーにはコード署名がありません。OSの警告が表示された場合は、同じReleaseのSHA256と照合してください。SHA256はファイルの破損や差し替わりを確認する値で、配布者の身元を証明する署名ではありません。

細かな設定や各機能の説明は [GitHub Wiki](https://github.com/MagnestGames/TwitchManager/wiki) を参照してください。

> TwitchおよびOBS Studioの公式ツールではありません。
