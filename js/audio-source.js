(() => {
  'use strict';
  const CHANNEL_NAME = 'twitchmanager-audio-v1';
  const STORAGE_KEY = 'twitchmanager_audio_event_v1';
  const READY_KEY = 'twitchmanager_audio_ready_v1';
  const PING_KEY = 'twitchmanager_audio_ping_v1';
  const RESULT_KEY = 'twitchmanager_audio_result_v1';
  const recentIds = new Set();
  const active = [];
  const texts = {
    ja: '通知音ソースの準備ができました',
    en: 'Notification audio source is ready',
    zh: '通知音频源已就绪'
  };
  let saved = '';
  try { saved = localStorage.getItem('stream_language_v16') || ''; } catch (_) { /* use browser language */ }
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

  let channel = null;

  function publish(message, storageKey) {
    channel?.postMessage(message);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...message, nonce: `${Date.now()}-${Math.random()}` }));
    } catch (_) { /* storage can be unavailable in restricted browser sources */ }
  }

  function announceReady() {
    publish({ type: 'ready', at: Date.now() }, READY_KEY);
  }

  function reportPlayback(type, eventId) {
    publish({ type, eventId, at: Date.now() }, RESULT_KEY);
  }

  function stopPrimary() {
    for (let index = active.length - 1; index >= 0; index -= 1) {
      const current = active[index];
      if (!current.primary) continue;
      active.splice(index, 1);
      current.audio.pause();
      current.audio.currentTime = 0;
    }
  }

  let overlayTimer = null;
  let overlayFadeTimer = null;

  function showWelcomeOverlay(imageInfo) {
    let overlay = document.getElementById('obs-welcome-overlay');
    let img = document.getElementById('obs-welcome-img');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'obs-welcome-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;max-width:1920px;max-height:1080px;pointer-events:none;z-index:999999;opacity:0;transition:opacity 0.4s ease-in-out;visibility:visible !important;';

      img = document.createElement('img');
      img.id = 'obs-welcome-img';
      overlay.appendChild(img);

      document.body.appendChild(overlay);
    }

    if (overlayTimer) clearTimeout(overlayTimer);
    if (overlayFadeTimer) clearTimeout(overlayFadeTimer);

    img.src = imageInfo.src;
    const scale = (Number(imageInfo.size) || 100) / 100;
    const posX = imageInfo.posX ?? 50;
    const posY = imageInfo.posY ?? 50;

    img.style.cssText = `position:absolute;left:${posX}%;top:${posY}%;transform:translate(-50%,-50%) scale(${scale});max-width:1600px;max-height:900px;object-fit:contain;filter:drop-shadow(0 6px 20px rgba(0,0,0,0.7));visibility:visible !important;transition:transform 0.2s ease, left 0.1s ease, top 0.1s ease;`;

    overlay.style.display = 'block';
    void overlay.offsetWidth;
    overlay.style.opacity = '1';

    const durationMs = Math.max(1000, (Number(imageInfo.duration) || 5) * 1000);
    overlayTimer = setTimeout(() => {
      overlay.style.opacity = '0';
      overlayFadeTimer = setTimeout(() => {
        overlay.style.display = 'none';
        img.src = '';
      }, 400);
    }, durationMs);
  }

  function play(message) {
    if (!message || message.type !== 'play' || !remember(message.eventId)) return;
    if (!message.overlap) stopPrimary();

    if (message.imageInfo && message.imageInfo.enabled && message.imageInfo.src) {
      showWelcomeOverlay(message.imageInfo);
    }

    if (!message.src) {
      reportPlayback('played', message.eventId);
      return;
    }

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
    audio.play()
      .then(() => reportPlayback('played', message.eventId))
      .catch(() => {
        remove();
        reportPlayback('failed', message.eventId);
      });
  }

  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.addEventListener('message', event => {
        if (event.data?.type === 'ping') announceReady();
        else play(event.data);
      });
    } catch (_) { channel = null; }
  }
  window.addEventListener('storage', event => {
    if (!event.newValue) return;
    try {
      if (event.key === STORAGE_KEY) play(JSON.parse(event.newValue));
      if (event.key === PING_KEY) announceReady();
    } catch (_) { /* ignore malformed events */ }
  });
  announceReady();
  window.setInterval(announceReady, 5000);
})();
