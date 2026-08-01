import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [ui, eventsub, storage] = await Promise.all([
  read('js/ui.js'),
  read('js/eventsub.js'),
  read('js/storage.js')
]);

function sourceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, `Could not extract ${startMarker}`);
  return source.slice(start, end);
}

const sortContext = vm.createContext({ isAppCreatedReward: () => false });
vm.runInContext(sourceBetween(ui, 'function getSortedCpRewards', 'function changeCpSortOrder'), sortContext);
const sortedTitles = vm.runInContext(`getSortedCpRewards([
  { title: 'Zulu' },
  { title: 'Alpha' },
  { title: 'Mike' }
], 'name_asc').map(item => item.title).join(',')`, sortContext);
assert.equal(sortedTitles, 'Alpha,Mike,Zulu', 'CP name ascending sort must reorder rewards.');

const backupContext = vm.createContext({
  extractTwitchAccessToken: value => String(value || '').replace(/^oauth:/i, '').trim()
});
vm.runInContext(sourceBetween(ui, 'const BACKUP_BLOCKED_KEYS', 'async function restoreFromLocalFile'), backupContext);
const backupResult = vm.runInContext(`backupSettingsWithoutToken({
  token: 'secret', userId: 'imported-id', userLogin: 'imported-login', clientId: 'imported-client',
  redirectUri: 'https://imported.invalid', dateFormat: 'YYYY/MM/DD'
})`, backupContext);
assert.deepEqual(Object.keys(backupResult), ['dateFormat'], 'Backups must omit all account-bound authentication fields.');

const restoredSettings = vm.runInContext(`restoreSettingsWithoutBackupToken(
  { userId: 'imported-id', userLogin: 'imported-login', clientId: 'imported-client', dateFormat: 'M/D' },
  { token: 'oauth:current-token', userId: 'current-id', userLogin: 'current-login', clientId: 'current-client', redirectUri: 'http://localhost', dateFormat: 'MM/DD' },
  true
)`, backupContext);
assert.equal(restoredSettings.token, 'current-token');
assert.equal(restoredSettings.userId, 'current-id');
assert.equal(restoredSettings.userLogin, 'current-login');
assert.equal(restoredSettings.clientId, 'current-client');
assert.equal(restoredSettings.redirectUri, 'http://localhost');
assert.equal(restoredSettings.dateFormat, 'M/D');

assert.match(ui, /function triggerNotification\(type\)\s*\{[\s\S]*notify-flash[\s\S]*\}/, 'Supporter EventSub notifications must remain visual-only.');
assert.match(eventsub, /triggerCpAutoOn\('raid'\)/, 'Inbound raid CP automation must be owned by the supporter EventSub path.');
assert.equal((ui.match(/triggerCpAutoOn\('raid'\)/g) || []).length, 0, 'Raid/SO EventSub must not duplicate inbound raid CP automation.');
assert.match(ui, /handleRaidSoRaid\(event\)[\s\S]*raidSoundEnabled\) playRaidSoSound\('raid'\)/, 'Raid/SO EventSub must own raid sound playback.');
assert.doesNotMatch(eventsub, /playRaidSoSound\('raid'\)/, 'Supporter EventSub must not duplicate raid sound playback.');
assert.match(storage, /if \(normalizedToken\)[\s\S]*stopAllTwitchConnectionsForAuthClear\(\);[\s\S]*clearLocalTwitchAuth\(\);/, 'Saving an empty token must stop active Twitch services.');

console.log('State conflict regression checks passed.');
