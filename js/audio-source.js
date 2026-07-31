(() => {
  'use strict';
  const CHANNEL_NAME = 'twitchmanager-audio-v1';
  const STORAGE_KEY = 'twitchmanager_audio_event_v1';
  const recentIds = new Set();
  const active = [];
  const texts = {
    ja: '通知音ソースは待機中です',
    en: 'Notification audio source is ready',
    zh: '通知音频源已就绪'
  };
  const saved = localStorage.getItem('stream_language_v16');
  const lang = saved && texts[saved] ? saved : (navigator.language.startsWith('zh') ? 'zh' : navigator.language.startsWith('ja') ? 'ja' : 'en');
  document.documentElement.lang = lang;
  const label = document.getElementById('status-text');
  if (label) label.textContent = texts[lang];

  function remember(id) {
    if (!id || recentIds.has(id)) return false;
    recentIds.add(id);
    window.setTimeout(() => recentIds.delete(id), 30000);
    return true;
  }

  function stopPrimary() {
    const current = active.find(item => item.primary);
    if (!current) return;
    current.audio.pause();
    current.audio.currentTime = 0;
  }

  function play(message) {
    if (!message || message.type !== 'play' || !remember(message.eventId) || !message.src) return;
    if (!message.overlap) stopPrimary();
    const audio = new Audio(message.src);
    audio.preload = 'auto';
    audio.volume = Math.max(0, Math.min(1, Number(message.volume) || 0));
    const entry = { audio, primary: !message.overlap };
    active.push(entry);
    const remove = () => {
      const index = active.indexOf(entry);
      if (index >= 0) active.splice(index, 1);
    };
    audio.addEventListener('ended', remove, { once: true });
    audio.addEventListener('error', remove, { once: true });
    audio.play().catch(remove);
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', event => play(event.data));
  }
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try { play(JSON.parse(event.newValue)); } catch (_) { /* ignore malformed events */ }
  });
})();
