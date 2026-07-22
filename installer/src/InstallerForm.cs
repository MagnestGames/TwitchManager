using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace TwitchManagerInstaller
{
    internal sealed class InstallerForm : Form
    {
        private readonly TextBox installDirectoryTextBox;
        private readonly Button browseButton;
        private readonly Button installButton;
        private readonly CheckBox openFolderCheckBox;
        private readonly Label statusLabel;

        public InstallerForm()
        {
            Text = InstallerStrings.SetupWindowTitle;
            ClientSize = new Size(650, 365);
            MinimumSize = new Size(650, 404);
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            AutoScaleMode = AutoScaleMode.Dpi;
            BackColor = Color.FromArgb(20, 20, 24);
            ForeColor = Color.WhiteSmoke;

            Label titleLabel = new Label();
            titleLabel.AutoSize = true;
            titleLabel.Font = new Font(InstallerStrings.UiFontName, 21F, FontStyle.Bold, GraphicsUnit.Point);
            titleLabel.ForeColor = Color.FromArgb(176, 117, 255);
            titleLabel.Location = new Point(28, 24);
            titleLabel.Text = "TwitchManager";
            Controls.Add(titleLabel);

            Label versionLabel = new Label();
            versionLabel.AutoSize = true;
            versionLabel.Font = new Font(InstallerStrings.UiFontName, 9F, FontStyle.Regular, GraphicsUnit.Point);
            versionLabel.ForeColor = Color.Silver;
            versionLabel.Location = new Point(32, 69);
            versionLabel.Text = "Version " + InstallService.Version;
            Controls.Add(versionLabel);

            Label descriptionLabel = new Label();
            descriptionLabel.Font = new Font(InstallerStrings.UiFontName, 10.5F, FontStyle.Regular, GraphicsUnit.Point);
            descriptionLabel.ForeColor = Color.Gainsboro;
            descriptionLabel.Location = new Point(32, 104);
            descriptionLabel.Size = new Size(586, 52);
            descriptionLabel.Text = InstallerStrings.Description;
            Controls.Add(descriptionLabel);

            Label pathLabel = new Label();
            pathLabel.AutoSize = true;
            pathLabel.Font = new Font(InstallerStrings.UiFontName, 9.5F, FontStyle.Bold, GraphicsUnit.Point);
            pathLabel.ForeColor = Color.WhiteSmoke;
            pathLabel.Location = new Point(32, 169);
            pathLabel.Text = InstallerStrings.InstallLocation;
            Controls.Add(pathLabel);

            installDirectoryTextBox = new TextBox();
            installDirectoryTextBox.BackColor = Color.FromArgb(42, 42, 50);
            installDirectoryTextBox.BorderStyle = BorderStyle.FixedSingle;
            installDirectoryTextBox.Font = new Font(InstallerStrings.UiFontName, 10F, FontStyle.Regular, GraphicsUnit.Point);
            installDirectoryTextBox.ForeColor = Color.White;
            installDirectoryTextBox.Location = new Point(32, 195);
            installDirectoryTextBox.Size = new Size(478, 30);
            installDirectoryTextBox.Text = InstallService.DefaultInstallDirectory;
            Controls.Add(installDirectoryTextBox);

            browseButton = new Button();
            browseButton.BackColor = Color.FromArgb(52, 52, 64);
            browseButton.FlatAppearance.BorderColor = Color.FromArgb(108, 108, 126);
            browseButton.FlatAppearance.BorderSize = 1;
            browseButton.FlatAppearance.MouseDownBackColor = Color.FromArgb(74, 61, 94);
            browseButton.FlatAppearance.MouseOverBackColor = Color.FromArgb(66, 66, 82);
            browseButton.FlatStyle = FlatStyle.Flat;
            browseButton.Font = new Font(InstallerStrings.UiFontName, 9F, FontStyle.Regular, GraphicsUnit.Point);
            browseButton.ForeColor = Color.White;
            browseButton.Location = new Point(520, 193);
            browseButton.Size = new Size(98, 32);
            browseButton.Text = InstallerStrings.Browse;
            browseButton.UseVisualStyleBackColor = false;
            browseButton.Click += BrowseButtonClick;
            Controls.Add(browseButton);

            openFolderCheckBox = new CheckBox();
            openFolderCheckBox.AutoSize = true;
            openFolderCheckBox.BackColor = BackColor;
            openFolderCheckBox.Checked = true;
            openFolderCheckBox.Font = new Font(InstallerStrings.UiFontName, 9.5F, FontStyle.Regular, GraphicsUnit.Point);
            openFolderCheckBox.ForeColor = Color.WhiteSmoke;
            openFolderCheckBox.Location = new Point(32, 244);
            openFolderCheckBox.Text = InstallerStrings.OpenFolderAfterInstall;
            openFolderCheckBox.UseVisualStyleBackColor = false;
            Controls.Add(openFolderCheckBox);

            statusLabel = new Label();
            statusLabel.AutoEllipsis = true;
            statusLabel.Font = new Font(InstallerStrings.UiFontName, 9F, FontStyle.Regular, GraphicsUnit.Point);
            statusLabel.ForeColor = Color.Silver;
            statusLabel.Location = new Point(32, 282);
            statusLabel.Size = new Size(410, 27);
            statusLabel.TextAlign = ContentAlignment.MiddleLeft;
            Controls.Add(statusLabel);

            installButton = new Button();
            installButton.BackColor = Color.FromArgb(126, 56, 224);
            installButton.FlatAppearance.MouseDownBackColor = Color.FromArgb(92, 38, 174);
            installButton.FlatAppearance.MouseOverBackColor = Color.FromArgb(148, 83, 236);
            installButton.FlatAppearance.BorderSize = 0;
            installButton.FlatStyle = FlatStyle.Flat;
            installButton.Font = new Font(InstallerStrings.UiFontName, 10.5F, FontStyle.Bold, GraphicsUnit.Point);
            installButton.ForeColor = Color.White;
            installButton.Location = new Point(452, 274);
            installButton.Size = new Size(166, 48);
            installButton.Text = InstallerStrings.Install;
            installButton.UseVisualStyleBackColor = false;
            installButton.Click += InstallButtonClick;
            Controls.Add(installButton);
        }

        private void BrowseButtonClick(object sender, EventArgs e)
        {
            using (FolderBrowserDialog dialog = new FolderBrowserDialog())
            {
                dialog.Description = InstallerStrings.SelectInstallLocation;
                dialog.SelectedPath = installDirectoryTextBox.Text;
                dialog.ShowNewFolderButton = true;
                if (dialog.ShowDialog(this) == DialogResult.OK)
                {
                    installDirectoryTextBox.Text = dialog.SelectedPath;
                }
            }
        }

        private void InstallButtonClick(object sender, EventArgs e)
        {
            ToggleControls(false);
            statusLabel.Text = InstallerStrings.Installing;
            Cursor = Cursors.WaitCursor;

            try
            {
                InstallResult result = InstallService.Install(installDirectoryTextBox.Text);
                Clipboard.SetText(result.DockUrl);
                statusLabel.Text = InstallerStrings.InstallCompleteStatus;

                if (openFolderCheckBox.Checked)
                {
                    ProcessStartInfo startInfo = new ProcessStartInfo();
                    startInfo.FileName = result.InstallDirectory;
                    startInfo.UseShellExecute = true;
                    Process.Start(startInfo);
                }

                MessageBox.Show(
                    InstallerStrings.InstallCompleteMessage + result.DockUrl,
                    InstallerStrings.SetupTitle,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
                Close();
            }
            catch (Exception error)
            {
                statusLabel.Text = InstallerStrings.InstallFailedStatus;
                MessageBox.Show(
                    InstallerStrings.InstallFailedMessage + "\r\n\r\n" + error.Message,
                    InstallerStrings.SetupTitle,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
                ToggleControls(true);
            }
            finally
            {
                Cursor = Cursors.Default;
            }
        }

        private void ToggleControls(bool enabled)
        {
            installDirectoryTextBox.Enabled = enabled;
            browseButton.Enabled = enabled;
            openFolderCheckBox.Enabled = enabled;
            installButton.Enabled = enabled;
        }
    }
}
