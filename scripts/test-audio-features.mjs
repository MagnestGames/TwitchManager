import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [ui, source, eventsub, storage, windowsBuild, macBuild] = await Promise.all([
  read('js/ui.js'),
  read('js/audio-source.js'),
  read('js/eventsub.js'),
  read('js/storage.js'),
  read('installer/build-installer.ps1'),
  read('installer/macos/build-installer.sh')
]);

const channel = "twitchmanager-audio-v1";
assert.match(ui, new RegExp(channel), 'The main UI must publish to the shared audio channel.');
assert.match(source, new RegExp(channel), 'The OBS source must listen to the shared audio channel.');
assert.match(ui, /if \(raidSoSettings\.obsAudioEnabled\)[\s\S]*sendRaidSoObsAudio/, 'OBS output must be selected explicitly.');
assert.match(ui, /function testRaidSoSound\(kind\)[\s\S]*playRaidSoSound\(kind\)/, 'Test playback must use the production route.');

assert.match(storage, /moderator:read:chatters/, 'Listener detection requires the Twitch chatters scope.');
assert.match(ui, /\/chat\/chatters\?/, 'Listener detection must use Get Chatters.');
assert.match(ui, /listenerBaselineReady/, 'The initial chatter list must be treated as a baseline.');
assert.match(ui, /played\[userId\] === streamId/, 'Listener sounds must be limited to once per stream.');
assert.match(eventsub, /pollRaidSoListenerArrivals\(currentStreamId\)/, 'Stream polling must trigger listener detection.');

for (const installer of [windowsBuild, macBuild]) {
  assert.match(installer, /TwitchManagerAudio\.html/, 'Installer payload must include the OBS audio page.');
}

console.log('OBS audio routing and listener arrival checks passed.');
