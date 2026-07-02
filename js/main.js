
    const DATE_FORMAT_VALUES = ['MM/DD', 'M/D', 'MM月DD日', 'YYYY/MM/DD', 'YYYY年MM月DD日', 'YY/MM/DD', 'YY年MM月DD日', 'M-D-W'];

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
        else fn();
    }

    function getSettingsUi() {
        return (langMap?.[currentLang]?.settingsUi) || langMap?.ja?.settingsUi || {};
    }

    function getIdText() {
        return (langMap?.[currentLang]?.idList) || langMap?.ja?.idList || {};
    }

    function safeNormalizeLogin(value) {
        try {
            if (typeof normalizeFriendTwitch === 'function') return normalizeFriendTwitch(value);
            if (typeof normalizeRaidSoLogin === 'function') return normalizeRaidSoLogin(value);
        } catch (e) {}
        return String(value || '')
            .trim()
            .replace(/^@/, '')
            .replace(/^https?:\/\/(?:www\.)?twitch\.tv\//i, '')
            .split(/[/?#]/)[0]
            .toLowerCase();
    }

    function escapeHtml(value) {
        if (typeof raidSoEscape === 'function') return raidSoEscape(value);
        return String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    }

    function setupDateFormatSelect() {
        const input = document.getElementById('date_format');
        if (!input) return;
        input.removeAttribute('list');
        let select = document.getElementById('date_format_preset');
        if (!select) {
            select = document.createElement('select');
            select.id = 'date_format_preset';
            select.setAttribute('aria-label', '日付形式プリセット');
            select.style.width = '100%';
            select.style.background = 'var(--bg-base)';
            select.style.border = '1px solid var(--border-color)';
            select.style.color = 'var(--text-main)';
            select.style.padding = '10px';
            select.style.borderRadius = '8px';
            select.style.fontSize = '13px';
            select.style.outline = 'none';
            input.parentNode.insertBefore(select, input);
            select.addEventListener('change', () => {
                if (select.value === '__custom__') return;
                input.value = select.value;
                if (typeof handleDateFormatPreview === 'function') handleDateFormatPreview(select.value);
                settings = { ...settings, dateFormat: select.value };
            });
            input.addEventListener('input', () => syncDateFormatSelectValue());
        }
        updateDateFormatSelectOptions();
        syncDateFormatSelectValue();
    }

    function updateDateFormatSelectOptions() {
        const select = document.getElementById('date_format_preset');
        if (!select) return;
        const L = langMap?.[currentLang] || langMap?.ja || {};
        const labels = L.dateFormatOptions || {};
        const current = select.value;
        const customLabel = currentLang === 'en' ? 'Custom' : (currentLang === 'zh' ? '自定义' : 'カスタム');
        select.innerHTML = DATE_FORMAT_VALUES.map(value => {
            const label = labels[value] ? `${labels[value]} (${value})` : value;
            return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
        }).join('') + `<option value="__custom__">${escapeHtml(customLabel)}</option>`;
        select.value = current || DATE_FORMAT_VALUES[0];
        syncDateFormatSelectValue();
    }

    function syncDateFormatSelectValue() {
        const input = document.getElementById('date_format');
        const select = document.getElementById('date_format_preset');
        if (!input || !select) return;
        const value = String(input.value || settings?.dateFormat || 'MM/DD');
        select.value = DATE_FORMAT_VALUES.includes(value) ? value : '__custom__';
    }

    window.setupDateFormatSelect = setupDateFormatSelect;
    window.updateDateFormatSelectOptions = updateDateFormatSelectOptions;
    window.syncDateFormatSelectValue = syncDateFormatSelectValue;

    function removeAuthenticatedUserIdList() {
        try {
            if (!Array.isArray(friendsConfig)) return false;
            const before = JSON.stringify(friendsConfig);
            friendsConfig = friendsConfig.filter(cat => cat?.kind !== 'authenticated-user');
            const changed = JSON.stringify(friendsConfig) !== before;
            if (changed) {
                if (typeof saveFriendsLocal === 'function') saveFriendsLocal(false);
                if (typeof renderFriends === 'function') renderFriends();
            }
            return changed;
        } catch (e) {
            console.warn('removeAuthenticatedUserIdList failed:', e);
            return false;
        }
    }
    window.removeAuthenticatedUserIdList = removeAuthenticatedUserIdList;

    const originalClearLocalTwitchAuth = clearLocalTwitchAuth;
    clearLocalTwitchAuth = function clearLocalTwitchAuthV5() {
        removeAuthenticatedUserIdList();
        if (typeof originalClearLocalTwitchAuth === 'function') return originalClearLocalTwitchAuth.apply(this, arguments);
        const keepClientId = typeof sanitizeTwitchClientId === 'function'
            ? sanitizeTwitchClientId(settings?.clientId || document.getElementById('client_id')?.value || '')
            : (settings?.clientId || document.getElementById('client_id')?.value || '');
        settings = { ...(settings || {}), token: '', userId: '', userLogin: '', clientId: keepClientId };
        ['token', 'user_id', 'user_login'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const clientInput = document.getElementById('client_id');
        if (clientInput) clientInput.value = keepClientId;
        localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
        updateSettingsAuthStatus();
    };

    async function authenticateTwitchFromSettings() {
        const ui = getSettingsUi();
        const tokenInput = document.getElementById('token');
        const token = typeof extractTwitchAccessToken === 'function'
            ? extractTwitchAccessToken(tokenInput?.value || settings?.token || '')
            : String(tokenInput?.value || settings?.token || '').replace(/^oauth:/i, '').trim();
        if (!token) {
            await customAlert?.(ui.tokenMissing || 'Access Tokenを入力してください。');
            return;
        }
        const btn = document.getElementById('ui-settings-revoke-auth-btn');
        const oldText = btn?.innerText;
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.55';
            btn.innerText = ui.authChecking || '認証中...';
        }
        try {
            settings = {
                ...(settings || {}),
                token,
                redirectUri: typeof getOAuthRedirectUri === 'function' ? getOAuthRedirectUri() : 'http://localhost',
                clientId: typeof getClientIdFromInputOrDefault === 'function' ? getClientIdFromInputOrDefault() : (document.getElementById('client_id')?.value || '')
            };
            if (tokenInput) tokenInput.value = token;
            const data = typeof refreshTwitchAuthFromToken === 'function'
                ? await refreshTwitchAuthFromToken(true)
                : null;
            if (!data) return;
            localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
            if (typeof ensureAuthenticatedUserIdList === 'function') ensureAuthenticatedUserIdList();
            if (typeof renderFriends === 'function') renderFriends();
            if (typeof updateSettingsAuthStatus === 'function') updateSettingsAuthStatus();
            showToast?.(ui.authSuccess || 'Twitch認証を保存しました。', 'success');
            try { if (typeof syncRaidSoConnection === 'function') syncRaidSoConnection(false); } catch (e) {}
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerText = oldText || btn.innerText;
            }
            updateSettingsAuthStatus();
        }
    }
    window.authenticateTwitchFromSettings = authenticateTwitchFromSettings;

    function ensureDangerModal() {
        let overlay = document.getElementById('tmd-danger-overlay');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'tmd-danger-overlay';
        overlay.className = 'tmd-danger-overlay';
        overlay.innerHTML = `
            <div class="tmd-danger-dialog" role="dialog" aria-modal="true" aria-labelledby="tmd-danger-title">
                <h3 class="tmd-danger-title" id="tmd-danger-title"></h3>
                <div class="tmd-danger-message" id="tmd-danger-message"></div>
                <div class="tmd-danger-actions">
                    <button type="button" class="btn-secondary tmd-danger-cancel" id="tmd-danger-cancel">キャンセル</button>
                    <button type="button" class="btn-primary tmd-danger-ok" id="tmd-danger-ok">認証を解除する</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        return overlay;
    }

    function showRevokeDangerConfirm() {
        const ui = getSettingsUi();
        const overlay = ensureDangerModal();
        const title = overlay.querySelector('#tmd-danger-title');
        const message = overlay.querySelector('#tmd-danger-message');
        const cancel = overlay.querySelector('#tmd-danger-cancel');
        const ok = overlay.querySelector('#tmd-danger-ok');
        title.innerText = ui.revokeAuthConfirmTitle || 'Twitch認証を解除';
        message.innerText = ui.revokeAuthConfirmMessageShort || 'Twitch認証を解除します。\n\n保存済みAccess Tokenを無効化します。\n無効化後は再利用できません。\n\n再度使うには、Access Tokenを作り直してください。\nこの操作は取り消せません。';
        cancel.innerText = langMap?.[currentLang]?.cancel || langMap?.ja?.cancel || 'キャンセル';
        ok.innerText = ui.revokeAuthConfirmOk || '認証を解除する';
        return new Promise(resolve => {
            const close = result => {
                overlay.classList.remove('show');
                cancel.onclick = null;
                ok.onclick = null;
                overlay.onclick = null;
                document.removeEventListener('keydown', onKeyDown);
                resolve(result);
            };
            const onKeyDown = event => {
                if (event.key === 'Escape') close(false);
            };
            cancel.onclick = () => close(false);
            ok.onclick = () => close(true);
            overlay.onclick = event => { if (event.target === overlay) close(false); };
            document.addEventListener('keydown', onKeyDown);
            overlay.classList.add('show');
            setTimeout(() => cancel.focus(), 30);
        });
    }
    window.showRevokeDangerConfirm = showRevokeDangerConfirm;

    revokeTwitchAuth = async function revokeTwitchAuthV5() {
        const ui = getSettingsUi();
        const token = typeof extractTwitchAccessToken === 'function'
            ? extractTwitchAccessToken(settings?.token || document.getElementById('token')?.value || '')
            : String(settings?.token || document.getElementById('token')?.value || '').replace(/^oauth:/i, '').trim();
        const clientId = typeof getClientIdFromInputOrDefault === 'function'
            ? getClientIdFromInputOrDefault()
            : (document.getElementById('client_id')?.value || settings?.clientId || '');
        const hasLocalAuth = Boolean(token || settings?.userId || settings?.userLogin);
        if (!hasLocalAuth) {
            clearLocalTwitchAuth?.();
            showToast?.(ui.revokeAuthMissing || 'ローカル認証情報を削除しました。', 'info');
            return;
        }
        const ok = await showRevokeDangerConfirm();
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
        try { if (typeof stopAllTwitchConnectionsForAuthClear === 'function') stopAllTwitchConnectionsForAuthClear(); } catch (e) {}
        clearLocalTwitchAuth?.();
        try { if (typeof syncRaidSoConnection === 'function') syncRaidSoConnection(false); } catch (e) {}
        try { if (typeof renderRaidSoStatus === 'function') renderRaidSoStatus(); } catch (e) {}
        try { if (typeof renderEventSubUI === 'function') renderEventSubUI(); } catch (e) {}
        const message = remoteRevoked
            ? (ui.revokeAuthSuccess || 'Twitch認証を解除しました。')
            : remoteInvalid
                ? (ui.revokeAuthInvalid || '保存済みTokenは既に無効です。ローカル認証情報を削除しました。')
                : (ui.revokeAuthLocalOnly || 'Twitch側の解除は未確認です。ローカル認証情報を削除しました。');
        showToast?.(message, remoteRevoked || remoteInvalid ? 'success' : 'info');
        try { if (typeof raidSoLog === 'function') raidSoLog(message, remoteRevoked || remoteInvalid ? 'info' : 'warn'); } catch (e) {}
        updateSettingsAuthStatus();
    };

    updateSettingsAuthStatus = function updateSettingsAuthStatusV5() {
        const el = document.getElementById('ui-settings-auth-status');
        const ui = getSettingsUi();
        const login = settings?.userLogin || settings?.userId || '';
        if (el) {
            el.innerText = login ? (ui.authStatusReady || '{login}').replace('{login}', login) : (ui.authStatusEmpty || '');
            el.classList.toggle('is-ready', Boolean(login));
            el.classList.toggle('is-warning', !login);
        }
        const row = document.getElementById('ui-settings-revoke-auth-btn')?.parentElement;
        if (row) row.classList.add('auth-action-row');
        const btn = document.getElementById('ui-settings-revoke-auth-btn');
        if (!btn) return;
        const token = typeof extractTwitchAccessToken === 'function'
            ? extractTwitchAccessToken(document.getElementById('token')?.value || settings?.token || '')
            : String(document.getElementById('token')?.value || settings?.token || '').replace(/^oauth:/i, '').trim();
        const isAuthed = Boolean(login);
        btn.classList.add('auth-action-toggle');
        btn.classList.toggle('is-authenticate', !isAuthed);
        btn.classList.toggle('is-revoke', isAuthed);
        btn.innerText = isAuthed ? (ui.revokeAuth || 'Twitch認証を解除') : (ui.authenticateNow || '認証する');
        btn.disabled = !isAuthed && !token;
        btn.style.opacity = btn.disabled ? '0.45' : '1';
        btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';
        btn.onclick = isAuthed ? revokeTwitchAuth : authenticateTwitchFromSettings;
    };

    const originalGetShoutoutSuggestionItems = getShoutoutSuggestionItems;
    getShoutoutSuggestionItems = function getShoutoutSuggestionItemsV5() {
        const map = new Map();
        const selfLogin = safeNormalizeLogin(settings?.userLogin || '');
        for (const category of friendsConfig || []) {
            if (category?.kind === 'authenticated-user') continue;
            const isHistoryCategory = category?.kind === 'shoutout-history';
            for (const friend of category?.friends || []) {
                const login = safeNormalizeLogin(friend?.twitch || friend?.username || friend?.url || '');
                if (!login || login === selfLogin) continue;
                if (typeof isValidShoutoutLogin === 'function' && !isValidShoutoutLogin(login)) continue;
                const displayName = String(friend?.name || friend?.displayName || '').trim();
                const shoutoutCount = Number(friend?.shoutoutCount || 0);
                const lastShoutoutAt = friend?.lastShoutoutAt || '';
                const categoryName = String(category?.name || '');
                const existing = map.get(login);
                if (!existing) {
                    map.set(login, { login, displayName, shoutoutCount, lastShoutoutAt, isHistoryCategory, categoryName });
                    continue;
                }
                if (!existing.displayName && displayName) existing.displayName = displayName;
                existing.shoutoutCount = Math.max(Number(existing.shoutoutCount || 0), shoutoutCount);
                if (String(lastShoutoutAt || '').localeCompare(String(existing.lastShoutoutAt || '')) > 0) existing.lastShoutoutAt = lastShoutoutAt;
                existing.isHistoryCategory = existing.isHistoryCategory || isHistoryCategory;
                if (!existing.categoryName && categoryName) existing.categoryName = categoryName;
            }
        }
        const items = Array.from(map.values());
        if (!items.length && typeof originalGetShoutoutSuggestionItems === 'function') {
            return originalGetShoutoutSuggestionItems.call(this).filter(item => item.login !== selfLogin);
        }
        return items.sort((a, b) => {
            if (a.isHistoryCategory !== b.isHistoryCategory) return a.isHistoryCategory ? -1 : 1;
            const dateCompare = String(b.lastShoutoutAt || '').localeCompare(String(a.lastShoutoutAt || ''));
            if (dateCompare) return dateCompare;
            return (b.shoutoutCount || 0) - (a.shoutoutCount || 0)
                || String(a.categoryName || '').localeCompare(String(b.categoryName || ''))
                || String(a.login || '').localeCompare(String(b.login || ''));
        });
    };

    async function resetFriendShoutoutHistory(ci, fi) {
        const friend = friendsConfig?.[ci]?.friends?.[fi];
        if (!friend) return;
        const name = friend.name || friend.twitch || '';
        const ok = await customConfirm?.({
            title: getIdText().resetShoutoutTitle || '紹介履歴をリセット',
            message: (getIdText().resetShoutoutMessage || 'このIDの紹介回数と最終紹介日時をリセットします。').replace('{name}', name)
        });
        if (!ok) return;
        friend.shoutoutCount = 0;
        friend.lastShoutoutAt = '';
        if (typeof saveFriendsLocal === 'function') saveFriendsLocal(false);
        if (typeof renderFriends === 'function') renderFriends();
        showToast?.(getIdText().resetShoutoutDone || '紹介履歴をリセットしました。', 'success');
    }
    window.resetFriendShoutoutHistory = resetFriendShoutoutHistory;

    const originalRenderFriends = renderFriends;
    renderFriends = function renderFriendsV5() {
        if (typeof originalRenderFriends === 'function') originalRenderFriends.apply(this, arguments);
        document.querySelectorAll('#friends-container .record-card').forEach(card => {
            const idAttr = card.getAttribute('id') || '';
            const match = idAttr.match(/^friend-card-(\d+)-(\d+)$/);
            if (!match) return;
            const ci = Number(match[1]);
            const fi = Number(match[2]);
            const isSelf = friendsConfig?.[ci]?.kind === 'authenticated-user';
            if (isSelf) return;
            const body = card.querySelector('.record-body');
            const friend = friendsConfig?.[ci]?.friends?.[fi];
            if (!body || !friend || body.querySelector('.id-history-actions')) return;
            const hasHistory = Boolean(Number(friend.shoutoutCount || 0) || friend.lastShoutoutAt);
            const wrap = document.createElement('div');
            wrap.className = 'id-history-actions';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-outline id-history-reset-btn';
            btn.innerText = getIdText().resetShoutout || '紹介履歴リセット';
            btn.disabled = !hasHistory;
            btn.onclick = event => {
                event.stopPropagation();
                resetFriendShoutoutHistory(ci, fi);
            };
            wrap.appendChild(btn);
            body.insertBefore(wrap, body.firstChild);
        });
    };

    function updateDockLayoutMetrics() {
        const root = document.documentElement;
        const active = document.querySelector('.tab-content.active');
        const footer = active?.querySelector('.sticky-footer-wrapper');
        const footerHeight = footer ? Math.ceil(footer.getBoundingClientRect().height) : 0;
        root.style.setProperty('--dock-footer-height', `${footerHeight}px`);
    }
    window.updateDockLayoutMetrics = updateDockLayoutMetrics;

    const originalSwitchTab = switchTab;
    switchTab = function switchTabV5(id, b) {
        const result = typeof originalSwitchTab === 'function' ? originalSwitchTab.apply(this, arguments) : undefined;
        requestAnimationFrame(updateDockLayoutMetrics);
        return result;
    };
    if (typeof twToggle === 'function') {
        const originalTwToggle = twToggle;
        twToggle = function twToggleV5() {
            const result = originalTwToggle.apply(this, arguments);
            requestAnimationFrame(updateDockLayoutMetrics);
            return result;
        };
    }
    if (typeof render === 'function') {
        const originalRender = render;
        render = function renderV5() {
            const result = originalRender.apply(this, arguments);
            requestAnimationFrame(updateDockLayoutMetrics);
            return result;
        };
    }
    if (typeof renderMemo === 'function') {
        const originalRenderMemo = renderMemo;
        renderMemo = function renderMemoV5() {
            const result = originalRenderMemo.apply(this, arguments);
            requestAnimationFrame(updateDockLayoutMetrics);
            return result;
        };
    }
    if (typeof renderRaidShoutOutPanel === 'function') {
        const originalRenderRaidShoutOutPanel = renderRaidShoutOutPanel;
        renderRaidShoutOutPanel = function renderRaidShoutOutPanelV5() {
            const result = originalRenderRaidShoutOutPanel.apply(this, arguments);
            requestAnimationFrame(updateDockLayoutMetrics);
            return result;
        };
    }

    const originalSetLanguage = setLanguage;
    setLanguage = function setLanguageV5() {
        const result = typeof originalSetLanguage === 'function' ? originalSetLanguage.apply(this, arguments) : undefined;
        setupDateFormatSelect();
        updateSettingsAuthStatus();
        requestAnimationFrame(updateDockLayoutMetrics);
        return result;
    };

    const originalOpenModal = openModal;
    openModal = function openModalV5(id) {
        const result = typeof originalOpenModal === 'function' ? originalOpenModal.apply(this, arguments) : document.getElementById(id)?.classList.add('modal-open');
        if (id === 'settingModal') {
            setupDateFormatSelect();
            updateSettingsAuthStatus();
        }
        return result;
    };


    // --- 制作者および外部リンクの動的読み込み機能 ---
    const DYNAMIC_CREATOR_INFO_URL = 'https://raw.githubusercontent.com/uikouka/OBS_title_save/main/creators.json';

    const fallbackCreators = [
        {
            name: "初狐羽鹿",
            color: "#bf94ff",
            avatar: "https://raw.githubusercontent.com/uikouka/OBS_title_save/main/assets/image1.png",
            links: [
                { type: "twitch", url: "https://www.twitch.tv/uikouka", title: "Twitch" },
                { type: "x", url: "https://x.com/uikouka", title: "X" },
                { type: "booth", url: "https://toumei2suisai.booth.pm/", title: "Booth" }
            ]
        },
        {
            name: "古隅フユセ",
            color: "#bf94ff",
            avatar: "https://raw.githubusercontent.com/uikouka/OBS_title_save/main/assets/image2.png",
            links: [
                { type: "twitch", url: "https://www.twitch.tv/frusumi", title: "Twitch" },
                { type: "x", url: "https://x.com/FruEnji", title: "X" },
                { type: "booth", url: "https://frusumi.booth.pm/", title: "Booth" }
            ]
        }
    ];

    let cachedCreatorInfo = null;

    function getCreatorIconSvg(type) {
        switch(type) {
            case 'twitch':
                return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path></svg>';
            case 'x':
                return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M4 4l11.733 16h4.267l-11.733 -16zM4 20l6.768 -6.768m2.46 -2.46L20 4"></path></svg>';
            case 'booth':
                return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
            case 'youtube':
                return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>';
            default:
                return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }
    }

    async function fetchDynamicCreatorInfo() {
        try {
            let response = null;
            try {
                response = await fetch('creators.json');
            } catch (localErr) {
                console.log("Local creators.json not found, falling back to remote.");
            }
            if (!response || !response.ok) {
                response = await fetch(DYNAMIC_CREATOR_INFO_URL);
            }
            if (response && response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.creators)) {
                    cachedCreatorInfo = data;
                    updateCreatorsDOM();
                }
            }
        } catch (e) {
            console.warn("Could not fetch creator info, using fallback:", e);
        }
    }
    window.fetchDynamicCreatorInfo = fetchDynamicCreatorInfo;

    function updateCreatorsDOM() {
        const container = document.getElementById('help-creators-container');
        if (!container) return;

        const data = cachedCreatorInfo || { creators: fallbackCreators };
        const creators = data.creators || [];

        if (creators.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = `
        <div style="font-size: 11px; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; flex-direction: column; gap: 8px;">`;

        creators.forEach(c => {
            const name = c.name || '';
            const color = c.color || '#bf94ff';
            const links = c.links || [];
            const avatarUrl = c.avatar || '';

            let linksHtml = '';
            links.forEach(l => {
                const icon = getCreatorIconSvg(l.type);
                const title = l.title || l.type || 'Link';
                linksHtml += `
                <a href="${l.url}" target="_blank" style="color: var(--text-muted); text-decoration: none; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 4px; transition: 0.2s;" title="${title}" onmouseover="this.style.color='var(--twitch-purple)';this.style.background='var(--bg-item)'" onmouseout="this.style.color='var(--text-muted)';this.style.background='transparent'">
                    ${icon}
                </a>`;
            });

            let localUrl = '';
            if (avatarUrl.includes('/assets/image1.png')) localUrl = '../../images/image1.png';
            else if (avatarUrl.includes('/assets/image2.png')) localUrl = '../../images/image2.png';
            else if (avatarUrl.includes('/assets/image3.png')) localUrl = '../../images/image3.png';
            else if (avatarUrl.includes('/assets/uikouka.png')) localUrl = '../../images/image1.png';
            else if (avatarUrl.includes('/assets/frusumi.png')) localUrl = '../../images/image2.png';

            const avatarHtml = avatarUrl 
                ? `<img src="${localUrl || avatarUrl}" onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried=true;this.src='${avatarUrl}'}else{this.style.display='none'}" style="width:16px;height:16px;border-radius:50%;object-fit:cover;flex-shrink:0;vertical-align:middle;margin-right:4px;border:1px solid var(--border-color);" />`
                : '';

            html += `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: center;">
                    ${avatarHtml}
                    <strong style="color: ${color}; min-width: 70px;">${name}</strong>
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                    ${linksHtml}
                </div>
            </div>`;
        });

        html += `
            </div>
        </div>`;

        container.innerHTML = html;
    }
    window.updateCreatorsDOM = updateCreatorsDOM;

    function applyFontAdjustments(fontSizeOffset, lineHeight) {
        fontSizeOffset = Number(fontSizeOffset || 0);
        lineHeight = Number(lineHeight || 1.5);
        document.documentElement.style.setProperty('--font-size-offset', fontSizeOffset + 'px');
        document.documentElement.style.setProperty('--line-height-adjust', lineHeight);
        const fsVal = document.getElementById('settings_font_size_val');
        if (fsVal) fsVal.innerText = fontSizeOffset;
        const lhVal = document.getElementById('settings_line_height_val');
        if (lhVal) lhVal.innerText = lineHeight;
    }
    window.applyFontAdjustments = applyFontAdjustments;

    function initCustomSlider(wrapperId, thumbId, min, max, step, initialVal, onChange) {
        const wrapper = document.getElementById(wrapperId);
        const thumb = document.getElementById(thumbId);
        if (!wrapper || !thumb) return;

        let currentValue = initialVal;

        function updateValueFromX(clientX) {
            const rect = wrapper.getBoundingClientRect();
            let pct = (clientX - rect.left) / rect.width;
            pct = Math.max(0, Math.min(1, pct));
            
            const rawVal = min + pct * (max - min);
            const steppedVal = Math.round(rawVal / step) * step;
            const decimals = (String(step).split('.')[1] || '').length;
            const fixedVal = parseFloat(steppedVal.toFixed(decimals));
            const clampedVal = Math.max(min, Math.min(max, fixedVal));
            
            setValue(clampedVal);
            if (typeof onChange === 'function') onChange(clampedVal);
        }

        function setValue(val) {
            currentValue = val;
            thumb.dataset.value = val;
            const pct = ((val - min) / (max - min)) * 100;
            thumb.style.left = `${pct}%`;
        }

        setValue(initialVal);

        let isDragging = false;

        wrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateValueFromX(e.clientX);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateValueFromX(e.clientX);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        wrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateValueFromX(e.touches[0].clientX);
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateValueFromX(e.touches[0].clientX);
        }, { passive: false });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        thumb.getValue = () => currentValue;
        thumb.setValue = (val) => setValue(val);
    }
    window.initCustomSlider = initCustomSlider;

    function attachAuthInputListeners() {
        const token = document.getElementById('token');
        const client = document.getElementById('client_id');
        [token, client].forEach(input => {
            if (!input || input.dataset.v5AuthListener === 'true') return;
            input.dataset.v5AuthListener = 'true';
            input.addEventListener('input', () => updateSettingsAuthStatus());
        });
    }

    ready(() => {
        if (typeof initTheme === 'function') initTheme();
        setupDateFormatSelect();
        attachAuthInputListeners();
        updateSettingsAuthStatus();
        try { if (typeof renderFriends === 'function') renderFriends(); } catch (e) {}
        updateDockLayoutMetrics();
        window.addEventListener('resize', updateDockLayoutMetrics);
        if (window.ResizeObserver) {
            const observer = new ResizeObserver(updateDockLayoutMetrics);
            const header = document.querySelector('.sticky-top-wrapper');
            if (header) observer.observe(header);
            document.querySelectorAll('.sticky-footer-wrapper').forEach(el => observer.observe(el));
        }
        document.addEventListener('click', () => requestAnimationFrame(updateDockLayoutMetrics));
    });