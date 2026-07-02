/****************************************************************************************
 * ==================================================================================== *
 *                              TRANSLATION DATA START                                  *
 * ==================================================================================== *
 * 有志の翻訳者へ：
 * 言語を追加・修正する場合は、以下の `I18N_DATA` 内のテキストのみを編集してください。
 * プログラムの動作ロジックはこのブロックより下にあります。
 ****************************************************************************************/

/****************************************************************************************
 * ==================================================================================== *
 *                               TRANSLATION DATA END                                   *
 * ==================================================================================== *
 ****************************************************************************************/

// --- 内部処理用マッピング（編集不要） ---
const cmdSets = {
    ja: I18N_DATA.ja.twitch,
    en: I18N_DATA.en.twitch,
    zh: I18N_DATA.zh.twitch
};


        

        const cmdButtonHtml = ([label, command, tip], s) => {
            const isAutoExec = !command.endsWith(' ');
            const autoExecIcon = isAutoExec ? `<span class="command-exec-icon" title="${s.directExecTitle || cmdSets.ja.directExecTitle}">✦</span>` : '';
            const displayCmd = command.trim();

            const actionTip = isAutoExec ? (s.directTip || s.copyTip) : s.copyTip;
            const tipText = tip && tip !== label ? (tip + ' / ' + actionTip) : actionTip;

            return `<button class="btn-outline cmd-copy-btn has-tooltip" style="padding: 6px; font-size: 11px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-sm); color: var(--text-main); cursor: pointer; transition: var(--transition-fast);"
                data-tooltip="${label}: ${command}&#10;${tipText}" 
                onclick="handleCommandClick('${command}', '${label}', ${isAutoExec})">
                <span class="cmd-label" style="margin-bottom: 2px; display: flex; align-items: center; text-align: center; line-height: 1.2;">${label}${autoExecIcon}</span>
                <span class="cmd-code">${displayCmd}</span>
            </button>`;
        };

        const chatToggleBtnHtml = (label, onCmdInfo, offCmdInfo, s, inputConfig) => {
            const onCmdBase = onCmdInfo[1].trim();
            const offCmd = offCmdInfo[1].trim();
            const id = 'chat-toggle-btn-' + offCmd.replace(/[^a-zA-Z]/g, '');
            
            let inputHtml = '';
            if (inputConfig) {
                inputHtml = `
                <div class="cmd-time-control" onclick="event.stopPropagation()">
                    <input type="${inputConfig.type}" id="${inputConfig.id}" value="${inputConfig.value}"${inputConfig.min !== undefined ? ` min="${inputConfig.min}"` : ''}${inputConfig.max !== undefined ? ` max="${inputConfig.max}"` : ''}${inputConfig.step !== undefined ? ` step="${inputConfig.step}"` : ''}${inputConfig.min !== undefined && inputConfig.max !== undefined ? ` onchange="this.value=clampInt(this.value,${inputConfig.min},${inputConfig.max},${inputConfig.value})"` : ''}>
                    <span>${inputConfig.unit}</span>
                </div>`;
            }

            return `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <button class="btn-outline cmd-copy-btn has-tooltip" id="${id}" style="flex: 1; padding: 8px 6px; font-size: 11px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-sm); color: var(--text-main); cursor: pointer; transition: all 0.2s ease;"
                    data-tooltip="${label}: ${onCmdBase} / ${offCmd}&#10;${s.directTip || s.copyTip}" 
                    onclick="handleChatToggleButton(this, '${onCmdBase}', '${offCmd}', '${inputConfig ? inputConfig.id : ''}')">
                    <span class="cmd-label" style="display: flex; align-items: center; text-align: center; line-height: 1.2;">${label}<span class="command-exec-icon" title="${s.directExecTitle || cmdSets.ja.directExecTitle}">✦</span></span>
                </button>
                ${inputHtml}
            </div>`;
        };

        const getCmdHtml = (l) => {
            const s = cmdSets[l] || cmdSets.ja;
            const b = s.buttons;
            const c = s.categories;
            const units = I18N_DATA[l]?.ui?.extended || I18N_DATA.ja.ui.extended;
            const renderGrid = (buttons) => `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 6px; padding: 6px;">${buttons.map(cmd => cmdButtonHtml(cmd, s)).join('')}</div>`;

            return `
            <div class="command-stack" style="display: flex; flex-direction: column; gap: 8px;">
                <div class="tab-lead-note">
                    <span><span style="color: #bf94ff;">✦</span> ${s.directExecHint || cmdSets.ja.directExecHint}</span>
                </div>
                <div class="category-box tw-section" id="cmd-box-stream" style="margin-bottom: 0;">
                    <div class="category-name" onclick="twToggle('cmd-box-stream')" style="padding: 6px 10px; background: rgba(255,255,255,0.05); border-bottom: 1px solid var(--border-color); font-size: 12px;"><span>${c.stream}</span></div>
                    <div class="tw-body">${renderGrid([b.title, b.game, b.marker, b.raid, b.unraid, b.ads30, b.ads60, b.ads180])}</div>
                </div>
                <div class="category-box tw-section" id="cmd-box-chat" style="margin-bottom: 0;">
                    <div class="category-name" onclick="twToggle('cmd-box-chat')" style="padding: 6px 10px; background: rgba(255,255,255,0.05); border-bottom: 1px solid var(--border-color); font-size: 12px;"><span>${c.chat}</span></div>
                    <div class="tw-body">
                        ${renderGrid([b.announce, b.clear, b.color, b.me, b.disconnect])}
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 6px; padding: 6px;">
                            ${chatToggleBtnHtml(b.emoteOnly[0], b.emoteOnly, b.emoteOff, s)}
                            ${chatToggleBtnHtml(b.sub[0], b.sub, b.subOff, s)}
                            ${chatToggleBtnHtml(b.unique[0], b.unique, b.uniqueOff, s)}
                            ${chatToggleBtnHtml(b.followerOnly[0], b.followerOnly, b.followerOff, s, { id: 'follower-time', type: 'number', value: 0, min: 0, max: 129600, step: 1, unit: units.unitMinute, width: '40px' })}
                            ${chatToggleBtnHtml(b.slow[0], b.slow, b.slowOff, s, { id: 'slow-time', type: 'number', value: 30, min: 3, max: 120, step: 1, unit: units.unitSecond, width: '40px' })}
                        </div>
                    </div>
                </div>
                <div class="category-box tw-section" id="cmd-box-user" style="margin-bottom: 0;">
                    <div class="category-name" onclick="twToggle('cmd-box-user')" style="padding: 6px 10px; background: rgba(255,255,255,0.05); border-bottom: 1px solid var(--border-color); font-size: 12px;"><span>${c.user}</span></div>
                    <div class="tw-body">${renderGrid([b.ban, b.unban, b.timeout, b.mod, b.unmod, b.vip, b.unvip, b.mods, b.vips, b.user, b.monitor, b.unmonitor, b.restrict, b.unrestrict, b.block, b.unblock, b.w])}</div>
                </div>
                <div class="category-box tw-section" id="cmd-box-interact" style="margin-bottom: 0;">
                    <div class="category-name" onclick="twToggle('cmd-box-interact')" style="padding: 6px 10px; background: rgba(255,255,255,0.05); border-bottom: 1px solid var(--border-color); font-size: 12px;"><span>${c.interact}</span></div>
                    <div class="tw-body">${renderGrid([b.poll, b.predict, b.pin, b.unpin, b.shoutout])}</div>
                </div>
            </div>`;
        };

        
// 動的コンテンツ(HTML)を含むため分離
const langMap = {
    ja: { ...I18N_DATA.ja.ui, cmdHtml: getCmdHtml('ja') },
    en: { ...I18N_DATA.en.ui, cmdHtml: getCmdHtml('en') },
    zh: { ...I18N_DATA.zh.ui, cmdHtml: getCmdHtml('zh') }
};



        const LANGUAGE_STORAGE_KEY = 'stream_language_v16';
        const LANGUAGE_OPTIONS = [
            { code: 'ja', short: 'JP' },
            { code: 'en', short: 'EN' },
            { code: 'zh', short: 'ZH' }
        ];
        function detectInitialLanguage() {
            const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (langMap[savedLang]) return savedLang;
            const browserLang = navigator.language.toLowerCase();
            return browserLang.startsWith('ja') ? 'ja' : (browserLang.startsWith('zh') ? 'zh' : 'en');
        }

        let currentLang = detectInitialLanguage(), config = [], friendsConfig = [], memoConfig = [], settings = {}, isSortLocked = true, sortableInstances = [], dynamicCategorySortables = [];

        function saveAllLocal(s) { localStorage.setItem('stream_config_v16', JSON.stringify(config)); if (s) { showToast(doneText()); raidSoLog(uiText('runtime.operationLog.titlesSaved')); } }
        function saveFriendsLocal(s) { localStorage.setItem('stream_friends_v16', JSON.stringify(friendsConfig)); renderShoutoutSuggestions(); if (s) { showToast(doneText()); raidSoLog(uiText('runtime.operationLog.idsSaved')); } }
        function saveMemoLocal(s = false) { localStorage.setItem('stream_memo_v16', JSON.stringify(memoConfig)); if (s) { showToast(doneText()); raidSoLog(uiText('runtime.operationLog.memosSaved')); } }
        function saveDockState(show = true) {
            saveAllLocal(false);
            saveFriendsLocal(false);
            saveMemoLocal(false);
            saveRaidSoSettings(false);
            if (show) showToast(doneText());
        }

        function extractTwitchAccessToken(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            const withoutOauthPrefix = raw.replace(/^oauth:/i, '');
            const hashIndex = withoutOauthPrefix.indexOf('#');
            const queryIndex = withoutOauthPrefix.indexOf('?');
            const paramText = hashIndex >= 0 ? withoutOauthPrefix.slice(hashIndex + 1) : (queryIndex >= 0 ? withoutOauthPrefix.slice(queryIndex + 1) : '');
            if (paramText) {
                const params = new URLSearchParams(paramText);
                const token = params.get('access_token');
                if (token) return token.trim();
            }
            const looseMatch = withoutOauthPrefix.match(/access_token=([^&\s]+)/);
            return looseMatch ? decodeURIComponent(looseMatch[1]).trim() : withoutOauthPrefix;
        }

        function sanitizeTwitchClientId(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            const compact = raw.replace(/[\s_-]+/g, '').toLowerCase();
            if (/^(demo|sample|example|your)?clientid\d*$/.test(compact)) return '';
            if (/^[a-z]+$/i.test(raw) && raw.length < 20) return '';
            return raw;
        }

        function scrubSavedClientId() {
            const cleaned = sanitizeTwitchClientId(settings.clientId);
            if (settings.clientId && !cleaned) {
                settings.clientId = '';
                localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
            } else {
                settings.clientId = cleaned;
            }
            const input = document.getElementById('client_id');
            if (input) input.value = settings.clientId || '';
        }

        function getOAuthRedirectUri() {
            return (document.getElementById('oauth_redirect_uri')?.value || settings.redirectUri || 'http://localhost').trim() || 'http://localhost';
        }

        async function copyOAuthRedirectUri() {
            const ui = langMap[currentLang]?.settingsUi || langMap.ja.settingsUi;
            await copyTextToClipboard(getOAuthRedirectUri(), ui.redirectCopied || doneText());
        }

        function applyTwitchValidationData(data) {
            if (!data) return;
            if (data.client_id) settings.clientId = sanitizeTwitchClientId(data.client_id);
            if (data.user_id) settings.userId = data.user_id;
            if (data.login) settings.userLogin = data.login;
            const userIdInput = document.getElementById('user_id');
            const userLoginInput = document.getElementById('user_login');
            const clientIdInput = document.getElementById('client_id');
            if (userIdInput) userIdInput.value = settings.userId || '';
            if (userLoginInput) userLoginInput.value = settings.userLogin || '';
            if (clientIdInput && settings.clientId) clientIdInput.value = settings.clientId;
            updateSettingsAuthStatus();
            if (ensureAuthenticatedUserIdList()) renderFriends();
        }

        function updateSettingsAuthStatus() {
            const el = document.getElementById('ui-settings-auth-status');
            if (!el) return;
            const ui = langMap[currentLang]?.settingsUi || langMap.ja.settingsUi;
            const login = settings.userLogin || settings.userId || '';
            el.innerText = login ? (ui.authStatusReady || '{login}').replace('{login}', login) : (ui.authStatusEmpty || '');
            el.classList.toggle('is-ready', Boolean(login));
            el.classList.toggle('is-warning', !login);
            const revokeBtn = document.getElementById('ui-settings-revoke-auth-btn');
            if (revokeBtn) {
                const hasLocalAuth = Boolean(settings.token || settings.userId || settings.userLogin || document.getElementById('token')?.value);
                revokeBtn.disabled = !hasLocalAuth;
                revokeBtn.style.opacity = hasLocalAuth ? '1' : '0.45';
                revokeBtn.style.cursor = hasLocalAuth ? 'pointer' : 'not-allowed';
            }
        }

        async function refreshTwitchAuthFromToken(showError = false) {
            const token = extractTwitchAccessToken(settings.token || document.getElementById('token')?.value || '');
            if (!token) return null;
            try {
                const response = await fetch('https://id.twitch.tv/oauth2/validate', { headers: { 'Authorization': `OAuth ${token}` } });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.message || uiText('runtime.tokenValidationFailed'));
                applyTwitchValidationData(data);
                localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
                return data;
            } catch (e) {
                if (showError) await customAlert(uiText('runtime.authValidationFailed', { error: e.message }));
                return null;
            }
        }

        async function saveSettings() {
            const normalizedToken = extractTwitchAccessToken(document.getElementById('token').value);
            settings = {
                ...settings,
                userId: document.getElementById('user_id')?.value.trim() || settings.userId || '',
                userLogin: document.getElementById('user_login')?.value.trim() || settings.userLogin || '',
                clientId: getClientIdFromInputOrDefault(),
                redirectUri: getOAuthRedirectUri(),
                token: normalizedToken,
                dateFormat: document.getElementById('date_format').value,
                autoAdEnabled: !!document.getElementById('settings_auto_ad')?.checked,
                autoPinEnabled: !!document.getElementById('settings_auto_pin')?.checked,
                fontSizeOffset: Number(document.getElementById('settings_font_size_offset')?.getValue?.() ?? document.getElementById('settings_font_size_offset')?.dataset.value ?? 0),
                lineHeight: Number(document.getElementById('settings_line_height')?.getValue?.() ?? document.getElementById('settings_line_height')?.dataset.value ?? 1.5)
            };
            document.getElementById('client_id').value = settings.clientId || '';
            document.getElementById('token').value = normalizedToken;
            if (normalizedToken) await refreshTwitchAuthFromToken(false);
            localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
            updateSettingsAuthStatus();
            updateTodayDateDisplay();
            closeModal('settingModal');
            showToast(doneText());
            raidSoLog(uiText('runtime.operationLog.settingsSaved'));
            syncRaidSoConnection(false);
        }

        function clearLocalTwitchAuth() {
            const keepClientId = sanitizeTwitchClientId(settings.clientId || document.getElementById('client_id')?.value || '');
            settings = {
                ...settings,
                token: '',
                userId: '',
                userLogin: '',
                clientId: keepClientId
            };
            const tokenInput = document.getElementById('token');
            const userIdInput = document.getElementById('user_id');
            const userLoginInput = document.getElementById('user_login');
            const clientIdInput = document.getElementById('client_id');
            if (tokenInput) tokenInput.value = '';
            if (userIdInput) userIdInput.value = '';
            if (userLoginInput) userLoginInput.value = '';
            if (clientIdInput) clientIdInput.value = keepClientId;
            localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
            updateSettingsAuthStatus();
        }

        function stopAllTwitchConnectionsForAuthClear() {
            try { if (typeof disconnectRaidSo === 'function') disconnectRaidSo(); } catch (e) { console.warn('Raid/SO disconnect failed:', e); }
            try { if (typeof disconnectEventSub === 'function') disconnectEventSub(); } catch (e) { console.warn('Supporter EventSub disconnect failed:', e); }
            try {
                if (typeof _streamCheckInterval !== 'undefined' && _streamCheckInterval) {
                    clearInterval(_streamCheckInterval);
                    _streamCheckInterval = null;
                }
            } catch (e) { console.warn('Stream polling stop failed:', e); }
        }

        async function revokeTwitchAuth() {
            const ui = langMap[currentLang]?.settingsUi || langMap.ja.settingsUi;
            const token = extractTwitchAccessToken(settings.token || document.getElementById('token')?.value || '');
            const clientId = getClientIdFromInputOrDefault();
            const hasLocalAuth = Boolean(token || settings.userId || settings.userLogin);
            if (!hasLocalAuth) {
                clearLocalTwitchAuth();
                showToast(ui.revokeAuthMissing || 'ローカル認証情報を削除しました。', 'info');
                return;
            }
            const ok = await customConfirm({
                title: ui.revokeAuthConfirmTitle || 'Twitch認証解除',
                message: ui.revokeAuthConfirmMessage || '保存済みAccess TokenをTwitch側で失効させ、このHTML内の認証情報も削除します。続行しますか？'
            });
            if (!ok) return;
            const btn = document.getElementById('ui-settings-revoke-auth-btn');
            if (btn) { btn.disabled = true; btn.style.opacity = '0.55'; }
            let remoteRevoked = false;
            let remoteInvalid = false;
            if (token && clientId) {
                try {
                    const body = new URLSearchParams();
                    body.set('client_id', clientId);
                    body.set('token', token);
                    const res = await fetch('https://id.twitch.tv/oauth2/revoke', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body
                    });
                    if (res.ok) remoteRevoked = true;
                    else if (res.status === 400 || res.status === 401) remoteInvalid = true;
                } catch (e) {
                    console.warn('Twitch token revoke failed:', e);
                }
            }
            stopAllTwitchConnectionsForAuthClear();
            clearLocalTwitchAuth();
            syncRaidSoConnection(false);
            try { if (typeof renderRaidSoStatus === 'function') renderRaidSoStatus(); } catch (e) {}
            try { if (typeof renderEventSubUI === 'function') renderEventSubUI(); } catch (e) {}
            const message = remoteRevoked
                ? (ui.revokeAuthSuccess || 'Twitch認証を解除しました。')
                : remoteInvalid
                    ? (ui.revokeAuthInvalid || '保存済みTokenは既に無効です。ローカル認証情報を削除しました。')
                    : (ui.revokeAuthLocalOnly || 'Twitch側の解除は未確認です。ローカル認証情報を削除しました。');
            showToast(message, remoteRevoked || remoteInvalid ? 'success' : 'info');
            raidSoLog(message, remoteRevoked || remoteInvalid ? 'info' : 'warn');
        }
        function togglePasswordVisibility() { const tokenInput = document.getElementById('token'); tokenInput.type = tokenInput.type === 'password' ? 'text' : 'password'; }

        const RAIDSO_STORAGE_KEY = 'stream_raidso_settings_v1';
        const RAIDSO_CUSTOM_TEMPLATES_KEY = 'stream_raidso_custom_templates_v1';
        const RAIDSO_LOG_STORAGE_KEY = 'stream_operation_logs_v16';
        const RAIDSO_LOG_LIMIT = 200;
        const RAIDSO_EVENTSUB_WS = 'wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30';
        const TWITCH_TOKEN_GENERATOR_URL = 'https://twitchtokengenerator.com/';
        // アクセストークン検証時にTwitchからclient_idを取得します。必要な場合のみ内部で保持します。
        const TITLE_DOCK_DEFAULT_CLIENT_ID = '';
        const RAIDSO_REQUIRED_SCOPES = [
            'user:read:chat',
            'user:write:chat',
            'bits:read',
            'channel:read:subscriptions',
            'channel:read:hype_train',
            'channel:read:redemptions',
            'channel:read:vips',
            'channel:manage:vips',
            'channel:manage:polls',
            'channel:manage:predictions',
            'channel:manage:raids',
            'clips:edit',
            'moderator:read:followers',
            'moderator:manage:announcements',
            'moderator:manage:chat_messages',
            'moderator:manage:chat_settings',
            'moderator:manage:shoutouts'
        ];
        const TITLE_DOCK_REQUIRED_SCOPES = ['channel:manage:broadcast', ...RAIDSO_REQUIRED_SCOPES];

        function getEffectiveTwitchClientId() {
            return sanitizeTwitchClientId(settings.clientId || TITLE_DOCK_DEFAULT_CLIENT_ID || '');
        }

        function getClientIdFromInputOrDefault() {
            return sanitizeTwitchClientId(document.getElementById('client_id')?.value || settings.clientId || TITLE_DOCK_DEFAULT_CLIENT_ID || '');
        }
        const RAIDSO_DEFAULT_SOUND_FILES = [
            'sounds/001_picon_down.wav',
            'sounds/001_picoon_down.wav',
            'sounds/001_powa.wav',
            'sounds/001_pyowan_up.wav',
            'sounds/002_talk_1.wav',
            'sounds/002_talk_2.wav',
            'sounds/002_talk_3_low.wav',
            'sounds/003_click.wav',
            'sounds/003_clickB.wav',
            'sounds/004_noise_high.wav',
            'sounds/005_flag_high.wav',
            'sounds/005_flag_middle.wav',
            'sounds/005_flag_middle2.wav',
            'sounds/006_door_locked.wav',
            'sounds/006_door_open2.wav',
            'sounds/006_door_unlocked.wav',
            'sounds/beep.wav',
            'sounds/BGM_ending.wav',
            'sounds/BGM_main.wav',
            'sounds/BGM_main2.wav',
            'sounds/BGM_title.wav',
            'sounds/comment-notification.wav',
            'sounds/raidbeep.wav',
            'sounds/se_balloon_pop.wav',
            'sounds/se_box_close.wav',
            'sounds/se_box_key_drop.wav',
            'sounds/se_box_open.wav',
            'sounds/se_clock_hand_get.wav',
            'sounds/se_clock.wav',
            'sounds/se_key_drop.wav',
            'sounds/se_key_get.wav',
            'sounds/se_scissors.wav'
        ];
        const RAIDSO_TEMPLATE_PRESET_IDS = ['classic', 'simple', 'polite', 'energetic', 'stream-focus', 'bilingual'];
        const RAIDSO_RAID_TEMPLATE_PRESETS = RAIDSO_TEMPLATE_PRESET_IDS.map(id => ({
            id,
            labels: Object.fromEntries(Object.entries(I18N_DATA).map(([lang, data]) => [
                lang,
                data.ui.raidSo.templatePresets[id].label
            ])),
            templates: Object.fromEntries(Object.entries(I18N_DATA).map(([lang, data]) => [
                lang,
                {
                    raid: data.ui.raidSo.templatePresets[id].raid,
                    manual: data.ui.raidSo.templatePresets[id].manual
                }
            ]))
        }));
        const RAIDSO_DEFAULT_RAID_TEMPLATE = I18N_DATA.ja.ui.raidSo.templatePresets.classic.raid;
        const RAIDSO_DEFAULT_MANUAL_TEMPLATE = I18N_DATA.ja.ui.raidSo.templatePresets.classic.manual;
        const RAIDSO_DEFAULT_TEMPLATE_PRESET = RAIDSO_RAID_TEMPLATE_PRESETS.find(preset => preset.id === 'simple') || RAIDSO_RAID_TEMPLATE_PRESETS[0];
        const RAIDSO_DEFAULT_TEMPLATE_SET = RAIDSO_DEFAULT_TEMPLATE_PRESET.templates[currentLang] || RAIDSO_DEFAULT_TEMPLATE_PRESET.templates.ja;
        function loadRaidSoLogs() {
            try {
                const stored = JSON.parse(localStorage.getItem(RAIDSO_LOG_STORAGE_KEY) || '[]');
                return Array.isArray(stored)
                    ? stored.filter(item => item && typeof item.message === 'string').slice(0, RAIDSO_LOG_LIMIT)
                    : [];
            } catch (error) {
                console.warn('Operation logs could not be loaded:', error);
                return [];
            }
        }

        function loadRaidSoSettings() {
            try {
                const loaded = { ...RAIDSO_DEFAULTS, ...(JSON.parse(localStorage.getItem(RAIDSO_STORAGE_KEY) || '{}')) };
                if (loaded.firstCommentSoundFile === 'sounds/legacy-default.wav') {
                    loaded.firstCommentSoundFile = RAIDSO_DEFAULTS.firstCommentSoundFile;
                }
                return loaded;
            } catch (e) {
                return { ...RAIDSO_DEFAULTS };
            }
        }

        function loadRaidSoCustomTemplates() {
            try {
                const list = JSON.parse(localStorage.getItem(RAIDSO_CUSTOM_TEMPLATES_KEY) || '[]');
                return Array.isArray(list) ? list.filter(item => item && item.name && typeof item.raid === 'string' && typeof item.manual === 'string') : [];
            } catch (e) {
                return [];
            }
        }

        function saveRaidSoCustomTemplates() {
            localStorage.setItem(RAIDSO_CUSTOM_TEMPLATES_KEY, JSON.stringify(customRaidSoTemplates));
        }

        function saveRaidSoSettings(show = true) {
            collectRaidSoSettings();
            localStorage.setItem(RAIDSO_STORAGE_KEY, JSON.stringify(raidSoSettings));
            if (show) {
                showToast(doneText());
                raidSoLog(uiText('runtime.operationLog.raidSettingsSaved'));
            }
            renderRaidSoStatus();
        }

        function normalizeSupporterLogin(value) {
            const raw = String(value || '').trim();
            const match = raw.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
            return (match ? match[1] : raw).replace(/^@/, '').toLowerCase();
        }

        function ensureSupporterSettings() {
            settings.supporterCategories = {
                ...SUPPORTER_CATEGORY_DEFAULTS,
                ...(settings.supporterCategories && typeof settings.supporterCategories === 'object' ? settings.supporterCategories : {})
            };
            settings.supporterExcludedUsers = String(settings.supporterExcludedUsers || '');
            settings.supporterHonorificEnabled = settings.supporterHonorificEnabled === true;
        }

        function isSupporterCategoryEnabled(category) {
            ensureSupporterSettings();
            return settings.supporterCategories[category] !== false;
        }

        function supporterExcludedIds() {
            ensureSupporterSettings();
            return new Set(settings.supporterExcludedUsers
                .split(/[\s,、]+/)
                .map(normalizeSupporterLogin)
                .filter(Boolean));
        }

        function isSupporterExcluded(...values) {
            const excluded = supporterExcludedIds();
            const broadcasterId = String(settings.userId || '');
            const broadcasterLogin = normalizeSupporterLogin(settings.userLogin);
            return values.some(value => {
                const raw = String(value || '').trim();
                const login = normalizeSupporterLogin(raw);
                return (broadcasterId && raw === broadcasterId)
                    || (broadcasterLogin && login === broadcasterLogin)
                    || (login && excluded.has(login));
            });
        }

        function canAddSupporter(category, ...identifiers) {
            return isSupporterCategoryEnabled(category) && !isSupporterExcluded(...identifiers);
        }

        function updateSupporterCategoryVisibility() {
            ensureSupporterSettings();
            document.querySelectorAll('[data-supporter-category]').forEach(card => {
                const category = card.dataset.supporterCategory;
                const enabled = isSupporterCategoryEnabled(category);
                card.classList.toggle('is-disabled', !enabled);
                const input = document.getElementById(`supporter-cat-${category}`);
                if (input) input.checked = enabled;
            });
        }

        function restoreSupporterControls() {
            ensureSupporterSettings();
            updateSupporterCategoryVisibility();
            const excludedInput = document.getElementById('supporter-excluded-users');
            if (excludedInput) excludedInput.value = settings.supporterExcludedUsers;
            const honorificToggle = document.getElementById('supporter-honorific-enabled');
            if (honorificToggle) honorificToggle.checked = settings.supporterHonorificEnabled === true;
        }

        function saveSupporterCategorySetting(category, checked) {
            ensureSupporterSettings();
            if (!Object.prototype.hasOwnProperty.call(SUPPORTER_CATEGORY_DEFAULTS, category)) return;
            settings.supporterCategories[category] = Boolean(checked);
            safeSetLocal('stream_settings_v16', JSON.stringify(settings));
            updateSupporterCategoryVisibility();
            updatePostPreview();
        }

        function saveSupporterExcludedUsers(value) {
            ensureSupporterSettings();
            settings.supporterExcludedUsers = String(value || '');
            safeSetLocal('stream_settings_v16', JSON.stringify(settings));
        }

        function saveSupporterHonorificSetting(checked) {
            ensureSupporterSettings();
            settings.supporterHonorificEnabled = Boolean(checked);
            safeSetLocal('stream_settings_v16', JSON.stringify(settings));
            updatePostPreview();
        }

        function saveSupporterResetSetting(checked) {
            settings.supporterResetOnStreamStart = Boolean(checked);
            localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
            raidSoLog(uiText(checked ? 'runtime.operationLog.resetSettingOn' : 'runtime.operationLog.resetSettingOff'));
        }

        // === Favorite Clips Logic ===
        function getStoredFavClips() {
            try {
                const value = JSON.parse(localStorage.getItem('stream_fav_clips_v16') || '[]');
                return Array.isArray(value) ? value : [];
            } catch (e) {
                console.warn('Favorite clip data could not be read:', e);
                return [];
            }
        }

        function saveFavClip(url, title) {
            if (!url) return;
            title = title || twExt('favoriteClipTitle');
            const favs = getStoredFavClips();
            if (!favs.find(f => f.url === url)) {
                favs.push({ id: Date.now().toString(), url, title, added_at: new Date().toISOString() });
                safeSetLocal('stream_fav_clips_v16', JSON.stringify(favs));
                showToast(twExt('favAddedToast'), 'success');
            } else {
                showToast(twExt('favExistsToast'), 'error');
            }
        }

        function addFavClipManual() {
            const urlInput = document.getElementById('tw-fav-clip-url');
            const url = urlInput.value.trim();
            let parsedUrl;
            try {
                parsedUrl = new URL(url);
            } catch (e) {
                return customAlert(twExt('invalidClipUrl'));
            }
            const hostname = parsedUrl.hostname.toLowerCase();
            if (parsedUrl.protocol !== 'https:' || (hostname !== 'clips.twitch.tv' && !hostname.endsWith('.twitch.tv'))) {
                return customAlert(twExt('invalidClipUrl'));
            }
            saveFavClip(url, twExt('savedClipLabel'));
            urlInput.value = '';
            loadFavClips();
        }

        function loadFavClips() {
            const c = document.getElementById('tw-clip-result');
            const favs = getStoredFavClips();
            if (favs.length === 0) {
                c.innerHTML = `<p style="color:#888;font-size:11px;">${raidSoEscape(twExt('noFavClips'))}</p>`;
                return;
            }
            
            favs.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
            
            c.innerHTML = `<div class="tw-clip-list">${favs.map(clip => {
                const safeTitle = raidSoEscape(clip.title || twExt('clipUntitled'));
                const safeUrl = raidSoEscape(clip.url || '');
                const safeId = raidSoEscape(clip.id || '');
                const addedDate = raidSoEscape(typeof clip.added_at === 'string' ? clip.added_at.slice(0, 10) : '-');
                return `
                <article class="tw-clip-card is-favorite">
                    <div class="tw-clip-field">
                        <span class="tw-clip-label">${raidSoEscape(twExt('clipTitleLabel'))}</span>
                        <span class="tw-clip-title">${safeTitle}</span>
                        <span class="tw-clip-meta">${raidSoEscape(twExt('addedOn'))}: ${addedDate}</span>
                    </div>
                    <div class="tw-clip-field tw-clip-url-box">
                        <span class="tw-clip-label">${raidSoEscape(twExt('clipUrlLabel'))}</span>
                        <a class="tw-clip-url" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>
                    </div>
                    <div class="tw-clip-actions">
                        <button class="btn-secondary" data-url="${safeUrl}" onclick="copyClipFromButton(this)">${raidSoEscape(twExt('copyShort'))}</button>
                        <button class="btn-secondary" style="background:rgba(255,100,100,0.1);color:#ff6b6b;" data-id="${safeId}" onclick="deleteFavClipFromButton(this)">×${raidSoEscape(twExt('removeShort'))}</button>
                    </div>
                </article>`;
            }).join('')}</div>`;
        }

        function deleteFavClip(id) {
            let favs = getStoredFavClips();
            favs = favs.filter(f => f.id !== id);
            safeSetLocal('stream_fav_clips_v16', JSON.stringify(favs));
            loadFavClips();
        }




function getStoredRaidSoSoundFiles() {
            return uniqueRaidSoSoundSources(Array.isArray(raidSoSettings.soundFiles) ? raidSoSettings.soundFiles : []);
        }
