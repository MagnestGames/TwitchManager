import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, ui, css, locales, storage] = await Promise.all([
  read('TwitchManagerDock.html'),
  read('js/ui.js'),
  read('css/twitch_manager.css'),
  read('js/locales.js'),
  read('js/storage.js')
]);
const eventsub = await read('js/eventsub.js');

assert.match(html, /<details class="cp-notice">[\s\S]*<summary[^>]*data-i18n="cpTab\.noticeTitle"/, 'The CP limitation notice must be collapsible.');
assert.match(html, /class="cp-rewards-table"/, 'The CP reward list must use the responsive table layout.');
assert.match(css, /@media \(max-width: 480px\)[\s\S]*\.cp-reward-row\s*\{[\s\S]*grid-template-areas:/, 'CP rewards must switch to cards on narrow screens.');
assert.match(css, /\.cp-reward-icon-button\s*\{[^}]*width:\s*28px;[^}]*height:\s*28px;/, 'Edit and delete buttons must have matching dimensions.');
assert.match(css, /\.cp-toolbar\s*\{[^}]*background:\s*var\(--bg-base\);/, 'The CP toolbar must follow both dark and light theme backgrounds.');
assert.match(ui, /class="cp-group-actions"/, 'CP group actions must use the shared aligned layout.');
assert.match(css, /#cp-groups-container \.cp-group-actions\s*\{[^}]*grid-template-columns:[^}]*repeat\(3, 28px\)/, 'CP group text and icon actions must use consistent dimensions.');
assert.match(html, /class="misc-action-row"[\s\S]*id="ui-backup-select-file"[\s\S]*id="ui-restore-file-name"[^>]*data-i18n="footerActions\.selectFile"/, 'Restore actions must keep the localized label inside the file button.');
assert.doesNotMatch(html, /id="ui-backup-select-file"[^>]*data-i18n=/, 'Localization must not replace the restore button and remove its icon or filename element.');
assert.match(css, /\.misc-action-row\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/, 'Backup and restore action buttons must use equal columns.');
assert.doesNotMatch(ui, /getElementById\('ui-(?:backup-title|backup-copy|restore-btn)'\)\.innerText/, 'Localization must not remove icons from backup and restore controls.');
assert.match(ui, /const changes = Array\.isArray\(result\.release\.changes\)/, 'Update notifications must include release highlights when available.');
assert.match(ui, /changes\.map\(change => `<li>\$\{raidSoEscape\(change\)\}<\/li>`\)/, 'Release highlights must be escaped before display.');

assert.match(ui, /onclick="copyTwitchStreamSettingsUrl\(\)"/, 'Raid settings must provide a URL copy button.');
assert.match(ui, /raidSoSuggestInputHtml\('raidso-listener-id'/, 'Welcome notification IDs must use the shared Twitch history suggestions.');
assert.match(ui, /class="btn-primary raidso-listener-add-button"[^>]*onclick="addRaidSoListener\(\)"/, 'The welcome notification add action must use the same primary theme colors as Save.');
assert.match(css, /\.raidso-listener-add-button\s*\{[^}]*background:\s*var\(--button-primary-bg\)\s*!important;[^}]*color:\s*var\(--button-primary-text\)\s*!important;[^}]*border-color:\s*var\(--button-primary-border\)\s*!important;/, 'The welcome notification add action must preserve Save colors in dark and light themes.');
assert.match(ui, /class="btn-secondary cp-reward-icon-button"[^>]*aria-label="\$\{raidSoEscape\(actionTitle\)\}"/, 'The CP edit action must be icon-only with an accessible label.');
assert.match(ui, /class="btn-secondary cp-reward-icon-button is-delete"[^>]*aria-label="\$\{raidSoEscape\(isAppOwned \? deleteAria : actionTitle\)\}"/, 'The CP delete action must match the edit action.');
assert.doesNotMatch(html, /id="cp-group-auto-obs-scene"/, 'Removed obs-websocket scene automation must not remain in the CP UI.');
assert.match(ui, /activeGroups: new Set\(\)/, 'CP group state must track active groups.');
assert.match(ui, /protectedIds[\s\S]*cpState\.activeGroups\.has/, 'Shared rewards must remain enabled while another group is active.');
assert.match(ui, /case 'name_asc':[\s\S]*localeCompare\(b\.title \|\| '', 'ja'\)/, 'Ascending CP name sorting must compare different rewards.');
assert.match(ui, /manageableRewards = \(cpState\.rewards \|\| \[\]\)\.filter\(isAppCreatedReward\)/, 'Bulk CP operations must skip rewards created outside this tool.');
assert.match(ui, /manageableIds = Array\.from\(new Set\(group\.rewardIds\)\)\.filter\(isManageableCpRewardId\)/, 'CP group automation must skip external and stale reward IDs.');
assert.match(ui, /loadCpGroupsFromStorage\(\);\s*reconcileCpGroupsWithRewards\(\);/, 'Refreshing CP data must remove stale group reward IDs.');
assert.match(ui, /disabledAttribute = isAppOwned \? '' : ' disabled aria-disabled="true"'/, 'External CP controls must be visibly disabled.');
assert.match(ui, /class="cp-segmented-control\${isAppOwned \? '' : ' is-disabled'}"/, 'External CP switches must expose a disabled visual state.');
assert.match(css, /\.cp-reward-icon-button:disabled,[\s\S]*\.cp-segmented-control\.is-disabled/, 'External CP controls must look disabled in both themes.');
assert.match(ui, /rewardIds: \(group\.rewardIds \|\| \[\]\)\.filter\(id => id !== rewardId\)/, 'Deleting a reward must remove stale group references.');
assert.match(ui, /cpGroups:[\s\S]*cpAppRewardIds:/, 'Backups must include CP groups and app-created reward IDs.');
assert.match(ui, /let customDialogTail = Promise\.resolve\(\)/, 'Custom dialogs must be serialized.');
assert.match(ui, /if \(typeof options\.onOpen === 'function'\)[\s\S]*options\.onOpen\(\{ resolveWith \}\)/, 'Queued custom dialogs must attach dynamic controls only after presentation.');
const editTagsDialogSource = ui.slice(ui.indexOf('async function showEditFriendTagsDialog'), ui.indexOf('window.showEditFriendTagsDialog'));
assert.match(editTagsDialogSource, /onOpen: \(\{ resolveWith \}\) =>/, 'The tag editor must bind controls when its queued dialog is actually shown.');
assert.doesNotMatch(editTagsDialogSource, /setTimeout\(/, 'The tag editor must not rely on fixed-delay dialog binding.');
const addFriendDialogSource = ui.slice(ui.indexOf('async function showAddFriendDialog'), ui.indexOf('function updateRestoreFileName'));
assert.match(addFriendDialogSource, /onOpen: \(\{ resolveWith \}\) =>/, 'The add-friend dialog must bind controls when its queued dialog is actually shown.');
assert.doesNotMatch(addFriendDialogSource, /setTimeout\(/, 'The add-friend dialog must not rely on fixed-delay dialog binding.');
assert.match(ui, /BACKUP_AUTH_KEYS = new Set\(\['token', 'userId', 'userLogin', 'clientId', 'redirectUri'\]\)/, 'Backups must not import account-bound Twitch authentication fields.');
assert.match(ui, /title="\$\{raidSoEscape\(cpCopy\('bulkEditTitle'\)\)\}" aria-label="\$\{raidSoEscape\(cpCopy\('bulkEditTitle'\)\)\}"/, 'CP group bulk edit labels must follow the selected language.');
assert.doesNotMatch(ui, /data-i18n-title="cpTab\.bulkEditTitle" title="一括編集" aria-label="一括編集"/, 'CP group actions must not retain fixed Japanese accessibility labels.');
const titleTagRowsSource = ui.slice(ui.indexOf('function renderTitleTagModalRows'), ui.indexOf('function addCustomCategoryMappingRow'));
assert.match(titleTagRowsSource, /extended\.tagNoCustomTags/, 'The empty custom-tag state must be localized.');
assert.match(titleTagRowsSource, /extended\.tagNoCategoryRules/, 'The empty category-map state must be localized.');
assert.match(titleTagRowsSource, /extended\.tagSelectRegisteredCategory/, 'The registered-category prompt must be localized.');
assert.match(titleTagRowsSource, /extended\.tagDirectInputOption/, 'The direct-input option must be localized.');
assert.doesNotMatch(titleTagRowsSource, />削除<\/button>/, 'Dynamic tag-setting delete buttons must not remain fixed in Japanese.');
assert.match(storage, /if \(normalizedToken\)[\s\S]*stopAllTwitchConnectionsForAuthClear\(\);[\s\S]*clearLocalTwitchAuth\(\);/, 'Clearing the saved token must stop Twitch connections and clear account identity.');

for (const conciseJapaneseLabel of ['重複IDを統合', 'すべての項目', 'グループ', '報酬一覧']) {
  assert.match(locales, new RegExp(`"${conciseJapaneseLabel}"`), `${conciseJapaneseLabel} must remain in the Japanese UI.`);
}
for (const verboseJapaneseLabel of ['重複IDを統合・整理', 'すべての項目 (フルバックアップ)', 'グループ一括操作 (ワンタップON/OFF)']) {
  assert.doesNotMatch(locales, new RegExp(verboseJapaneseLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${verboseJapaneseLabel} must not return to the Japanese UI.`);
}

const soundButtonStart = ui.indexOf('class="btn-outline raidso-audio-guide-button"');
const soundButtonEnd = ui.indexOf('</button>', soundButtonStart);
assert.ok(soundButtonStart >= 0 && soundButtonEnd > soundButtonStart, 'The OBS audio guide button must exist.');
assert.doesNotMatch(ui.slice(soundButtonStart, soundButtonEnd), /raidso-fox-mark|🦊/, 'The main OBS audio guide button must not show the fox icon.');
assert.match(ui.slice(soundButtonStart, soundButtonEnd), /raidso-audio-guide-icon[^>]*aria-hidden="true">🔊</, 'The OBS audio guide button must use a speaker emoji.');

const introBoxPosition = ui.indexOf('${raidSoIntroActionsBoxHtml(r)}');
const raidSettingsPosition = ui.indexOf('id="raidso-box-open-settings"');
assert.ok(introBoxPosition >= 0 && raidSettingsPosition > introBoxPosition, 'Raid settings must appear second in Notification & Shoutout.');

for (const key of ['listenerPlayNote', 'listenerPrivacyNote', 'copyRaidSettingsUrl', 'raidSettingsCopyHint', 'raidSettingsUrlCopied', 'noticeTitle', 'changes', 'tagNoCustomTags', 'tagNoCategoryRules', 'tagSelectRegisteredCategory', 'tagDirectInputOption', 'tagCollabAllMembers', 'outboundRaidStartFailed', 'outboundRaidUrlFailed', 'outboundRaid', 'unknown']) {
  assert.equal((locales.match(new RegExp(`"${key}"`, 'g')) || []).length, 3, `${key} must be translated in all three languages.`);
}
assert.match(ui, /return hit \? uiText\(`apiErrors\.\$\{hit\[1\]\}`\) : uiText\('apiErrors\.unknown'\)/, 'Unknown Twitch API errors must use the selected-language fallback.');
assert.doesNotMatch(eventsub, /Outbound Raid to \$\{ev\.to_broadcaster_user_name\}/, 'Outbound raid logs must not remain fixed in English.');
assert.match(eventsub, /uiText\('runtime\.supporter\.outboundRaid'/, 'Outbound raid logs must use the selected-language string.');
for (const formatLabel of ['対応形式: JSON / TXT', 'Formats: JSON / TXT', '支持格式：JSON / TXT']) {
  assert.match(locales, new RegExp(formatLabel), `${formatLabel} must be localized.`);
}

console.log('UI refinement checks passed.');
