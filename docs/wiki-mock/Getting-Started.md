# インストールとOBSへの追加

## インストール

### Windows 11

1. [GitHubの最新リリース](https://github.com/MagnestGames/TwitchManager/releases/latest)を開きます。
2. AssetsからTwitchManager-Windows11-Setup.exeをダウンロードして実行します。
3. 完了時にコピーされるOBS用URLを控えます。

既定のインストール先は、Windowsの「ドキュメント」フォルダ内にあるTwitchManagerです。URLはインストール先のOBS_Dock_URL.txtでも確認できます。

### macOS

1. [GitHubの最新リリース](https://github.com/MagnestGames/TwitchManager/releases/latest)を開きます。
2. TwitchManager-macOS.pkgをインストールします。
3. /Applications/TwitchManager の「TwitchManagerをOBSに追加」を開きます。

対応はmacOS 11以降です。URLは /Applications/TwitchManager/OBS_Dock_URL.txt にも保存されます。

> インストーラーは未署名です。警告が出た場合は、同じReleaseのAssetsに添付された`.sha256`ファイルと照合してください。

### SHA256を確認する

Windows PowerShell:

~~~powershell
Get-FileHash "$env:USERPROFILE\Downloads\TwitchManager-Windows11-Setup.exe" -Algorithm SHA256
~~~

macOSのターミナル:

~~~sh
shasum -a 256 ~/Downloads/TwitchManager-macOS.pkg
~~~

表示された64文字の値が、対応する`.sha256`ファイル内の値と完全に同じであることを確認します。一致しない場合は実行せず、ファイルを削除してダウンロードし直してください。

SHA256はファイルの破損や差し替わりを確認するための値です。配布者の身元を証明するコード署名とは異なります。

## OBSへ追加する

1. OBS Studioの「ドック」から「カスタムブラウザドック」を開きます。

![OBSのドックメニュー](images/obs-custom-browser-dock-menu.png)

2. ドック名にTwitchManager、URL欄にインストール時のURLを入力します。
3. 「適用」を押します。

![カスタムブラウザドックの設定例](images/obs-custom-browser-dock-settings.png)

表示されたドックをドラッグして配置し、文字とボタンが読める幅へ調整します。

![OBSへ追加したTwitchManager](images/twitch-manager-dock.png)

最後に、右上の歯車から[Twitch認証](Authentication)を設定します。

## ZIP版

ZIPを移動しないフォルダへ展開し、TwitchManagerDock.htmlのローカルURLをOBSへ登録します。

~~~text
file:///C:/TwitchManager/TwitchManagerDock.html
~~~

HTMLだけを取り出さず、同梱ファイルを同じ構成のまま置いてください。
