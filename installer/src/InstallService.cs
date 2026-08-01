using Microsoft.Win32;
using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Text;
using System.Windows.Forms;

namespace TwitchManagerInstaller
{
    internal sealed class InstallResult
    {
        public string InstallDirectory { get; set; }
        public string DockUrl { get; set; }
    }

    internal static class InstallService
    {
        private const string PayloadResourceName = "TwitchManager.Payload.zip";
        private const string VersionResourceName = "TwitchManager.Version.txt";
        private const string MarkerFileName = ".twitchmanager-install";
        private const string MarkerContent = "TwitchManagerInstaller-v1";
        private const string UninstallRegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\TwitchManager";

        public static string DefaultInstallDirectory
        {
            get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "TwitchManager"); }
        }

        public static string Version
        {
            get
            {
                string value = ReadEmbeddedText(VersionResourceName);
                return string.IsNullOrWhiteSpace(value) ? "local" : value.Trim();
            }
        }

        public static InstallResult Install(string requestedDirectory)
        {
            if (string.IsNullOrWhiteSpace(requestedDirectory))
            {
                throw new InvalidOperationException(InstallerStrings.InstallDirectoryRequired);
            }

            string installDirectory = Path.GetFullPath(Environment.ExpandEnvironmentVariables(requestedDirectory.Trim()));
            if (Directory.Exists(installDirectory)
                && Directory.GetFileSystemEntries(installDirectory).Length > 0
                && !IsTwitchManagerInstallation(installDirectory))
            {
                throw new InvalidOperationException(InstallerStrings.InstallDirectoryNotEmpty);
            }

            Directory.CreateDirectory(installDirectory);
            ExtractPayload(installDirectory);

            string dockPath = Path.Combine(installDirectory, "TwitchManagerDock.html");
            if (!File.Exists(dockPath))
            {
                throw new InvalidDataException(InstallerStrings.DockExtractionFailed);
            }

            string dockUrl = new Uri(dockPath).AbsoluteUri;
            string audioUrl = dockUrl + "?audio-source=1";
            File.WriteAllText(Path.Combine(installDirectory, "OBS_Dock_URL.txt"), dockUrl + Environment.NewLine, new UTF8Encoding(true));
            File.WriteAllText(Path.Combine(installDirectory, "OBS_Audio_Source_URL.txt"), audioUrl + Environment.NewLine, new UTF8Encoding(true));
            File.WriteAllText(Path.Combine(installDirectory, MarkerFileName), MarkerContent, Encoding.ASCII);

            string uninstallerPath = Path.Combine(installDirectory, "Uninstall.exe");
            string installerPath = Application.ExecutablePath;
            if (!string.Equals(Path.GetFullPath(installerPath), Path.GetFullPath(uninstallerPath), StringComparison.OrdinalIgnoreCase))
            {
                File.Copy(installerPath, uninstallerPath, true);
            }

            CreateStartMenuShortcut(dockUrl);
            RegisterUninstaller(installDirectory, uninstallerPath);

            InstallResult result = new InstallResult();
            result.InstallDirectory = installDirectory;
            result.DockUrl = dockUrl;
            return result;
        }

        public static bool IsTwitchManagerInstallation(string directory)
        {
            if (string.IsNullOrWhiteSpace(directory))
            {
                return false;
            }

            try
            {
                string fullDirectory = Path.GetFullPath(directory);
                string markerPath = Path.Combine(fullDirectory, MarkerFileName);
                string dockPath = Path.Combine(fullDirectory, "TwitchManagerDock.html");
                return File.Exists(markerPath)
                    && File.Exists(dockPath)
                    && string.Equals(File.ReadAllText(markerPath).Trim(), MarkerContent, StringComparison.Ordinal);
            }
            catch
            {
                return false;
            }
        }

        public static void RemoveRegistration()
        {
            try
            {
                Registry.CurrentUser.DeleteSubKeyTree(UninstallRegistryPath, false);
            }
            catch
            {
            }

            string startMenuDirectory = GetStartMenuDirectory();
            try
            {
                if (Directory.Exists(startMenuDirectory))
                {
                    Directory.Delete(startMenuDirectory, true);
                }
            }
            catch
            {
            }
        }

        private static void ExtractPayload(string installDirectory)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream payload = assembly.GetManifestResourceStream(PayloadResourceName))
            {
                if (payload == null)
                {
                    throw new InvalidDataException(InstallerStrings.PayloadMissing);
                }

                string root = Path.GetFullPath(installDirectory).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                    + Path.DirectorySeparatorChar;
                using (ZipArchive archive = new ZipArchive(payload, ZipArchiveMode.Read, false))
                {
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        string destination = Path.GetFullPath(Path.Combine(root, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));
                        if (!destination.StartsWith(root, StringComparison.OrdinalIgnoreCase))
                        {
                            throw new InvalidDataException(InstallerStrings.InvalidPayload);
                        }

                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(destination);
                            continue;
                        }

                        string parentDirectory = Path.GetDirectoryName(destination);
                        if (!string.IsNullOrEmpty(parentDirectory))
                        {
                            Directory.CreateDirectory(parentDirectory);
                        }

                        using (Stream input = entry.Open())
                        using (FileStream output = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
                        {
                            input.CopyTo(output);
                        }
                    }
                }
            }
        }

        private static void RegisterUninstaller(string installDirectory, string uninstallerPath)
        {
            using (RegistryKey key = Registry.CurrentUser.CreateSubKey(UninstallRegistryPath))
            {
                if (key == null)
                {
                    return;
                }

                key.SetValue("DisplayName", "TwitchManager");
                key.SetValue("DisplayVersion", Version);
                key.SetValue("Publisher", "MagnestGames");
                key.SetValue("InstallLocation", installDirectory);
                key.SetValue("DisplayIcon", uninstallerPath);
                key.SetValue("UninstallString", "\"" + uninstallerPath + "\" /uninstall");
                key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
            }
        }

        private static void CreateStartMenuShortcut(string dockUrl)
        {
            string startMenuDirectory = GetStartMenuDirectory();
            Directory.CreateDirectory(startMenuDirectory);
            string shortcutPath = Path.Combine(startMenuDirectory, InstallerStrings.BrowserShortcutName);
            string contents = "[InternetShortcut]" + Environment.NewLine
                + "URL=" + dockUrl + Environment.NewLine;
            File.WriteAllText(shortcutPath, contents, new UTF8Encoding(true));
        }

        private static string GetStartMenuDirectory()
        {
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.StartMenu),
                "Programs",
                "TwitchManager");
        }

        private static string ReadEmbeddedText(string resourceName)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream == null)
                {
                    return string.Empty;
                }
                using (StreamReader reader = new StreamReader(stream, Encoding.UTF8, true))
                {
                    return reader.ReadToEnd();
                }
            }
        }
    }
}
