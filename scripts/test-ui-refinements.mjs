import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, ui, css, locales] = await Promise.all([
  read('TwitchManagerDock.html'),
  read('js/ui.js'),
  read('twitch_manager.css'),
  read('twitch_manager_locales.js')
]);

assert.match(html, /<details class="cp-notice">[\s\S]*<summary[^>]*data-i18n="cpTab\.noticeTitle"/, 'The CP limitation notice must be collapsible.');
assert.match(html, /class="cp-rewards-table"/, 'The CP reward list must use the responsive table layout.');
assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.cp-reward-row\s*\{[\s\S]*grid-template-areas:/, 'CP rewards must switch to cards on narrow screens.');
assert.match(css, /\.cp-reward-icon-button\s*\{[^}]*width:\s*28px;[^}]*height:\s*28px;/, 'Edit and delete buttons must have matching dimensions.');

assert.match(ui, /onclick="copyTwitchStreamSettingsUrl\(\)"/, 'Raid settings must provide a URL copy button.');
assert.match(ui, /raidSoSuggestInputHtml\('raidso-listener-id'/, 'Welcome notification IDs must use the shared Twitch history suggestions.');
assert.match(ui, /class="btn-secondary cp-reward-icon-button"[^>]*aria-label="\$\{raidSoEscape\(editText\)\}"/, 'The CP edit action must be icon-only with an accessible label.');
assert.match(ui, /class="btn-secondary cp-reward-icon-button is-delete"[^>]*aria-label="\$\{raidSoEscape\(deleteAria\)\}"/, 'The CP delete action must match the edit action.');

const soundButtonStart = ui.indexOf('class="btn-outline raidso-audio-guide-button"');
const soundButtonEnd = ui.indexOf('</button>', soundButtonStart);
assert.ok(soundButtonStart >= 0 && soundButtonEnd > soundButtonStart, 'The OBS audio guide button must exist.');
assert.doesNotMatch(ui.slice(soundButtonStart, soundButtonEnd), /raidso-fox-mark|🦊/, 'The main OBS audio guide button must not show the fox icon.');

const introBoxPosition = ui.indexOf('${raidSoIntroActionsBoxHtml(r)}');
const raidSettingsPosition = ui.indexOf('id="raidso-box-open-settings"');
assert.ok(introBoxPosition >= 0 && raidSettingsPosition > introBoxPosition, 'Raid settings must appear second in Notification & Shoutout.');

for (const key of ['listenerPlayNote', 'listenerPrivacyNote', 'copyRaidSettingsUrl', 'raidSettingsCopyHint', 'raidSettingsUrlCopied', 'noticeTitle']) {
  assert.equal((locales.match(new RegExp(`"${key}"`, 'g')) || []).length, 3, `${key} must be translated in all three languages.`);
}

console.log('UI refinement checks passed.');
