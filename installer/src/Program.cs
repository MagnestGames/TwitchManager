using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace TwitchManagerInstaller
{
    internal static class Program
    {
        private const int MoveFileDelayUntilReboot = 0x4;

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool MoveFileEx(string existingFileName, string newFileName, int flags);

        [STAThread]
        private static void Main(string[] args)
        {
            if (args.Length > 0 && string.Equals(args[0], "/cleanup", StringComparison.OrdinalIgnoreCase))
            {
                RunCleanup(args);
                return;
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (args.Length > 0 && string.Equals(args[0], "/uninstall", StringComparison.OrdinalIgnoreCase))
            {
                RunUninstall();
                return;
            }

            Application.Run(new InstallerForm());
        }

        private static void RunUninstall()
        {
            string installDirectory = Path.GetDirectoryName(Application.ExecutablePath);
            if (!InstallService.IsTwitchManagerInstallation(installDirectory))
            {
                MessageBox.Show(
                    InstallerStrings.InstallationNotFound,
                    InstallerStrings.UninstallerTitle,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
                return;
            }

            DialogResult result = MessageBox.Show(
                InstallerStrings.UninstallConfirmation,
                InstallerStrings.UninstallerTitle,
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question,
                MessageBoxDefaultButton.Button2);
            if (result != DialogResult.Yes)
            {
                return;
            }

            try
            {
                InstallService.RemoveRegistration();
                string cleanupExecutable = Path.Combine(
                    Path.GetTempPath(),
                    "TwitchManager-Cleanup-" + Guid.NewGuid().ToString("N") + ".exe");
                File.Copy(Application.ExecutablePath, cleanupExecutable, true);

                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = cleanupExecutable;
                startInfo.Arguments = "/cleanup " + Quote(installDirectory) + " " + Process.GetCurrentProcess().Id;
                startInfo.UseShellExecute = false;
                startInfo.CreateNoWindow = true;
                startInfo.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(startInfo);
            }
            catch (Exception error)
            {
                MessageBox.Show(
                    InstallerStrings.UninstallStartFailed + "\r\n\r\n" + error.Message,
                    InstallerStrings.UninstallerTitle,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }
        }

        private static void RunCleanup(string[] args)
        {
            if (args.Length < 3)
            {
                return;
            }

            int parentProcessId;
            if (!int.TryParse(args[2], out parentProcessId))
            {
                return;
            }

            string installDirectory = Path.GetFullPath(args[1]);
            if (!InstallService.IsTwitchManagerInstallation(installDirectory))
            {
                return;
            }

            try
            {
                Process parent = Process.GetProcessById(parentProcessId);
                parent.WaitForExit(15000);
            }
            catch (ArgumentException)
            {
            }
            catch (InvalidOperationException)
            {
            }

            for (int attempt = 0; attempt < 20; attempt++)
            {
                try
                {
                    if (Directory.Exists(installDirectory))
                    {
                        Directory.Delete(installDirectory, true);
                    }
                    break;
                }
                catch (IOException)
                {
                    Thread.Sleep(250);
                }
                catch (UnauthorizedAccessException)
                {
                    Thread.Sleep(250);
                }
            }

            MoveFileEx(Application.ExecutablePath, null, MoveFileDelayUntilReboot);
        }

        private static string Quote(string value)
        {
            return "\"" + value.Replace("\"", "\\\"") + "\"";
        }
    }
}
