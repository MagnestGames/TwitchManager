        // === EventSub WebSocket ===
        const SUPPORTER_LAST_STREAM_ID_KEY = 'stream_supporter_last_stream_id_v16';
        const SUPPORTER_ARCHIVE_STORAGE_KEY = 'stream_supporter_archives_v16';
        const SUPPORTER_ARCHIVE_LEGACY_KEY = 'stream_supporter_archive_v16';
        const SUPPORTER_ARCHIVE_LIMIT = 30;
        const SUPPORTER_CATEGORY_DEFAULTS = Object.freeze({
            first: true,
            raid: true,
            follow: true,
            cheer: true,
            sub: true,
            gift: true,
            chat: true
        });
        let _esWs = null, _esSessionId = null, _esManualDisconnect = false, _esReconnectTimeout = null;
        let _streamStateInitialized = false;
        let _lastObservedStreamId = (() => {
            try {
                return localStorage.getItem(SUPPORTER_LAST_STREAM_ID_KEY) || '';
            } catch (error) {
                return '';
            }
        })();
        let _numberWheelInitialized = false;

        function createEmptyStreamStats() {
            return {
                streamDate: new Date().toISOString(),
                streamTitle: '',
                raids: [],
                cheers: 0,
                cheerers: new Set(),
                subscribes: 0,
                subscribers: [],
                gifts: 0,
                follows: 0,
                followers: [],
                chatters: new Set(),
                manualRaid: 0,
                manualCheer: 0,
                manualSub: 0,
                manualFollow: 0
            };
        }

        let streamStats = createEmptyStreamStats();

        async function triggerStreamStartAd() {
            if (!settings.autoAdEnabled) return;
            const bId = settings.userId;
            if (!bId) {
                raidSoLog('自動広告エラー: 配信者が未設定です', 'warn');
                return;
            }
            raidSoLog('配信開始を検知しました。自動広告（3分間）を実行します...');
            try {
                const r = await apiRequest('/channels/commercial', 'POST', {
                    broadcaster_id: bId,
                    length: 180
                });
                if (r?.data?.[0]) {
                    const sec = r.data[0].length || 180;
                    raidSoLog(`自動広告を開始しました: ${sec}秒`);
                } else {
                    raidSoLog('自動広告の開始に失敗しました。クールダウン中などの可能性があります。', 'warn');
                }
            } catch (err) {
                raidSoLog(`自動広告エラー: ${err.message || err}`, 'warn');
            }
        }

        function handleSupporterStreamStart(streamId = '') {
            const marker = String(streamId || '').trim();
            if (marker && marker === _lastObservedStreamId) return false;
            if (marker) {
                _lastObservedStreamId = marker;
                safeSetLocal(SUPPORTER_LAST_STREAM_ID_KEY, marker);
            }
            
            // 配信開始に伴う自動広告の実行
            triggerStreamStartAd();

            if (settings.supporterResetOnStreamStart === false) return false;
            archivePastLog();
            return true;
        }

        // カテゴリ別のプレーンテキストログ追加関数
        function appendCategoryTextLog(category, msg) {
            const categoryLabels = {
                sub: uiText('runtime.supporter.headingSub'),
                cheer: uiText('runtime.supporter.headingCheer'),
                follow: uiText('runtime.supporter.headingFollow'),
                raid: uiText('runtime.supporter.headingRaid'),
                hype: 'Hype Train',
                first: uiText('runtime.supporter.headingFirst')
            };
            raidSoLog(`${categoryLabels[category] || category}: ${msg}`);
            const ta = document.getElementById(`es-ta-${category}`);
            if (!ta) return;
            const time = new Date().toLocaleTimeString();
            ta.value += `[${time}] ${msg}\n`;
            ta.scrollTop = ta.scrollHeight;
        }

        // EventSubログのミニタブ切り替え関数
        function switchEsLogTab(target) {
            document.querySelectorAll('.tw-log-pane').forEach(el => el.style.display = 'none');
            const pane = document.getElementById(`es-log-pane-${target}`);
            if (pane) pane.style.display = 'block';

            const tabs = ['all', 'sub', 'cheer', 'follow', 'raid', 'hype', 'first'];
            tabs.forEach(t => {
                const btn = document.getElementById(`es-tbtn-${t}`);
                if (btn) {
                    if (t === target) {
                        btn.style.background = 'var(--twitch-purple)';
                        btn.style.fontWeight = 'bold';
                        btn.style.color = 'var(--text-white)';
                    } else {
                        btn.style.background = 'var(--bg-header)';
                        btn.style.fontWeight = 'normal';
                        btn.style.color = '';
                    }
                }
            });
        }

        // テキストエリアコピー関数
        async function copyTextarea(id) {
            const ta = document.getElementById(id);
            if (!ta) return;
            await copyTextToClipboard(ta.value, uiText('runtime.copyDone'));
        }

        function esLog(type, msg) {
            raidSoLog(uiText('runtime.operationLog.eventSub', { message: `[${type}] ${msg}` }), type === 'ERR' ? 'warn' : 'info');
            const log = document.getElementById('es-log');
            if (!log) return;
            const time = new Date().toLocaleTimeString();
            const entry = document.createElement('div');
            entry.className = 'tw-log-entry';
            entry.innerHTML = `<span class="tw-log-time">${time}</span><span class="tw-log-type">[${type}]</span>${msg}`;
            if (log.firstChild?.tagName === 'P') log.innerHTML = '';
            log.insertBefore(entry, log.firstChild);
            if (log.children.length > 50) log.removeChild(log.lastChild);
        }

        function esSetStatus(connected) {
            const s = document.getElementById('es-status');
            if (!s) return;
            s.textContent = uiText(connected ? 'runtime.supporter.statusConnected' : 'runtime.supporter.statusDisconnected');
            s.className = 'tw-badge ' + (connected ? 'tw-badge-on' : 'tw-badge-off');
        }

        async function esSubscribe(type, version, condition) {
            if (!_esSessionId || !settings.clientId || !settings.token) return;
            try {
                await apiRequest('/eventsub/subscriptions', 'POST', {
                    type, version, condition,
                    transport: { method: 'websocket', session_id: _esSessionId }
                }, true);
            } catch (err) {
                console.warn(`[EventSub Subscription Ignored] type: ${type}, status:`, err?.status, err?.message);
            }
        }

        function connectEventSub(socketUrl = 'wss://eventsub.wss.twitch.tv/ws') {
            if (_esWs) { showToast(uiText('runtime.supporter.alreadyConnected'), 'info'); return; }
            if (!settings.userId || !settings.clientId || !settings.token) {
                return customAlert(langMap[currentLang].alerts.requireToken);
            }
            esLog('SYS', uiText('runtime.supporter.connecting'));
            _esManualDisconnect = false;
            if (_esReconnectTimeout) clearTimeout(_esReconnectTimeout);
            _esWs = new WebSocket(socketUrl);

            _esWs.onopen = () => esLog('SYS', uiText('runtime.supporter.websocketConnected'));

            _esWs.onmessage = async (e) => {
                const msg = JSON.parse(e.data);
                const mtype = msg.metadata?.message_type;
                if (mtype === 'session_welcome') {
                    _esSessionId = msg.payload?.session?.id;
                    esSetStatus(true);
                    esLog('SYS', uiText('runtime.supporter.sessionReceived', { id: _esSessionId?.slice(0, 12) || '' }));
                    const bId = settings.userId;
                    await esSubscribe('channel.subscribe', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.subscription.message', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.subscription.gift', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.cheer', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.follow', '2', { broadcaster_user_id: bId, moderator_user_id: bId });
                    await esSubscribe('channel.raid', '1', { to_broadcaster_user_id: bId });
                    await esSubscribe('channel.hype_train.begin', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.hype_train.end', '1', { broadcaster_user_id: bId });
                    await esSubscribe('stream.online', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.chat.message', '1', { broadcaster_user_id: bId, user_id: bId });
                    esLog('SYS', uiText('runtime.supporter.subscriptionsReady', { count: 10 }));
                } else if (mtype === 'notification') {
                    const subtype = msg.metadata?.subscription_type;
                    const ev = msg.payload?.event;
                    let logMsg = "";
                    let showLog = true;

                    if (subtype === 'stream.online') {
                        const didReset = handleSupporterStreamStart(ev.id || ev.started_at || '');
                        logMsg = `📡 ${uiText(didReset ? 'runtime.supporter.streamStarted' : 'runtime.supporter.streamStartedNoReset')}`;
                    } else if (subtype === 'channel.subscribe') {
                        if (document.getElementById('es-f-sub')?.checked === false) showLog = false;
                        logMsg = `🎉 ${uiText('runtime.supporter.subscription', { user: ev.user_name, tier: ev.tier?.charAt(0) || '' })}`;
                        triggerNotification('sub');
                        
                        // Stats tracking
                        if (!ev.is_gift && canAddSupporter('sub', ev.user_id, ev.user_login, ev.user_name)) {
                            streamStats.subscribes++;
                            appendToStatsTextarea('pg-i-sub-det', uiText('runtime.supporter.subscriptionNewDetail', { user: ev.user_name }));
                        }
                    }
                    else if (subtype === 'channel.subscription.message') {
                        if (document.getElementById('es-f-sub')?.checked === false) showLog = false;
                        const months = ev.cumulative_months || ev.duration_months || 1;
                        logMsg = `🎉 ${uiText('runtime.supporter.subscriptionRenewal', { user: ev.user_name, months })}`;
                        triggerNotification('sub');
                        if (canAddSupporter('sub', ev.user_id, ev.user_login, ev.user_name)) {
                            streamStats.subscribes++;
                            appendToStatsTextarea('pg-i-sub-det', uiText('runtime.supporter.subscriptionRenewalDetail', { user: ev.user_name, months }));
                        }
                    }
                    else if (subtype === 'channel.subscription.gift') {
                        if (document.getElementById('es-f-sub')?.checked === false) showLog = false;
                        const giftTier = ev.tier ? `Tier` + ev.tier.charAt(0) : '';
                        const giftCount = ev.total || 1;
                        logMsg = `\uD83C\uDF81 ${uiText('runtime.supporter.gift', { user: ev.user_name, count: giftCount, tier: giftTier })}`;
                        triggerNotification('sub');
                        // Stats: record gifter（投げた人）
                        if (canAddSupporter('gift', ev.user_id, ev.user_login, ev.user_name)) {
                            streamStats.gifts += (ev.total || 1);
                            appendToStatsTextarea('pg-i-gift-det', uiText('runtime.supporter.giftDetail', { user: ev.user_name, count: giftCount }));
                        }
                    }
                    else if (subtype === 'channel.cheer') {
                        if (document.getElementById('es-f-cheer')?.checked === false) showLog = false;
                        logMsg = `💎 ${uiText('runtime.supporter.cheer', { user: ev.user_name, bits: ev.bits })}`;
                        triggerNotification('cheer');
                        
                        // Stats tracking
                        if (canAddSupporter('cheer', ev.user_id, ev.user_login, ev.user_name)) {
                            streamStats.cheers += ev.bits;
                            streamStats.cheerers.add(ev.user_name);
                            appendToStatsTextarea('pg-i-cheer-det', uiText('runtime.supporter.cheerDetail', { user: ev.user_name, bits: ev.bits }));
                        }
                    }
                    else if (subtype === 'channel.follow') {
                        if (document.getElementById('es-f-follow')?.checked === false) showLog = false;
                        logMsg = `👥 ${uiText('runtime.supporter.follow', { user: ev.user_name })}`;
                        
                        // Stats tracking
                        if (canAddSupporter('follow', ev.user_id, ev.user_login, ev.user_name)) {
                            streamStats.follows++;
                            if (!streamStats.followers.includes(ev.user_name)) streamStats.followers.push(ev.user_name);
                            appendToStatsTextarea('pg-i-follow-det', uiText('runtime.supporter.followDetail', { user: ev.user_name }));
                        }
                    }
                    else if (subtype === 'channel.raid') {
                        if (document.getElementById('es-f-raid')?.checked === false) showLog = false;
                        logMsg = `🚀 ${uiText('runtime.supporter.raid', { user: ev.from_broadcaster_user_name, viewers: ev.viewers })}`;
                        triggerNotification('raid');
                        
                        // Stats tracking
                        if (canAddSupporter('raid', ev.from_broadcaster_user_id, ev.from_broadcaster_user_login, ev.from_broadcaster_user_name)) {
                            streamStats.raids.push({ user: ev.from_broadcaster_user_name, viewers: ev.viewers });
                            const twitchUrl = ev.from_broadcaster_user_login ? ` https://www.twitch.tv/${ev.from_broadcaster_user_login}` : '';
                            appendToStatsTextarea('pg-i-raid-det', uiText('runtime.supporter.raidDetail', { user: ev.from_broadcaster_user_name, viewers: ev.viewers, url: twitchUrl }));
                        }

                        // Shoutout (シャウトアウト) の入力欄にレイド元のIDを自動入力
                        if (ev.from_broadcaster_user_login) {
                            const soInput = document.getElementById('so-user-input');
                            if (soInput) {
                                // 手動入力中の邪魔をしないよう、入力欄が空の場合のみ自動入力します
                                if (!soInput.value.trim()) {
                                    soInput.value = ev.from_broadcaster_user_login;
                                }
                            }
                        }
                    }
                    else if (subtype === 'channel.hype_train.begin') {
                        if (document.getElementById('es-f-hype')?.checked === false) showLog = false;
                        logMsg = `🚂 ${uiText('runtime.supporter.hypeStart', { level: ev.level })}`;
                    }
                    else if (subtype === 'channel.hype_train.end') {
                        if (document.getElementById('es-f-hype')?.checked === false) showLog = false;
                        logMsg = `🏁 ${uiText('runtime.supporter.hypeEnd', { level: ev.level })}`;
                    }
                    else if (subtype === 'channel.chat.message') {
                        const isFirstTime = ev.badges?.some(b => b.set_id === 'first-time-chatter');
                        const chatLogin = normalizeSupporterLogin(ev.chatter_user_login || ev.chatter_user_name);
                        const chatName = ev.chatter_user_name || ev.chatter_user_login || '';
                        const excluded = isSupporterExcluded(ev.chatter_user_id, ev.chatter_user_login, ev.chatter_user_name);
                        if (isFirstTime) {
                            logMsg = `💬 ${uiText('runtime.supporter.firstChat', { user: ev.chatter_user_name })}`;
                            if (isSupporterCategoryEnabled('first') && !excluded) {
                                appendToStatsTextarea('pg-i-first-det', uiText('runtime.supporter.firstChatDetail', { user: chatName }));
                            }
                        } else {
                            showLog = false;
                        }
                        if (isSupporterCategoryEnabled('chat') && !excluded && chatLogin && !streamStats.chatters.has(chatLogin)) {
                            streamStats.chatters.add(chatLogin);
                            appendToStatsTextarea('pg-i-chat-det', chatName);
                        }
                    }

                    // カテゴリログは showLog に関わらず logMsg があれば記録
                    if (logMsg) {
                        if (subtype === 'channel.subscribe') appendCategoryTextLog('sub', logMsg);
                        else if (subtype === 'channel.subscription.message') appendCategoryTextLog('sub', logMsg);
                        else if (subtype === 'channel.subscription.gift') appendCategoryTextLog('sub', logMsg);
                        else if (subtype === 'channel.cheer') appendCategoryTextLog('cheer', logMsg);
                        else if (subtype === 'channel.follow') appendCategoryTextLog('follow', logMsg);
                        else if (subtype === 'channel.raid') appendCategoryTextLog('raid', logMsg);
                        else if (subtype.startsWith('channel.hype_train')) appendCategoryTextLog('hype', logMsg);
                        else if (subtype === 'channel.chat.message') appendCategoryTextLog('first', logMsg);
                    }
                } else if (mtype === 'session_keepalive') {
                    // keep-alive、ログ不要
                } else if (mtype === 'session_reconnect') {
                    esLog('SYS', uiText('runtime.supporter.reconnectRequested'));
                    const newUrl = msg.payload?.session?.reconnect_url;
                    if (newUrl) {
                        const previousSocket = _esWs;
                        _esWs = null;
                        if (previousSocket) {
                            previousSocket.onclose = null;
                            previousSocket.close();
                        }
                        connectEventSub(newUrl);
                    }
                }
            };

            _esWs.onerror = () => esLog('ERR', uiText('runtime.supporter.websocketError'));
            _esWs.onclose = () => {
                esSetStatus(false);
                esLog('SYS', uiText('runtime.supporter.disconnected'));
                _esWs = null;
                _esSessionId = null;
                
                // 手動切断でない場合、5秒後に自動再接続を試みる
                if (!_esManualDisconnect) {
                    esLog('SYS', uiText('runtime.supporter.reconnectIn'));
                    if (_esReconnectTimeout) clearTimeout(_esReconnectTimeout);
                    _esReconnectTimeout = setTimeout(() => {
                        connectEventSub();
                    }, 5000);
                }
            };
        }

        function disconnectEventSub() {
            _esManualDisconnect = true;
            if (_esReconnectTimeout) clearTimeout(_esReconnectTimeout);
            if (_esWs) { _esWs.close(); _esWs = null; }
            esSetStatus(false);
            esLog('SYS', uiText('runtime.supporter.manualDisconnected'));
        }

        // EventSubを補完する配信状態ポーリング
        let _streamCheckInterval = null;
        async function checkStreamStatus() {
            const bId = settings.userId;
            if (!bId || !settings.clientId || !settings.token) return;

            try {
                const r = await apiRequest(`/streams?user_id=${bId}`);
                const stream = r?.data?.[0];
                const currentStreamId = stream?.type === 'live' ? String(stream.id || stream.started_at || '') : '';
                if (!_streamStateInitialized) {
                    _streamStateInitialized = true;
                    if (currentStreamId && _lastObservedStreamId && currentStreamId !== _lastObservedStreamId) {
                        esLog('SYS', uiText('runtime.supporter.onlineDetected'));
                        handleSupporterStreamStart(currentStreamId);
                    } else if (currentStreamId && !_lastObservedStreamId) {
                        _lastObservedStreamId = currentStreamId;
                        safeSetLocal(SUPPORTER_LAST_STREAM_ID_KEY, currentStreamId);
                    }
                } else if (currentStreamId && currentStreamId !== _lastObservedStreamId) {
                    esLog('SYS', uiText('runtime.supporter.onlineDetected'));
                    handleSupporterStreamStart(currentStreamId);
                } else if (!currentStreamId) {
                    _lastObservedStreamId = '';
                }
                if (currentStreamId) {
                    const nextDate = stream.started_at || streamStats.streamDate || new Date().toISOString();
                    const nextTitle = String(stream.title || streamStats.streamTitle || '');
                    if (streamStats.streamDate !== nextDate || streamStats.streamTitle !== nextTitle) {
                        streamStats.streamDate = nextDate;
                        streamStats.streamTitle = nextTitle;
                        updatePostPreview();
                    }
                }
                if (!_esWs) connectEventSub();
            } catch (err) {
                console.error("Stream check failed:", err);
            }
        }
