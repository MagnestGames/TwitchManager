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

        function uiText(path, vars = {}, fallback = '') {
            const resolve = source => String(path || '').split('.').reduce((value, key) => value == null ? undefined : value[key], source);
            let value = resolve(langMap[currentLang]);
            if (value === undefined) value = resolve(langMap.ja);
            if (value === undefined) value = fallback;
            return String(value ?? '').replace(/\{([A-Za-z0-9_]+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match);
        }

        function initLanguage() {
            setLanguage(currentLang, false);
        }

        function updateLanguageButton() {
            const option = LANGUAGE_OPTIONS.find(item => item.code === currentLang) || LANGUAGE_OPTIONS[0];
            const btn = document.getElementById('ui-btn-language');
            if (btn) {
                btn.innerText = option.short;
                btn.setAttribute('data-tooltip', uiText('extended.language'));
            }
            document.querySelectorAll('[data-lang-option]').forEach(el => {
                const active = el.getAttribute('data-lang-option') === currentLang;
                el.classList.toggle('active', active);
                el.setAttribute('aria-current', active ? 'true' : 'false');
            });
        }

        function closeLanguageMenu() {
            const menu = document.getElementById('language-menu');
            const btn = document.getElementById('ui-btn-language');
            if (menu) menu.classList.remove('open');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }

        function toggleLanguageMenu(event) {
            event?.stopPropagation();
            const menu = document.getElementById('language-menu');
            const btn = document.getElementById('ui-btn-language');
            if (!menu || !btn) return;
            const nextOpen = !menu.classList.contains('open');
            menu.classList.toggle('open', nextOpen);
            btn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
        }

        function chooseLanguage(lang) {
            setLanguage(lang);
            closeLanguageMenu();
        }

        function setLanguage(lang, shouldSave = true) {
            if (!langMap[lang]) return;
            const currentActiveTab = document.querySelector('.tab-content.active')?.id || 'main-tab';
            const at = currentActiveTab;
            currentLang = lang; const L = langMap[currentLang];
            document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : currentLang;
            if (shouldSave) localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
            updateLanguageButton();

            // 自動ローカライズ (data-i18n)
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const keys = el.getAttribute('data-i18n').split('.');
                let val = L;
                keys.forEach(k => { if(val) val = val[k]; });
                if (val) el.innerText = val;
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const keys = el.getAttribute('data-i18n-placeholder').split('.');
                let val = L;
                keys.forEach(k => { if(val) val = val[k]; });
                if (val) el.placeholder = val;
            });
            document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
                const keys = el.getAttribute('data-i18n-tooltip').split('.');
                let val = L;
                keys.forEach(k => { if(val) val = val[k]; });
                if (val) el.setAttribute('data-tooltip', val);
            });
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                const keys = el.getAttribute('data-i18n-aria').split('.');
                let val = L;
                keys.forEach(k => { if (val) val = val[k]; });
                if (val !== undefined) el.setAttribute('aria-label', val);
            });


            document.getElementById('toast').innerText = L.toast;
            document.getElementById('lock-btn').setAttribute('data-tooltip', L.lock);

            // 折りたたみテキストの更新
            const summaryMain = document.getElementById('ui-info-summary-text');
            if (summaryMain) summaryMain.innerText = L.infoSummary;
            document.querySelectorAll('.ui-info-summary-text-common').forEach(el => el.innerText = L.infoSummary);

            // 注意書きテキストの更新
            const topInfo = document.getElementById('ui-main-info-top');
            if (topInfo) topInfo.innerHTML = L.mainInfoTop || '';
            const bottomInfo = document.getElementById('ui-main-info-bottom');
            if (bottomInfo) bottomInfo.innerHTML = L.mainInfoBottom || '';
            document.querySelectorAll('.ui-common-warning').forEach(el => el.innerHTML = L.commonWarning || '');
            document.querySelectorAll('.ui-backup-warning').forEach(el => el.innerHTML = L.backupWarning || '');

            // ボタン類などの更新
            document.querySelectorAll('[id^="del-mode-"]').forEach(el => {
                const targetTab = document.getElementById(`${el.id.replace('del-mode-', '')}-tab`);
                el.innerText = targetTab?.classList.contains('delete-mode-on') ? deleteModeText() : L.delete;
            });
            document.querySelectorAll('[id^="ui-add-template-"]').forEach(el => el.innerText = L.addTemplate);
            document.querySelectorAll('[id^="ui-save-"]').forEach(el => el.innerText = L.save);
            const addMemoBtn = document.getElementById('ui-add-memo');
            if (addMemoBtn) {
                addMemoBtn.innerText = '＋';
                addMemoBtn.title = L.extended?.addMemoAria || L.addMemo;
                addMemoBtn.setAttribute('aria-label', L.extended?.addMemoAria || L.addMemo);
            }
            const footerActions = L.footerActions || langMap.ja.footerActions;
            const restoreFileInput = document.getElementById('ui-restore-file');
            const restoreFileName = document.getElementById('ui-restore-file-name');
            if (restoreFileName && !restoreFileInput?.files?.length) restoreFileName.innerText = footerActions.noFileSelected;
            const footerLabelMap = {
                'ui-save-cmd': L.save,
                'ui-raid-save': L.save,
                'ui-backup-select-file': footerActions.selectFile,
                'ui-backup-copy-footer': footerActions.copyBackup,
                'ui-backup-restore-footer': footerActions.loadBackup,
                'ui-backup-copy-log-footer': footerActions.copyLogs,
                'ui-backup-clear-log-footer': footerActions.clearLogs
            };
            Object.entries(footerLabelMap).forEach(([id, text]) => {
                const el = document.getElementById(id);
                if (el && text) el.innerText = text;
            });
            document.getElementById('ui-backup-title').innerText = L.backupTitle;
            document.getElementById('ui-backup-copy').innerText = L.backupCopy;
            const restoreTitleText = document.querySelector('#ui-restore-title [data-i18n="restoreTitle"]');
            if (restoreTitleText) restoreTitleText.innerText = L.restoreTitle;
            document.getElementById('ui-restore-btn').innerText = L.restoreBtn;
            const backupLogTitle = document.getElementById('ui-backup-log-title');
            const cmdText = commandText();
            const raidText = L.raidSo || langMap.ja.raidSo;
            if (backupLogTitle) backupLogTitle.innerText = raidText.logsTitle || langMap.ja.raidSo.logsTitle;
            document.querySelectorAll('[data-raidso-log]').forEach(el => {
                el.dataset.empty = raidText.noLogs || cmdText.noLogs || '';
            });
            document.getElementById('ui-btn-guide').setAttribute('data-tooltip', L.tips.guide);
            document.getElementById('ui-btn-settings').setAttribute('data-tooltip', L.tips.settings);
            const dateBtn = document.getElementById('ui-btn-copy-date');
            if (dateBtn) dateBtn.setAttribute("data-tooltip", L.copyDateTip || langMap.ja.copyDateTip);
            
            // Date format label is handled by data-i18n now

            const settingsUi = L.settingsUi || {};
            const settingsTitle = document.getElementById('ui-settings-title');
            if (settingsTitle && settingsUi.title) settingsTitle.innerText = settingsUi.title;
            const authTitle = document.getElementById('ui-settings-auth-title');
            if (authTitle && settingsUi.authTitle) authTitle.innerText = settingsUi.authTitle;
            const authHelp = document.getElementById('ui-settings-auth-help');
            if (authHelp && settingsUi.authHelp) authHelp.innerText = settingsUi.authHelp;
            const displayTitle = document.getElementById('ui-settings-display-title');
            if (displayTitle && settingsUi.displayTitle) displayTitle.innerText = settingsUi.displayTitle;
            const settingsLabelMap = {
                'ui-settings-redirect-uri': settingsUi.redirectUri,
                'ui-settings-client-id': settingsUi.clientId,
                'ui-settings-access-token': settingsUi.accessToken
            };
            Object.entries(settingsLabelMap).forEach(([id, text]) => {
                const el = document.getElementById(id);
                if (el && text) el.innerText = text;
            });
            const clientIdInput = document.getElementById('client_id');
            if (clientIdInput && settingsUi.clientIdPlaceholder) clientIdInput.placeholder = settingsUi.clientIdPlaceholder;
            const tokenInput = document.getElementById('token');
            if (tokenInput && settingsUi.tokenPlaceholder) tokenInput.placeholder = settingsUi.tokenPlaceholder;
            const settingsAuthBtn = document.getElementById('ui-settings-auth-btn');
            if (settingsAuthBtn && settingsUi.openAuth) settingsAuthBtn.innerText = settingsUi.openAuth;
            const settingsRevokeAuthBtn = document.getElementById('ui-settings-revoke-auth-btn');
            if (settingsRevokeAuthBtn && settingsUi.revokeAuth) settingsRevokeAuthBtn.innerText = settingsUi.revokeAuth;
            const settingsSaveBtn = document.getElementById('ui-settings-save');
            if (settingsSaveBtn && settingsUi.save) settingsSaveBtn.innerText = settingsUi.save;
            updateSettingsAuthStatus();

            const datalist = document.getElementById('date_format_presets');
            if (datalist && L.dateFormatOptions) {
                Array.from(datalist.options).forEach(opt => {
                    if (L.dateFormatOptions[opt.value]) opt.innerText = L.dateFormatOptions[opt.value];
                });
            }
            updateTodayDateDisplay();

            // モーダルとコマンドの更新
            const guideEl = document.getElementById('ui-guide-content');
            if (guideEl) guideEl.innerHTML = L.guideHtml;
            const cmdEl = document.getElementById('cmd-container');
            if (cmdEl) cmdEl.innerHTML = L.cmdHtml;
            refreshTwitchChoicePlaceholders();
            renderShoutoutSuggestions();
            renderRaidShoutOutPanel();
            restoreCategoryVisibility('cmd-tab');
            restoreCategoryVisibility('raid-tab');

            // タブの再構築
            const tn = document.getElementById('tab-navigation');
            if (tn) {
                tn.innerHTML = '';
                const defaultTids = ['main-tab', 'raid-tab', 'twitch-tab', 'cmd-tab', 'friends-tab', 'memo-tab', 'misc-tab'];
                let tids = [...defaultTids];
                try {
                    const savedOrder = JSON.parse(localStorage.getItem('stream_tab_order_v16'));
                    if (savedOrder && Array.isArray(savedOrder)) {
                        const filteredSaved = savedOrder.filter(id => defaultTids.includes(id));
                        const missing = defaultTids.filter(id => !filteredSaved.includes(id));
                        tids = [...filteredSaved, ...missing];
                    }
                } catch (e) {}

                tids.forEach((tid) => {
                    const defaultIdx = defaultTids.indexOf(tid);
                    const name = L.tabs[defaultIdx];
                    const b = document.createElement('button');
                    b.className = "tab-btn" + (tid === at ? " active" : "");
                    b.innerText = name;
                    b.dataset.tabTarget = tid;
                    b.onclick = () => switchTab(tid, b);
                    tn.appendChild(b);
                });
            }

            // 描画更新
            render(); renderFriends(); renderMemo();
            restoreTwitchListCaches();
            ensureDefaultTwitchPresets();
            updatePollPresetDropdown();
            updatePredPresetDropdown();
            const supporterResetToggle = document.getElementById('supporter-reset-on-stream-start');
            if (supporterResetToggle) supporterResetToggle.checked = settings.supporterResetOnStreamStart !== false;
            restoreSupporterControls();
        }


        const SPINNER_SVG = `<svg class="spinner" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg>`;

        const dialogCopyMap = Object.fromEntries(Object.entries(I18N_DATA).map(([lang, data]) => [lang, data.ui.inputDialogs]));

        function dialogCopy(key, vars = {}) {
            const lang = dialogCopyMap[currentLang] || dialogCopyMap.ja;
            const base = lang[key] || dialogCopyMap.ja[key] || {};
            const format = value => String(value || '').replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
            return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, format(v)]));
        }

        function dialogGuideHtml(options = {}) {
            const lang = dialogCopyMap[currentLang] || dialogCopyMap.ja;
            const rows = [];
            if (options.input) rows.push([lang.inputLabel, options.input]);
            if (options.output) rows.push([lang.outputLabel, options.output]);
            if (!rows.length && !options.note) return "";
            const body = rows.map(([label, text]) => `<div class="dialog-guide-row"><span class="dialog-guide-label">${raidSoEscape(label)}</span><span class="dialog-guide-text">${raidSoEscape(text)}</span></div>`).join('');
            const note = options.note ? `<div class="dialog-guide-note">${raidSoEscape(options.note)}</div>` : '';
            return `<div class="dialog-guide">${body}${note}</div>`;
        }

        function showCustomDialog(options) {
            return new Promise((resolve) => {
                const overlay = document.getElementById('custom-dialog-overlay');
                const titleEl = document.getElementById('cd-title');
                const msgEl = document.getElementById('cd-message');
                const inputEl = document.getElementById('cd-input');
                const btnCancel = document.getElementById('cd-btn-cancel');
                const btnOk = document.getElementById('cd-btn-ok');
                const actionsEl = document.getElementById('cd-actions');

                titleEl.innerText = options.title || langMap[currentLang].alerts.notice;
                msgEl.innerHTML = options.messageHtml || options.message || "";
                msgEl.scrollTop = 0;

                inputEl.style.display = options.type === 'prompt' ? 'block' : 'none';
                inputEl.placeholder = options.placeholder || "";
                btnCancel.style.display = (options.type === 'confirm' || options.type === 'prompt') ? 'block' : 'none';
                actionsEl?.classList.toggle('single-action', options.type !== 'confirm' && options.type !== 'prompt');
                btnCancel.innerText = langMap[currentLang]?.cancel || langMap.ja.cancel;
                btnOk.innerText = options.okText || "OK";

                if (options.type === 'prompt') {
                    inputEl.value = options.defaultValue || "";
                    inputEl.setAttribute('aria-label', options.placeholder || options.title || langMap[currentLang].alerts.input);
                    setTimeout(() => inputEl.focus(), 100);
                }

                const closeDialog = () => {
                    overlay.classList.remove('show');
                    btnOk.onclick = null;
                    btnCancel.onclick = null;
                    overlay.onclick = null;
                    inputEl.onkeydown = null;
                    inputEl.placeholder = "";
                    if (closeTopBtn) closeTopBtn.style.display = 'none';
                    btnOk.style.display = '';
                    actionsEl.style.display = '';
                };

                const closeTopBtn = document.getElementById('cd-btn-close-top');
                // alert型は右上×ボタンに置き換え、下部OKを非表示
                if (options.type === 'alert') {
                    if (closeTopBtn) closeTopBtn.style.display = 'flex';
                    btnOk.style.display = 'none';
                    actionsEl.style.display = 'none';
                } else {
                    if (closeTopBtn) closeTopBtn.style.display = 'none';
                    btnOk.style.display = '';
                    actionsEl.style.display = '';
                }

                btnOk.onclick = () => { closeDialog(); resolve(options.type === 'prompt' ? inputEl.value : true); };
                btnCancel.onclick = () => { closeDialog(); resolve(options.type === 'prompt' ? null : false); };
                // オーバーレイ外クリックで閉じる（prompt/confirm以外の場合はOK扱い、それ以外はキャンセル扱い）
                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        if (options.type === 'confirm' || options.type === 'prompt') {
                            closeDialog(); resolve(options.type === 'prompt' ? null : false);
                        } else {
                            closeDialog(); resolve(true);
                        }
                    }
                };

                if (options.type === 'prompt') {
                    inputEl.onkeydown = (e) => { if (e.key === 'Enter') btnOk.onclick(); };
                }

                overlay.classList.add('show');
            });
        }

        async function customAlert(message) { await showCustomDialog({ type: 'alert', message: message }); }
        async function customConfirm(messageOrOptions) {
            const options = typeof messageOrOptions === 'object'
                ? messageOrOptions
                : { message: messageOrOptions, title: langMap[currentLang].alerts.confirm };
            return await showCustomDialog({
                type: 'confirm',
                title: options.title || langMap[currentLang].alerts.confirm,
                messageHtml: options.messageHtml || dialogGuideHtml(options),
                message: options.message || ''
            });
        }
        async function customPrompt(messageOrOptions, defaultValue = "") {
            const options = typeof messageOrOptions === 'object'
                ? messageOrOptions
                : { message: messageOrOptions, defaultValue, title: langMap[currentLang].alerts.input };
            return await showCustomDialog({
                type: 'prompt',
                title: options.title || langMap[currentLang].alerts.input,
                messageHtml: options.messageHtml || dialogGuideHtml(options),
                message: options.message || '',
                defaultValue: options.defaultValue ?? defaultValue,
                placeholder: options.placeholder || ''
            });
        }

        function showToast(m, type = "success") {
            const t = document.getElementById('toast');
            t.innerText = m;
            if (type === "error") t.style.background = "var(--danger)";
            else if (type === "info") t.style.background = "var(--twitch-purple)";
            else t.style.background = "var(--success)";
            t.className = "show";
            setTimeout(() => t.className = "", 2500);
        }

        function doneText() {
            return langMap[currentLang]?.toast || langMap.ja.toast;
        }

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.language-picker')) closeLanguageMenu();
        });

        function replayUiAnimation(el, className, duration = 360) {
            if (!el) return;
            el.classList.remove(className);
            void el.offsetWidth;
            el.classList.add(className);
            setTimeout(() => el.classList.remove(className), duration);
        }

        document.addEventListener('click', (event) => {
            const buttonLike = event.target.closest('button, .cmd-service-card');
            if (buttonLike) replayUiAnimation(buttonLike, 'ui-click-burst');

            const checkbox = event.target.matches('input[type="checkbox"]')
                ? event.target
                : event.target.closest('label')?.querySelector('input[type="checkbox"]');
            if (checkbox) replayUiAnimation(checkbox, 'ui-check-pop', 430);
        });

        function switchTab(id, b) {
            const target = document.getElementById(id);
            if (!target) return;
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            const tabButton = b || document.querySelector(`.tab-btn[data-tab-target="${id}"]`);
            if (tabButton) {
                tabButton.classList.add('active');
                tabButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            initSortable();
        }

        function initTabNavDrag() {
            const nav = document.getElementById('tab-navigation');
            if (!nav || nav.dataset.dragReady === 'true') return;
            nav.dataset.dragReady = 'true';
            let dragging = false;
            let moved = false;
            let startX = 0;
            let startScrollLeft = 0;

            nav.addEventListener('pointerdown', event => {
                if (event.pointerType !== 'mouse' || event.button !== 0) return;
                dragging = true;
                moved = false;
                startX = event.clientX;
                startScrollLeft = nav.scrollLeft;
            });
            nav.addEventListener('pointermove', event => {
                if (!dragging) return;
                const distance = event.clientX - startX;
                if (!moved && Math.abs(distance) <= 4) return;
                moved = true;
                nav.classList.add('is-dragging');
                nav.scrollLeft = startScrollLeft - distance;
            });
            const finishDrag = () => {
                if (!dragging) return;
                dragging = false;
                nav.classList.remove('is-dragging');
            };
            window.addEventListener('pointerup', finishDrag);
            window.addEventListener('pointercancel', finishDrag);
            nav.addEventListener('click', event => {
                if (!moved) return;
                event.preventDefault();
                event.stopPropagation();
                moved = false;
            }, true);
        }

        function switchTabById(id) {
            switchTab(id, document.querySelector(`.tab-btn[data-tab-target="${id}"]`));
        }

        function applyInitialViewFromLocation() {
            const params = new URLSearchParams(window.location.search);
            const tabId = params.get('tab');
            if (tabId) switchTabById(tabId);

            const openIds = (params.get('open') || '')
                .split(',')
                .map(id => id.trim())
                .filter(Boolean);
            openIds.forEach(id => document.getElementById(id)?.classList.remove('closed'));

            const focusId = params.get('focus');
            if (focusId) {
                requestAnimationFrame(() => {
                    document.getElementById(focusId)?.scrollIntoView({ block: 'start', behavior: 'auto' });
                });
            }
        }

        function openModal(id) { document.getElementById(id).classList.add('modal-open'); }
        function closeModal(id) { document.getElementById(id).classList.remove('modal-open'); }

        // 非セキュアコンテキスト（file:///やOBSドック）向け：ブラウザ制限を回避するため、完全に同期処理でコピーを実行
        function writeClipboardTextSync(value) {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (e) {
                ok = false;
            }
            document.body.removeChild(ta);
            return ok;
        }

        async function copyTextToClipboard(text, successMessage = doneText()) {
            const value = String(text ?? '');
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(value);
                    showToast(successMessage);
                    raidSoLog(uiText('runtime.operationLog.copied'));
                    return true;
                } catch (e) {}
            }
            if (writeClipboardTextSync(value)) {
                showToast(successMessage);
                raidSoLog(uiText('runtime.operationLog.copied'));
                return true;
            }
            const message = uiText('runtime.copyFallback');
            await customAlert(`${message}<br><br><div style="background:#000;border:1px solid var(--border-color);border-radius:8px;padding:10px;white-space:pre-wrap;">${raidSoEscape(value)}</div>`);
            return false;
        }

        async function copyRaw(t) { return await copyTextToClipboard(t); }

        function commandText() {
            return cmdSets[currentLang] || cmdSets.ja;
        }

        function formatCommandLog(key, vars = {}) {
            const text = commandText()[key] || cmdSets.ja[key] || '';
            return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
        }

        function formatDateToken(date = new Date(), format = settings.dateFormat || 'MM/DD') {
            const yyyy = String(date.getFullYear());
            const yy = yyyy.slice(-2);
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const m = String(date.getMonth() + 1);
            const dd = String(date.getDate()).padStart(2, '0');
            const d = String(date.getDate());
            
            const localeRuntime = langMap[currentLang]?.runtime || langMap.ja.runtime;
            const wShort = localeRuntime.weekdaysShort[date.getDay()];
            const wLong = localeRuntime.weekdaysLong[date.getDay()];

            return format.replace(/(YYYY|YY|MM|M|DD|D|WW|W)/g, match => {
                switch (match) {
                    case 'YYYY': return yyyy;
                    case 'YY': return yy;
                    case 'MM': return mm;
                    case 'M': return m;
                    case 'DD': return dd;
                    case 'D': return d;
                    case 'WW': return wLong;
                    case 'W': return wShort;
                    default: return match;
                }
            });
        }

        function updateTodayDateDisplay() {
            const el = document.getElementById('today-date');
            if (!el) return;
            const now = new Date();
            const time = now.toLocaleTimeString(undefined, { hour12: false });
            el.innerText = `${formatDateToken(now, settings.dateFormat || 'MM/DD')} ${time}`;
        }

        function handleDateFormatPreview(value) {
            settings = { ...settings, dateFormat: value || 'MM/DD' };
            updateTodayDateDisplay();
            const livePreview = document.getElementById('date_format_live_preview');
            if(livePreview) {
                livePreview.innerText = uiText('runtime.datePreview', { date: formatDateToken(new Date(), settings.dateFormat) });
            }
        }

        const raidSoErrorRules = [
            [/cooldown period expires|may not give another Shoutout/i, 'shoutoutCooldown'],
            [/not streaming live|one or more viewers/i, 'shoutoutNotLive'],
            [/may not give themselves|cannot shoutout yourself|same broadcaster/i, 'shoutoutSelf'],
            [/channel:read:redemptions|channel:manage:redemptions/i, 'missingRedemptionScope'],
            [/user:read:chat|channel:bot|user:bot/i, 'missingChatScope'],
            [/moderator:manage:shoutouts|manage:shoutouts|scope/i, 'missingShoutoutScope'],
            [/not one of the broadcaster'?s moderators|moderator/i, 'notModerator'],
            [/may not send the specified broadcaster/i, 'shoutoutUnavailable'],
            [/exceeded the number of Shoutouts|Too Many Requests|429/i, 'shoutoutRateLimit'],
            [/Unauthorized|401|access token|OAuth token|not valid/i, 'unauthorized'],
            [/not found/i, 'userNotFound']
        ];

        function localizeRaidSoError(error) {
            const raw = [error?.message, error?.data?.message, error?.data?.error].filter(Boolean).join(' ').trim() || String(error || '').trim();
            const hit = raidSoErrorRules.find(([pattern]) => pattern.test(raw));
            return hit ? uiText(`apiErrors.${hit[1]}`) : raw;
        }

        async function sendCommandToChat(message, logKey, vars = {}) {
            const text = String(message || '').trim();
            if (!text) return showToast(commandText().commandSendEmpty || cmdSets.ja.commandSendEmpty);
            try {
                ensureRaidSoBaseSettings();
                await sendRaidSoChat(text, formatCommandLog(logKey, { ...vars, command: text }));
                showToast(doneText());
            } catch (e) {
                const fail = commandText().commandSendFailed || cmdSets.ja.commandSendFailed;
                const detail = localizeRaidSoError(e);
                raidSoLog(`${fail}: ${detail}`, 'warn');
                await customAlert(`${raidSoEscape(fail)}<br><br><span style="color:var(--text-muted);">${raidSoEscape(detail)}</span>`);
            }
        }

        async function copyCommandButton(button) {
            const rawCommand = button?.dataset?.command || '';
            const command = String(rawCommand || '').trim();
            const label = button?.dataset?.label || command;
            if (!command) return showToast(commandText().commandSendEmpty || cmdSets.ja.commandSendEmpty);
            const copied = await copyRaw(rawCommand);
            if (copied) raidSoLog(formatCommandLog('copiedCommand', { label, command }));
        }

        async function sendCommandButton(button) {
            const command = button?.dataset?.command || '';
            const label = button?.dataset?.label || command.trim();
            const message = String(command || '').trim();
            if (!message) return;
            await sendCommandToChat(message, 'sentCommand', { label, command: message });
        }

        async function sendShoutoutCommandFromInput() {
            const input = document.getElementById('so-user-input');
            const raw = input?.value.trim() || '';
            const login = normalizeFriendTwitch(raw);
            if (!login) return showToast(uiText('runtime.inputTwitchId'));
            try {
                ensureRaidSoBaseSettings();
                const user = await getRaidSoUser(login);
                const displayName = user.display_name || user.login || login;
                rememberShoutoutId({ username: user.login || login, displayName, url: `https://twitch.tv/${user.login || login}`, description: user.description || '' });
                const result = await sendRaidSoOfficialShoutout(user.id, user.login || login, formatCommandLog('sentShoutout', { id: user.login || login }));
                showToast(result?.queued ? (commandText().shoutoutQueuedToast || doneText()) : doneText());
            } catch (e) {
                const fail = commandText().shoutoutSendFailed || cmdSets.ja.shoutoutSendFailed;
                const detail = localizeRaidSoError(e);
                raidSoLog(`${fail}: ${detail}`, 'warn');
                await customAlert(`${raidSoEscape(fail)}<br><br><span style="color:var(--text-muted);">${raidSoEscape(detail)}</span>`);
            }
        }

        function parseCommandIds(value) {
            return [...new Set(String(value || '')
                .split(/[\s,、]+/)
                .map(normalizeRaidSoLogin)
                .filter(Boolean))];
        }

        
        function saveTabOrder() {
            const tn = document.getElementById('tab-navigation');
            if (!tn) return;
            const order = Array.from(tn.querySelectorAll('.tab-btn')).map(b => b.dataset.tabTarget);
            localStorage.setItem('stream_tab_order_v16', JSON.stringify(order));
        }

        function toggleSortLock() {
            isSortLocked = !isSortLocked;
            const b = document.getElementById('lock-btn');
            b.innerText = isSortLocked ? "🔒" : "🔓";
            b.className = "btn-head-purple" + (isSortLocked ? "" : " unlocked");

            // 既存のSortableインスタンスのdisabledだけ更新
            // （destroy/recreateしないのでDOM順序が絶対に変わらない）
            [...sortableInstances, ...dynamicCategorySortables].forEach(s => {
                try { s.option('disabled', isSortLocked); } catch(e) {}
            });

            if (isSortLocked) {
                saveTabOrder();
            }

            showToast(uiText(isSortLocked ? 'runtime.sortLocked' : 'runtime.sortEnabled'));
        }

        function initTheme() {
            const savedTheme = localStorage.getItem('stream_theme') || 'dark';
            applyTheme(savedTheme);
        }

        function applyTheme(theme) {
            const isLight = theme === 'light';
            document.body.classList.toggle('light-theme', isLight);
            const btn = document.getElementById('theme-btn');
            if (btn) {
                btn.innerText = isLight ? '☀' : '🌙';
            }
            localStorage.setItem('stream_theme', theme);
        }

        function toggleTheme() {
            const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme);
        }

        function toggleDeleteMode(tid) {
            const isOn = document.getElementById(tid).classList.toggle('delete-mode-on');
            const b = document.getElementById('del-mode-' + tid.replace('-tab', ''));
            if (b) {
                b.style.background = isOn ? "#ff4a4a" : "#444";
                b.style.color = "#fff";
                b.innerText = isOn ? deleteModeText() : langMap[currentLang].delete;
            }
        }

        function deleteModeText() {
            return uiText('runtime.deleteMode');
        }

        // ★ 更新版：絵文字をSVGアイコンに変更
        function emptyStateHtml(text) {
            return `<div class="empty-state">${raidSoEscape(text || '')}</div>`;
        }

        function render() {
            const c = document.getElementById('main-container'); if (!c) return; c.innerHTML = "";
            const T = langMap[currentLang];
            const L = T.labels;
            const A = T.titleActions || langMap.ja.titleActions;
            if (!config.length) {
                c.innerHTML = emptyStateHtml(T.empty?.titleCategories || '');
                initSortable();
                return;
            }
            config.forEach((cat, ci) => {
                const d = document.createElement('div'); d.className = "category-box" + (cat.isClosed ? " closed" : ""); d.setAttribute('data-idx', ci);
                d.innerHTML = `<div class="category-name" onclick="toggleCategory(this, ${ci})"><span>${cat.name}</span><button class="btn-delete-cat" onclick="event.stopPropagation(); deleteCategory(${ci})">${raidSoEscape(T.delete)}</button><button class="btn-secondary btn-add-item" onclick="event.stopPropagation(); addRecord(${ci})">＋</button></div><div class="category-records sortable-items" data-cat-idx="${ci}"></div>`;
                const records = cat.records || [];
                if (!records.length) {
                    d.querySelector('.category-records').innerHTML = emptyStateHtml(T.empty?.titleRecords || '');
                }
                records.forEach((r, ri) => {
                    const card = document.createElement('div'); card.className = "record-card" + (r.isOpen ? " open" : ""); card.setAttribute('data-idx', ri);

                    card.innerHTML = `
                <div class="record-header" onclick="toggleRecordOpen(${ci}, ${ri})">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>● ${r.label || A.newLabel}</span>
                        <button class="icon-btn" style="padding:4px; display:flex; align-items:center; justify-content:center;" onclick="event.stopPropagation(); renameRecord(${ci}, ${ri})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                    </div>
                    <div class="record-actions">
                        <button class="icon-btn twitch-action-btn sync-action-btn" title="${A.syncTip}" onclick="event.stopPropagation(); syncWithTwitch(${ci}, ${ri}, this)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                            <span class="action-text"><span class="action-main">${A.syncMain}</span><span class="action-sub">${A.syncSub}</span></span>
                        </button>
                        <button class="icon-btn twitch-action-btn push-action-btn" title="${A.pushTip}" onclick="event.stopPropagation(); pushToTwitch(${ci}, ${ri}, this)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            <span class="action-text"><span class="action-main">${A.pushMain}</span><span class="action-sub">${A.pushSub}</span></span>
                        </button>
                        <button class="btn-delete-item" onclick="event.stopPropagation(); deleteRecord(${ci}, ${ri})">✕</button>
                    </div>
                </div>
                <div class="record-body">
                    <span class="field-label">${L.game}</span>
                    <input type="text" value="${r.game || ''}" oninput="config[${ci}].records[${ri}].game=this.value; saveAllLocal(false)">
                    
                    <span class="field-label">${L.title}</span>
                    <textarea onchange="config[${ci}].records[${ri}].title=this.value; saveAllLocal(false)">${r.title || ''}</textarea>

                    <span class="field-label" style="display:flex; align-items:center;">${L.notif}<span style="font-size:10px; color:#aaa; margin-left:8px; font-weight:normal;">${I18N_DATA[currentLang]?.ui?.jsMsgs?.manualMemo || langMap.ja.jsMsgs.manualMemo}</span></span>
                    <textarea onchange="config[${ci}].records[${ri}].notif=this.value; saveAllLocal(false)">${r.notif || ''}</textarea>

                    <span class="field-label" style="display:flex; align-items:center;">${L.tags}<span style="font-size:10px; color:#aaa; margin-left:8px; font-weight:normal;">${I18N_DATA[currentLang]?.ui?.jsMsgs?.manualMemo || langMap.ja.jsMsgs.manualMemo}</span></span>
                    <input type="text" value="${r.tags || ''}" oninput="config[${ci}].records[${ri}].tags=this.value; saveAllLocal(false)">

                    <span class="field-label">${L.memo}</span>
                    <textarea onchange="config[${ci}].records[${ri}].memo=this.value; saveAllLocal(false)">${r.memo || ''}</textarea>
                </div>`;
                    d.querySelector('.category-records').appendChild(card);
                });
                c.appendChild(d);
            });
            initSortable();
        }

        // --- 追加機能：リネーム ---
        async function renameRecord(ci, ri) {
            const newName = await customPrompt({
                ...dialogCopy('titleRecordRename'),
                defaultValue: config[ci].records[ri].label || ''
            });
            if (newName !== null) {
                config[ci].records[ri].label = newName;
                saveAllLocal(false);
                render();
            }
        }

        // --- 追加機能：Twitch API通信ロジック ---
        const TWITCH_API_BASE = 'https://api.twitch.tv/helix';

        async function apiRequest(endpoint, method = 'GET', body = null) {
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
                    console.error("API Error:", await res.text());
                    raidSoLog(uiText('runtime.operationLog.apiFailed', {
                        method: requestMethod,
                        endpoint: requestEndpoint,
                        status: res.status
                    }), 'warn');
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
                console.error("Network Error:", error);
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

        // ★ 更新版：IDリストのUIと機能を画像に合わせて復元
        function renderFriends() {
            const L = langMap[currentLang];
            const I = L.idList || langMap.ja.idList;
            const c = document.getElementById('friends-container'); if (!c) return; c.innerHTML = "";
            (friendsConfig || []).forEach(cat => {
                if (cat.kind === 'shoutout-history') cat.name = I.autoCategory || cat.name;
                if (cat.kind === 'authenticated-user') cat.name = I.selfCategory || cat.name;
            });
            if (!(friendsConfig || []).length) {
                c.innerHTML = emptyStateHtml(L.empty?.idCategories || '');
                initSortable();
                renderShoutoutSuggestions();
                return;
            }

            (friendsConfig || []).forEach((cat, ci) => {
                const d = document.createElement('div'); d.className = "category-box" + (cat.isClosed ? " closed" : ""); d.setAttribute('data-idx', ci);
                d.innerHTML = `
                <div class="category-name" onclick="toggleFriendCategory(this, ${ci})">
                    <span>${raidSoEscape(cat.name)}</span>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="btn-delete-cat" onclick="event.stopPropagation(); deleteFriendCategory(${ci})">${raidSoEscape(L.delete)}</button>
                        <button class="btn-secondary btn-add-item" onclick="event.stopPropagation(); addFriendRecord(${ci})">＋</button>
                    </div>
                </div>
                <div class="category-records sortable-items" data-cat-idx="${ci}"></div>`;

                const friends = cat.friends || [];
                if (!friends.length) {
                    d.querySelector('.category-records').innerHTML = emptyStateHtml(L.empty?.idRecords || '');
                }
                friends.forEach((f, fi) => {
                    const card = document.createElement('div');
                    card.className = "record-card" + (f.isOpen ? " open" : "");
                    card.setAttribute('data-idx', fi);
                    const displayName = f.name || f.displayName || f.twitch || I.emptyName;
                    const shoutoutCount = Number(f.shoutoutCount || 0);
                    const lastDate = f.lastShoutoutAt ? new Date(f.lastShoutoutAt).toLocaleString() : '';
                    const meta = shoutoutCount ? (I.shoutoutMeta || '').replace('{count}', shoutoutCount).replace('{date}', lastDate || '-') : '';

                    card.innerHTML = `
                <div class="record-header" onclick="toggleFriendRecordOpen(${ci}, ${fi})">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>● ${raidSoEscape(displayName)}</span>
                        <button class="icon-btn id-action-btn id-edit-action" title="${raidSoEscape(L.alerts.renameId)}" onclick="event.stopPropagation(); renameFriendRecord(${ci}, ${fi})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="icon-btn id-action-btn id-copy-action" title="${raidSoEscape(L.tips.copyId)}" onclick="event.stopPropagation(); copyTwitchId(${ci}, ${fi})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button class="icon-btn id-action-btn id-twitch-action" title="${raidSoEscape(L.tips.openTwitch)}" onclick="event.stopPropagation(); openTwitchLink(${ci}, ${fi})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path></svg>
                        </button>
                        <button class="icon-btn id-action-btn id-x-action" title="${raidSoEscape(L.tips.openX)}" onclick="event.stopPropagation(); openXLink(${ci}, ${fi})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16zM4 20l6.768 -6.768m2.46 -2.46L20 4"></path></svg>
                        </button>
                        <button class="icon-btn id-action-btn id-youtube-action" title="${raidSoEscape(L.tips.openYoutube || 'YouTubeを開く')}" onclick="event.stopPropagation(); openYoutubeLink(${ci}, ${fi})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                        </button>
                        <button class="btn-delete-item" onclick="event.stopPropagation(); deleteFriendRecord(${ci}, ${fi})">✕</button>
                    </div>
                </div>
                <div class="record-body">
                    ${meta ? `<div class="id-meta">${raidSoEscape(meta)}</div>` : ''}
                    <span class="field-label">${raidSoEscape(L.labels.twitchId || langMap.ja.labels.twitchId)}</span>
                    <input type="text" value="${raidSoEscape(f.twitch || '')}" oninput="friendsConfig[${ci}].friends[${fi}].twitch=this.value; saveFriendsLocal(false)" onchange="friendsConfig[${ci}].friends[${fi}].twitch=this.value; saveFriendsLocal(false); autoFillFriendXFromTwitch(ci, fi)">
                    
                    <span class="field-label">${raidSoEscape(L.labels.xUrl || langMap.ja.labels.xUrl)}</span>
                    <input type="text" value="${raidSoEscape(f.x || '')}" oninput="friendsConfig[${ci}].friends[${fi}].x=this.value; saveFriendsLocal(false)">

                    <span class="field-label">${raidSoEscape(L.labels.youtubeUrl || 'YouTube リンク')}</span>
                    <input type="text" value="${raidSoEscape(f.youtube || '')}" oninput="friendsConfig[${ci}].friends[${fi}].youtube=this.value; saveFriendsLocal(false)">
                    
                    <span class="field-label">${raidSoEscape(L.labels.memo)}</span>
                    <textarea onchange="friendsConfig[${ci}].friends[${fi}].memo=this.value; saveFriendsLocal(false)">${raidSoEscape(f.memo || '')}</textarea>
                </div>`;
                    d.querySelector('.category-records').appendChild(card);
                });
                c.appendChild(d);
            });
            initSortable();
            renderShoutoutSuggestions();
        }

        // --- IDリスト専用の追加関数 ---
        function toggleFriendRecordOpen(ci, ri) {
            friendsConfig[ci].friends[ri].isOpen = !friendsConfig[ci].friends[ri].isOpen;
            renderFriends();
        }


        function addFriendRecord(i) {
            if (!friendsConfig[i].friends) friendsConfig[i].friends = [];
            const I = langMap[currentLang]?.idList || langMap.ja.idList;
            friendsConfig[i].friends.push({ name: I.emptyName || langMap.ja.idList.emptyName, twitch: "", x: "", memo: "", isOpen: true });
            renderFriends();
            saveFriendsLocal(false);
        }

        // --- 各種ボタンの動作（追加ロジック） ---
        function copyTwitchId(ci, fi) {
            let val = friendsConfig[ci].friends[fi].twitch || "";
            if (!val) return showToast(langMap[currentLang].alerts.copyNoUrl);
            let id = normalizeFriendTwitch(val);

            copyTextToClipboard(id, langMap[currentLang].alerts.idCopied);
        }

        function openTwitchLink(ci, fi) {
            let val = friendsConfig[ci].friends[fi].twitch || "";
            if (!val) return;
            const id = normalizeFriendTwitch(val);
            let url = id ? 'https://www.twitch.tv/' + id : val.trim();
            window.open(url, '_blank');
        }

        function openXLink(ci, fi) {
            let val = friendsConfig[ci].friends[fi].x || "";
            if (!val) return;
            const url = normalizeXProfileUrl(val);
            if (!url) return;
            window.open(url, '_blank');
        }

        function openYoutubeLink(ci, fi) {
            let val = friendsConfig[ci].friends[fi].youtube || "";
            if (!val) return;
            let url = val.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                if (url.startsWith('@')) {
                    url = 'https://www.youtube.com/' + url;
                } else {
                    url = 'https://' + url;
                }
            }
            window.open(url, '_blank');
        }

        async function renameFriendRecord(ci, ri) {
            const newName = await customPrompt({
                ...dialogCopy('idRecordRename'),
                defaultValue: friendsConfig[ci].friends[ri].name || ''
            });
            if (newName !== null) {
                friendsConfig[ci].friends[ri].name = newName;
                saveFriendsLocal(false);
                renderFriends();
            }
        }


        function renderMemo() {
            const c = document.getElementById('memo-container'); if (!c) return; c.innerHTML = "";
            if (!memoConfig.length) {
                c.innerHTML = emptyStateHtml(langMap[currentLang].empty?.memos || '');
                initSortable();
                return;
            }
            memoConfig.forEach((m, i) => {
                const d = document.createElement('div'); d.className = "category-box" + (m.isClosed ? " closed" : ""); d.setAttribute('data-idx', i);
                let previewText = (m.content || '').replace(/\n/g, ' ').substring(0, 15);
                if ((m.content || '').length > 15) previewText += '...';
                d.innerHTML = `<div class="category-name" onclick="toggleMemoCategory(this, ${i})">
                    <div style="display:flex; align-items:center; flex:1; gap:10px; overflow:hidden;">
                        <span style="white-space:nowrap;">${m.title}</span>
                        <small class="memo-preview" style="font-size: 11px; color: var(--text-muted); opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; margin-top:2px;">${previewText}</small>
                    </div>
                    <button class="btn-delete-item btn-secondary" onclick="event.stopPropagation(); deleteMemo(${i})">✕</button>
                </div>
            <textarea style="min-height:150px;" oninput="memoConfig[${i}].content=this.value; saveMemoLocal() ">${m.content || ''}</textarea>`;
                c.appendChild(d);
            });
            initSortable();
        }

        function initSortable() {
            if (typeof Sortable === 'undefined') return;
            sortableInstances.forEach(i => i.destroy()); sortableInstances = [];
            const opts = { animation: 150, handle: '.category-name', disabled: isSortLocked };            const itemOpts = (list, save, renderFunc, groupName) => ({
                animation: 150, handle: '.record-header', disabled: isSortLocked, group: groupName,
                onEnd: (evt) => {
                    const fromIdx = parseInt(evt.from.getAttribute('data-cat-idx')), toIdx = parseInt(evt.to.getAttribute('data-cat-idx'));
                    const item = list[fromIdx][groupName === 'main' ? 'records' : 'friends'].splice(evt.oldIndex, 1)[0];
                    list[toIdx][groupName === 'main' ? 'records' : 'friends'].splice(evt.newIndex, 0, item);
                    save(false); renderFunc();
                }
            });

            const mc = document.getElementById('main-container'); if (mc) {
                sortableInstances.push(new Sortable(mc, { ...opts, onEnd: (e) => { const i = config.splice(e.oldIndex, 1)[0]; config.splice(e.newIndex, 0, i); saveAllLocal(false); render(); } }));
                mc.querySelectorAll('.sortable-items').forEach(el => sortableInstances.push(new Sortable(el, itemOpts(config, saveAllLocal, render, 'main'))));
            }
            const fc = document.getElementById('friends-container'); if (fc) {
                sortableInstances.push(new Sortable(fc, { ...opts, onEnd: (e) => { const i = friendsConfig.splice(e.oldIndex, 1)[0]; friendsConfig.splice(e.newIndex, 0, i); saveFriendsLocal(false); renderFriends(); } }));
                fc.querySelectorAll('.sortable-items').forEach(el => sortableInstances.push(new Sortable(el, itemOpts(friendsConfig, saveFriendsLocal, renderFriends, 'friends'))));
            }
            const memc = document.getElementById('memo-container'); if (memc) {
                sortableInstances.push(new Sortable(memc, { ...opts, onEnd: (e) => { const i = memoConfig.splice(e.oldIndex, 1)[0]; memoConfig.splice(e.newIndex, 0, i); saveMemoLocal(); renderMemo(); } }));
            }
            const tn = document.getElementById('tab-navigation');
            if (tn) {
                sortableInstances.push(new Sortable(tn, {
                    animation: 150,
                    disabled: isSortLocked
                }));
            }
        }

        function toggleCategory(el, i) { config[i].isClosed = el.closest('.category-box').classList.toggle('closed'); saveAllLocal(false); }
        function toggleFriendCategory(el, i) { friendsConfig[i].isClosed = el.closest('.category-box').classList.toggle('closed'); saveFriendsLocal(false); }
        function toggleMemoCategory(el, i) { 
            memoConfig[i].isClosed = el.closest('.category-box').classList.toggle('closed'); 
            if (memoConfig[i].isClosed) {
                let p = (memoConfig[i].content || '').replace(/\n/g, ' ').substring(0, 15);
                if ((memoConfig[i].content || '').length > 15) p += '...';
                const previewEl = el.querySelector('.memo-preview');
                if (previewEl) previewEl.textContent = p;
            }
            saveMemoLocal(false); 
        }
        function toggleRecordOpen(ci, ri) { config[ci].records[ri].isOpen = !config[ci].records[ri].isOpen; render(); }

        function addRecord(i) { config[i].records.push({ label: "NEW", game: "", title: "", isOpen: true }); render(); saveAllLocal(false); }
        async function deleteCategory(ci) { if (await customConfirm(dialogCopy('deleteTitleCategory'))) { config.splice(ci, 1); render(); saveAllLocal(false); } }
        async function deleteRecord(ci, ri) { if (await customConfirm(dialogCopy('deleteTitleRecord'))) { config[ci].records.splice(ri, 1); render(); saveAllLocal(false); } }
        async function deleteFriendCategory(ci) { if (await customConfirm(dialogCopy('deleteIdCategory'))) { friendsConfig.splice(ci, 1); renderFriends(); saveFriendsLocal(false); } }
        async function deleteFriendRecord(ci, fi) { if (await customConfirm(dialogCopy('deleteIdRecord'))) { friendsConfig[ci].friends.splice(fi, 1); renderFriends(); saveFriendsLocal(false); } }
        async function addMemo() { const t = await customPrompt(dialogCopy('memoAdd')); if (t) { memoConfig.push({ title: t, content: "", isClosed: false }); renderMemo(); saveMemoLocal(); } }
        async function deleteMemo(i) { if (await customConfirm(dialogCopy('deleteMemo'))) { memoConfig.splice(i, 1); renderMemo(); saveMemoLocal(); } }

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

        function cleanupTitleTestData() {
            if (!Array.isArray(config)) return;
            const testNames = new Set(['あ', '４', '4', 'て']);
            const before = JSON.stringify(config);
            config = config
                .filter(cat => !testNames.has(String(cat.name || '').trim()))
                .map(cat => ({
                    ...cat,
                    records: (cat.records || []).filter(record => {
                        const label = String(record.label || '').trim();
                        const title = String(record.title || '').trim();
                        return !testNames.has(label) && !testNames.has(title);
                    })
                }));
            if (JSON.stringify(config) !== before) saveAllLocal(false);
        }

        function cleanupIdListTestData() {
            if (!Array.isArray(friendsConfig)) return;
            const testNames = new Set(['あ', '４', '4', 'て']);
            const memoCategoryNames = new Set(['移行したメモ', 'Imported Memos', '已迁移备忘录']);
            const before = JSON.stringify(friendsConfig);
            friendsConfig = friendsConfig
                .filter(cat => {
                    const categoryName = String(cat.name || '').trim();
                    return cat.kind !== 'imported-memos' && !memoCategoryNames.has(categoryName) && !testNames.has(categoryName);
                })
                .map(cat => ({
                    ...cat,
                    friends: (cat.friends || []).filter(friend => {
                        const name = String(friend.name || '').trim();
                        const twitch = String(friend.twitch || '').trim();
                        return !testNames.has(name) && !testNames.has(twitch);
                    })
                }))
                .filter(cat => (cat.friends || []).length || cat.kind !== 'shoutout-history');
            if (JSON.stringify(friendsConfig) !== before) saveFriendsLocal(false);
            localStorage.removeItem('stream_memo_merged_into_friends_v1');
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
                dateFormat: document.getElementById('date_format').value
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
        const RAIDSO_DEFAULTS = {
            autoIntroEnabled: true,
            autoIntroWaitSeconds: 10,
            officialShoutoutOnRaid: true,
            raidSoundEnabled: true,
            commentSoundEnabled: false,
            channelPointSoundEnabled: false,
            channelPointSoundMode: "comment",
            firstCommentSoundEnabled: true,
            firstCommentAlsoPlayComment: false,
            manualCommandEnabled: true,
            commandAliases: "!latest,!so,!shoutout",
            allowedRoles: ["broadcaster", "moderator"],
            raidSoundFile: "sounds/raidbeep.wav",
            raidVolume: 80,
            commentSoundFile: "sounds/comment-notification.wav",
            commentVolume: 60,
            channelPointSoundFile: "sounds/comment-notification.wav",
            channelPointVolume: 60,
            firstCommentSoundFile: "sounds/001_pyowan_up.wav",
            firstCommentVolume: 80,
            soundFiles: [],
            excludedUsers: "StreamElements\nSoundAlerts\nNightbot",
            raidTemplate: RAIDSO_DEFAULT_TEMPLATE_SET.raid,
            manualTemplate: RAIDSO_DEFAULT_TEMPLATE_SET.manual
        };
        let raidSoSettings = loadRaidSoSettings();
        let customRaidSoTemplates = loadRaidSoCustomTemplates();
        let raidSoState = {
            ws: null,
            wantConnection: false,
            suppressClose: false,
            reconnectTimer: null,
            sessionId: "",
            audio: null,
            audioPool: [],
            activeSuggestInputId: "",
            seenChatters: new Set(),
            subscriptions: { raid: false, chat: false, reward: false, autoReward: false },
            shoutoutRetryTimers: new Map(),
            nextOfficialShoutoutAt: 0,
            logs: loadRaidSoLogs()
        };

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

        function raidSoEscape(value) {
            return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function raidSoSelected(value, expected) {
            return value === expected ? ' selected' : '';
        }

        function raidSoChecked(value) {
            return value ? ' checked' : '';
        }

        function authOpenText(key) {
            return uiText(`authInstructions.${key}`, { scopes: TITLE_DOCK_REQUIRED_SCOPES.join(' / ') });
        }

        async function openAuthUrlInBrowser(url, openedMessage = authOpenText('opened'), blockedMessage = authOpenText('blocked')) {
            await copyTextToClipboard(url, doneText());
            await customAlert(openedMessage || blockedMessage);
            return false;
        }

        async function openOfficialAuth() {
            settings = {
                ...settings,
                userId: document.getElementById('user_id')?.value.trim() || settings.userId || '',
                userLogin: document.getElementById('user_login')?.value.trim() || settings.userLogin || '',
                clientId: getClientIdFromInputOrDefault(),
                redirectUri: getOAuthRedirectUri(),
                token: extractTwitchAccessToken(document.getElementById('token')?.value || settings.token || ''),
                dateFormat: document.getElementById('date_format')?.value || settings.dateFormat || 'MM/DD'
            };
            localStorage.setItem('stream_settings_v16', JSON.stringify(settings));
            await openAuthUrlInBrowser(TWITCH_TOKEN_GENERATOR_URL);
        }

        function raidSoText() {
            return langMap[currentLang]?.raidSo || langMap.ja.raidSo;
        }

        function roleLabel(role) {
            return raidSoText().roles?.[role] || langMap.ja.raidSo.roles?.[role] || role;
        }

        function raidSoPresetLabel(preset) {
            return preset.labels?.[currentLang] || preset.labels?.ja || preset.id;
        }

        function raidSoCustomPrefix() {
            return raidSoText().customTemplatePrefix || langMap.ja.raidSo.customTemplatePrefix;
        }

        function getRaidSoTemplatePresets(lang = currentLang) {
            const customPresets = customRaidSoTemplates
                .filter(item => item.lang === lang)
                .map(item => ({
                    id: `custom:${item.id}`,
                    custom: true,
                    labels: { [lang]: `${raidSoCustomPrefix()}: ${item.name}` },
                    templates: { [lang]: { raid: item.raid, manual: item.manual } }
                }));
            return [...RAIDSO_RAID_TEMPLATE_PRESETS, ...customPresets];
        }

        function raidSoTemplateSet(preset, lang) {
            const selected = preset.templates?.[lang] || preset.templates?.ja || {};
            return {
                raid: selected.raid || RAIDSO_DEFAULT_RAID_TEMPLATE,
                manual: selected.manual || RAIDSO_DEFAULT_MANUAL_TEMPLATE
            };
        }

        function raidSoTemplatePresetHtml(r, currentTemplate) {
            const presets = getRaidSoTemplatePresets(currentLang);
            return `<div class="raidso-template-box">
                <span class="field-label">${raidSoEscape(r.raidTemplatePresetLabel)}</span>
                <div class="raidso-template-row">
                    <select id="raidso-raid-template-preset">
                        ${presets.map(preset => `<option value="${raidSoEscape(preset.id)}"${raidSoTemplateSet(preset, currentLang).raid === currentTemplate ? ' selected' : ''}>${raidSoEscape(raidSoPresetLabel(preset))}</option>`).join('')}
                    </select>
                    <div class="raidso-template-actions">
                        <button type="button" class="btn-outline" onclick="applyRaidSoMessageTemplate()">${raidSoEscape(r.applyRaidTemplate)}</button>
                        <button type="button" class="btn-outline" onclick="saveRaidSoCustomTemplate()">${raidSoEscape(r.saveCustomTemplate)}</button>
                    </div>
                </div>
            </div>`;
        }

        function raidSoTokenHelpHtml(r) {
            const desc = r.tokenDescriptions || langMap.ja.raidSo.tokenDescriptions;
            const tokens = [
                ['{displayName}', desc.displayName],
                ['{username}', desc.username],
                ['{viewers}', desc.viewers],
                ['{url}', desc.url],
                ['{game}', desc.game],
                ['{title}', desc.title]
            ];
            return `<details class="raidso-token-help">
                <summary class="raidso-token-help-title">${raidSoEscape(r.messageTokensTitle)}</summary>
                <div class="raidso-token-help-body">
                    <div class="raidso-token-note">${raidSoEscape(r.tokenCopyNote || langMap.ja.raidSo.tokenCopyNote)}</div>
                    <div class="raidso-token-grid">
                        ${tokens.map(([token, label]) => `<button type="button" class="raidso-token-item has-tooltip" data-tooltip="${raidSoEscape(label)}" aria-label="${raidSoEscape(label)}" onclick="copyRaw('${raidSoEscape(token)}')"><code>${raidSoEscape(token)}</code></button>`).join('')}
                    </div>
                </div>
            </details>`;
        }

        function raidSoSuggestInputHtml(id, placeholder, options = {}) {
            const safeId = raidSoEscape(id);
            const multi = options.multi ? ' data-suggest-multi="true"' : '';
            return `<div class="so-suggest-wrap" id="${safeId}-suggest-wrap">
                <input type="text" id="${safeId}" autocomplete="off" data-suggest="twitch-id"${multi} placeholder="${raidSoEscape(placeholder || '')}" oninput="renderShoutoutSuggestions(true, '${safeId}')" onfocus="openShoutoutSuggestions('${safeId}')" onblur="setTimeout(closeShoutoutSuggestions, 120)" onkeydown="handleShoutoutSuggestKey(event)">
                <div class="so-suggest-panel" id="${safeId}-suggest-panel"></div>
            </div>`;
        }

        function raidSoIntroActionsBoxHtml(r) {
            const command = commandText();
            return `<div class="category-box command-feature-box tw-section" id="raidso-box-shoutout">
                <div class="category-name" onclick="twToggle('raidso-box-shoutout')"><span>${raidSoEscape(r.introActionsTitle || r.manualIntroTitle)}</span></div>
                <div class="tw-body">
                    <div class="raidso-intro-actions">
                        ${raidSoSuggestInputHtml('so-user-input', r.manualTargetPlaceholder || command.soInput || 'ID')}
                        <div class="raidso-intro-buttons">
                            <button class="btn-primary has-tooltip" data-tooltip="${raidSoEscape(command.tips.so)}" onclick="sendShoutoutCommandFromInput()">/shoutout</button>
                            <button class="btn-primary" onclick="manualRaidSoIntroduce(true)">${raidSoEscape(r.sendIntro)}</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        function renderRaidShoutOutPanel() {
            const el = document.getElementById('raidso-container');
            if (!el) return;
            const s = raidSoSettings || RAIDSO_DEFAULTS;
            const r = raidSoText();
            el.innerHTML = `
                <details class="raidso-note tab-help">
                    <summary class="tab-help-summary">
                        <span>${raidSoEscape(r.notice)}</span>
                    </summary>
                    <div class="raidso-note-body">
                        <p style="margin: 0 0 8px 0;">${raidSoEscape(r.noteIntro)}</p>
                        <p style="margin: 0 0 8px 0;">${raidSoEscape(r.noteToken)}</p>
                        <p style="margin: 0 0 8px 0;">${raidSoEscape(r.requiredScopes)}: <span style="color:#bf94ff;">${raidSoEscape(TITLE_DOCK_REQUIRED_SCOPES.join(' / '))}</span></p>
                        <div class="raidso-actions">
                            <button type="button" class="btn-outline" onclick="openOfficialAuth()">${raidSoEscape(langMap[currentLang]?.settingsUi?.openAuth || langMap.ja.settingsUi.openAuth)}</button>
                        </div>
                    </div>
                </details>

                ${raidSoIntroActionsBoxHtml(r)}

                <div class="category-box tw-section" id="raidso-box-raid-settings">
                    <div class="category-name" onclick="twToggle('raidso-box-raid-settings')"><span>${raidSoEscape(r.autoIntroTitle)}</span></div>
                    <div class="tw-body">
                        <div class="raidso-auto-intro-setting">
                            ${raidSoSwitchHtml('raidso-auto-intro', r.autoIntroToggle, s.autoIntroEnabled, 'handleRaidSoAutoIntroToggle(this)')}
                            <div class="raidso-auto-intro-wait" id="raidso-auto-intro-wait"${s.autoIntroEnabled ? '' : ' hidden'}>
                                <span class="field-label">${raidSoEscape(r.autoIntroWaitLabel || '自動紹介までの時間')}</span>
                                <div class="tw-time-control">
                                    <input type="number" id="raidso-auto-intro-wait-seconds" value="${Math.max(0, Math.min(600, Number(s.autoIntroWaitSeconds) || 0))}" min="0" max="600" step="1" onchange="saveRaidSoSettings(false)">
                                    <span>${raidSoEscape(twExt('unitSecond', '秒'))}</span>
                                </div>
                            </div>
                        </div>
                        ${raidSoToggleHtml('raidso-official-shoutout', r.officialShoutout, s.officialShoutoutOnRaid)}
                        ${raidSoToggleHtml('raidso-manual-command-enabled', r.manualCommandToggle, s.manualCommandEnabled, 'handleRaidSoManualCommandToggle(this)')}
                        <details class="raidso-child-settings" id="raidso-command-settings"${s.manualCommandEnabled ? '' : ' hidden'}>
                            <summary>${raidSoEscape(r.commandSettings || langMap.ja.raidSo.commandSettings)}</summary>
                            <div class="raidso-child-settings-body">
                                <span class="field-label">${raidSoEscape(r.commandLabel)}</span>
                                <input type="text" id="raidso-command-aliases" value="${raidSoEscape(s.commandAliases)}">
                                <span class="field-label">${raidSoEscape(r.rolesLabel)}</span>
                                <div class="raidso-role-grid">
                                    ${['broadcaster', 'moderator', 'vip', 'subscriber', 'everyone'].map(role => `<label><input type="checkbox" class="raidso-role raidso-check" value="${role}"${s.allowedRoles.includes(role) ? ' checked' : ''}> ${raidSoEscape(roleLabel(role))}</label>`).join('')}
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                <div class="category-box tw-section" id="raidso-box-messages">
                    <div class="category-name" onclick="twToggle('raidso-box-messages')"><span>${raidSoEscape(r.messagesTitle)}</span></div>
                    <div class="tw-body">
                        ${raidSoTemplatePresetHtml(r, s.raidTemplate)}
                        <span class="field-label">${raidSoEscape(r.raidTemplateLabel)}</span>
                        <textarea id="raidso-raid-template" style="min-height:110px;">${raidSoEscape(s.raidTemplate)}</textarea>
                        <span class="field-label">${raidSoEscape(r.manualTemplateLabel)}</span>
                        <textarea id="raidso-manual-template" style="min-height:110px;">${raidSoEscape(s.manualTemplate)}</textarea>
                        ${raidSoTokenHelpHtml(r)}
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button class="btn-primary" onclick="saveRaidSoSettings(true)">${raidSoEscape(r.saveMessages)}</button>
                        </div>
                    </div>
                </div>

                <div class="category-box tw-section" id="raidso-box-sounds">
                    <div class="category-name" onclick="twToggle('raidso-box-sounds')"><span>${raidSoEscape(r.soundTitle)}</span></div>
                    <div class="tw-body">
                        <div class="raidso-actions" style="margin-bottom:12px;">
                            <button type="button" class="btn-outline" onclick="openRaidSoSoundFolder()">${raidSoEscape(r.openSoundFolder)}</button>
                            <input type="file" id="raidso-sound-folder-picker" accept="audio/*,.wav,.mp3,.ogg,.m4a,.aac,.flac,.webm" webkitdirectory multiple style="display:none;" onchange="replaceRaidSoSoundFilesFromFolder(this)">
                        </div>
                        ${raidSoSoundBlockHtml('raid', r.raidSound, r.raidSoundToggle, s.raidSoundEnabled, s.raidSoundFile, s.raidVolume)}
                        ${raidSoSoundBlockHtml('comment', r.commentSound, r.commentSoundToggle, s.commentSoundEnabled, s.commentSoundFile, s.commentVolume)}
                        ${raidSoChannelPointSoundHtml(r, s)}
                        ${raidSoSoundBlockHtml('first', r.firstCommentSound, r.firstCommentSoundToggle, s.firstCommentSoundEnabled, s.firstCommentSoundFile, s.firstCommentVolume)}
                        ${raidSoToggleHtml('raidso-first-comment-also-comment', r.firstCommentAlsoComment, s.firstCommentAlsoPlayComment)}
                        <details class="raidso-excluded-settings">
                            <summary>${raidSoEscape(r.excludedUsers)}</summary>
                            <textarea id="raidso-excluded-users" style="min-height:80px;">${raidSoEscape(s.excludedUsers)}</textarea>
                        </details>
                    </div>
                </div>`;
            renderRaidSoStatus();
            renderRaidSoLog();
            renderShoutoutSuggestions();
            restoreCategoryVisibility('raid-tab');
        }

        function raidSoToggleHtml(id, label, checked, onChange = 'handleRaidSoFeatureToggle()') {
            return raidSoSwitchHtml(id, label, checked, onChange);
        }

        function raidSoSwitchHtml(id, label, checked, onChange) {
            return `<label class="raidso-toggle-row">
                <span>${raidSoEscape(label)}</span>
                <span class="raidso-switch">
                    <input type="checkbox" id="${id}"${raidSoChecked(checked)} onchange="${onChange}">
                    <span class="raidso-slider"></span>
                </span>
            </label>`;
        }

        function raidSoSoundBlockHtml(kind, title, toggleLabel, enabled, file, volume) {
            const toggleId = `raidso-${kind === 'first' ? 'first-comment' : kind}-sound-enabled`;
            return `<div class="raidso-sound-block ${enabled ? 'is-open' : 'is-closed'}">
                ${raidSoToggleHtml(toggleId, toggleLabel, enabled, 'handleRaidSoFeatureToggle(true)')}
                <div class="raidso-sound-controls">
                    <div class="raidso-sound-controls-inner">
                        ${raidSoSoundControlsHtml(kind, title, file, volume)}
                    </div>
                </div>
            </div>`;
        }

        function raidSoChannelPointSoundHtml(r, s) {
            const mode = s.channelPointSoundMode === 'custom' ? 'custom' : 'comment';
            return `<div class="raidso-sound-block ${s.channelPointSoundEnabled ? 'is-open' : 'is-closed'}">
                ${raidSoToggleHtml('raidso-channel-point-sound-enabled', r.channelPointSoundToggle, s.channelPointSoundEnabled, 'handleRaidSoFeatureToggle(true)')}
                <div class="raidso-sound-controls">
                    <div class="raidso-sound-controls-inner">
                        <span class="field-label">${raidSoEscape(r.channelPointSoundModeLabel)}</span>
                        <div class="raidso-choice-row">
                            <label class="raidso-choice ${mode === 'comment' ? 'active' : ''}">
                                <input type="radio" name="raidso-channel-point-sound-mode" value="comment"${mode === 'comment' ? ' checked' : ''} onchange="handleRaidSoFeatureToggle(true)">
                                <span>${raidSoEscape(r.channelPointUseCommentSound)}</span>
                            </label>
                            <label class="raidso-choice ${mode === 'custom' ? 'active' : ''}">
                                <input type="radio" name="raidso-channel-point-sound-mode" value="custom"${mode === 'custom' ? ' checked' : ''} onchange="handleRaidSoFeatureToggle(true)">
                                <span>${raidSoEscape(r.channelPointUseDedicatedSound)}</span>
                            </label>
                        </div>
                        <div class="raidso-dedicated-sound ${mode === 'custom' ? 'is-open' : 'is-closed'}">
                            ${raidSoSoundControlsHtml('channelPoint', r.channelPointSound, s.channelPointSoundFile, s.channelPointVolume)}
                        </div>
                    </div>
                </div>
            </div>`;
        }

        function collectRaidSoSettings() {
            const roleInputs = Array.from(document.querySelectorAll('.raidso-role:checked'));
            const keepValue = (id, currentValue, defaultValue) => document.getElementById(id)?.value ?? currentValue ?? defaultValue;
            const keepNumber = (id, currentValue, defaultValue) => Number(document.getElementById(id)?.value ?? currentValue ?? defaultValue);
            const keepVolume = (id, currentValue, defaultValue) => clampRaidSoVolume(document.getElementById(id)?.value ?? currentValue ?? defaultValue, defaultValue);
            const channelPointMode = document.querySelector('input[name="raidso-channel-point-sound-mode"]:checked')?.value
                || raidSoSettings.channelPointSoundMode
                || RAIDSO_DEFAULTS.channelPointSoundMode;
            raidSoSettings = {
                ...raidSoSettings,
                autoIntroEnabled: document.getElementById('raidso-auto-intro')?.checked ?? raidSoSettings.autoIntroEnabled,
                autoIntroWaitSeconds: Math.max(0, Math.min(600, keepNumber('raidso-auto-intro-wait-seconds', raidSoSettings.autoIntroWaitSeconds, RAIDSO_DEFAULTS.autoIntroWaitSeconds) || 0)),
                officialShoutoutOnRaid: document.getElementById('raidso-official-shoutout')?.checked ?? raidSoSettings.officialShoutoutOnRaid,
                raidSoundEnabled: document.getElementById('raidso-raid-sound-enabled')?.checked ?? raidSoSettings.raidSoundEnabled,
                commentSoundEnabled: document.getElementById('raidso-comment-sound-enabled')?.checked ?? raidSoSettings.commentSoundEnabled,
                channelPointSoundEnabled: document.getElementById('raidso-channel-point-sound-enabled')?.checked ?? raidSoSettings.channelPointSoundEnabled,
                channelPointSoundMode: channelPointMode === 'custom' ? 'custom' : 'comment',
                firstCommentSoundEnabled: document.getElementById('raidso-first-comment-sound-enabled')?.checked ?? raidSoSettings.firstCommentSoundEnabled,
                firstCommentAlsoPlayComment: document.getElementById('raidso-first-comment-also-comment')?.checked ?? raidSoSettings.firstCommentAlsoPlayComment,
                manualCommandEnabled: document.getElementById('raidso-manual-command-enabled')?.checked ?? raidSoSettings.manualCommandEnabled,
                commandAliases: document.getElementById('raidso-command-aliases')?.value.trim() || RAIDSO_DEFAULTS.commandAliases,
                allowedRoles: roleInputs.map(input => input.value),
                raidSoundFile: keepValue('raidso-raid-sound-file', raidSoSettings.raidSoundFile, RAIDSO_DEFAULTS.raidSoundFile),
                raidVolume: keepVolume('raidso-raid-volume', raidSoSettings.raidVolume, RAIDSO_DEFAULTS.raidVolume),
                commentSoundFile: keepValue('raidso-comment-sound-file', raidSoSettings.commentSoundFile, RAIDSO_DEFAULTS.commentSoundFile),
                commentVolume: keepVolume('raidso-comment-volume', raidSoSettings.commentVolume, RAIDSO_DEFAULTS.commentVolume),
                channelPointSoundFile: keepValue('raidso-channel-point-sound-file', raidSoSettings.channelPointSoundFile, RAIDSO_DEFAULTS.channelPointSoundFile),
                channelPointVolume: keepVolume('raidso-channel-point-volume', raidSoSettings.channelPointVolume, RAIDSO_DEFAULTS.channelPointVolume),
                firstCommentSoundFile: keepValue('raidso-first-comment-sound-file', raidSoSettings.firstCommentSoundFile, RAIDSO_DEFAULTS.firstCommentSoundFile),
                firstCommentVolume: keepVolume('raidso-first-comment-volume', raidSoSettings.firstCommentVolume, RAIDSO_DEFAULTS.firstCommentVolume),
                soundFiles: getRaidSoSoundFiles(),
                excludedUsers: document.getElementById('raidso-excluded-users')?.value || '',
                raidTemplate: document.getElementById('raidso-raid-template')?.value || RAIDSO_DEFAULT_RAID_TEMPLATE,
                manualTemplate: document.getElementById('raidso-manual-template')?.value || RAIDSO_DEFAULT_MANUAL_TEMPLATE
            };
            delete raidSoSettings.raidCustomSound;
            delete raidSoSettings.commentCustomSound;
            delete raidSoSettings.channelPointCustomSound;
            delete raidSoSettings.firstCommentCustomSound;
        }

        function cleanRaidSoToken() {
            return extractTwitchAccessToken(settings.token);
        }

        function normalizeRaidSoLogin(value) {
            const raw = String(value || '').trim();
            const match = raw.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
            return (match ? match[1] : raw).replace(/^@/, '').toLowerCase();
        }

        function raidSoAuthHeaders(json = false) {
            const headers = { 'Client-ID': getEffectiveTwitchClientId(), 'Authorization': `Bearer ${cleanRaidSoToken()}` };
            if (json) headers['Content-Type'] = 'application/json';
            return headers;
        }

        function openRaidSoSoundFolder() {
            const picker = document.getElementById('raidso-sound-folder-picker');
            if (picker) picker.click();
        }

        async function raidSoHelix(endpoint, options = {}) {
            const response = await fetch(`${TWITCH_API_BASE}${endpoint}`, { ...options, headers: { ...raidSoAuthHeaders(Boolean(options.body)), ...(options.headers || {}) } });
            const text = await response.text();
            let data = {};
            if (text) {
                try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
            }
            if (!response.ok) {
                const error = new Error(data.message || `${response.status} ${response.statusText}`);
                error.status = response.status;
                error.statusText = response.statusText;
                error.data = data;
                error.headers = Object.fromEntries(response.headers.entries());
                throw error;
            }
            return data;
        }

        function ensureRaidSoBaseSettings() {
            if (!cleanRaidSoToken()) {
                throw new Error(langMap[currentLang].logs.errNotSet);
            }
            if (!settings.userId || !getEffectiveTwitchClientId()) {
                throw new Error(langMap[currentLang].logs.errNotLinked);
            }
        }

        async function validateRaidSoAuth() {
            try {
                if (!cleanRaidSoToken()) throw new Error(langMap[currentLang].logs.errNotSet);
                const data = await refreshTwitchAuthFromToken(false);
                if (!data) throw new Error(langMap[currentLang].logs.errConfirmFailed);
                ensureRaidSoBaseSettings();
                raidSoLog(`${langMap[currentLang].logs.logConfirmed} ${data.login || settings.userLogin || settings.userId}`);
                return data;
            } catch (e) {
                raidSoLog(e.message, 'warn');
                throw e;
            }
        }

        function needsRaidSoChatSubscription() {
            return raidSoSettings.manualCommandEnabled || raidSoSettings.commentSoundEnabled || raidSoSettings.firstCommentSoundEnabled;
        }

        function needsRaidSoRewardSubscription() {
            return raidSoSettings.channelPointSoundEnabled;
        }

        function needsRaidSoRaidSubscription() {
            return raidSoSettings.autoIntroEnabled || raidSoSettings.raidSoundEnabled;
        }

        function needsRaidSoConnection() {
            return needsRaidSoRaidSubscription() || needsRaidSoChatSubscription() || needsRaidSoRewardSubscription();
        }

        function hasRaidSoAuthSettings() {
            return Boolean(settings.userId && getEffectiveTwitchClientId() && cleanRaidSoToken());
        }

        function syncRaidSoConnection(showWarning = false) {
            if (!needsRaidSoConnection()) {
                if (raidSoState.ws || raidSoState.wantConnection) disconnectRaidSo();
                return;
            }
            if (!hasRaidSoAuthSettings()) {
                if (showWarning) raidSoLog(langMap[currentLang].logs.warnNotLinked, 'warn');
                return;
            }
            if (raidSoState.ws && raidSoState.ws.readyState <= WebSocket.OPEN) {
                ensureRaidSoSubscriptions();
                return;
            }
            connectRaidSo();
        }

        function handleRaidSoFeatureToggle(shouldRender = false) {
            saveRaidSoSettings(false);
            syncRaidSoConnection(true);
            if (shouldRender) renderRaidShoutOutPanel();
            showToast(doneText());
        }

        function handleRaidSoManualCommandToggle(input) {
            const settingsPanel = document.getElementById('raidso-command-settings');
            if (settingsPanel) {
                settingsPanel.hidden = !input.checked;
                if (!input.checked) settingsPanel.open = false;
            }
            handleRaidSoFeatureToggle();
        }

        function handleRaidSoAutoIntroToggle(input) {
            const waitControl = document.getElementById('raidso-auto-intro-wait');
            if (waitControl) waitControl.hidden = !input.checked;
            handleRaidSoFeatureToggle();
        }

        async function connectRaidSo() {
            saveRaidSoSettings(false);
            clearTimeout(raidSoState.reconnectTimer);
            raidSoState.wantConnection = true;
            raidSoState.seenChatters = new Set();
            try {
                await validateRaidSoAuth();
                openRaidSoSocket(RAIDSO_EVENTSUB_WS, true);
                raidSoLog(langMap[currentLang].logs.logConnecting);
            } catch (e) {
                raidSoState.wantConnection = false;
                renderRaidSoStatus();
            }
        }

        function disconnectRaidSo() {
            raidSoState.wantConnection = false;
            clearTimeout(raidSoState.reconnectTimer);
            if (raidSoState.ws) raidSoState.ws.close();
            raidSoState.ws = null;
            raidSoState.subscriptions = { raid: false, chat: false, reward: false, autoReward: false };
            renderRaidSoStatus();
            raidSoLog(langMap[currentLang].logs.logStopped);
        }

        function openRaidSoSocket(url, shouldSubscribe) {
            if (raidSoState.ws && raidSoState.ws.readyState <= WebSocket.OPEN) {
                raidSoState.suppressClose = true;
                raidSoState.ws.close();
            }
            const socket = new WebSocket(url);
            raidSoState.ws = socket;
            socket.onmessage = async (event) => {
                try {
                    const packet = JSON.parse(event.data);
                    await handleRaidSoPacket(packet, shouldSubscribe);
                } catch (e) {
                    raidSoLog(`${langMap[currentLang].logs.warnError} ${e.message}`, 'warn');
                }
            };
            socket.onclose = () => {
                renderRaidSoStatus();
                if (raidSoState.suppressClose) {
                    raidSoState.suppressClose = false;
                    return;
                }
                if (raidSoState.wantConnection) {
                    raidSoLog(langMap[currentLang].logs.warnReconnect, 'warn');
                    raidSoState.reconnectTimer = setTimeout(() => openRaidSoSocket(RAIDSO_EVENTSUB_WS, true), 5000);
                }
            };
            socket.onerror = () => raidSoLog(langMap[currentLang].logs.warnSocketErr, 'warn');
            renderRaidSoStatus();
        }

        async function handleRaidSoPacket(packet, shouldSubscribe) {
            const messageType = packet.metadata?.message_type;
            if (messageType === 'session_welcome') {
                raidSoState.sessionId = packet.payload.session.id;
                raidSoLog(langMap[currentLang].logs.logStarted);
                if (shouldSubscribe) await subscribeRaidSoSession(raidSoState.sessionId);
                renderRaidSoStatus();
                return;
            }
            if (messageType === 'session_reconnect') {
                openRaidSoSocket(packet.payload.session.reconnect_url, false);
                return;
            }
            if (messageType === 'notification') {
                const type = packet.metadata.subscription_type;
                const event = packet.payload.event;
                if (type === 'channel.raid') await handleRaidSoRaid(event);
                if (type === 'channel.chat.message') await handleRaidSoChat(event);
                if (type === 'channel.channel_points_custom_reward_redemption.add' || type === 'channel.channel_points_automatic_reward_redemption.add') await handleRaidSoRewardRedemption(event);
                renderRaidSoStatus();
            }
        }

        async function subscribeRaidSoSession(sessionId) {
            raidSoState.subscriptions = { raid: false, chat: false, reward: false, autoReward: false };
            await ensureRaidSoSubscriptions(sessionId);
        }

        async function ensureRaidSoSubscriptions(sessionId = raidSoState.sessionId) {
            if (!sessionId) return;
            if (needsRaidSoRaidSubscription() && !raidSoState.subscriptions.raid) {
                try {
                    await createRaidSoSubscription('channel.raid', { to_broadcaster_user_id: settings.userId }, sessionId);
                    raidSoState.subscriptions.raid = true;
                    raidSoLog(langMap[currentLang].logs.logRaidSub);
                } catch (e) {
                    raidSoLog(`${langMap[currentLang].logs.warnRaidFail} ${localizeRaidSoError(e)}`, 'warn');
                }
            }
            if (needsRaidSoChatSubscription() && !raidSoState.subscriptions.chat) {
                try {
                    await createRaidSoSubscription('channel.chat.message', { broadcaster_user_id: settings.userId, user_id: settings.userId }, sessionId);
                    raidSoState.subscriptions.chat = true;
                    raidSoLog(langMap[currentLang].logs.logChatSub);
                } catch (e) {
                    raidSoLog(`${langMap[currentLang].logs.warnChatFail} ${localizeRaidSoError(e)}`, 'warn');
                }
            }
            if (needsRaidSoRewardSubscription() && !raidSoState.subscriptions.reward) {
                try {
                    await createRaidSoSubscription('channel.channel_points_custom_reward_redemption.add', { broadcaster_user_id: settings.userId }, sessionId);
                    raidSoState.subscriptions.reward = true;
                    raidSoLog(langMap[currentLang].logs.logPointsSub);
                } catch (e) {
                    raidSoLog(`${langMap[currentLang].logs.warnPointsFail} ${localizeRaidSoError(e)}`, 'warn');
                }
            }
            if (needsRaidSoRewardSubscription() && !raidSoState.subscriptions.autoReward) {
                try {
                    await createRaidSoSubscription('channel.channel_points_automatic_reward_redemption.add', { broadcaster_user_id: settings.userId }, sessionId, '2');
                    raidSoState.subscriptions.autoReward = true;
                    raidSoLog(langMap[currentLang].logs.logAutoPointsSub);
                } catch (e) {
                    raidSoLog(`${langMap[currentLang].logs.warnAutoPointsFail} ${localizeRaidSoError(e)}`, 'warn');
                }
            }
            renderRaidSoStatus();
        }

        async function createRaidSoSubscription(type, condition, sessionId, version = '1') {
            await raidSoHelix('/eventsub/subscriptions', {
                method: 'POST',
                body: JSON.stringify({ type, version, condition, transport: { method: 'websocket', session_id: sessionId } })
            });
        }

        async function handleRaidSoRaid(event) {
            raidSoLog(`${langMap[currentLang].logs.logRaidDetected} ${event.from_broadcaster_user_name} / ${event.viewers || 0} viewers`);
            if (raidSoSettings.raidSoundEnabled) playRaidSoSound('raid');
            if (!raidSoSettings.autoIntroEnabled) return;
            const waitSeconds = Math.max(0, Math.min(600, Number(raidSoSettings.autoIntroWaitSeconds) || 0));
            if (waitSeconds > 0) {
                raidSoLog(twFormat(raidSoText().autoIntroScheduled || '{seconds}秒後に紹介します: {user}', {
                    seconds: waitSeconds,
                    user: event.from_broadcaster_user_name || event.from_broadcaster_user_login || ''
                }));
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                if (!raidSoSettings.autoIntroEnabled) return;
            }
            await introduceRaidSoChannel({
                targetLogin: event.from_broadcaster_user_login,
                targetId: event.from_broadcaster_user_id,
                viewers: event.viewers || '',
                template: raidSoSettings.raidTemplate,
                officialShoutout: raidSoSettings.officialShoutoutOnRaid,
                sendChat: true
            });
        }

        async function handleRaidSoChat(event) {
            handleRaidSoCommentSounds(event);
            if (!raidSoSettings.manualCommandEnabled) return;
            const text = event.message?.text?.trim() || '';
            if (!text.startsWith('!')) return;
            const [command, target] = text.split(/\s+/);
            const aliases = raidSoSettings.commandAliases.split(/[,\s]+/).map(v => v.trim().toLowerCase()).filter(Boolean);
            if (!aliases.includes(command.toLowerCase())) return;
            if (!canUseRaidSoCommand(event)) {
                raidSoLog(`${langMap[currentLang].logs.warnNoPerm} ${event.chatter_user_login}`, 'warn');
                return;
            }
            if (!target) {
                raidSoLog(`${command} ${langMap[currentLang].logs.warnNoTarget}`, 'warn');
                return;
            }
            await introduceRaidSoChannel({ targetLogin: normalizeRaidSoLogin(target), targetId: '', viewers: '', template: raidSoSettings.manualTemplate, officialShoutout: false, sendChat: true });
        }

        function handleRaidSoRewardRedemption(event) {
            const login = normalizeRaidSoLogin(event.user_login);
            if (!login || isRaidSoExcluded(login, event.user_name)) return;
            const rewardTitle = event.reward?.title || event.reward?.type || (I18N_DATA[currentLang]?.ui?.jsMsgs?.chPoint || langMap.ja.jsMsgs.chPoint);
            raidSoLog(uiText('runtime.channelPointRedeemed', { user: event.user_name || login, reward: rewardTitle }));
            if (raidSoSettings.channelPointSoundEnabled) {
                playRaidSoSound(raidSoSettings.channelPointSoundMode === 'custom' ? 'channelPoint' : 'comment');
            }
        }

        function canUseRaidSoCommand(event) {
            if (raidSoSettings.allowedRoles.includes('everyone')) return true;
            if (raidSoSettings.allowedRoles.includes('broadcaster') && event.chatter_user_id === settings.userId) return true;
            const badges = new Set((event.badges || []).map(badge => badge.set_id));
            return raidSoSettings.allowedRoles.some(role => badges.has(role));
        }

        function handleRaidSoCommentSounds(event) {
            const login = normalizeRaidSoLogin(event.chatter_user_login);
            if (!login || isRaidSoExcluded(login, event.chatter_user_name)) return;
            const first = !raidSoState.seenChatters.has(login);
            raidSoState.seenChatters.add(login);
            if (first && raidSoSettings.firstCommentSoundEnabled) {
                const alsoComment = raidSoSettings.commentSoundEnabled && raidSoSettings.firstCommentAlsoPlayComment;
                playRaidSoSound('first', { overlap: alsoComment });
                if (alsoComment) playRaidSoSound('comment', { overlap: true });
                return;
            }
            if (raidSoSettings.commentSoundEnabled) playRaidSoSound('comment');
        }

        function isRaidSoExcluded(login, displayName) {
            const excluded = new Set(String(raidSoSettings.excludedUsers || '').split(/[\n,]+/).map(v => normalizeRaidSoLogin(v)).filter(Boolean));
            return excluded.has(normalizeRaidSoLogin(login)) || excluded.has(normalizeRaidSoLogin(displayName));
        }

        function idListText() {
            return langMap[currentLang]?.idList || langMap.ja.idList;
        }

        function normalizeFriendTwitch(value) {
            return normalizeRaidSoLogin(value);
        }

        function isValidShoutoutLogin(login) {
            return /^[a-z0-9_]{3,25}$/.test(String(login || ''));
        }

        function shoutoutSuggestText() {
            return { empty: uiText('runtime.noSavedIds'), used: uiText('runtime.shoutoutCountUnit') };
        }

        function getShoutoutSuggestionItems() {
            const items = [];
            for (const category of friendsConfig || []) {
                const isHistoryCategory = category.kind === 'shoutout-history';
                for (const friend of category.friends || []) {
                    const login = normalizeFriendTwitch(friend.twitch || friend.username || friend.url || '');
                    if (!login || !isValidShoutoutLogin(login)) continue;
                    const displayName = String(friend.name || friend.displayName || '').trim();
                    const shoutoutCount = Number(friend.shoutoutCount || 0);
                    const lastShoutoutAt = friend.lastShoutoutAt || '';
                    items.push({
                        login,
                        displayName,
                        shoutoutCount,
                        lastShoutoutAt,
                        isHistoryCategory,
                        categoryName: String(category.name || '')
                    });
                }
            }
            return items.sort((a, b) => {
                if (a.isHistoryCategory !== b.isHistoryCategory) return a.isHistoryCategory ? -1 : 1;
                const dateCompare = String(b.lastShoutoutAt || '').localeCompare(String(a.lastShoutoutAt || ''));
                if (dateCompare) return dateCompare;
                return (b.shoutoutCount || 0) - (a.shoutoutCount || 0)
                    || a.categoryName.localeCompare(b.categoryName)
                    || a.login.localeCompare(b.login);
            });
        }

        function getSuggestInput(id = '') {
            const targetId = id || raidSoState.activeSuggestInputId || document.activeElement?.id || 'so-user-input';
            const input = document.getElementById(targetId);
            return input?.dataset?.suggest === 'twitch-id' ? input : null;
        }

        function currentSuggestQuery(input) {
            const value = String(input?.value || '');
            if (input?.dataset?.suggestMulti === 'true') {
                const parts = value.split(/[\s,、]+/);
                return parts[parts.length - 1] || '';
            }
            return value;
        }

        function getFilteredShoutoutSuggestions(inputId = '') {
            const input = getSuggestInput(inputId);
            const querySource = currentSuggestQuery(input);
            const query = normalizeRaidSoLogin(querySource);
            const raw = String(querySource || '').trim().toLowerCase();
            return getShoutoutSuggestionItems().filter(item => {
                if (!query && !raw) return true;
                return item.login.includes(query || raw) || String(item.displayName || '').toLowerCase().includes(raw);
            }).slice(0, 10);
        }

        function renderShoutoutSuggestions(animate = false, inputId = '') {
            const input = getSuggestInput(inputId);
            if (!input) return;
            raidSoState.activeSuggestInputId = input.id;
            const wrap = document.getElementById(`${input.id}-suggest-wrap`);
            const panel = document.getElementById(`${input.id}-suggest-panel`);
            if (!panel) return;
            const I = idListText();
            const emptyName = I.emptyName || '';
            const items = getFilteredShoutoutSuggestions(input.id);
            const text = shoutoutSuggestText();
            panel.innerHTML = items.length ? items.map(item => {
                const name = item.displayName && item.displayName !== emptyName ? item.displayName : '';
                const countMeta = item.shoutoutCount ? ` / ${item.shoutoutCount}${text.used}` : '';
                const main = name ? name : `@${item.login}`;
                const categoryMeta = item.categoryName ? ` / ${item.categoryName}` : '';
                const sub = name ? `@${item.login}${countMeta}${categoryMeta}` : `${countMeta.replace(/^ \/ /, '')}${categoryMeta}`.replace(/^ \/ /, '');
                return `<button type="button" class="so-suggest-item" data-login="${raidSoEscape(item.login)}" data-input-id="${raidSoEscape(input.id)}" onmousedown="selectShoutoutSuggestion(event, this)"><span class="so-suggest-main">${raidSoEscape(main)}</span><span class="so-suggest-sub">${raidSoEscape(sub || item.login)}</span></button>`;
            }).join('') : `<div class="so-suggest-empty">${raidSoEscape(text.empty)}</div>`;
            if (document.activeElement === input) {
                wrap?.classList.add('is-active');
                panel.classList.add('open');
                if (animate) {
                    panel.classList.remove('refresh-pop');
                    void panel.offsetWidth;
                    panel.classList.add('refresh-pop');
                }
            }
        }

        function openShoutoutSuggestions(inputId = '', animate = false) {
            const input = getSuggestInput(inputId);
            if (!input) return;
            raidSoState.activeSuggestInputId = input.id;
            const wrap = document.getElementById(`${input.id}-suggest-wrap`);
            const panel = document.getElementById(`${input.id}-suggest-panel`);
            if (!wrap || !panel) return;
            renderShoutoutSuggestions(false, input.id);
            wrap.classList.add('is-active');
            panel.classList.add('open');
            if (animate) {
                panel.classList.remove('refresh-pop');
                void panel.offsetWidth;
                panel.classList.add('refresh-pop');
            }
        }

        function closeShoutoutSuggestions() {
            document.querySelectorAll('.so-suggest-wrap').forEach(wrap => wrap.classList.remove('is-active'));
            document.querySelectorAll('.so-suggest-panel').forEach(panel => panel.classList.remove('open', 'refresh-pop'));
        }

        function selectShoutoutSuggestion(event, button) {
            event.preventDefault();
            const input = getSuggestInput(button?.dataset?.inputId || '');
            const login = button?.dataset?.login || '';
            if (!input || !login) return;
            if (input.dataset.suggestMulti === 'true') {
                const value = String(input.value || '');
                if (!value.trim() || /[\s,、]$/.test(value)) {
                    input.value = `${value}${login}`;
                } else {
                    const parts = value.split(/([\s,、]+)/);
                    let replaced = false;
                    for (let i = parts.length - 1; i >= 0; i--) {
                        if (!/^[\s,、]+$/.test(parts[i]) && parts[i] !== '') {
                            parts[i] = login;
                            replaced = true;
                            break;
                        }
                    }
                    input.value = replaced ? parts.join('') : login;
                }
            } else {
                input.value = login;
            }
            closeShoutoutSuggestions();
            input.focus();
        }

        function handleShoutoutSuggestKey(event) {
            if (event.key === 'Escape') closeShoutoutSuggestions();
        }


        function normalizeXProfileUrl(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            const urlMatch = raw.match(/(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/(?!share(?:\/|$)|intent(?:\/|$)|home(?:\/|$)|search(?:\/|$)|i\/)([A-Za-z0-9_]{1,15})(?:[\/?#].*)?$/i);
            const id = urlMatch ? urlMatch[1] : raw.replace(/^@/, '').match(/^[A-Za-z0-9_]{1,15}$/)?.[0];
            return id ? `https://x.com/${id}` : '';
        }

        function extractXProfileFromTwitchDescription(description) {
            const text = String(description || '').trim();
            if (!text) return '';
            const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/(?!share(?:\/|$)|intent(?:\/|$)|home(?:\/|$)|search(?:\/|$)|i\/)([A-Za-z0-9_]{1,15})(?:[\/?#\s,，。.)]|$)/i);
            if (urlMatch) return normalizeXProfileUrl(urlMatch[1]);
            const nearAfter = text.match(/(?:^|[^A-Za-z0-9_])(?:x|twitter|Ｘ|𝕏)(?:\s|:|：|ID|id|アカウント|垢|@|\.|／|-|－){0,20}@([A-Za-z0-9_]{1,15})(?![A-Za-z0-9_])/i);
            if (nearAfter) return normalizeXProfileUrl(nearAfter[1]);
            const nearBefore = text.match(/(?:^|[^A-Za-z0-9_])@([A-Za-z0-9_]{1,15})(?![A-Za-z0-9_])[^\n]{0,24}(?:x|twitter|Ｘ|𝕏)/i);
            if (nearBefore) return normalizeXProfileUrl(nearBefore[1]);
            return '';
        }

        async function autoFillFriendXFromTwitch(ci, fi, knownDescription = '') {
            const friend = friendsConfig?.[ci]?.friends?.[fi];
            if (!friend) return false;
            if (String(friend.x || '').trim() && !isPlaceholderFriendName(friend.name)) return false;
            const login = normalizeFriendTwitch(friend.twitch || friend.username || friend.url || '');
            if (!login) return false;
            const hasAuthForLookup = Boolean(cleanRaidSoToken() && getEffectiveTwitchClientId());
            if (!knownDescription && !hasAuthForLookup) return false;
            const lastChecked = Date.parse(friend.xAutoCheckedAt || '');
            if (!knownDescription && lastChecked && Date.now() - lastChecked < 24 * 60 * 60 * 1000) return false;
            friend.xAutoCheckedAt = new Date().toISOString();
            let description = knownDescription || '';
            try {
                let changed = false;
                if (!description && hasAuthForLookup) {
                    const user = await getRaidSoUser(login);
                    description = user?.description || '';
                    if (isPlaceholderFriendName(friend.name) && (user?.display_name || user?.login)) {
                        friend.name = user.display_name || user.login;
                        changed = true;
                    }
                }
                const xUrl = extractXProfileFromTwitchDescription(description);
                if (xUrl && !String(friend.x || '').trim()) {
                    friend.x = xUrl;
                    changed = true;
                }
                if (changed) {
                    saveFriendsLocal(false);
                    renderFriends();
                    return true;
                }
                saveFriendsLocal(false);
            } catch (e) {
                console.warn('X profile auto-fill failed:', e);
            }
            return false;
        }

        function autoFillFriendXFromLogin(login, knownDescription = '') {
            const normalized = normalizeFriendTwitch(login || '');
            if (!normalized) return;
            for (let ci = 0; ci < (friendsConfig || []).length; ci++) {
                const friends = friendsConfig[ci]?.friends || [];
                for (let fi = 0; fi < friends.length; fi++) {
                    if (normalizeFriendTwitch(friends[fi].twitch || friends[fi].username || friends[fi].url || '') === normalized) {
                        autoFillFriendXFromTwitch(ci, fi, knownDescription);
                        return;
                    }
                }
            }
        }

        function isPlaceholderFriendName(value) {
            const name = String(value || '').trim();
            const placeholders = ['USER', '配信者', 'Streamer', '主播'];
            return !name || placeholders.includes(name);
        }

        function ensureFriendCategory(name, kind = '') {
            if (!Array.isArray(friendsConfig)) friendsConfig = [];
            let category = friendsConfig.find(cat => (kind && cat.kind === kind) || cat.name === name);
            if (!category) {
                category = { name, kind, friends: [], isClosed: false };
                friendsConfig.unshift(category);
            }
            if (kind) category.kind = kind;
            if (name) category.name = name;
            if (!Array.isArray(category.friends)) category.friends = [];
            return category;
        }

        function ensureAuthenticatedUserIdList() {
            const login = normalizeFriendTwitch(settings.userLogin || '');
            if (!login || !settings.userId) return false;
            const I = idListText();
            const before = JSON.stringify(friendsConfig || []);
            const category = ensureFriendCategory(I.selfCategory || '自分のTwitchアカウント', 'authenticated-user');
            category.isClosed = Boolean(category.isClosed);
            let friend = category.friends.find(item => normalizeFriendTwitch(item.twitch) === login);
            if (!friend) {
                friend = { name: settings.userLogin || login, twitch: login, x: '', memo: '', isOpen: false };
                category.friends.unshift(friend);
            }
            if (isPlaceholderFriendName(friend.name)) friend.name = settings.userLogin || login;
            friend.twitch = login;
            if (!String(friend.memo || '').trim()) {
                friend.memo = uiText('idList.selfMemo', { userId: settings.userId }, `Twitch User ID: ${settings.userId}`);
            }
            const changed = JSON.stringify(friendsConfig) !== before;
            if (changed) saveFriendsLocal(false);
            autoFillFriendXFromLogin(login);
            return changed;
        }

        function rememberShoutoutId(data, incrementCount = false) {
            const login = normalizeFriendTwitch(data?.username || data?.url || '');
            if (!login) return;
            const displayName = data.displayName || data.username || login;
            const now = new Date().toISOString();
            let found = null;
            for (const category of friendsConfig || []) {
                for (const friend of category.friends || []) {
                    if (normalizeFriendTwitch(friend.twitch) === login) {
                        found = friend;
                        break;
                    }
                }
                if (found) break;
            }
            if (!found) {
                const category = ensureFriendCategory(idListText().autoCategory || (I18N_DATA[currentLang]?.ui?.jsMsgs?.shoutoutHistory || langMap.ja.jsMsgs.shoutoutHistory), 'shoutout-history');
                found = { name: displayName, twitch: login, x: '', memo: '', isOpen: false, shoutoutCount: 0, lastShoutoutAt: '' };
                category.friends.unshift(found);
            }
            if (isPlaceholderFriendName(found.name)) found.name = displayName;
            found.twitch = login;
            if (incrementCount) {
                found.shoutoutCount = Number(found.shoutoutCount || 0) + 1;
                found.lastShoutoutAt = now;
            }
            saveFriendsLocal(false);
            renderFriends();
            autoFillFriendXFromLogin(login, data.description || '');
        }

        async function introduceRaidSoChannel(options) {
            const user = options.targetId ? await getRaidSoUser(options.targetId) : await getRaidSoUser(options.targetLogin);
            const channel = await getRaidSoChannel(user.id);
            const data = {
                username: channel.broadcaster_login || user.login,
                displayName: channel.broadcaster_name || user.display_name,
                game: channel.game_name || langMap[currentLang].logs.catUnset,
                title: channel.title || (I18N_DATA[currentLang]?.ui?.jsMsgs?.noTitle || langMap.ja.jsMsgs.noTitle),
                viewers: options.viewers || '',
                url: `https://twitch.tv/${channel.broadcaster_login || user.login}`,
                description: user.description || ''
            };
            rememberShoutoutId(data);
            if (options.officialShoutout) {
                try {
                    await sendRaidSoOfficialShoutout(user.id, data.username, formatCommandLog('sentShoutout', { id: data.username }));
                } catch (e) {
                    const fail = commandText().shoutoutSendFailed || cmdSets.ja.shoutoutSendFailed;
                    raidSoLog(`${fail}: ${localizeRaidSoError(e)}`, 'warn');
                }
            }
            if (options.sendChat) await sendRaidSoChat(renderRaidSoTemplate(options.template, data));
            raidSoLog(`${langMap[currentLang].logs.logIntroDone} ${data.displayName}`);
        }

        async function getRaidSoUser(loginOrId) {
            const raw = String(loginOrId || '').trim();
            const query = /^\d+$/.test(raw) ? `id=${encodeURIComponent(raw)}` : `login=${encodeURIComponent(normalizeRaidSoLogin(raw))}`;
            const data = await raidSoHelix(`/users?${query}`);
            if (!data.data || !data.data[0]) throw new Error(`${langMap[currentLang].logs.errNoUser} ${loginOrId}`);
            return data.data[0];
        }

        async function getRaidSoChannel(userId) {
            const data = await raidSoHelix(`/channels?broadcaster_id=${encodeURIComponent(userId)}`);
            if (!data.data || !data.data[0]) throw new Error(`${langMap[currentLang].logs.errNoChannel} ${userId}`);
            return data.data[0];
        }

        function renderRaidSoTemplate(template, data) {
            const map = { username: data.username, displayName: data.displayName, game: data.game, title: data.title, viewers: data.viewers, url: data.url, ID: data.username, NAME: data.displayName, CATEGORY: data.game, TITLE: data.title, VIEWERS: data.viewers };
            return String(template || '').replace(/\{(username|displayName|game|title|viewers|url|ID|NAME|CATEGORY|TITLE|VIEWERS)\}/g, (_, key) => map[key] ?? '').replace(/\s*\n+\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
        }

        async function sendRaidSoChat(message, successLog) {
            const result = await raidSoHelix('/chat/messages', { method: 'POST', body: JSON.stringify({ broadcaster_id: settings.userId, sender_id: settings.userId, message }) });
            const sent = result?.data?.[0];
            if (sent && sent.is_sent === false) {
                const reason = sent.drop_reason?.message || sent.drop_reason?.code || langMap[currentLang].logs.errChatReject;
                throw new Error(reason);
            }
            raidSoLog(successLog || langMap[currentLang].logs.logChatSent);
        }

        // チャット消去APIの直接実行 (DELETE /moderation/chat)
        async function deleteRaidSoChat() {
            ensureRaidSoBaseSettings();
            await raidSoHelix(`/moderation/chat?broadcaster_id=${settings.userId}&moderator_id=${settings.userId}`, {
                method: 'DELETE'
            });
            raidSoLog(uiText('runtime.chatCleared'));
        }

        // チャット設定変更APIの直接実行 (PATCH /chat/settings)
        async function updateRaidSoChatSettings(body) {
            ensureRaidSoBaseSettings();
            await raidSoHelix(`/chat/settings?broadcaster_id=${settings.userId}&moderator_id=${settings.userId}`, {
                method: 'PATCH',
                body: JSON.stringify(body)
            });
            raidSoLog(uiText('runtime.chatUpdated'));
        }

        // ピン留め解除の直接実行 (DELETE /chat/pins)
        async function unpinRaidSoChat() {
            ensureRaidSoBaseSettings();
            await raidSoHelix(`/chat/pins?broadcaster_id=${settings.userId}&moderator_id=${settings.userId}`, {
                method: 'DELETE'
            });
            raidSoLog(uiText('runtime.messageUnpinned'));
        }

        // レイドキャンセルの直接実行 (DELETE /raids)
        async function cancelRaidSo() {
            ensureRaidSoBaseSettings();
            await raidSoHelix(`/raids?broadcaster_id=${settings.userId}`, {
                method: 'DELETE'
            });
            raidSoLog(uiText('runtime.raidCanceled'));
        }

        function getRaidSoErrorRawText(error) {
            return [error?.message, error?.data?.message, error?.data?.error].filter(Boolean).join(' ').trim() || String(error || '').trim();
        }

        function getRaidSoShoutoutRetryDelayMs(error) {
            const raw = getRaidSoErrorRawText(error);
            const headers = error?.headers || {};
            const retryAfter = headers['retry-after'];
            if (retryAfter) {
                const seconds = Number(retryAfter);
                if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
                const retryDate = Date.parse(retryAfter);
                if (Number.isFinite(retryDate)) return Math.max(0, retryDate - Date.now());
            }
            const reset = Number(headers['ratelimit-reset'] || headers['x-ratelimit-reset']);
            if (Number.isFinite(reset) && reset > 0) {
                const resetMs = reset > 9999999999 ? reset : reset * 1000;
                return Math.max(0, resetMs - Date.now());
            }
            const secondsMatch = raw.match(/(?:wait|after|in|あと|残り)?\s*(\d+)\s*(?:seconds?|secs?|sec|s|秒)/i);
            if (secondsMatch) return Number(secondsMatch[1]) * 1000;
            const minutesMatch = raw.match(/(?:wait|after|in|あと|残り)?\s*(\d+)\s*(?:minutes?|mins?|min|m|分)/i);
            if (minutesMatch) return Number(minutesMatch[1]) * 60 * 1000;
            if (/cooldown period expires|may not give another Shoutout/i.test(raw)) {
                const knownWait = raidSoState.nextOfficialShoutoutAt - Date.now();
                const fallbackWait = /same broadcaster/i.test(raw) ? 60 * 60 * 1000 : 120000;
                return knownWait > 0 ? knownWait : fallbackWait;
            }
            return 0;
        }

        function queueRaidSoOfficialShoutout(targetId, targetLogin, successLog, delayMs) {
            const login = normalizeRaidSoLogin(targetLogin) || String(targetId || '');
            const waitMs = Math.max(1000, Math.min(24 * 60 * 60 * 1000, Number(delayMs || 120000) + 1000));
            const existing = raidSoState.shoutoutRetryTimers.get(login);
            if (existing?.timer) clearTimeout(existing.timer);
            const seconds = Math.ceil(waitMs / 1000);
            const timer = setTimeout(async () => {
                raidSoState.shoutoutRetryTimers.delete(login);
                try {
                    raidSoLog(formatCommandLog('shoutoutRetrying', { id: targetLogin || login }));
                    await sendRaidSoOfficialShoutout(targetId, targetLogin, successLog, { allowRetry: false });
                } catch (e) {
                    raidSoLog(`${formatCommandLog('shoutoutRetryFailed', { id: targetLogin || login })}: ${localizeRaidSoError(e)}`, 'warn');
                }
            }, waitMs);
            raidSoState.shoutoutRetryTimers.set(login, { timer, runAt: Date.now() + waitMs, targetId, targetLogin });
            raidSoLog(formatCommandLog('shoutoutQueued', { id: targetLogin || login, seconds }), 'warn');
            return { queued: true, waitMs };
        }

        async function sendRaidSoOfficialShoutout(targetId, targetLogin, successLog, options = {}) {
            const allowRetry = options.allowRetry !== false;
            const knownWaitMs = Math.max(0, raidSoState.nextOfficialShoutoutAt - Date.now());
            if (allowRetry && knownWaitMs > 1000) {
                return queueRaidSoOfficialShoutout(targetId, targetLogin, successLog, knownWaitMs);
            }
            const query = new URLSearchParams({ from_broadcaster_id: settings.userId, to_broadcaster_id: targetId, moderator_id: settings.userId });
            try {
                await raidSoHelix(`/chat/shoutouts?${query.toString()}`, { method: 'POST' });
                raidSoState.nextOfficialShoutoutAt = Date.now() + 120000;
                rememberShoutoutId({ username: targetLogin, displayName: targetLogin }, true);
                raidSoLog(successLog || `${I18N_DATA[currentLang]?.ui?.jsMsgs?.shoutoutExec} ${targetLogin}`);
                return { sent: true };
            } catch (e) {
                const retryDelayMs = getRaidSoShoutoutRetryDelayMs(e);
                if (allowRetry && retryDelayMs > 0) return queueRaidSoOfficialShoutout(targetId, targetLogin, successLog, retryDelayMs);
                throw e;
            }
        }

        function raidSoSoundConfig(kind) {
            const r = raidSoText();
            if (kind === 'raid') return { src: raidSoSettings.raidSoundFile, volume: raidSoSettings.raidVolume, label: r.raidSound };
            if (kind === 'comment') return { src: raidSoSettings.commentSoundFile, volume: raidSoSettings.commentVolume, label: r.commentSound };
            if (kind === 'channelPoint') return { src: raidSoSettings.channelPointSoundFile, volume: raidSoSettings.channelPointVolume, label: r.channelPointSound };
            return { src: raidSoSettings.firstCommentSoundFile, volume: raidSoSettings.firstCommentVolume, label: r.firstCommentSound };
        }

        function playRaidSoSound(kind, options = {}) {
            const cfg = raidSoSoundConfig(kind);
            if (!cfg.src) return;
            if (!options.overlap && raidSoState.audio) {
                raidSoState.audio.pause();
                raidSoState.audio.currentTime = 0;
            }
            const src = new URL(cfg.src, window.location.href).href;
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = Math.max(0, Math.min(1, Number(cfg.volume) / 100));
            if (!options.overlap) raidSoState.audio = audio;
            else {
                raidSoState.audioPool.push(audio);
                audio.addEventListener('ended', () => {
                    raidSoState.audioPool = raidSoState.audioPool.filter(item => item !== audio);
                }, { once: true });
            }
            audio.play()
                .then(() => raidSoLog(`${cfg.label}${langMap[currentLang].logs.logAudioPlayed}`))
                .catch(e => {
                    const hint = e.name === 'NotAllowedError' ? langMap[currentLang].logs.warnBrowserLimit : e.message;
                    raidSoLog(`${cfg.label} ${I18N_DATA[currentLang]?.ui?.jsMsgs?.audioPlayErr} ${hint}`, 'warn');
                });
        }

        function testRaidSoSound(kind) {
            saveRaidSoSettings(false);
            playRaidSoSound(kind);
        }

        async function manualRaidSoIntroduce(sendChat) {
            saveRaidSoSettings(false);
            try {
                ensureRaidSoBaseSettings();
                const target = normalizeRaidSoLogin(document.getElementById('so-user-input')?.value || '');
                if (!target) throw new Error(langMap[currentLang].logs.errNoSoId);
                await introduceRaidSoChannel({ targetLogin: target, targetId: '', viewers: '', template: raidSoSettings.manualTemplate, officialShoutout: false, sendChat });
            } catch (e) {
                raidSoLog(e.message, 'warn');
            }
        }

        function applyRaidSoMessageTemplate() {
            const presetId = document.getElementById('raidso-raid-template-preset')?.value || 'classic';
            const templateLang = currentLang || 'ja';
            const presets = getRaidSoTemplatePresets(templateLang);
            const preset = presets.find(item => item.id === presetId) || presets[0] || RAIDSO_RAID_TEMPLATE_PRESETS[0];
            const set = raidSoTemplateSet(preset, templateLang);
            const raidEl = document.getElementById('raidso-raid-template');
            const manualEl = document.getElementById('raidso-manual-template');
            if (raidEl) raidEl.value = set.raid;
            if (manualEl) manualEl.value = set.manual;
            saveRaidSoSettings(false);
            const label = raidSoPresetLabel(preset);
            const text = raidSoText().templateApplied || langMap.ja.raidSo.templateApplied;
            raidSoLog(text.replace('{name}', label));
            showToast(doneText());
        }

        async function saveRaidSoCustomTemplate() {
            collectRaidSoSettings();
            const r = raidSoText();
            const name = (await customPrompt(dialogCopy('customTemplateSave')))?.trim();
            if (!name) return;
            const lang = currentLang || 'ja';
            const existingIndex = customRaidSoTemplates.findIndex(item => item.lang === lang && item.name === name);
            const saved = {
                id: existingIndex >= 0 ? customRaidSoTemplates[existingIndex].id : `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                lang,
                name,
                raid: raidSoSettings.raidTemplate,
                manual: raidSoSettings.manualTemplate,
                updatedAt: new Date().toISOString()
            };
            if (existingIndex >= 0) customRaidSoTemplates.splice(existingIndex, 1);
            customRaidSoTemplates.unshift(saved);
            saveRaidSoCustomTemplates();
            renderRaidShoutOutPanel();
            const msg = (r.customTemplateSaved || langMap.ja.raidSo.customTemplateSaved).replace('{name}', name);
            raidSoLog(msg);
            showToast(msg);
        }

        function renderRaidSoStatus() {
            const el = document.getElementById('raidso-status');
            if (!el) return;
            const connected = raidSoState.ws && raidSoState.ws.readyState === WebSocket.OPEN;
            const subs = [];
            if (raidSoState.subscriptions.raid) subs.push(I18N_DATA[currentLang]?.ui?.jsMsgs?.raid || langMap.ja.jsMsgs.raid);
            if (raidSoState.subscriptions.chat) subs.push(I18N_DATA[currentLang]?.ui?.jsMsgs?.chat || langMap.ja.jsMsgs.chat);
            el.innerHTML = `${I18N_DATA[currentLang]?.ui?.jsMsgs?.statusPrefix}${connected ? I18N_DATA[currentLang]?.ui?.jsMsgs?.statusConn : I18N_DATA[currentLang]?.ui?.jsMsgs?.statusDisconn}${I18N_DATA[currentLang]?.ui?.jsMsgs?.monitorPrefix}${subs.length ? subs.join(', ') : I18N_DATA[currentLang]?.ui?.jsMsgs?.statusUnset}${I18N_DATA[currentLang]?.ui?.jsMsgs?.authPrefix}${settings.userLogin || settings.userId || I18N_DATA[currentLang]?.ui?.jsMsgs?.statusUnset}`;
        }

        function raidSoLog(message, type = 'info') {
            const now = new Date();
            const locale = currentLang === 'ja' ? 'ja-JP' : currentLang === 'zh' ? 'zh-CN' : 'en-US';
            const time = now.toLocaleString(locale, {
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
            raidSoState.logs.unshift({ at: now.toISOString(), time, message: String(message || ''), type });
            raidSoState.logs = raidSoState.logs.slice(0, RAIDSO_LOG_LIMIT);
            safeSetLocal(RAIDSO_LOG_STORAGE_KEY, JSON.stringify(raidSoState.logs));
            renderRaidSoLog();
        }

        function clearRaidSoLog(show = false) {
            raidSoState.logs = [];
            localStorage.removeItem(RAIDSO_LOG_STORAGE_KEY);
            renderRaidSoLog();
            if (show) showToast(doneText());
        }

        async function copyRaidSoLogToClipboard() {
            const text = raidSoState.logs.length
                ? raidSoState.logs.map(item => `[${item.time}] ${item.type || 'info'}: ${item.message}`).join('\n')
                : (raidSoText().noLogs || commandText().noLogs || '');
            await copyTextToClipboard(text);
            showToast(doneText());
        }

        function renderRaidSoLog() {
            const logs = document.querySelectorAll('[data-raidso-log]');
            if (!logs.length) return;
            logs.forEach(el => {
                const emptyText = el.dataset.empty || raidSoText().noLogs;
                el.innerHTML = raidSoState.logs.length
                    ? raidSoState.logs.map(item => `<div class="raidso-log-item ${item.type === 'warn' ? 'warn' : ''}"><span class="raidso-log-time">${raidSoEscape(item.time)}</span>${raidSoEscape(item.message)}</div>`).join('')
                    : raidSoEscape(emptyText);
            });
        }

        async function addFriendCategory(cid) {
            const isTitleTab = cid === 'main-container';
            const n = await customPrompt(dialogCopy(isTitleTab ? 'titleCategoryAdd' : 'idCategoryAdd'));
            if (!n) return;
            if (isTitleTab) {
                config.push({ name: n, records: [], isClosed: false });
                render();
                saveAllLocal(false);
            } else {
                friendsConfig.push({ name: n, friends: [], isClosed: false });
                renderFriends();
                saveFriendsLocal(false);
            }
        }

        function updateRestoreFileName(input) {
            const name = document.getElementById('ui-restore-file-name');
            if (name) name.innerText = input?.files?.[0]?.name || (langMap[currentLang]?.footerActions?.noFileSelected || langMap.ja.footerActions.noFileSelected);
        }

        function restoreFromLocalFile() {
            const file = document.getElementById('ui-restore-file')?.files?.[0];
            if (!file) {
                showToast(uiText('runtime.selectBackupFile'), 'error');
                return;
            }
            const reader = new FileReader(); reader.onload = (e) => {
                try {
                    const d = JSON.parse(e.target.result);
                    if (d.config) localStorage.setItem('stream_config_v16', JSON.stringify(d.config));
                    if (d.friends) localStorage.setItem('stream_friends_v16', JSON.stringify(d.friends));
                    if (d.settings) localStorage.setItem('stream_settings_v16', JSON.stringify(d.settings));
                    if (d.memoList) localStorage.setItem('stream_memo_v16', JSON.stringify(d.memoList));
                    if (d.raidShoutOut) localStorage.setItem(RAIDSO_STORAGE_KEY, JSON.stringify(d.raidShoutOut));
                    if (d.raidShoutOutTemplates) localStorage.setItem(RAIDSO_CUSTOM_TEMPLATES_KEY, JSON.stringify(d.raidShoutOutTemplates));
                    if (Array.isArray(d.supporterArchives)) localStorage.setItem(SUPPORTER_ARCHIVE_STORAGE_KEY, JSON.stringify(d.supporterArchives.slice(0, SUPPORTER_ARCHIVE_LIMIT)));
                    raidSoLog(uiText('runtime.operationLog.backupRestored'));
                    location.reload();
                } catch (error) {
                    showToast(uiText('runtime.restoreFailed'), 'error');
                }
            }; reader.readAsText(file);
            reader.onerror = () => showToast(uiText('runtime.restoreFailed'), 'error');
        }
        async function copyBackupToClipboard() { collectRaidSoSettings(); const d = { config, friends: friendsConfig, settings, memoList: memoConfig, raidShoutOut: raidSoSettings, raidShoutOutTemplates: customRaidSoTemplates, supporterArchives: readSupporterArchives() }; await copyTextToClipboard(JSON.stringify(d, null, 2)); }

        window.onload = () => {
            config = JSON.parse(localStorage.getItem('stream_config_v16') || '[]');
            friendsConfig = JSON.parse(localStorage.getItem('stream_friends_v16') || '[]');
            memoConfig = JSON.parse(localStorage.getItem('stream_memo_v16') || '[]');
            customRaidSoTemplates = loadRaidSoCustomTemplates();
            settings = {
                redirectUri: 'http://localhost',
                supporterResetOnStreamStart: true,
                ...JSON.parse(localStorage.getItem('stream_settings_v16') || '{}')
            };
            ensureSupporterSettings();
            settings.token = extractTwitchAccessToken(settings.token);
            scrubSavedClientId();

            // ★追加：保存されている設定(IDやToken)を設定画面の入力欄にセットして表示する
            if (settings) {
                if (settings.userId) document.getElementById('user_id').value = settings.userId;
                if (settings.userLogin) document.getElementById('user_login').value = settings.userLogin;
                document.getElementById('client_id').value = settings.clientId || '';
                document.getElementById('oauth_redirect_uri').value = settings.redirectUri || 'http://localhost';
                if (settings.token) document.getElementById('token').value = settings.token;
                if (settings.dateFormat) document.getElementById('date_format').value = settings.dateFormat;
                const livePreview = document.getElementById('date_format_live_preview');
                if (livePreview) livePreview.innerText = uiText('runtime.datePreview', { date: formatDateToken(new Date(), settings.dateFormat) });
            }

            initLanguage();
            initTabNavDrag();
            cleanupTitleTestData();
            cleanupIdListTestData();
            ensureAuthenticatedUserIdList();
            render();
            renderFriends();
            renderMemo();
            restoreTwitchListCaches();
            initNumberWheelControls();
            syncTwitchChoiceButtons('prediction');
            syncTwitchChoiceButtons('poll');

            const supporterResetToggle = document.getElementById('supporter-reset-on-stream-start');
            if (supporterResetToggle) supporterResetToggle.checked = settings.supporterResetOnStreamStart !== false;
            restoreSupporterControls();

            const listCacheStr = localStorage.getItem('stream_supporter_list_v16');
            if (listCacheStr) {
                try {
                    const listCache = JSON.parse(listCacheStr);
                    if (listCache.first && document.getElementById('pg-i-first-det')) document.getElementById('pg-i-first-det').value = listCache.first;
                    if (listCache.raid && document.getElementById('pg-i-raid-det')) document.getElementById('pg-i-raid-det').value = listCache.raid;
                    if (listCache.follow && document.getElementById('pg-i-follow-det')) document.getElementById('pg-i-follow-det').value = listCache.follow;
                    if (listCache.cheer && document.getElementById('pg-i-cheer-det')) document.getElementById('pg-i-cheer-det').value = listCache.cheer;
                    if (listCache.sub && document.getElementById('pg-i-sub-det')) document.getElementById('pg-i-sub-det').value = listCache.sub;
                    if (listCache.gift && document.getElementById('pg-i-gift-det')) document.getElementById('pg-i-gift-det').value = listCache.gift;
                    if (listCache.chat && document.getElementById('pg-i-chat-det')) document.getElementById('pg-i-chat-det').value = listCache.chat;
                    if (Array.isArray(listCache.chatIds)) streamStats.chatters = new Set(listCache.chatIds.map(normalizeSupporterLogin).filter(Boolean));
                    if (listCache.streamDate) streamStats.streamDate = listCache.streamDate;
                    if (typeof listCache.streamTitle === 'string') streamStats.streamTitle = listCache.streamTitle;
                } catch (e) {
                    console.warn('Supporter list restore failed:', e);
                }
            }

            updatePollPresetDropdown();
            updatePredPresetDropdown();
            updatePostPreview();

            if (settings.userId && settings.clientId && settings.token) {
                connectEventSub();
                checkStreamStatus();
                _streamCheckInterval = setInterval(checkStreamStatus, 60000);
            }

            setTimeout(() => syncRaidSoConnection(false), 0);
            setTimeout(initSyncHeights, 150);
            applyInitialViewFromLocation();
            updateTodayDateDisplay();
            setInterval(updateTodayDateDisplay, 1000);
        };
    


    const CHAT_DURATION_LIMITS = {
        follower: { min: 0, max: 129600, fallback: 0 },
        slow: { min: 3, max: 120, fallback: 30 }
    };

    function clampInt(value, min, max, fallback) {
        const num = Number.parseInt(value, 10);
        if (!Number.isFinite(num)) return fallback;
        return Math.min(max, Math.max(min, num));
    }

    function clampElementValue(id, min, max, fallback) {
        const el = document.getElementById(id);
        const value = clampInt(el?.value, min, max, fallback);
        if (el) el.value = String(value);
        return value;
    }

    function getChatDurationLimitByInputId(inputId) {
        if (inputId === 'follower-time' || inputId === 'cs-follow-dur') return CHAT_DURATION_LIMITS.follower;
        if (inputId === 'slow-time' || inputId === 'cs-slow-dur') return CHAT_DURATION_LIMITS.slow;
        return null;
    }

    async function handleCommandClick(cmd, label, isAutoExec) {
        const cleanedCmd = String(cmd || '').trim();
        const isSlashCommand = cleanedCmd.startsWith('/');
        const isAllowedDirect = cleanedCmd.startsWith('/me ') || cleanedCmd.startsWith('/announce ');

        let handledByApi = false;
        if (isAutoExec && isSlashCommand) {
            try {
                if (cleanedCmd === '/clear') {
                    await deleteRaidSoChat();
                    handledByApi = true;
                } else if (cleanedCmd === '/disconnect') {
                    disconnectRaidSo();
                    handledByApi = true;
                } else if (cleanedCmd === '/unpin') {
                    await unpinRaidSoChat();
                    handledByApi = true;
                } else if (cleanedCmd === '/unraid') {
                    await cancelRaidSo();
                    handledByApi = true;
                } else if (cleanedCmd === '/emoteonly') {
                    await updateRaidSoChatSettings({ emote_mode: true });
                    handledByApi = true;
                } else if (cleanedCmd === '/emoteonlyoff') {
                    await updateRaidSoChatSettings({ emote_mode: false });
                    handledByApi = true;
                } else if (cleanedCmd === '/subscribers') {
                    await updateRaidSoChatSettings({ subscriber_mode: true });
                    handledByApi = true;
                } else if (cleanedCmd === '/subscribersoff') {
                    await updateRaidSoChatSettings({ subscriber_mode: false });
                    handledByApi = true;
                } else if (cleanedCmd === '/uniquechat') {
                    await updateRaidSoChatSettings({ unique_chat_mode: true });
                    handledByApi = true;
                } else if (cleanedCmd === '/uniquechatoff') {
                    await updateRaidSoChatSettings({ unique_chat_mode: false });
                    handledByApi = true;
                } else if (cleanedCmd === '/followersoff') {
                    await updateRaidSoChatSettings({ follower_mode: false });
                    handledByApi = true;
                } else if (cleanedCmd === '/slowoff') {
                    await updateRaidSoChatSettings({ slow_mode: false });
                    handledByApi = true;
                } else if (cleanedCmd.startsWith('/followers ')) {
                    const val = clampInt(cleanedCmd.split(/\s+/)[1], 0, 129600, 0);
                    await updateRaidSoChatSettings({ follower_mode: true, follower_mode_duration: val });
                    handledByApi = true;
                } else if (cleanedCmd.startsWith('/slow ')) {
                    const val = clampInt(cleanedCmd.split(/\s+/)[1], 3, 120, 30);
                    await updateRaidSoChatSettings({ slow_mode: true, slow_mode_wait_time: val });
                    handledByApi = true;
                }
            } catch (e) {
                showToast(e.message || uiText('runtime.apiActionFailed'), 'error');
                throw e; // トグルボタンの差し戻しのために例外を伝播
            }
        }

        if (handledByApi) {
            showToast((label || cmd) + (I18N_DATA[currentLang]?.ui?.jsMsgs?.sent || langMap.ja.jsMsgs.sent));
        } else if (isAutoExec && (!isSlashCommand || isAllowedDirect)) {
            try {
                await sendRaidSoChat(cmd);
                showToast((label || cmd) + (I18N_DATA[currentLang]?.ui?.jsMsgs?.sent || langMap.ja.jsMsgs.sent));
            } catch (e) {
                showToast(e.message || uiText('runtime.sendFailed'), 'error');
                throw e;
            }
        } else {
            await copyTextToClipboard(cmd, (label || cmd) + (I18N_DATA[currentLang]?.ui?.jsMsgs?.execCopyDone || langMap.ja.jsMsgs.execCopyDone));
        }
    }
    
    async function handleChatToggleButton(btn, onCmdBase, offCmd, inputId) {
        const isON = btn.classList.contains('active-toggle');
        btn.classList.toggle('active-toggle', !isON);
        
        let cmd = isON ? offCmd : onCmdBase;
        if (!isON && inputId) {
            const inputEl = document.getElementById(inputId);
            if (inputEl) {
                const limit = getChatDurationLimitByInputId(inputId);
                if (limit) {
                    const value = clampInt(inputEl.value, limit.min, limit.max, limit.fallback);
                    inputEl.value = String(value);
                    cmd += ' ' + value;
                } else {
                    cmd += ' ' + inputEl.value;
                }
            }
        }

        try {
            await handleCommandClick(cmd, cmd, true);
        } catch (e) {
            // エラー時はトグル状態を元に戻す
            btn.classList.toggle('active-toggle', isON);
        }
    }



    function twToggle(id) {
        const target = document.getElementById(id);
        if (!target) return;
        
        const parent = target.parentElement;
        const isClosing = !target.classList.contains('closed');
        
        let sameRowSiblings = [];
        // window.getComputedStyle to be robust in case styles are in classes instead of inline
        if (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.display === 'flex' && parentStyle.flexWrap === 'wrap') {
                const targetTop = target.offsetTop;
                const siblings = Array.from(parent.children).filter(child => child.classList?.contains('category-box'));
                siblings.forEach(sib => {
                    if (sib !== target && Math.abs(sib.offsetTop - targetTop) < 10) {
                        sameRowSiblings.push(sib);
                    }
                });
            }
        }
        
        target.classList.toggle('closed');
        
        sameRowSiblings.forEach(sib => {
            if (isClosing) {
                sib.classList.add('closed');
            } else {
                sib.classList.remove('closed');
            }
        });
    }

    function toggleStandaloneSection(id) {
        const target = document.getElementById(id);
        if (target) target.classList.toggle('closed');
    }


// --- RESTORED API FUNCTIONS ---
function safeSetLocal(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    alert(uiText('runtime.storageFull'));
                } else {
                    console.error("localStorage error:", e);
                }
            }
        }

        function toggleObsDockMode() {
            document.body.classList.toggle('obs-dock-mode');
            safeSetLocal('obs_dock_mode_v16', document.body.classList.contains('obs-dock-mode'));
        }

        // Initialize OBS Dock Mode
        if (localStorage.getItem('obs_dock_mode_v16') === 'true') {
            document.body.classList.add('obs-dock-mode');
        }

                function twSyncHeight(pair) {
            // 少し遅延させてDOM更新後に高さ取得
            requestAnimationFrame(() => {
                const els = pair.map(id => document.getElementById(id)).filter(Boolean);
                els.forEach(e => e.style.height = '');
                const maxH = Math.max(...els.map(e => e.offsetHeight));
                if (maxH > 0) els.forEach(e => e.style.height = maxH + 'px');
            });
        }

        // 初期化時に全ペアの高さを揃える
        const TW_SYNC_PAIRS = [];
        function initSyncHeights() {
            TW_SYNC_PAIRS.forEach(pair => twSyncHeight(pair));
        }

        function twExt(key, fallback = '') {
            return langMap[currentLang]?.extended?.[key]
                ?? langMap.ja?.extended?.[key]
                ?? fallback;
        }

        function twFormat(template, vars = {}) {
            return String(template || '').replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
        }

        function twPollChoicePlaceholder(index) {
            return uiText('runtime.choiceLabel', { index });
        }

        function refreshTwitchChoicePlaceholders() {
            document.querySelectorAll('.pred-outcome').forEach((input, index) => {
                input.placeholder = twPollChoicePlaceholder(index + 1);
            });
            document.querySelectorAll('.poll-ch').forEach((input, index) => {
                input.placeholder = twPollChoicePlaceholder(index + 1);
            });
        }

        function twStatusLabel(status) {
            const map = {
                ACTIVE: uiText('runtime.statusActive'),
                TERMINATED: uiText('runtime.statusEnded'),
                COMPLETED: uiText('runtime.statusEnded'),
                ARCHIVED: uiText('runtime.statusEnded'),
                LOCKED: uiText('runtime.statusLocked'),
                RESOLVED: uiText('runtime.statusResolved'),
                CANCELED: uiText('runtime.statusCanceled')
            };
            return map[status] || status || '';
        }

        function generateMultiUrl() {
            const input = document.getElementById('tw-collab').value.trim();
            if (!input) {
                showToast(uiText('runtime.inputTwitchId'), 'error');
                return;
            }
            const ids = input.split(/[\s,、]+/).filter(Boolean);
            const svc = document.querySelector('input[name="tw-ms"]:checked')?.value || 'multi';
            const url = svc === 'multi' ? `https://multistre.am/${ids.join('/')}` : `https://www.twitchtheater.tv/${ids.join('/')}`;
            copyRaw(url);
        }

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

        function twitchListEmptyHtml(message = '') {
            const useDefault = !message;
            return `<p class="tw-list-empty"${useDefault ? ' data-i18n="extended.noListInfo"' : ''}>${raidSoEscape(message || twExt('noListInfo'))}</p>`;
        }

        function renderVipSlotInfo(currentVipCount, maxVip) {
            const infoEl = document.getElementById('tw-vip-slot-info');
            if (!infoEl) return;
            const remaining = Math.max(0, maxVip - currentVipCount);
            if (maxVip === 0) {
                infoEl.innerHTML = `<span>${raidSoEscape(uiText('runtime.currentVips'))}: <strong>${currentVipCount}${raidSoEscape(uiText('runtime.personSuffix'))}</strong> (${raidSoEscape(uiText('runtime.standardAccount'))})</span>`;
            } else {
                infoEl.innerHTML = `<span>${raidSoEscape(uiText('runtime.currentVips'))}: <strong>${currentVipCount} / ${maxVip}${raidSoEscape(uiText('runtime.personSuffix'))}</strong></span><span>${raidSoEscape(uiText('runtime.remaining'))}: <strong>${remaining}${raidSoEscape(uiText('runtime.slotSuffix'))}</strong></span>`;
            }
        }

        function resetVipDisplay() {
            const list = document.getElementById('tw-vip-list');
            if (list) list.innerHTML = twitchListEmptyHtml();
            const info = document.getElementById('tw-vip-slot-info');
            if (info) {
                const text = langMap[currentLang]?.extended || langMap.ja.extended;
                info.innerHTML = `<span>${raidSoEscape(text.vipSlotPrefix)}<strong>${raidSoEscape(text.vipSlotDesc)}</strong></span>`;
            }
        }

        function renderVipList(vips) {
            const list = document.getElementById('tw-vip-list');
            if (!list) return;
            list.innerHTML = vips.length === 0
                ? twitchListEmptyHtml()
                : vips.map(v => {
                    const name = raidSoEscape(v.user_name || v.user_login || '');
                    const login = raidSoEscape(v.user_login || '');
                    const tip = raidSoEscape(twExt('copyVipIdTip'));
                    return `<div class="tw-list-item"><button type="button" class="tw-list-name has-tooltip" data-login="${login}" data-tooltip="${tip}" aria-label="${tip}: ${login}" onclick="copyVipLoginFromButton(this)">👑 ${name}</button><span class="tw-list-meta">${login}</span></div>`;
                }).join('');
        }

        function copyVipLoginFromButton(button) {
            const login = String(button?.dataset?.login || '').trim();
            if (!login) return;
            copyTextToClipboard(login, twFormat(twExt('vipIdCopied'), { id: login }));
        }

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
            const r = await apiRequest('/channels/commercials', 'POST', {
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
                    btn.style.color = '#bf94ff';
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
                    btn.style.color = '#bf94ff';
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

        function handleSupporterStreamStart(streamId = '') {
            const marker = String(streamId || '').trim();
            if (marker && marker === _lastObservedStreamId) return false;
            if (marker) {
                _lastObservedStreamId = marker;
                safeSetLocal(SUPPORTER_LAST_STREAM_ID_KEY, marker);
            }
            if (settings.supporterResetOnStreamStart === false) return false;
            archivePastLog();
            return true;
        }

        function initNumberWheelControls() {
            if (_numberWheelInitialized) return;
            _numberWheelInitialized = true;
            document.addEventListener('wheel', event => {
                const input = event.target instanceof HTMLInputElement && event.target.type === 'number' ? event.target : null;
                if (!input || input.disabled || input.readOnly || event.ctrlKey) return;
                event.preventDefault();
                try {
                    input.focus({ preventScroll: true });
                } catch (error) {
                    input.focus();
                }
                if (event.deltaY < 0) input.stepUp();
                else if (event.deltaY > 0) input.stepDown();
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }, { passive: false });
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
                    } else {
                        btn.style.background = '#323239';
                        btn.style.fontWeight = 'normal';
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
            await apiRequest('/eventsub/subscriptions', 'POST', {
                type, version, condition,
                transport: { method: 'websocket', session_id: _esSessionId }
            });
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

        // =============================================
        // === X (Twitter) Post Generator Functions ===
        // =============================================
        function appendToStatsTextarea(id, line) {
            const ta = document.getElementById(id);
            if (!ta) return;
            const currentVal = ta.value.trim();
            if (currentVal) {
                ta.value = currentVal + "\n" + line;
            } else {
                ta.value = line;
            }
            updatePostPreview();
        }


        let _updatePostPreviewTimeout;
        function updatePostPreview() {
            clearTimeout(_updatePostPreviewTimeout);
            _updatePostPreviewTimeout = setTimeout(() => {
                _updatePostPreviewInner();
            }, 300);
        }

        function stripAutomaticSupporterHonorifics(value) {
            return String(value || '')
                .split('\n')
                .map(line => line.replace(/さん(?=(?:[\s　(]|$))/g, ''))
                .join('\n');
        }

        function formatSupporterDetailBlock(value) {
            const clean = stripAutomaticSupporterHonorifics(value);
            if (!settings.supporterHonorificEnabled) return clean;
            const suffix = uiText('runtime.supporter.honorificSuffix');
            if (!suffix) return clean;
            return clean.split('\n').map(line => {
                if (!line.trim()) return line;
                return line.replace(/^(\s*)(\S+?)(?=(?:[\s　(]|$))/, `$1$2${suffix}`);
            }).join('\n');
        }

        function readSupporterDetail(id) {
            const el = document.getElementById(id);
            const clean = stripAutomaticSupporterHonorifics(el?.value.trim() || '');
            if (el && el.value.trim() !== clean) el.value = clean;
            return clean;
        }

        function _updatePostPreviewInner() {
            const firstDet = readSupporterDetail('pg-i-first-det');
            const raidDet = readSupporterDetail('pg-i-raid-det');
            const followDet = readSupporterDetail('pg-i-follow-det');
            const cheerDet = readSupporterDetail('pg-i-cheer-det');
            const subDet = readSupporterDetail('pg-i-sub-det');
            const giftDet = readSupporterDetail('pg-i-gift-det');
            const chatDet = readSupporterDetail('pg-i-chat-det');
            
            const dateValue = new Date(streamStats.streamDate || Date.now());
            const locale = currentLang === 'ja' ? 'ja-JP' : currentLang === 'zh' ? 'zh-CN' : 'en-US';
            const streamDate = Number.isNaN(dateValue.getTime())
                ? new Date().toLocaleDateString(locale)
                : dateValue.toLocaleDateString(locale);
            const streamTitle = streamStats.streamTitle || uiText('runtime.supporter.streamTitleUnknown');
            let text = `◆ ${uiText('runtime.supporter.streamInfo')}\n`
                + `${uiText('runtime.supporter.streamDate')}: ${streamDate}\n`
                + `${uiText('runtime.supporter.streamTitle')}: ${streamTitle}\n\n`;

            if (firstDet && isSupporterCategoryEnabled('first')) {
                text += `☆ ${uiText('runtime.supporter.headingFirst')}\n${formatSupporterDetailBlock(firstDet)}\n\n`;
            }
            if (raidDet && isSupporterCategoryEnabled('raid')) {
                text += `☆ ${uiText('runtime.supporter.headingRaid')}\n${formatSupporterDetailBlock(raidDet)}\n\n`;
            }
            if (cheerDet && isSupporterCategoryEnabled('cheer')) {
                text += `☆ ${uiText('runtime.supporter.headingCheer')}\n${formatSupporterDetailBlock(cheerDet)}\n\n`;
            }
            if (subDet && isSupporterCategoryEnabled('sub')) {
                text += `☆ ${uiText('runtime.supporter.headingSub')}\n${formatSupporterDetailBlock(subDet)}\n\n`;
            }
            if (giftDet && isSupporterCategoryEnabled('gift')) {
                text += `☆ ${uiText('runtime.supporter.headingGift')}\n${formatSupporterDetailBlock(giftDet)}\n\n`;
            }
            if (followDet && isSupporterCategoryEnabled('follow')) {
                text += `☆ ${uiText('runtime.supporter.headingFollow')}\n${formatSupporterDetailBlock(followDet)}\n\n`;
            }
            if (chatDet && isSupporterCategoryEnabled('chat')) {
                text += `☆ ${uiText('runtime.supporter.headingChat')}\n${formatSupporterDetailBlock(chatDet)}\n\n`;
            }

            const outputEl = document.getElementById('pg-output');
            if (outputEl) outputEl.value = text.trim();

            const listCache = {
                first: firstDet,
                raid: raidDet,
                follow: followDet,
                cheer: cheerDet,
                sub: subDet,
                gift: giftDet,
                chat: chatDet,
                chatIds: Array.from(streamStats.chatters),
                streamDate: streamStats.streamDate,
                streamTitle: streamStats.streamTitle
            };
            safeSetLocal('stream_supporter_list_v16', JSON.stringify(listCache));
        }

        function copyPostText() {
            const text = document.getElementById('pg-output')?.value || "";
            if (!text) return;
            copyTextToClipboard(text, twExt('supporterListCopied'));
        }

        function supporterEntriesExist() {
            return ['pg-i-first-det', 'pg-i-raid-det', 'pg-i-follow-det', 'pg-i-cheer-det', 'pg-i-sub-det', 'pg-i-gift-det', 'pg-i-chat-det']
                .some(id => Boolean(document.getElementById(id)?.value.trim()));
        }

        function readSupporterArchives() {
            try {
                const stored = JSON.parse(localStorage.getItem(SUPPORTER_ARCHIVE_STORAGE_KEY) || '[]');
                if (Array.isArray(stored) && stored.length) return stored.slice(0, SUPPORTER_ARCHIVE_LIMIT);
            } catch (error) {
                console.warn('Supporter archives could not be loaded:', error);
            }
            const legacyText = localStorage.getItem(SUPPORTER_ARCHIVE_LEGACY_KEY) || '';
            return legacyText ? [{
                id: 'legacy',
                archivedAt: new Date().toISOString(),
                streamDate: '',
                streamTitle: '',
                text: legacyText
            }] : [];
        }

        function archiveCurrentSupporterList() {
            if (!supporterEntriesExist()) return null;
            _updatePostPreviewInner();
            const text = document.getElementById('pg-output')?.value.trim() || '';
            if (!text) return null;
            const entry = {
                id: `supporter-${Date.now().toString(36)}`,
                archivedAt: new Date().toISOString(),
                streamDate: streamStats.streamDate || '',
                streamTitle: streamStats.streamTitle || '',
                text
            };
            const archives = [entry, ...readSupporterArchives()].slice(0, SUPPORTER_ARCHIVE_LIMIT);
            safeSetLocal(SUPPORTER_ARCHIVE_STORAGE_KEY, JSON.stringify(archives));
            safeSetLocal(SUPPORTER_ARCHIVE_LEGACY_KEY, text);
            raidSoLog(uiText('runtime.operationLog.supporterArchived', {
                title: entry.streamTitle || uiText('runtime.supporter.streamTitleUnknown')
            }));
            return entry;
        }

        function archivePastLog() {
            const archived = archiveCurrentSupporterList();
            if (archived) {
                resetStreamStats(false);
                showToast(uiText('runtime.statsArchiveStarted'), "success");
            } else {
                resetStreamStats(false);
                esLog('SYS', uiText('runtime.statsArchiveEmpty'));
                raidSoLog(uiText('runtime.operationLog.supporterArchiveEmpty'));
            }
            raidSoLog(uiText('runtime.operationLog.supporterAutoReset'));
        }

        function supporterArchiveOptionLabel(entry) {
            const locale = currentLang === 'ja' ? 'ja-JP' : currentLang === 'zh' ? 'zh-CN' : 'en-US';
            const date = new Date(entry.archivedAt || entry.streamDate || Date.now());
            const dateText = Number.isNaN(date.getTime()) ? '-' : date.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
            const title = entry.streamTitle || uiText('runtime.supporter.streamTitleUnknown');
            return `${dateText} / ${title}`;
        }

        function renderSelectedPastLog() {
            const archives = readSupporterArchives();
            const select = document.getElementById('supporter-archive-select');
            const output = document.getElementById('supporter-archive-output');
            if (!select || !output) return;
            output.value = archives[Number(select.value) || 0]?.text || '';
        }

        function copySelectedPastLog() {
            const text = document.getElementById('supporter-archive-output')?.value || '';
            if (text) copyTextToClipboard(text, twExt('pastLogCopied'));
        }

        function openPastLogs() {
            const archives = readSupporterArchives();
            if (!archives.length) return showToast(twExt('noPastLog'), 'error');
            const options = archives.map((entry, index) => `<option value="${index}">${raidSoEscape(supporterArchiveOptionLabel(entry))}</option>`).join('');
            showCustomDialog({
                type: 'alert',
                title: twExt('pastLogsTitle'),
                messageHtml: `<div class="supporter-archive-viewer"><label class="field-label" for="supporter-archive-select">${raidSoEscape(twExt('pastLogsSelect'))}</label><select id="supporter-archive-select" onchange="renderSelectedPastLog()">${options}</select><textarea id="supporter-archive-output" readonly></textarea><button type="button" class="btn-primary" onclick="copySelectedPastLog()">${raidSoEscape(twExt('copySelectedPastLog'))}</button></div>`
            });
            renderSelectedPastLog();
            raidSoLog(uiText('runtime.operationLog.pastLogsOpened'));
        }

        function resetStreamStats(show = true) {
            if (show) archiveCurrentSupporterList();
            streamStats = createEmptyStreamStats();
            
            if (document.getElementById('pg-i-first-det')) document.getElementById('pg-i-first-det').value = "";
            if (document.getElementById('pg-i-raid-det')) document.getElementById('pg-i-raid-det').value = "";
            if (document.getElementById('pg-i-follow-det')) document.getElementById('pg-i-follow-det').value = "";
            if (document.getElementById('pg-i-cheer-det')) document.getElementById('pg-i-cheer-det').value = "";
            if (document.getElementById('pg-i-sub-det')) document.getElementById('pg-i-sub-det').value = "";
            if (document.getElementById('pg-i-gift-det')) document.getElementById('pg-i-gift-det').value = "";
            if (document.getElementById('pg-i-chat-det')) document.getElementById('pg-i-chat-det').value = "";
            
            updatePostPreview();
            if (show) {
                showToast(twExt('statsReset'), "info");
                raidSoLog(uiText('runtime.operationLog.supporterReset'));
            }
        }

        // --- Notifications ---
        function triggerNotification(type) {
            document.body.classList.remove('notify-flash');
            void document.body.offsetWidth; // trigger reflow
            document.body.classList.add('notify-flash');
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




// --- Co-creator sound functions ---
function clampRaidSoVolume(value, fallback = 80) {
            const num = Number(value);
            if (!Number.isFinite(num)) return fallback;
            return Math.max(0, Math.min(100, num));
        }

function raidSoSoundControlsHtml(kind, title, file, volume) {
            const id = kind === 'first' ? 'first-comment' : (kind === 'channelPoint' ? 'channel-point' : kind);
            const r = raidSoText();
            const soundOptions = getRaidSoSoundFiles(file);
            const volumeValue = clampRaidSoVolume(volume);
            return `<div>
                <div style="font-weight:bold; color:#bf94ff; margin-bottom:8px;">${raidSoEscape(title)}</div>
                <span class="field-label">${raidSoEscape(r.soundSource)}</span>
                <select id="raidso-${id}-sound-file" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); color:var(--text-main); padding:10px; border-radius:8px;" onchange="saveRaidSoSettings(false)">
                    ${soundOptions.map(src => `<option value="${raidSoEscape(src)}"${raidSoSelected(file, src)}>${raidSoEscape(raidSoSoundFileLabel(src))}</option>`).join('')}
                </select>
                <span class="field-label">${raidSoEscape(r.volume)}</span>
                <input type="range" id="raidso-${id}-volume" min="0" max="100" step="1" value="${volumeValue}" oninput="collectRaidSoSettings()" onchange="saveRaidSoSettings(false)">
                <button class="btn-outline" style="width:100%; margin-top:8px;" onclick="testRaidSoSound('${kind}')">${raidSoEscape(r.playSound.replace('{title}', title))}</button>
            </div>`;
        }

function raidSoSoundFileLabel(src) {
            return String(src || '').split(/[\\/]/).pop() || src;
        }

function uniqueRaidSoSoundSources(values) {
            return [...new Set(values.map(normalizeRaidSoSoundSource).filter(isRaidSoAudioSource))]
                .sort((a, b) => raidSoSoundFileLabel(a).localeCompare(raidSoSoundFileLabel(b), undefined, { numeric: true }));
        }

function getRaidSoSoundFiles(selected = '') {
            const stored = getStoredRaidSoSoundFiles();
            if (raidSoSettings.soundFilesRefreshed && stored.length) return stored;
            return stored;
        }

function getStoredRaidSoSoundFiles() {
            return uniqueRaidSoSoundSources(Array.isArray(raidSoSettings.soundFiles) ? raidSoSettings.soundFiles : []);
        }

function replaceRaidSoSoundFilesFromFolder(input) {
            try {
                collectRaidSoSettings();
                const sources = Array.from(input?.files || [])
                    .filter(file => isRaidSoAudioSource(file.name))
                    .map(file => {
                        const parts = String(file.webkitRelativePath || file.name).replace(/\\/g, '/').split('/').filter(Boolean);
                        const relative = parts.length > 1 ? parts.slice(1).join('/') : parts[0];
                        return `sounds/${relative}`;
                    });
                const available = applyRaidSoAvailableSoundFiles(sources);
                localStorage.setItem(RAIDSO_STORAGE_KEY, JSON.stringify(raidSoSettings));
                renderRaidShoutOutPanel();
                if (!available.length) {
                    showToast(raidSoText().soundFilesEmpty, 'error');
                    return;
                }
                showToast(raidSoText().soundFilesUpdated.replace('{count}', available.length));
            } catch (error) {
                raidSoLog(raidSoText().soundFilesReadFailed, 'warn');
                showToast(raidSoText().soundFilesReadFailed, 'error');
            } finally {
                if (input) input.value = '';
            }
        }

function applyRaidSoAvailableSoundFiles(sources) {
            const available = uniqueRaidSoSoundSources(sources);
            const fallback = available[0] || '';
            const keepAvailable = value => available.includes(normalizeRaidSoSoundSource(value)) ? normalizeRaidSoSoundSource(value) : fallback;
            raidSoSettings.soundFiles = available;
            raidSoSettings.soundFilesRefreshed = true;
            raidSoSettings.raidSoundFile = keepAvailable(raidSoSettings.raidSoundFile);
            raidSoSettings.commentSoundFile = keepAvailable(raidSoSettings.commentSoundFile);
            raidSoSettings.channelPointSoundFile = keepAvailable(raidSoSettings.channelPointSoundFile);
            raidSoSettings.firstCommentSoundFile = keepAvailable(raidSoSettings.firstCommentSoundFile);
            return available;
        }

function readRaidSoSoundFolderSourcesFromIframe(folderUrl) {
            return new Promise(resolve => {
                const iframe = document.createElement('iframe');
                let done = false;
                const finish = result => {
                    if (done) return;
                    done = true;
                    clearTimeout(timer);
                    iframe.remove();
                    resolve(result || { sources: [], readable: false });
                };
                const readFrame = () => {
                    try {
                        const html = iframe.contentDocument?.documentElement?.outerHTML || iframe.contentWindow?.document?.documentElement?.outerHTML || '';
                        const result = raidSoSoundReadResultFromHtml(html, folderUrl);
                        if (result.sources.length) finish(result);
                    } catch (e) {
                        // Keep waiting until the timeout; local folder frames can become readable a little late.
                    }
                };
                const timer = setTimeout(() => {
                    readFrame();
                    finish({ sources: [], readable: false });
                }, 5000);
                iframe.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;border:0;opacity:0;';
                iframe.onload = () => {
                    readFrame();
                    setTimeout(readFrame, 150);
                };
                document.body.appendChild(iframe);
                iframe.src = folderUrl.href;
            });
        }

function raidSoSoundReadResultFromHtml(html, folderUrl) {
            const sources = parseRaidSoSoundFolderHtml(html, folderUrl);
            return { sources, readable: sources.length > 0 || looksLikeRaidSoSoundFolderListing(html) };
        }

function requestRaidSoSoundFolderText(url) {
            return new Promise(resolve => {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url.href, true);
                    xhr.timeout = 2500;
                    xhr.onload = () => resolve(xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300) ? xhr.responseText : null);
                    xhr.onerror = () => resolve(null);
                    xhr.ontimeout = () => resolve(null);
                    xhr.send();
                } catch (e) {
                    resolve(null);
                }
            });
        }

async function readRaidSoSoundManifest() {
            try {
                const manifestUrl = new URL(`sound-list.json?t=${Date.now()}`, getRaidSoSoundFolderUrl().href);
                const response = await fetch(manifestUrl.href, { cache: 'no-store' });
                if (!response.ok) return { sources: [], readable: false };
                const data = await response.json();
                const values = Array.isArray(data) ? data : (Array.isArray(data.files) ? data.files : []);
                const sources = uniqueRaidSoSoundSources(values);
                return { sources, readable: sources.length > 0 };
            } catch (e) {
                return { sources: [], readable: false };
            }
        }

function getRaidSoSoundFolderUrl() {
            return new URL('sounds/', window.location.href);
        }

function parseRaidSoSoundFolderHtml(html, folderUrl) {
            const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
            const hrefs = Array.from(doc.querySelectorAll('a[href]')).map(a => a.getAttribute('href') || '');
            const hrefMatches = Array.from(String(html || '').matchAll(/href=["']([^"']+\.(?:wav|mp3|ogg|m4a|aac|flac|webm)(?:[?#][^"']*)?)["']/gi)).map(match => match[1]);
            const textMatches = Array.from((doc.body?.textContent || html || '').matchAll(/([^\s<>:"|?*\/\\]+\.(?:wav|mp3|ogg|m4a|aac|flac|webm))/gi)).map(match => match[1]);
            return uniqueRaidSoSoundSources([...hrefs, ...hrefMatches, ...textMatches].map(source => {
                try {
                    const url = new URL(source, folderUrl.href);
                    return `sounds/${decodeURIComponent(url.pathname.split('/').pop() || '')}`;
                } catch (e) {
                    return source;
                }
            }));
        }

function looksLikeRaidSoSoundFolderListing(html) {
            return /href=|Index of|Directory Listing|Parent Directory|親ディレクトリ|名前|サイズ|更新日|Last modified/i.test(String(html || ''));
        }

function normalizeRaidSoSoundSource(src) {
            const clean = String(src || '').trim().replace(/\\/g, '/').replace(/^\.?\/*/, '');
            if (!clean) return '';
            const withoutQuery = clean.split(/[?#]/)[0];
            const inSounds = withoutQuery.includes('/sounds/') ? withoutQuery.replace(/^.*\/sounds\//, 'sounds/') : withoutQuery;
            return inSounds.startsWith('sounds/') ? inSounds : `sounds/${inSounds.replace(/^sounds\//, '')}`;
        }

function isRaidSoAudioSource(src) {
            return /\.(wav|mp3|ogg|m4a|aac|flac|webm)$/i.test(String(src || '').split(/[?#]/)[0]);
        }

function getDynamicCategoryTarget(tabId) {
    const tab = document.getElementById(tabId);
    if (!tab) return null;
    if (tabId === 'cmd-tab') return tab.querySelector('.command-stack') || tab;
    if (tabId === 'raid-tab') return tab.querySelector('#raidso-container') || tab;
    if (tabId === 'misc-tab') return tab.querySelector('div[style*="flex-direction: column; gap: 10px;"]') || tab;
    return tab;
}

function getTopLevelCategoryBoxes(tabId) {
    const target = getDynamicCategoryTarget(tabId);
    if (!target) return [];
    return Array.from(target.children).filter(child => child.classList?.contains('category-box'));
}

function getDisplayCategoryBoxes(tabId) {
    const target = getDynamicCategoryTarget(tabId);
    if (!target) return [];
    if (tabId !== 'twitch-tab') return getTopLevelCategoryBoxes(tabId);
    return Array.from(target.querySelectorAll(':scope > .category-box, :scope > .tw-pair-grid > .category-box'));
}

function updateCategoryGroupVisibility(tabId) {
    if (tabId !== 'twitch-tab') return;
    const target = getDynamicCategoryTarget(tabId);
    target?.querySelectorAll(':scope > .tw-pair-grid').forEach(group => {
        const boxes = Array.from(group.children).filter(child => child.classList?.contains('category-box'));
        group.style.display = boxes.length && boxes.every(box => box.style.display === 'none') ? 'none' : '';
    });
}

function initDynamicCategories(skipWrapperRemoval = false) {
    dynamicCategorySortables.forEach(instance => instance.destroy());
    dynamicCategorySortables = [];

    const sortableTabs = ['twitch-tab', 'cmd-tab', 'raid-tab', 'misc-tab'];
    sortableTabs.forEach(tabId => {
        const tab = document.getElementById(tabId);
        if (!tab) return;
        
        // ロック切り替え時はラッパー除去をスキップ（DOM構造を保全し並び順を維持）
        if (!skipWrapperRemoval) {
            const wrappers = Array.from(tab.querySelectorAll('div[style*="display:flex"][style*="flex-wrap:wrap"], div[style*="display: flex"][style*="flex-wrap: wrap"]'));
            wrappers.forEach(w => {
                while (w.firstChild) w.parentNode.insertBefore(w.firstChild, w);
                w.remove();
            });
        }

        tab.style.display = '';

        const target = getDynamicCategoryTarget(tabId);
        if (!target) return;
        getTopLevelCategoryBoxes(tabId).forEach((box, idx) => {
            if (!box.id) box.id = 'cat-box-' + tabId + '-' + idx;
        });

        target.classList.add('sortable-tab');
        
        if (typeof Sortable !== 'undefined') {
            dynamicCategorySortables.push(Sortable.create(target, {
                animation: 150, handle: '.category-name', disabled: isSortLocked,
                onEnd: () => saveCategoryOrder(tabId)
            }));
        }
        restoreCategoryOrder(tabId);
        restoreCategoryVisibility(tabId);
    });
}
function saveCategoryOrder(tabId) {
    const boxes = getTopLevelCategoryBoxes(tabId).map(box => box.id);
    localStorage.setItem('stream_category_order_' + tabId, JSON.stringify(boxes));
}
function restoreCategoryOrder(tabId) {
    const target = getDynamicCategoryTarget(tabId);
    if (!target) return;
    try {
        const order = JSON.parse(localStorage.getItem('stream_category_order_' + tabId));
        if (order && Array.isArray(order)) {
            order.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.parentNode === target) target.appendChild(el);
            });
        }
    } catch(e) {}
}

function displaySettingsText(key, fallback = '') {
    return uiText(`extended.${key}`, {}, fallback);
}

function openActiveCategorySettings() {
    const activeTabId = document.querySelector('.tab-content.active')?.id || 'raid-tab';
    openCategorySettings(activeTabId);
}

function switchDisplaySettingsTab(tabId) {
    document.querySelectorAll('.display-settings-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabId);
    });
    document.querySelectorAll('.display-settings-panel').forEach(panel => {
        panel.hidden = panel.dataset.tab !== tabId;
    });
}

function openCategorySettings(initialTabId) {
    const tabNames = langMap[currentLang]?.tabs || langMap.ja.tabs;
    const targetTabs = [
        { id: 'raid-tab', name: tabNames[1] },
        { id: 'twitch-tab', name: tabNames[2] },
        { id: 'cmd-tab', name: tabNames[3] }
    ];
    if (!targetTabs.some(tab => tab.id === initialTabId)) initialTabId = targetTabs[0].id;

    const tabsHtml = targetTabs.map(tab => `<button type="button" class="display-settings-tab${tab.id === initialTabId ? ' active' : ''}" data-tab="${tab.id}" onclick="switchDisplaySettingsTab('${tab.id}')">${raidSoEscape(tab.name)}</button>`).join('');
    const panelsHtml = targetTabs.map(tab => {
        const target = document.getElementById(tab.id);
        if (!target) {
            return `<div class="display-settings-panel" data-tab="${tab.id}"${tab.id === initialTabId ? '' : ' hidden'}><span class="tw-list-empty">${raidSoEscape(displaySettingsText('tabNotFound', 'タブが存在しません'))}</span></div>`;
        }
        const boxes = getDisplayCategoryBoxes(tab.id);
        const items = boxes.map(box => {
            const title = String(box.querySelector('.category-name')?.textContent || box.id).trim().replace(/^[▶▼\s]+/, '');
            const checked = box.style.display !== 'none' ? ' checked' : '';
            return `<label class="display-settings-item"><span class="display-settings-item-name">${raidSoEscape(title)}</span><span class="tw-toggle"><input type="checkbox"${checked} onchange="toggleCategoryBox('${raidSoEscape(box.id)}', this.checked, '${tab.id}')"><span class="tw-slider"></span></span></label>`;
        }).join('');
        const body = items || `<span class="tw-list-empty">${raidSoEscape(displaySettingsText('noSettings', '設定できる項目がありません'))}</span>`;
        // actionsはパネル内には置かず、フッターに集約
        return `<div class="display-settings-panel" data-tab="${tab.id}"${tab.id === initialTabId ? '' : ' hidden'}>${body}</div>`;
    }).join('');

    // フッター固定: すべてON(50%) / すべてOFF(50%)
    const footerHtml = `<div class="display-settings-footer">` +
        `<button type="button" class="btn-primary" onclick="(function(){ var t = document.querySelector('.display-settings-tab.active'); toggleAllCategories(t ? t.dataset.tab : '${initialTabId}', true); })()">${raidSoEscape(displaySettingsText('btnAllOn', 'すべてON'))}</button>` +
        `<button type="button" class="btn-secondary" onclick="(function(){ var t = document.querySelector('.display-settings-tab.active'); toggleAllCategories(t ? t.dataset.tab : '${initialTabId}', false); })()">${raidSoEscape(displaySettingsText('btnAllOff', 'すべてOFF'))}</button>` +
        `</div>`;

    const dialogHtml = `<div class="display-settings-layout"><div class="display-settings-tabs">${tabsHtml}</div><div class="display-settings-content">${panelsHtml}</div>${footerHtml}</div>`;
    showCustomDialog({ title: displaySettingsText('displaySettings', '表示設定'), messageHtml: dialogHtml, type: 'alert' });
}

function toggleCategoryBox(boxId, isVisible, tabId) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.style.display = isVisible ? '' : 'none';
    updateCategoryGroupVisibility(tabId);
    saveCategoryVisibility(tabId);
}

function toggleAllCategories(tabId, isVisible) {
    getDisplayCategoryBoxes(tabId).forEach(box => {
        box.style.display = isVisible ? '' : 'none';
    });
    document.querySelectorAll(`.display-settings-panel[data-tab="${tabId}"] input[type="checkbox"]`).forEach(input => {
        input.checked = isVisible;
    });
    updateCategoryGroupVisibility(tabId);
    saveCategoryVisibility(tabId);
}

function saveCategoryVisibility(tabId) {
    const hiddenIds = getDisplayCategoryBoxes(tabId)
        .filter(box => box.style.display === 'none')
        .map(box => box.id);
    safeSetLocal(`stream_category_hidden_${tabId}`, JSON.stringify(hiddenIds));
}

function restoreCategoryVisibility(tabId) {
    try {
        const hiddenIds = JSON.parse(localStorage.getItem(`stream_category_hidden_${tabId}`) || '[]');
        if (!Array.isArray(hiddenIds)) return;
        getDisplayCategoryBoxes(tabId).forEach(box => {
            box.style.display = hiddenIds.includes(box.id) ? 'none' : '';
        });
        updateCategoryGroupVisibility(tabId);
    } catch (error) {
        console.warn(`Category visibility restore failed: ${tabId}`, error);
    }
}

function checkBackupReminder() {
    const lastBackup = localStorage.getItem('stream_last_backup_date');
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (!lastBackup) {
        localStorage.setItem('stream_last_backup_date', now.toString());
        return;
    }
    if (now - parseInt(lastBackup) > thirtyDays) {
        setTimeout(() => {
            showCustomDialog({
                type: 'alert',
                title: uiText('runtime.backupReminderTitle'),
                message: uiText('runtime.backupReminderMessage')
            });
            localStorage.setItem('stream_last_backup_date', now.toString());
        }, 2000);
    }
}

const origCopyBackup = window.copyBackupToClipboard;
if (origCopyBackup && !window.copyBackupPatched) {
    window.copyBackupPatched = true;
    window.copyBackupToClipboard = async function() {
        await origCopyBackup();
        localStorage.setItem('stream_last_backup_date', Date.now().toString());
    };
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDynamicCategories, 500);
    setTimeout(checkBackupReminder, 1000);
});




(function () {
    'use strict';

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
            select.style.background = '#000';
            select.style.border = '1px solid #444';
            select.style.color = '#fff';
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
        document.querySelectorAll('#friends-container .category-box').forEach(catEl => {
            const ci = Number(catEl.getAttribute('data-idx'));
            catEl.querySelectorAll('.record-card').forEach(card => {
                const fi = Number(card.getAttribute('data-idx'));
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
})();