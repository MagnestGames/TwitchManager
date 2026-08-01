import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, legacySourcePage, ui, source, eventsub, storage, windowsBuild, windowsInstallService, macBuild] = await Promise.all([
  read('TwitchManagerDock.html'),
  read('TwitchManagerAudio.html'),
  read('js/ui.js'),
  read('js/audio-source.js'),
  read('js/eventsub.js'),
  read('js/storage.js'),
  read('installer/build-installer.ps1'),
  read('installer/src/InstallService.cs'),
  read('installer/macos/build-installer.sh')
]);

const channel = "twitchmanager-audio-v1";
assert.match(ui, new RegExp(channel), 'The main UI must publish to the shared audio channel.');
assert.match(source, new RegExp(channel), 'The OBS source must listen to the shared audio channel.');
assert.match(ui, /if \(raidSoSettings\.obsAudioEnabled\)[\s\S]*sendRaidSoObsAudio/, 'OBS output must be selected explicitly.');
assert.match(ui, /function testRaidSoSound\(kind\)[\s\S]*playRaidSoSound\(kind\)/, 'Test playback must use the production route.');
assert.match(ui, /searchParams\.set\('audio-source', '1'\)/, 'The OBS source must use the same dock document origin.');
assert.match(html, /twitchManagerAudioSourceMode[\s\S]*js\/audio-source\.js/, 'The dock must provide a dedicated invisible audio-source mode.');
assert.match(legacySourcePage, /location\.replace\(target\.href\)/, 'Existing standalone audio URLs must migrate to the dock audio-source mode.');
assert.match(source, /announceReady\(\)[\s\S]*setInterval\(announceReady, 5000\)/, 'The OBS source must publish a readiness heartbeat.');
assert.match(source, /reportPlayback\('played', message\.eventId\)/, 'The OBS source must acknowledge playback.');
assert.match(source, /for \(let index = active\.length - 1; index >= 0; index -= 1\)[\s\S]*active\.splice\(index, 1\)/, 'Starting a primary sound must stop every previous primary sound.');
assert.match(ui, /pendingObsAudio[\s\S]*obsAudioFallback[\s\S]*playRaidSoAudioDirect/, 'Missing OBS acknowledgements must fall back to direct playback.');

assert.match(storage, /moderator:read:chatters/, 'Listener detection requires the Twitch chatters scope.');
assert.match(ui, /\/chat\/chatters\?/, 'Listener detection must use Get Chatters.');
assert.match(ui, /listenerBaselineReady/, 'The initial chatter list must be treated as a baseline.');
assert.match(ui, /played\[userId\] === normalizedStreamId/, 'Listener sounds must be limited to once per stream.');
assert.match(ui, /listenerStreamId !== normalizedStreamId[\s\S]*listenerBaselineReady = false/, 'Changing streams must reset the listener baseline.');
assert.match(ui, /await fetchRaidSoChatters\(\)[\s\S]*!raidSoSettings\.listenerArrivalEnabled[\s\S]*currentEntries/, 'Listener settings must be rechecked after the asynchronous chatter request.');
assert.match(eventsub, /pollRaidSoListenerArrivals\(currentStreamId\)/, 'Stream polling must trigger listener detection.');
assert.match(eventsub, /message_id/, 'EventSub notifications must be deduplicated by message ID.');
assert.match(ui, /raidSoState\.eventMessageIds\.has\(messageId\)/, 'The notification-and-shoutout EventSub connection must also deduplicate message IDs.');
assert.match(eventsub, /triggerCpAutoOn\('stream_start'\)/, 'Stream starts must trigger channel-point group automation.');

for (const installer of [windowsBuild, macBuild]) {
  assert.match(installer, /TwitchManagerAudio\.html/, 'Installer payload must include the OBS audio page.');
}
assert.match(windowsInstallService, /dockUrl \+ "\?audio-source=1"/, 'The Windows installer must publish the same-origin audio-source URL.');
assert.match(macBuild, /audio_url="\$\{dock_url\}\?audio-source=1"/, 'The macOS installer must publish the same-origin audio-source URL.');

console.log('OBS audio routing and listener arrival checks passed.');
