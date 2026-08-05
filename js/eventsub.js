        // === EventSub WebSocket ===
        const SUPPORTER_LAST_STREAM_ID_KEY = 'stream_supporter_last_stream_id_v16';
        const SUPPORTER_ARCHIVE_STORAGE_KEY = 'stream_supporter_archives_v16';
        const SUPPORTER_ARCHIVE_LEGACY_KEY = 'stream_supporter_archive_v16';
        const SUPPORTER_ARCHIVE_LIMIT = 30;
        const EVENTSUB_MESSAGE_DEDUPE_LIMIT = 1000;
        const EVENTSUB_MESSAGE_DEDUPE_TTL_MS = 10 * 60 * 1000;
        const SUPPORTER_CATEGORY_DEFAULTS = Object.freeze({
            first: true,
            raid: true,
            follow: true,
            cheer: true,
            sub: true,
            gift: true,
            chat: true,
            point: true
        });
        let _esWs = null, _esSessionId = null, _esManualDisconnect = false, _esReconnectTimeout = null, _esReconnectDelay = 5000;
        const _esProcessedMessageIds = new Map();
        let _streamStateInitialized = false;
        let _lastObservedStreamId = (() => {
            try {
                return localStorage.getItem(SUPPORTER_LAST_STREAM_ID_KEY) || '';
            } catch (error) {
                return '';
            }
        })();
        let _numberWheelInitialized = false;

        function isDuplicateEventSubNotification(metadata) {
            const messageId = String(metadata?.message_id || '').trim();
            if (!messageId) return false;

            const now = Date.now();
            for (const [storedId, seenAt] of _esProcessedMessageIds) {
                if (now - seenAt <= EVENTSUB_MESSAGE_DEDUPE_TTL_MS) break;
                _esProcessedMessageIds.delete(storedId);
            }

            if (_esProcessedMessageIds.has(messageId)) {
                _esProcessedMessageIds.delete(messageId);
                _esProcessedMessageIds.set(messageId, now);
                return true;
            }

            _esProcessedMessageIds.set(messageId, now);
            while (_esProcessedMessageIds.size > EVENTSUB_MESSAGE_DEDUPE_LIMIT) {
                const oldestId = _esProcessedMessageIds.keys().next().value;
                _esProcessedMessageIds.delete(oldestId);
            }
            return false;
        }

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
                raidSoLog(uiText('runtime.autoAdMissingBroadcaster'), 'warn');
                return;
            }
            raidSoLog(uiText('runtime.autoAdStreamStarted'));
            try {
                const r = await apiRequest('/channels/commercial', 'POST', {
                    broadcaster_id: bId,
                    length: 180
                });
                if (r?.data?.[0]) {
                    const sec = r.data[0].length || 180;
                    raidSoLog(uiText('runtime.autoAdStarted', { seconds: sec }));
                } else {
                    raidSoLog(uiText('runtime.autoAdFailed'), 'warn');
                }
            } catch (err) {
                raidSoLog(uiText('runtime.autoAdError', { error: err.message || err }), 'warn');
            }
        }

        function handleSupporterStreamStart(streamId = '') {
            const marker = String(streamId || '').trim();
            if (marker && marker === _lastObservedStreamId) return false;
            if (marker) {
                _lastObservedStreamId = marker;
                safeSetLocal(SUPPORTER_LAST_STREAM_ID_KEY, marker);
            }

            if (typeof raidSoState !== 'undefined') {
                raidSoState.seenChatters = new Set();
            }
            if (typeof triggerCpAutoOn === 'function') {
                Promise.resolve(triggerCpAutoOn('stream_start')).catch(error => {
                    console.warn('Channel point stream-start automation failed:', error);
                });
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
                first: uiText('runtime.supporter.headingFirst'),
                point: uiText('runtime.supporter.headingPoint')
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
            const timeEl = document.createElement('span');
            timeEl.className = 'tw-log-time';
            timeEl.textContent = time;
            const typeEl = document.createElement('span');
            typeEl.className = 'tw-log-type';
            typeEl.textContent = `[${type}]`;
            entry.append(timeEl, typeEl, document.createTextNode(String(msg ?? '')));
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
                    _esReconnectDelay = 5000;
                    esLog('SYS', uiText('runtime.supporter.sessionReceived', { id: _esSessionId?.slice(0, 12) || '' }));
                    const bId = settings.userId;
                    await esSubscribe('channel.subscribe', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.subscription.message', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.subscription.gift', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.bits.use', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.follow', '2', { broadcaster_user_id: bId, moderator_user_id: bId });
                    await esSubscribe('channel.raid', '1', { to_broadcaster_user_id: bId });
                    await esSubscribe('channel.hype_train.begin', '2', { broadcaster_user_id: bId });
                    await esSubscribe('channel.hype_train.end', '2', { broadcaster_user_id: bId });
                    await esSubscribe('stream.online', '1', { broadcaster_user_id: bId });
                    await esSubscribe('stream.offline', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.chat.message', '1', { broadcaster_user_id: bId, user_id: bId });
                    await esSubscribe('channel.channel_points_custom_reward_redemption.add', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.channel_points_custom_reward.add', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.channel_points_custom_reward.update', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.channel_points_custom_reward.remove', '1', { broadcaster_user_id: bId });
                    await esSubscribe('channel.channel_points_automatic_reward_redemption.add', '2', { broadcaster_user_id: bId });
                    esLog('SYS', uiText('runtime.supporter.subscriptionsReady', { count: 12 }));
                } else if (mtype === 'notification') {
                    if (isDuplicateEventSubNotification(msg.metadata)) return;
                    const subtype = msg.metadata?.subscription_type;
                    const ev = msg.payload?.event;
                    let logMsg = "";
                    let showLog = true;

                    if (subtype === 'stream.online') {
                        const didReset = handleSupporterStreamStart(ev.id || ev.started_at || '');
                        logMsg = `📡 ${uiText(didReset ? 'runtime.supporter.streamStarted' : 'runtime.supporter.streamStartedNoReset')}`;
                    } else if (subtype === 'stream.offline') {
                        logMsg = `📡 Stream offline detected`;
                        if (typeof triggerCpAutoOff === 'function') {
                            Promise.resolve(triggerCpAutoOff('stream_offline')).catch(error => {
                                console.warn('Channel point stream-offline automation failed:', error);
                            });
                        }
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
                    else if (subtype === 'channel.bits.use') {
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
                        const isOutbound = ev.from_broadcaster_user_id === settings.userId;
                        if (isOutbound) {
                            logMsg = `🚀 Outbound Raid to ${ev.to_broadcaster_user_name} with ${ev.viewers} viewers!`;
                            if (typeof handleRaidSoOutboundRaidEvent === 'function') {
                                handleRaidSoOutboundRaidEvent(ev);
                            }
                        } else {
                            if (document.getElementById('es-f-raid')?.checked === false) showLog = false;
                            logMsg = `🚀 ${uiText('runtime.supporter.raid', { user: ev.from_broadcaster_user_name, viewers: ev.viewers })}`;
                            triggerNotification('raid');
                            if (typeof triggerCpAutoOn === 'function') {
                                Promise.resolve(triggerCpAutoOn('raid')).catch(error => {
                                    console.warn('Channel point raid automation failed:', error);
                                });
                            }

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
                    else if (subtype === 'channel.channel_points_custom_reward_redemption.add') {
                        if (document.getElementById('es-f-point')?.checked === false) showLog = false;
                        const rewardTitle = ev.reward?.title || '';
                        logMsg = `🪙 ${uiText('runtime.supporter.channelPointRedeemed', { user: ev.user_name || ev.user_login, reward: rewardTitle })}`;
                        triggerNotification('point');
                        if (canAddSupporter('point', ev.user_id, ev.user_login, ev.user_name)) {
                            appendToStatsTextarea('pg-i-point-det', uiText('runtime.supporter.channelPointRedeemedDetail', { user: ev.user_name || ev.user_login, reward: rewardTitle }));
                        }
                    }
                    else if (subtype === 'channel.channel_points_automatic_reward_redemption.add') {
                        if (document.getElementById('es-f-point')?.checked === false) showLog = false;
                        const autoRewardType = ev.reward?.type || '';
                        let rewardTitle = autoRewardType;
                        if (autoRewardType === 'send_gigantified_emote' || autoRewardType === 'gigantify_an_emote') {
                            rewardTitle = uiText('runtime.rewardLabels.gigantifiedEmote');
                        } else if (autoRewardType === 'send_animated_message' || autoRewardType === 'message_effect') {
                            rewardTitle = uiText('runtime.rewardLabels.messageEffect');
                        } else if (autoRewardType === 'celebration') {
                            rewardTitle = uiText('runtime.rewardLabels.celebration');
                        } else if (autoRewardType === 'send_highlighted_message') {
                            rewardTitle = uiText('runtime.rewardLabels.highlightedMessage');
                        }
                        
                        logMsg = `🪙 ${uiText('runtime.supporter.channelPointRedeemed', { user: ev.user_name || ev.user_login, reward: rewardTitle })}`;
                        triggerNotification('point');
                        if (canAddSupporter('point', ev.user_id, ev.user_login, ev.user_name)) {
                            appendToStatsTextarea('pg-i-point-det', uiText('runtime.supporter.channelPointRedeemedDetail', { user: ev.user_name || ev.user_login, reward: rewardTitle }));
                        }
                    }

                    // カテゴリログは showLog に関わらず logMsg があれば記録
                    if (logMsg) {
                        if (subtype === 'channel.subscribe') appendCategoryTextLog('sub', logMsg);
                        else if (subtype === 'channel.subscription.message') appendCategoryTextLog('sub', logMsg);
                        else if (subtype === 'channel.subscription.gift') appendCategoryTextLog('sub', logMsg);
                        else if (subtype === 'channel.bits.use') appendCategoryTextLog('cheer', logMsg);
                        else if (subtype === 'channel.follow') appendCategoryTextLog('follow', logMsg);
                        else if (subtype === 'channel.raid') appendCategoryTextLog('raid', logMsg);
                        else if (subtype.startsWith('channel.hype_train')) appendCategoryTextLog('hype', logMsg);
                        else if (subtype === 'channel.chat.message') appendCategoryTextLog('first', logMsg);
                        else if (subtype === 'channel.channel_points_custom_reward_redemption.add' || subtype === 'channel.channel_points_automatic_reward_redemption.add') appendCategoryTextLog('point', logMsg);
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
                
                // 手動切断でない場合、徐々に間隔を広げつつ自動再接続を試みる
                if (!_esManualDisconnect) {
                    const delaySecs = Math.round(_esReconnectDelay / 1000);
                    esLog('SYS', uiText('runtime.supporter.reconnectIn', { seconds: delaySecs }));
                    if (_esReconnectTimeout) clearTimeout(_esReconnectTimeout);
                    _esReconnectTimeout = setTimeout(() => {
                        connectEventSub();
                    }, _esReconnectDelay);
                    _esReconnectDelay = Math.min(_esReconnectDelay * 2, 60000);
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
                if (typeof pollRaidSoListenerArrivals === 'function') {
                    pollRaidSoListenerArrivals(currentStreamId);
                }
                if (!_esWs) connectEventSub();
            } catch (err) {
                console.error("Stream check failed:", err);
            }
        }

        function ensureTwitchEventServicesStarted() {
            if (!settings.userId || !settings.clientId || !settings.token) return false;

            if (!_esWs) connectEventSub();
            if (!_streamCheckInterval) {
                checkStreamStatus();
                _streamCheckInterval = setInterval(checkStreamStatus, 60000);
            }
            return true;
        }
