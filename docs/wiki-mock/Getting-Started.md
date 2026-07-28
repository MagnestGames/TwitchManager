> 🌐 **Language / 語言:** **🇯🇵 日本語** | [🇺🇸 English](Getting-Started-EN) | [🇨🇳 繁體中文](Getting-Started-ZH)

---

# インストールとOBSへの追加

## インストール

### Windows 11

1. [GitHubの最新リリース](https://github.com/MagnestGames/TwitchManager/releases/latest)を開きます。
2. Assetsから`TwitchManager-Windows11-Setup.exe`をダウンロードして実行します。
3. インストールを完了します。

既定のインストール先は、Windowsの「ドキュメント」フォルダ内にある`TwitchManager`です。

### macOS

1. [GitHubの最新リリース](https://github.com/MagnestGames/TwitchManager/releases/latest)を開きます。
2. `TwitchManager-macOS.pkg`をダウンロードしてインストールします。

既定のインストール先は`/Applications/TwitchManager`です。対応環境はmacOS 11以降です。

## OBSへ追加する

1. OBS Studioの「ドック」から「カスタムブラウザドック」を開きます。

![OBSのドックメニュー](https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/obs-custom-browser-dock-menu.png)

2. ドック名に`TwitchManager`と入力します。

3. URL欄にOBS用URLを貼り付けます。URLは次のいずれかの方法で取得できます。

   - Windowsでは、インストール完了時にコピーされたURL、または`OBS_Dock_URL.txt`に記載されたURLを使用します。
   - `TwitchManagerDock.html`をブラウザで開き、アドレスバーに表示されたURLをコピーします。

4. 「適用」を押します。

<img src="https://raw.githubusercontent.com/MagnestGames/TwitchManager/dev_0.9_beta/docs/wiki-mock/images/obs-custom-browser-dock-settings.png" alt="カスタムブラウザドックの設定例" width="700">

5. 追加されたドックをドラッグして配置し、文字やボタンが読める幅に調整します。

6. 右上の歯車から[Twitch認証](Authentication)を設定します。

> ZIP版を使用する場合は、HTMLファイルだけを取り出さず、同梱ファイルを同じフォルダ構成のまま配置してください。

> SHA256チェックサムは、各ReleaseのAssetsに添付しています。