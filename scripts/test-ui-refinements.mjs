import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, ui, css, locales, storage] = await Promise.all([
  read('TwitchManagerDock.html'),
  read('js/ui.js'),
  read('twitch_manager.css'),
  read('twitch_manager_locales.js'),
  read('js/storage.js')
]);

assert.match(html, /<details class="cp-notice">[\s\S]*<summary[^>]*data-i18n="cpTab\.noticeTitle"/, 'The CP limitation notice must be collapsible.');
assert.match(html, /class="cp-rewards-table"/, 'The CP reward list must use the responsive table layout.');
assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.cp-reward-row\s*\{[\s\S]*grid-template-areas:/, 'CP rewards must switch to cards on narrow screens.');
assert.match(css, /\.cp-reward-icon-button\s*\{[^}]*width:\s*28px;[^}]*height:\s*28px;/, 'Edit and delete buttons must have matching dimensions.');
assert.match(css, /\.cp-toolbar\s*\{[^}]*background:\s*var\(--bg-base\);/, 'The CP toolbar must follow both dark and light theme backgrounds.');

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
assert.match(storage, /if \(normalizedToken\)[\s\S]*stopAllTwitchConnectionsForAuthClear\(\);[\s\S]*clearLocalTwitchAuth\(\);/, 'Clearing the saved token must stop Twitch connections and clear account identity.');

const soundButtonStart = ui.indexOf('class="btn-outline raidso-audio-guide-button"');
const soundButtonEnd = ui.indexOf('</button>', soundButtonStart);
assert.ok(soundButtonStart >= 0 && soundButtonEnd > soundButtonStart, 'The OBS audio guide button must exist.');
assert.doesNotMatch(ui.slice(soundButtonStart, soundButtonEnd), /raidso-fox-mark|🦊/, 'The main OBS audio guide button must not show the fox icon.');
assert.match(ui.slice(soundButtonStart, soundButtonEnd), /raidso-audio-guide-icon[^>]*aria-hidden="true">🔊</, 'The OBS audio guide button must use a speaker emoji.');

const introBoxPosition = ui.indexOf('${raidSoIntroActionsBoxHtml(r)}');
const raidSettingsPosition = ui.indexOf('id="raidso-box-open-settings"');
assert.ok(introBoxPosition >= 0 && raidSettingsPosition > introBoxPosition, 'Raid settings must appear second in Notification & Shoutout.');

for (const key of ['listenerPlayNote', 'listenerPrivacyNote', 'copyRaidSettingsUrl', 'raidSettingsCopyHint', 'raidSettingsUrlCopied', 'noticeTitle']) {
  assert.equal((locales.match(new RegExp(`"${key}"`, 'g')) || []).length, 3, `${key} must be translated in all three languages.`);
}

console.log('UI refinement checks passed.');
