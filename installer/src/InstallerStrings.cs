using System;
using System.Globalization;

namespace TwitchManagerInstaller
{
    internal static class InstallerStrings
    {
        private static bool IsJapanese
        {
            get
            {
                string overrideLanguage = Environment.GetEnvironmentVariable("TWITCHMANAGER_INSTALLER_LANGUAGE");
                if (string.Equals(overrideLanguage, "ja", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
                if (string.Equals(overrideLanguage, "en", StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }
                return string.Equals(
                    CultureInfo.CurrentUICulture.TwoLetterISOLanguageName,
                    "ja",
                    StringComparison.OrdinalIgnoreCase);
            }
        }

        private static string Select(string japanese, string english)
        {
            return IsJapanese ? japanese : english;
        }

        public static string UiFontName { get { return Select("Yu Gothic UI", "Segoe UI"); } }
        public static string SetupWindowTitle { get { return Select("TwitchManager Windows 11 セットアップ", "TwitchManager Windows 11 Setup"); } }
        public static string SetupTitle { get { return Select("TwitchManager セットアップ", "TwitchManager Setup"); } }
        public static string Description { get { return Select(
            "Windows 11へOBSカスタムブラウザドック用のファイルをインストールします。\r\n完了後、OBSへ登録するローカルURLをクリップボードへコピーします。",
            "Installs the files for an OBS Custom Browser Dock on Windows 11.\r\nWhen complete, the local URL for OBS is copied to the clipboard."); } }
        public static string InstallLocation { get { return Select("インストール先", "Install location"); } }
        public static string Browse { get { return Select("参照...", "Browse..."); } }
        public static string OpenFolderAfterInstall { get { return Select("インストール後にフォルダーを開く", "Open the folder after installation"); } }
        public static string Install { get { return Select("インストール", "Install"); } }
        public static string SelectInstallLocation { get { return Select(
            "TwitchManagerのインストール先を選択してください。",
            "Select the folder where TwitchManager will be installed."); } }
        public static string Installing { get { return Select("インストールしています...", "Installing..."); } }
        public static string InstallCompleteStatus { get { return Select("インストールが完了しました。", "Installation complete."); } }
        public static string InstallCompleteMessage { get { return Select(
            "インストールが完了しました。\r\n\r\nOBSの「ドック」→「カスタムブラウザドック」で、クリップボードへコピーされたURLを指定してください。\r\n\r\n",
            "Installation is complete.\r\n\r\nIn OBS, open Docks > Custom Browser Docks and enter the URL copied to the clipboard.\r\n\r\n"); } }
        public static string InstallFailedStatus { get { return Select("インストールに失敗しました。", "Installation failed."); } }
        public static string InstallFailedMessage { get { return Select("インストールできませんでした。", "TwitchManager could not be installed."); } }

        public static string UninstallerTitle { get { return Select("TwitchManager アンインストーラー", "TwitchManager Uninstaller"); } }
        public static string InstallationNotFound { get { return Select(
            "TwitchManagerのインストール情報を確認できませんでした。",
            "The TwitchManager installation could not be verified."); } }
        public static string UninstallConfirmation { get { return Select(
            "TwitchManagerをアンインストールしますか？\r\n\r\n設定やOBS側のドック登録は自動では削除されません。",
            "Uninstall TwitchManager?\r\n\r\nSaved settings and the dock entry in OBS are not removed automatically."); } }
        public static string UninstallStartFailed { get { return Select(
            "アンインストールを開始できませんでした。",
            "The uninstaller could not be started."); } }

        public static string InstallDirectoryRequired { get { return Select(
            "インストール先を指定してください。",
            "Specify an installation folder."); } }
        public static string InstallDirectoryNotEmpty { get { return Select(
            "指定したフォルダーには既存のファイルがあります。\r\n空のフォルダーを選択するか、既存のTwitchManagerインストール先を指定してください。",
            "The selected folder already contains files.\r\nSelect an empty folder or an existing TwitchManager installation folder."); } }
        public static string DockExtractionFailed { get { return Select(
            "TwitchManagerDock.htmlを展開できませんでした。",
            "TwitchManagerDock.html could not be extracted."); } }
        public static string PayloadMissing { get { return Select(
            "インストールデータが見つかりません。",
            "The installation payload was not found."); } }
        public static string InvalidPayload { get { return Select(
            "不正なインストールデータを検出しました。",
            "Invalid installation payload detected."); } }
        public static string BrowserShortcutName { get { return Select(
            "TwitchManagerをブラウザで開く.url",
            "Open TwitchManager in Browser.url"); } }
    }
}
