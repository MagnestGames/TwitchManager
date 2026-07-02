        // --- 追加機能：Twitch API通信ロジック ---
        const TWITCH_API_BASE = 'https://api.twitch.tv/helix';

        async function apiRequest(endpoint, method = 'GET', body = null, silent = false) {
            const token = extractTwitchAccessToken(settings.token);
            const clientId = getEffectiveTwitchClientId();
            if (!clientId || !token) {
                await customAlert(langMap[currentLang].alerts.requireToken);
                return null;
            }
            const headers = {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            };
            if (body) headers['Content-Type'] = 'application/json';

            try {
                const res = await fetch(`${TWITCH_API_BASE}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null });
                const requestMethod = String(method).toUpperCase();
                const requestEndpoint = String(endpoint || '').split('?')[0];
                if (!res.ok) {
                    const errText = await res.text();
                    if (!silent) {
                        console.error("API Error:", errText);
                    }
                    raidSoLog(uiText('runtime.operationLog.apiFailed', {
                        method: requestMethod,
                        endpoint: requestEndpoint,
                        status: res.status
                    }), 'warn');
                    if (silent) {
                        throw { status: res.status, message: errText };
                    }
                    return null;
                }
                const result = res.status === 204 ? true : await res.json();
                if (requestMethod !== 'GET') {
                    raidSoLog(uiText('runtime.operationLog.apiWrite', {
                        method: requestMethod,
                        endpoint: requestEndpoint
                    }));
                } else if (requestEndpoint !== '/streams') {
                    raidSoLog(uiText('runtime.operationLog.apiRead', { endpoint: requestEndpoint }));
                }
                return result;
            } catch (error) {
                if (!silent) {
                    console.error("Network Error:", error);
                }
                raidSoLog(uiText('runtime.operationLog.apiFailed', {
                    method: String(method).toUpperCase(),
                    endpoint: String(endpoint || '').split('?')[0],
                    status: 'NETWORK'
                }), 'warn');
                return null;
            }
        }

        async function pushToTwitch(ci, ri, btnEl) {
            const originalContent = btnEl.innerHTML;
            btnEl.innerHTML = SPINNER_SVG;
            btnEl.disabled = true;
            btnEl.style.opacity = '0.5';

            if ((!settings.userId || !getEffectiveTwitchClientId()) && cleanRaidSoToken()) await refreshTwitchAuthFromToken(false);
            const record = config[ci].records[ri];
            const broadcasterId = settings.userId;
            if (!broadcasterId) {
                btnEl.innerHTML = originalContent;
                btnEl.disabled = false;
                btnEl.style.opacity = '1';
                return await customAlert(langMap[currentLang].alerts.requireBroadcaster);
            }

            showToast(langMap[currentLang].alerts.pushingTwitch, "info");
            let gameId = "";

            if (record.game) {
                const gameData = await apiRequest(`/games?name=${encodeURIComponent(record.game)}`);
                if (gameData && gameData.data && gameData.data.length > 0) {
                    gameId = gameData.data[0].id;
                } else {
                    await customAlert(langMap[currentLang].alerts.categoryNotFound.replace("{game}", record.game));
                    btnEl.innerHTML = originalContent;
                    btnEl.disabled = false;
                    btnEl.style.opacity = '1';
                    return;
                }
            }

            let finalTitle = record.title || "";
            if (finalTitle.includes('{date}')) {
                finalTitle = finalTitle.replace(/{date}/g, formatDateToken(new Date(), settings.dateFormat || "MM/DD"));
            }

            const body = { title: finalTitle };
            if (gameId) body.game_id = gameId;

            const result = await apiRequest(`/channels?broadcaster_id=${broadcasterId}`, 'PATCH', body);
            if (result) showToast(langMap[currentLang].alerts.pushSuccess, "success");
            else await customAlert(langMap[currentLang].alerts.pushFail);

            btnEl.innerHTML = originalContent;
            btnEl.disabled = false;
            btnEl.style.opacity = '1';
        }

        async function syncWithTwitch(ci, ri, btnEl) {
            const originalContent = btnEl.innerHTML;
            btnEl.innerHTML = SPINNER_SVG;
            btnEl.disabled = true;
            btnEl.style.opacity = '0.5';

            if ((!settings.userId || !getEffectiveTwitchClientId()) && cleanRaidSoToken()) await refreshTwitchAuthFromToken(false);
            const broadcasterId = settings.userId;
            if (!broadcasterId) {
                btnEl.innerHTML = originalContent;
                btnEl.disabled = false;
                btnEl.style.opacity = '1';
                return await customAlert(langMap[currentLang].alerts.requireBroadcaster);
            }

            showToast(langMap[currentLang].alerts.fetchingTwitch, "info");
            const channelData = await apiRequest(`/channels?broadcaster_id=${broadcasterId}`);

            if (channelData && channelData.data && channelData.data.length > 0) {
                const info = channelData.data[0];
                config[ci].records[ri].title = info.title;
                config[ci].records[ri].game = info.game_name;
                saveAllLocal(false);
                render();
                showToast(langMap[currentLang].alerts.syncSuccess, "success");
            } else {
                await customAlert(langMap[currentLang].alerts.syncFail);
            }

            btnEl.innerHTML = originalContent;
            btnEl.disabled = false;
            btnEl.style.opacity = '1';
        }


        // ソート状態管理
        let friendsSortOrder = 'name';
        // --- 各種ボタンの動作（追加ロジック） ---
        async function refreshFriendUserData(ci, fi, btnEl) {
            const friend = friendsConfig[ci]?.friends[fi];
            if (!friend) return;
            const twitchId = normalizeFriendTwitch(friend.twitch);
            if (!twitchId) {
                return showToast('Twitch IDが入力されていません', 'error');
            }

            const originalContent = btnEl.innerHTML;
            btnEl.innerHTML = '<span class="spinner" style="display:inline-block;animation:spin 1s linear infinite;font-size:10px;">⏳</span>';
            btnEl.disabled = true;

            try {
                // Twitch認証トークンの準備
                if ((!settings.userId || !getEffectiveTwitchClientId()) && cleanRaidSoToken()) {
                    await refreshTwitchAuthFromToken(false);
                }
                
                showToast('Twitchから情報を取得中...', 'info');
                const userData = await apiRequest(`/users?login=${encodeURIComponent(twitchId)}`);
                
                if (userData && userData.data && userData.data.length > 0) {
                    const info = userData.data[0];
                    const newDisplayName = info.display_name || info.login || '';
                    
                    let updated = false;

                    // 表示名(Twitch)の更新
                    if (friend.displayName !== newDisplayName) {
                        friend.displayName = newDisplayName;
                        updated = true;
                    }

                    // ニックネームが空の場合、取得した表示名を設定
                    if (!friend.name) {
                        friend.name = newDisplayName;
                        updated = true;
                    }

                    // TwitchIDの大文字小文字をAPI上の正確なログイン名に修正
                    if (friend.twitch !== info.login) {
                        friend.twitch = info.login;
                        updated = true;
                    }

                    // 取得した説明文 (description) にリンクが含まれるか解析（XやYouTubeのリンク補完）
                    const desc = info.description || '';
                    const xMatch = desc.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]{1,15})/i);
                    const ytMatch = desc.match(/(?:youtube\.com|youtu\.be)\/([@a-zA-Z0-9_\.\-]{3,30})/i);

                    if (xMatch && xMatch[1]) {
                        const newX = `https://x.com/${xMatch[1].trim()}`;
                        if (friend.x !== newX) {
                            if (friend.x) {
                                const confirmOverwrite = await customConfirm({
                                    title: 'Xリンクの上書き確認',
                                    message: `現在登録されている「${friend.x}」を、新しく検出した「${newX}」で上書きしますか？`
                                });
                                if (confirmOverwrite) { friend.x = newX; updated = true; }
                            } else {
                                friend.x = newX;
                                updated = true;
                            }
                        }
                    }

                    if (ytMatch && ytMatch[1]) {
                        let newYt = ytMatch[1].trim();
                        // 末尾のピリオドや余分な記号を削除
                        newYt = newYt.replace(/[\.\-]+$/, '');
                        if (!newYt.startsWith('@') && !newYt.startsWith('http')) {
                            newYt = `@${newYt}`;
                        }
                        if (friend.youtube !== newYt) {
                            if (friend.youtube) {
                                const confirmOverwrite = await customConfirm({
                                    title: 'YouTubeリンクの上書き確認',
                                    message: `現在登録されている「${friend.youtube}」を、新しく検出した「${newYt}」で上書きしますか？`
                                });
                                if (confirmOverwrite) { friend.youtube = newYt; updated = true; }
                            } else {
                                friend.youtube = newYt;
                                updated = true;
                            }
                        }
                    }

                    if (updated) {
                        saveFriendsLocal(false);
                        renderFriends();
                        showToast('情報を更新しました ✓', 'success');
                    } else {
                        showToast('更新する情報はありませんでした（最新です） ✓', 'success');
                    }
                } else {
                    showToast('Twitchユーザーが見つかりませんでした', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('APIエラーが発生しました。接続設定を確認してください。', 'error');
            } finally {
                btnEl.innerHTML = originalContent;
                btnEl.disabled = false;
            }
        }
        window.refreshFriendUserData = refreshFriendUserData;

        function setBtnLoading(btn, loading) {
            if (!btn) return;
            if (loading) { btn._orig = btn.innerHTML; btn.innerHTML = SPINNER_SVG; btn.disabled = true; }
            else { btn.innerHTML = btn._orig || ''; btn.disabled = false; }
        }

        async function resolveLogin(login) {
            const d = await apiRequest(`/users?login=${encodeURIComponent(login)}`);
            return d?.data?.[0] || null;
        }

        const TWITCH_VIP_CACHE_KEY = 'stream_vip_cache_v16';

        function restoreTwitchListCaches() {
            try {
                const cached = JSON.parse(localStorage.getItem(TWITCH_VIP_CACHE_KEY) || 'null');
                if (!cached || cached.broadcasterId !== settings.userId || !Array.isArray(cached.vips)) return;
                renderVipList(cached.vips);
                renderVipSlotInfo(cached.vips.length, Number(cached.maxVip) || 0);
            } catch (error) {
                localStorage.removeItem(TWITCH_VIP_CACHE_KEY);
            }
        }

        // === Subscribers ===
        async function fetchSubscribers(btn) {
            const c = document.getElementById('tw-sub-list');
            c.innerHTML = '';
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const data = await apiRequest(`/subscriptions?broadcaster_id=${bId}&first=100`);
            setBtnLoading(btn, false);
            if (!data?.data) {
                c.innerHTML = twitchListEmptyHtml(uiText('runtime.fetchFailed'));
                return;
            }
            const broadcasterId = String(bId || '');
            const broadcasterLogin = String(settings.userLogin || '').trim().toLowerCase();
            const subscribers = data.data.filter(subscriber => {
                const isSameId = broadcasterId && String(subscriber.user_id || '') === broadcasterId;
                const isSameLogin = broadcasterLogin && String(subscriber.user_login || '').trim().toLowerCase() === broadcasterLogin;
                return !isSameId && !isSameLogin;
            });
            const removedSelfCount = data.data.length - subscribers.length;
            const total = Math.max(0, (Number(data.total) || data.data.length) - removedSelfCount);
            if (!subscribers.length) {
                c.innerHTML = twitchListEmptyHtml();
                return;
            }
            c.innerHTML = `<p class="tw-list-summary">${raidSoEscape(uiText('runtime.total'))}: <strong>${total}</strong>${raidSoEscape(uiText('runtime.personSuffix'))}</p>` +
                subscribers.map(s => {
                    const tier = s.tier === '3000' ? 'T3' : s.tier === '2000' ? 'T2' : 'T1';
                    const col = s.tier === '3000' ? '#ffc800' : s.tier === '2000' ? '#bf94ff' : '#aaa';
                    return `<div class="tw-list-item"><span class="tw-list-name">${raidSoEscape(s.user_name || s.user_login || '')}</span><span class="tw-list-meta" style="color:${col};">${tier}${s.is_gift ? ' 🎁' : ''}</span></div>`;
                }).join('');
        }

        // === VIP ===
        async function updateVipSlotsInfo(currentVipCount) {
            const bId = settings.userId;
            if (!bId) return;
            const infoEl = document.getElementById('tw-vip-slot-info');
            if (!infoEl) return;
            try {
                // 1. ユーザー情報 (アフィリエイト/パートナー判定) 取得
                const userData = await apiRequest(`/users?id=${bId}`);
                const bType = userData?.data?.[0]?.broadcaster_type || ""; // "partner", "affiliate", ""

                // 2. フォロワー数取得
                const followData = await apiRequest(`/channels/followers?broadcaster_id=${bId}`);
                const followerCount = followData?.total || 0;

                // 3. 最大VIPスロット数算出
                let maxVip = 0;
                if (bType === 'partner') {
                    maxVip = 100;
                } else if (bType === 'affiliate') {
                    if (followerCount < 100) maxVip = 20;
                    else if (followerCount < 200) maxVip = 30;
                    else if (followerCount < 300) maxVip = 40;
                    else if (followerCount < 400) maxVip = 50;
                    else if (followerCount < 500) maxVip = 60;
                    else if (followerCount < 800) maxVip = 80;
                    else maxVip = 100;
                } else {
                    maxVip = 0;
                }

                renderVipSlotInfo(currentVipCount, maxVip);
                return { currentVipCount, maxVip };
            } catch (err) {
                console.error("Failed to update VIP slots info:", err);
                renderVipSlotInfo(currentVipCount, 0);
                return { currentVipCount, maxVip: 0 };
            }
        }

        async function fetchVips(btn) {
            localStorage.removeItem(TWITCH_VIP_CACHE_KEY);
            resetVipDisplay();
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const data = await apiRequest(`/channels/vips?broadcaster_id=${bId}&first=100`);
            setBtnLoading(btn, false);
            const c = document.getElementById('tw-vip-list');
            if (!data?.data) {
                c.innerHTML = twitchListEmptyHtml(uiText('runtime.fetchFailed'));
                return;
            }
            
            const slotInfo = await updateVipSlotsInfo(data.data.length);
            renderVipList(data.data);
            safeSetLocal(TWITCH_VIP_CACHE_KEY, JSON.stringify({
                broadcasterId: bId,
                vips: data.data,
                maxVip: slotInfo?.maxVip || 0,
                updatedAt: Date.now()
            }));
        }

        async function addVip(btn) {
            const login = document.getElementById('tw-vip-input').value.trim();
            if (!login) return;
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const user = await resolveLogin(login);
            if (!user) {
                setBtnLoading(btn, false);
                return customAlert(uiText('runtime.userNotFound', { login }));
            }
            const r = await apiRequest(`/channels/vips?broadcaster_id=${bId}&user_id=${user.id}`, 'POST');
            setBtnLoading(btn, false);
            showToast(r !== null ? uiText('runtime.vipAdded', { login }) : uiText('runtime.vipAddFailed'), r !== null ? 'success' : 'error');
            if (r !== null) fetchVips(document.getElementById('tw-btn-vip-list'));
        }

        async function removeVip(btn) {
            const login = document.getElementById('tw-vip-input').value.trim();
            if (!login) return;
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const user = await resolveLogin(login);
            if (!user) {
                setBtnLoading(btn, false);
                return customAlert(uiText('runtime.userNotFound', { login }));
            }
            const r = await apiRequest(`/channels/vips?broadcaster_id=${bId}&user_id=${user.id}`, 'DELETE');
            setBtnLoading(btn, false);
            showToast(r !== null ? uiText('runtime.vipRemoved', { login }) : uiText('runtime.vipRemoveFailed'), r !== null ? 'success' : 'error');
            if (r !== null) fetchVips(document.getElementById('tw-btn-vip-list'));
        }

        // === API操作 ===
        async function doApiMarker(btn) {
            const desc = document.getElementById('tw-marker-desc').value.trim();
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const r = await apiRequest('/streams/markers', 'POST', {
                user_id: bId,
                description: desc || uiText('runtime.markerDefault')
            });
            setBtnLoading(btn, false);
            if (r?.data?.[0]) {
                showToast(uiText('runtime.markerCreated'), 'success');
                document.getElementById('tw-marker-desc').value = '';
            } else {
                showToast(uiText('runtime.markerFailed'), 'error');
            }
        }

        async function doApiAnnounce(btn) {
            const msg = document.getElementById('tw-announce-msg').value.trim();
            if (!msg) return;
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const r = await apiRequest(`/chat/announcements?broadcaster_id=${bId}&moderator_id=${bId}`, 'POST', {
                message: msg,
                color: 'primary'
            });
            setBtnLoading(btn, false);
            if (r !== null) {
                showToast(uiText('runtime.announcementSent'), 'success');
                document.getElementById('tw-announce-msg').value = '';
            } else {
                showToast(uiText('runtime.announcementFailed'), 'error');
            }
        }

        async function doApiCommercial(btn, length) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const r = await apiRequest('/channels/commercial', 'POST', {
                broadcaster_id: bId,
                length: parseInt(length) || 30
            });
            setBtnLoading(btn, false);
            if (r?.data?.[0]) {
                const sec = r.data[0].length || length;
                showToast(uiText('runtime.commercialStarted', { seconds: sec }), 'success');
            } else {
                showToast(uiText('runtime.commercialFailed'), 'error');
            }
        }

        // === Chat Settings ===
        async function fetchChatSettings(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const data = await apiRequest(`/chat/settings?broadcaster_id=${bId}&moderator_id=${bId}`);
            setBtnLoading(btn, false);
            if (!data?.data?.[0]) { showToast(uiText('runtime.fetchFailed'), 'error'); return; }
            const s = data.data[0];
            document.getElementById('cs-emote').checked = !!s.emote_mode;
            document.getElementById('cs-follow').checked = !!s.follower_mode;
            document.getElementById('cs-follow-dur').value = clampInt(s.follower_mode_duration, 0, 129600, 0);
            document.getElementById('cs-slow').checked = !!s.slow_mode;
            document.getElementById('cs-slow-dur').value = clampInt(s.slow_mode_wait_time, 3, 120, 30);
            document.getElementById('cs-sub').checked = !!s.subscriber_mode;
            document.getElementById('cs-unique').checked = !!s.unique_chat_mode;
            showToast(uiText('runtime.chatSettingsLoaded'), 'success');
        }

        async function patchChatSettings(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const followerMode = document.getElementById('cs-follow').checked;
            const slowMode = document.getElementById('cs-slow').checked;
            const body = {
                emote_mode: document.getElementById('cs-emote').checked,
                follower_mode: followerMode,
                slow_mode: slowMode,
                subscriber_mode: document.getElementById('cs-sub').checked,
                unique_chat_mode: document.getElementById('cs-unique').checked
            };
            if (followerMode) body.follower_mode_duration = clampElementValue('cs-follow-dur', 0, 129600, 0);
            if (slowMode) body.slow_mode_wait_time = clampElementValue('cs-slow-dur', 3, 120, 30);
            const r = await apiRequest(`/chat/settings?broadcaster_id=${bId}&moderator_id=${bId}`, 'PATCH', body);
            setBtnLoading(btn, false);
            showToast(r ? uiText('runtime.chatSettingsApplied') : uiText('runtime.chatSettingsApplyFailed'), r ? 'success' : 'error');
        }

        async function applyChatToggle(input) {
            const bId = settings.userId;
            if (!bId) {
                input.checked = !input.checked;
                return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            }
            const fieldById = {
                'cs-emote': 'emote_mode',
                'cs-follow': 'follower_mode',
                'cs-slow': 'slow_mode',
                'cs-sub': 'subscriber_mode',
                'cs-unique': 'unique_chat_mode'
            };
            const field = fieldById[input.id];
            if (!field) return;
            const previous = !input.checked;
            const body = { [field]: input.checked };
            if (input.id === 'cs-follow' && input.checked) {
                body.follower_mode_duration = clampElementValue('cs-follow-dur', 0, 129600, 0);
            }
            if (input.id === 'cs-slow' && input.checked) {
                body.slow_mode_wait_time = clampElementValue('cs-slow-dur', 3, 120, 30);
            }
            input.disabled = true;
            const result = await apiRequest(`/chat/settings?broadcaster_id=${bId}&moderator_id=${bId}`, 'PATCH', body);
            input.disabled = false;
            if (result === null) input.checked = previous;
            showToast(result !== null ? uiText('runtime.chatSettingsApplied') : uiText('runtime.chatSettingsApplyFailed'), result !== null ? 'success' : 'error');
        }

        async function clearChatImmediately(button) {
            setBtnLoading(button, true);
            try {
                await deleteRaidSoChat();
                showToast(uiText('runtime.chatCleared'), 'success');
            } catch (error) {
                showToast(error.message || uiText('runtime.apiActionFailed'), 'error');
            } finally {
                setBtnLoading(button, false);
            }
        }

        // === Poll ===
        function readStoredPresetList(key) {
            try {
                const value = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
            } catch (e) {
                console.warn(`Preset data could not be read: ${key}`, e);
                return [];
            }
        }

        const TWITCH_MIN_CHOICES = 2;
        const TWITCH_POLL_MAX_CHOICES = 5;
        const TWITCH_PREDICTION_MAX_CHOICES = 10;

        function ensureDefaultTwitchPresets() {
            const seed = (storageKey, source, type) => {
                const stored = readStoredPresetList(storageKey).filter(item => !item.isDefault);
                const isPrediction = type === 'prediction';
                const minDuration = isPrediction ? 30 : 15;
                const defaultDuration = isPrediction ? 120 : 60;
                const maxChoices = isPrediction ? TWITCH_PREDICTION_MAX_CHOICES : TWITCH_POLL_MAX_CHOICES;
                const defaults = (Array.isArray(source) ? source : []).slice(0, 3).map((item, index) => {
                    const choices = (Array.isArray(item?.choices) ? item.choices : [])
                        .map(choice => String(choice || '').trim())
                        .filter(Boolean)
                        .slice(0, maxChoices);
                    while (choices.length < TWITCH_MIN_CHOICES) choices.push('');
                    const duration = Math.max(minDuration, Math.min(1800, Number(item?.duration) || defaultDuration));
                    return {
                        id: `default-${type}-${index + 1}`,
                        isDefault: true,
                        title: String(item?.title || ''),
                        ...(isPrediction ? { outcomes: choices } : { choices }),
                        dur: duration
                    };
                });
                safeSetLocal(storageKey, JSON.stringify([...defaults, ...stored]));
            };

            seed('stream_pred_presets_v16', twExt('defaultPredictionPresets', []), 'prediction');
            seed('stream_poll_presets_v16', twExt('defaultPollPresets', []), 'poll');
        }

        function createTwitchChoiceInput(className, index, value = '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = className;
            input.placeholder = twPollChoicePlaceholder(index);
            input.value = value;
            if (className === 'pred-outcome' && index <= 2) input.id = `pred-o${index}`;
            return input;
        }

        function syncTwitchChoiceButtons(type) {
            const isPrediction = type === 'prediction';
            const container = document.getElementById(isPrediction ? 'pred-outcomes' : 'poll-choices');
            const className = isPrediction ? '.pred-outcome' : '.poll-ch';
            const max = isPrediction ? TWITCH_PREDICTION_MAX_CHOICES : TWITCH_POLL_MAX_CHOICES;
            const count = container?.querySelectorAll(className).length || 0;
            const addButton = document.getElementById(isPrediction ? 'tw-btn-pred-add-ch' : 'tw-btn-poll-add-ch');
            const removeButton = document.getElementById(isPrediction ? 'tw-btn-pred-remove-ch' : 'tw-btn-poll-remove-ch');
            if (addButton) addButton.disabled = count >= max;
            if (removeButton) removeButton.disabled = count <= TWITCH_MIN_CHOICES;
        }

        function replaceTwitchChoiceInputs(type, values) {
            const isPrediction = type === 'prediction';
            const container = document.getElementById(isPrediction ? 'pred-outcomes' : 'poll-choices');
            if (!container) return;
            const className = isPrediction ? 'pred-outcome' : 'poll-ch';
            const max = isPrediction ? TWITCH_PREDICTION_MAX_CHOICES : TWITCH_POLL_MAX_CHOICES;
            const items = (Array.isArray(values) ? values : []).slice(0, max);
            while (items.length < TWITCH_MIN_CHOICES) items.push('');
            container.replaceChildren(...items.map((value, index) => createTwitchChoiceInput(className, index + 1, value)));
            syncTwitchChoiceButtons(type);
        }

        function addPollChoice() {
            const container = document.getElementById('poll-choices');
            const count = container?.querySelectorAll('.poll-ch').length || 0;
            if (!container || count >= TWITCH_POLL_MAX_CHOICES) {
                showToast(twExt('maxPollChoices'), 'info');
                syncTwitchChoiceButtons('poll');
                return;
            }
            container.appendChild(createTwitchChoiceInput('poll-ch', count + 1));
            syncTwitchChoiceButtons('poll');
        }

        function removePollChoice() {
            const container = document.getElementById('poll-choices');
            const choices = container?.querySelectorAll('.poll-ch') || [];
            if (choices.length <= TWITCH_MIN_CHOICES) {
                showToast(twExt('minChoicesNotice'), 'info');
                syncTwitchChoiceButtons('poll');
                return;
            }
            choices[choices.length - 1].remove();
            syncTwitchChoiceButtons('poll');
        }

        function addPredictionChoice() {
            const container = document.getElementById('pred-outcomes');
            const count = container?.querySelectorAll('.pred-outcome').length || 0;
            if (!container || count >= TWITCH_PREDICTION_MAX_CHOICES) {
                showToast(twExt('maxPredictionChoices'), 'info');
                syncTwitchChoiceButtons('prediction');
                return;
            }
            container.appendChild(createTwitchChoiceInput('pred-outcome', count + 1));
            syncTwitchChoiceButtons('prediction');
        }

        function removePredictionChoice() {
            const container = document.getElementById('pred-outcomes');
            const choices = container?.querySelectorAll('.pred-outcome') || [];
            if (choices.length <= TWITCH_MIN_CHOICES) {
                showToast(twExt('minChoicesNotice'), 'info');
                syncTwitchChoiceButtons('prediction');
                return;
            }
            choices[choices.length - 1].remove();
            syncTwitchChoiceButtons('prediction');
        }

        // Pollプリセット保存・読込ロジック
        function savePollPreset() {
            const title = document.getElementById('poll-title').value.trim();
            if (!title) return customAlert(twExt('pollQuestionRequired'));
            const choices = Array.from(document.querySelectorAll('.poll-ch')).map(i => i.value.trim()).filter(Boolean).slice(0, TWITCH_POLL_MAX_CHOICES);
            if (choices.length < 2) return customAlert(twExt('pollChoicesRequired'));
            const dur = clampElementValue('poll-dur', 15, 1800, 60);
            
            let presets = readStoredPresetList('stream_poll_presets_v16');
            presets = presets.filter(p => p.isDefault); // 1件のみ: 既存ユーザーPresetを破棄
            presets.push({ id: Date.now().toString(), title, choices, dur });
            safeSetLocal('stream_poll_presets_v16', JSON.stringify(presets));
            showToast(twExt('presetSaved'), 'success');
            updatePollPresetDropdown();
        }

        function loadPollPreset() {
            const id = document.getElementById('poll-preset-select').value;
            if (!id) return;
            const presets = readStoredPresetList('stream_poll_presets_v16');
            const p = presets.find(x => x.id === id);
            if (!p) return;
            document.getElementById('poll-title').value = p.title;
            document.getElementById('poll-dur').value = p.dur;
            
            replaceTwitchChoiceInputs('poll', p.choices);
            showToast(twExt('presetLoaded'), 'success');
        }

        function deletePollPreset() {
            const id = document.getElementById('poll-preset-select').value;
            if (!id) return;
            let presets = readStoredPresetList('stream_poll_presets_v16');
            if (presets.find(item => item.id === id)?.isDefault) {
                showToast(twExt('defaultPresetProtected'), 'info');
                return;
            }
            presets = presets.filter(x => x.id !== id);
            safeSetLocal('stream_poll_presets_v16', JSON.stringify(presets));
            showToast(twExt('presetDeleted'), 'success');
            updatePollPresetDropdown();
        }

        function updatePollPresetDropdown() {
            const presets = readStoredPresetList('stream_poll_presets_v16');
            const sel = document.getElementById('poll-preset-select');
            if (sel) {
                const placeholder = twExt('savedPresetOptions');
                sel.innerHTML = `<option value="">${raidSoEscape(placeholder)}</option>` +
                    presets.map(p => {
                        const title = String(p.title || '');
                        const prefix = p.isDefault ? '★ ' : '';
                        return `<option value="${raidSoEscape(p.id || '')}">${prefix}${raidSoEscape(title.slice(0, 15))}${title.length > 15 ? '...' : ''}</option>`;
                    }).join('');
            }

            // クイック起動ボタンのレンダリング
            const btnContainer = document.getElementById('poll-quick-btns');
            if (btnContainer) {
                btnContainer.innerHTML = '';
                
                // 「お気に入り」クイック起動用のボタンを作成（最大5つ）
                presets.slice(0, 5).forEach(p => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary';
                    btn.style.fontSize = '9px';
                    btn.style.padding = '3px 6px';
                    btn.style.margin = '0';
                    btn.style.background = p.isDefault ? 'rgba(145, 70, 255, 0.05)' : 'rgba(145, 70, 255, 0.15)';
                    btn.style.borderColor = 'var(--twitch-purple)';
                    btn.style.color = 'var(--command-accent)';
                    const title = String(p.title || '');
                    const choices = (Array.isArray(p.choices) ? p.choices : []).slice(0, TWITCH_POLL_MAX_CHOICES);
                    btn.innerText = `⭐ ${title.slice(0, 10)}${title.length > 10 ? '..' : ''}`;
                    btn.title = uiText('runtime.pollQuickStartTitle', { title, choices: choices.join('/'), duration: p.dur });
                    
                    btn.onclick = async () => {
                        if (await customConfirm(twFormat(twExt('pollQuickStartConfirm'), { title: p.title }))) {
                            // API呼び出し処理
                            const bId = settings.userId;
                            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
                            
                            btn.disabled = true;
                            const origText = btn.innerText;
                            btn.innerHTML = SPINNER_SVG;
                            
                            const r = await apiRequest('/polls', 'POST', {
                                broadcaster_id: bId,
                                title,
                                choices: choices.map(t => ({ title: t })),
                                duration: p.dur
                            });
                            
                            btn.disabled = false;
                            btn.innerText = origText;
                            
                            if (r?.data?.[0]) {
                                showToast(twExt('pollStarted'), 'success');
                                renderPollResult(r.data[0]);
                            } else {
                                showToast(twExt('pollStartFailed'), 'error');
                            }
                        }
                    };
                    btnContainer.appendChild(btn);
                });
            }
        }

        async function createPoll(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            const title = document.getElementById('poll-title').value.trim();
            if (!title) return customAlert(twExt('pollQuestionRequired'));
            const choices = Array.from(document.querySelectorAll('.poll-ch')).map(i => i.value.trim()).filter(Boolean).slice(0, TWITCH_POLL_MAX_CHOICES);
            if (choices.length < 2) return customAlert(twExt('pollChoicesRequired'));
            const dur = clampElementValue('poll-dur', 15, 1800, 60);
            setBtnLoading(btn, true);
            const r = await apiRequest('/polls', 'POST', {
                broadcaster_id: bId, title, choices: choices.map(t => ({ title: t })), duration: dur
            });
            setBtnLoading(btn, false);
            if (r?.data?.[0]) { showToast(twExt('pollCreated'), 'success'); renderPollResult(r.data[0]); }
            else showToast(twExt('pollCreateFailed'), 'error');
        }

        async function fetchPolls(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const r = await apiRequest(`/polls?broadcaster_id=${bId}&first=1`);
            setBtnLoading(btn, false);
            if (r?.data?.[0]) renderPollResult(r.data[0]);
            else showToast(twExt('noActivePoll'), 'info');
        }

        async function endPoll(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            const r0 = await apiRequest(`/polls?broadcaster_id=${bId}&first=1`);
            if (!r0?.data?.[0]) return showToast(twExt('noActivePoll'), 'info');
            const pollId = r0.data[0].id;
            setBtnLoading(btn, true);
            const r = await apiRequest('/polls', 'PATCH', { broadcaster_id: bId, id: pollId, status: 'TERMINATED' });
            setBtnLoading(btn, false);
            if (r?.data?.[0]) { showToast(twExt('pollEnded'), 'success'); renderPollResult(r.data[0]); }
            else showToast(uiText('runtime.actionFailed'), 'error');
        }

        function renderPollResult(p) {
            const choices = Array.isArray(p.choices) ? p.choices : [];
            const total = choices.reduce((s, c) => s + (c.votes || 0), 0);
            const statusColor = p.status === 'ACTIVE' ? '#00ca4e' : '#888';
            document.getElementById('tw-poll-result').innerHTML = `
                <div class="tw-result-card">
                    <strong>${raidSoEscape(p.title || '')}</strong>
                    <span style="float:right;color:${statusColor};font-size:10px;">${raidSoEscape(twStatusLabel(p.status))}</span><br>
                    ${choices.map(c => {
                        const pct = total > 0 ? Math.round((c.votes || 0) / total * 100) : 0;
                        return `<div style="margin-top:8px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;">
                                <span>${raidSoEscape(c.title || '')}</span><span>${c.votes || 0}${raidSoEscape(uiText('runtime.voteSuffix'))} (${pct}%)</span>
                            </div>
                            <div class="tw-result-bar"><div class="tw-result-bar-fill" style="width:${pct}%"></div></div>
                        </div>`;
                    }).join('')}
                </div>`;
        }

        // === Prediction ===
        let _activePredictionId = null;

        // Predictionプリセット保存・読込ロジック
        function savePredPreset() {
            const title = document.getElementById('pred-title').value.trim();
            const outcomes = Array.from(document.querySelectorAll('.pred-outcome')).map(input => input.value.trim()).filter(Boolean).slice(0, TWITCH_PREDICTION_MAX_CHOICES);
            if (!title || outcomes.length < TWITCH_MIN_CHOICES) return customAlert(twExt('predictionInputRequired'));
            const dur = clampElementValue('pred-dur', 30, 1800, 120);
            
            let presets = readStoredPresetList('stream_pred_presets_v16');
            presets = presets.filter(p => p.isDefault); // 1件のみ: 既存ユーザーPresetを破棄
            presets.push({ id: Date.now().toString(), title, outcomes, dur });
            safeSetLocal('stream_pred_presets_v16', JSON.stringify(presets));
            showToast(twExt('presetSaved'), 'success');
            updatePredPresetDropdown();
        }

        function loadPredPreset() {
            const id = document.getElementById('pred-preset-select').value;
            if (!id) return;
            const presets = readStoredPresetList('stream_pred_presets_v16');
            const p = presets.find(x => x.id === id);
            if (!p) return;
            const outcomes = Array.isArray(p.outcomes) ? p.outcomes : [];
            document.getElementById('pred-title').value = p.title;
            document.getElementById('pred-dur').value = p.dur;
            replaceTwitchChoiceInputs('prediction', outcomes);
            showToast(twExt('presetLoaded'), 'success');
        }

        function deletePredPreset() {
            const id = document.getElementById('pred-preset-select').value;
            if (!id) return;
            let presets = readStoredPresetList('stream_pred_presets_v16');
            if (presets.find(item => item.id === id)?.isDefault) {
                showToast(twExt('defaultPresetProtected'), 'info');
                return;
            }
            presets = presets.filter(x => x.id !== id);
            safeSetLocal('stream_pred_presets_v16', JSON.stringify(presets));
            showToast(twExt('presetDeleted'), 'success');
            updatePredPresetDropdown();
        }

        function updatePredPresetDropdown() {
            const presets = readStoredPresetList('stream_pred_presets_v16');
            const sel = document.getElementById('pred-preset-select');
            if (sel) {
                const placeholder = twExt('savedPresetOptions');
                sel.innerHTML = `<option value="">${raidSoEscape(placeholder)}</option>` +
                    presets.map(p => {
                        const title = String(p.title || '');
                        const prefix = p.isDefault ? '★ ' : '';
                        return `<option value="${raidSoEscape(p.id || '')}">${prefix}${raidSoEscape(title.slice(0, 15))}${title.length > 15 ? '...' : ''}</option>`;
                    }).join('');
            }

            // クイック起動ボタンのレンダリング
            const btnContainer = document.getElementById('pred-quick-btns');
            if (btnContainer) {
                btnContainer.innerHTML = '';
                
                // 「お気に入り」クイック起動用のボタンを作成（最大5つ）
                presets.slice(0, 5).forEach(p => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary';
                    btn.style.fontSize = '9px';
                    btn.style.padding = '3px 6px';
                    btn.style.margin = '0';
                    btn.style.background = p.isDefault ? 'rgba(145, 70, 255, 0.05)' : 'rgba(145, 70, 255, 0.15)';
                    btn.style.borderColor = 'var(--twitch-purple)';
                    btn.style.color = 'var(--command-accent)';
                    const title = String(p.title || '');
                    const outcomes = (Array.isArray(p.outcomes) ? p.outcomes : []).slice(0, TWITCH_PREDICTION_MAX_CHOICES);
                    btn.innerText = `⭐ ${title.slice(0, 10)}${title.length > 10 ? '..' : ''}`;
                    btn.title = uiText('runtime.predictionQuickStartTitle', { title, outcomes: outcomes.join(' vs '), duration: p.dur });
                    
                    btn.onclick = async () => {
                        if (await customConfirm(twFormat(twExt('predictionQuickStartConfirm'), { title: p.title }))) {
                            // API呼び出し処理
                            const bId = settings.userId;
                            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
                            
                            btn.disabled = true;
                            const origText = btn.innerText;
                            btn.innerHTML = SPINNER_SVG;
                            
                            const r = await apiRequest('/predictions', 'POST', {
                                broadcaster_id: bId,
                                title,
                                outcomes: outcomes.map(t => ({ title: t })),
                                prediction_window: p.dur
                            });
                            
                            btn.disabled = false;
                            btn.innerText = origText;
                            
                            if (r?.data?.[0]) {
                                showToast(twExt('predictionStarted'), 'success');
                                renderPredResult(r.data[0]);
                                _activePredictionId = r.data[0].id;
                            } else {
                                showToast(twExt('predictionStartFailed'), 'error');
                            }
                        }
                    };
                    btnContainer.appendChild(btn);
                });
            }
        }

        async function createPrediction(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            const title = document.getElementById('pred-title').value.trim();
            const outcomes = Array.from(document.querySelectorAll('.pred-outcome')).map(input => input.value.trim()).filter(Boolean).slice(0, TWITCH_PREDICTION_MAX_CHOICES);
            if (!title || outcomes.length < TWITCH_MIN_CHOICES) return customAlert(twExt('predictionInputRequired'));
            const dur = clampElementValue('pred-dur', 30, 1800, 120);
            setBtnLoading(btn, true);
            const r = await apiRequest('/predictions', 'POST', {
                broadcaster_id: bId, title,
                outcomes: outcomes.map(outcome => ({ title: outcome })),
                prediction_window: dur
            });
            setBtnLoading(btn, false);
            if (r?.data?.[0]) { showToast(twExt('predictionCreated'), 'success'); renderPredResult(r.data[0]); _activePredictionId = r.data[0].id; }
            else showToast(twExt('predictionCreateFailed'), 'error');
        }

        async function fetchPredictions(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const r = await apiRequest(`/predictions?broadcaster_id=${bId}&first=1`);
            setBtnLoading(btn, false);
            if (r?.data?.[0]) { renderPredResult(r.data[0]); _activePredictionId = r.data[0].id; }
            else showToast(twExt('noActivePrediction'), 'info');
        }

        async function cancelPrediction(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            if (!_activePredictionId) {
                const r0 = await apiRequest(`/predictions?broadcaster_id=${bId}&first=1`);
                if (!r0?.data?.[0] || r0.data[0].status !== 'ACTIVE') return showToast(twExt('noActivePrediction'), 'info');
                _activePredictionId = r0.data[0].id;
            }
            setBtnLoading(btn, true);
            const r = await apiRequest('/predictions', 'PATCH', { broadcaster_id: bId, id: _activePredictionId, status: 'CANCELED' });
            setBtnLoading(btn, false);
            showToast(r ? twExt('predictionCanceled') : uiText('runtime.actionFailed'), r ? 'success' : 'error');
            if (r?.data?.[0]) renderPredResult(r.data[0]);
        }

        function resolvePredictionFromButton(button) {
            return resolvePrediction(button?.dataset?.predictionId || '', button?.dataset?.outcomeId || '');
        }

        function renderPredResult(p) {
            const outcomes = Array.isArray(p.outcomes) ? p.outcomes : [];
            const total = outcomes.reduce((s, o) => s + (o.channel_points || 0), 0);
            const statusColor = p.status === 'ACTIVE' ? '#00ca4e' : p.status === 'LOCKED' ? '#ffc800' : '#888';
            const resolveBtns = p.status === 'ACTIVE' || p.status === 'LOCKED'
                ? outcomes.map(o => `<button class="btn-secondary" style="margin:4px;font-size:11px;" data-prediction-id="${raidSoEscape(p.id || '')}" data-outcome-id="${raidSoEscape(o.id || '')}" onclick="resolvePredictionFromButton(this)">✔ ${raidSoEscape(o.title || '')}</button>`).join('')
                : '';
            document.getElementById('tw-pred-result').innerHTML = `
                <div class="tw-result-card">
                    <strong>${raidSoEscape(p.title || '')}</strong>
                    <span style="float:right;color:${statusColor};font-size:10px;">${raidSoEscape(twStatusLabel(p.status))}</span><br>
                    ${outcomes.map(o => {
                        const pct = total > 0 ? Math.round((o.channel_points || 0) / total * 100) : 0;
                        return `<div style="margin-top:8px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;">
                                <span>${raidSoEscape(o.title || '')}</span><span>${o.channel_points || 0}pt (${pct}%)</span>
                            </div>
                            <div class="tw-result-bar"><div class="tw-result-bar-fill" style="width:${pct}%"></div></div>
                        </div>`;
                    }).join('')}
                    ${resolveBtns ? `<div style="margin-top:10px;"><span style="font-size:10px;color:#888;">${raidSoEscape(uiText('runtime.resolveResult'))}:</span><br>${resolveBtns}</div>` : ''}
                </div>`;
        }

        async function resolvePrediction(predId, outcomeId) {
            const bId = settings.userId;
            if (!bId) return;
            const r = await apiRequest('/predictions', 'PATCH', { broadcaster_id: bId, id: predId, status: 'RESOLVED', winning_outcome_id: outcomeId });
            if (r?.data?.[0]) { showToast(uiText('runtime.resultResolved'), 'success'); renderPredResult(r.data[0]); }
            else showToast(uiText('runtime.actionFailed'), 'error');
        }

        // === クリップ ===
        function copyClipFromButton(button) {
            return copyRaw(button?.dataset?.url || '');
        }

        function saveFavClipFromButton(button) {
            saveFavClip(button?.dataset?.url || '', button?.dataset?.title || '');
        }

        function deleteFavClipFromButton(button) {
            deleteFavClip(button?.dataset?.id || '');
        }

        async function createClip(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            setBtnLoading(btn, true);
            const r = await apiRequest(`/clips?broadcaster_id=${bId}`, 'POST');
            setBtnLoading(btn, false);
            const c = document.getElementById('tw-clip-result');
            if (r?.data?.[0]) {
                const url = r.data[0].edit_url || '';
                const safeUrl = raidSoEscape(url);
                c.innerHTML = `<div class="tw-result-card">✅ ${raidSoEscape(twExt('clipCreated'))}<br><a href="${safeUrl}" target="_blank" style="color:#bf94ff;word-break:break-all;">${safeUrl}</a><br><button class="btn-secondary" style="margin-top:6px;font-size:11px;" data-url="${safeUrl}" onclick="copyClipFromButton(this)">${raidSoEscape(uiText('runtime.copyUrl'))}</button></div>`;
                showToast(twExt('clipCreated'), 'success');
            } else {
                c.innerHTML = `<div class="tw-result-card" style="color:#ff4a4a;">❌ ${raidSoEscape(uiText('runtime.clipCreateLiveFailed'))}</div>`;
                showToast(twExt('clipCreateFailed'), 'error');
            }
        }

        async function fetchClips(btn) {
            const bId = settings.userId;
            if (!bId) return customAlert(langMap[currentLang].alerts.requireBroadcaster);
            const sortVal = document.getElementById('tw-clip-sort').value;
            const countVal = parseInt(document.getElementById('tw-clip-count').value) || 10;
            
            setBtnLoading(btn, true);
            const r = await apiRequest(`/clips?broadcaster_id=${bId}&first=100`);
            setBtnLoading(btn, false);
            const c = document.getElementById('tw-clip-result');
            if (!r?.data?.length) { c.innerHTML = `<p style="color:#888;font-size:11px;">${raidSoEscape(twExt('clipEmpty'))}</p>`; return; }
            
            let clips = [...r.data];
            if (sortVal === 'recent') {
                clips.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else {
                clips.sort((a, b) => b.view_count - a.view_count);
            }
            clips = clips.slice(0, countVal);
            
            c.innerHTML = `<div class="tw-clip-list">${clips.map(clip => {
                const safeTitle = raidSoEscape(clip.title || twExt('clipUntitled'));
                const safeUrl = raidSoEscape(clip.url || '');
                const safeViews = raidSoEscape(String(clip.view_count ?? 0));
                const safeDate = raidSoEscape(typeof clip.created_at === 'string' ? clip.created_at.slice(0, 10) : '-');
                return `
                <article class="tw-clip-card">
                    <div class="tw-clip-field">
                        <span class="tw-clip-label">${raidSoEscape(twExt('clipTitleLabel'))}</span>
                        <span class="tw-clip-title">${safeTitle}</span>
                        <span class="tw-clip-meta">${safeViews}${raidSoEscape(uiText('runtime.viewSuffix'))} · ${safeDate}</span>
                    </div>
                    <div class="tw-clip-field tw-clip-url-box">
                        <span class="tw-clip-label">${raidSoEscape(twExt('clipUrlLabel'))}</span>
                        <a class="tw-clip-url" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>
                    </div>
                    <div class="tw-clip-actions">
                        <button class="btn-secondary" data-url="${safeUrl}" onclick="copyClipFromButton(this)">${raidSoEscape(twExt('copyShort'))}</button>
                        <button class="btn-secondary" style="background:rgba(255,255,255,0.05);" data-url="${safeUrl}" data-title="${safeTitle}" onclick="saveFavClipFromButton(this)">★${raidSoEscape(uiText('runtime.saveShort'))}</button>
                    </div>
                </article>`;
            }).join('')}</div>`;





        }
