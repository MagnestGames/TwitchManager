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
            if (settingsTitle && settingsUi.title) {
                settingsTitle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg><span>${settingsUi.title}</span>`;
            }
            const authTitle = document.getElementById('ui-settings-auth-title');
            if (authTitle && settingsUi.authTitle) authTitle.innerText = settingsUi.authTitle;
            const authHelp = document.getElementById('ui-settings-auth-help');
            if (authHelp && settingsUi.authHelp) authHelp.innerText = settingsUi.authHelp;
            const displayTitle = document.getElementById('ui-settings-display-title');
            if (displayTitle && settingsUi.displayTitle) displayTitle.innerText = settingsUi.displayTitle;
            const settingsLabelMap = {
                'ui-settings-redirect-uri': settingsUi.redirectUri,
                'ui-settings-client-id': settingsUi.clientId,
                'ui-settings-access-token': settingsUi.accessToken,
                'ui-settings-stream-title': settingsUi.streamSettingsTitle,
                'ui-settings-auto-ad-label': settingsUi.autoAdLabel,
                'ui-settings-auto-pin-label': settingsUi.autoPinLabel
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
            try { if (typeof updateCreatorsDOM === 'function') updateCreatorsDOM(); } catch(e) {}
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
            if (b) {
                b.innerHTML = isSortLocked ? 
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>` : 
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
                b.className = "btn-head-purple" + (isSortLocked ? "" : " unlocked");
            }

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
                btn.innerHTML = isLight ? 
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : 
                    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
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
                if (isOn) {
                    b.style.background = "#ff4a4a";
                    b.style.color = "var(--text-white)";
                } else {
                    b.style.background = "";
                    b.style.color = "";
                }
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

        function changeFriendsSortOrder(val) {
            friendsSortOrder = val;
            const sel = document.getElementById('friends-sort-select');
            if (sel && sel.value !== val) sel.value = val;
            renderFriends();
        }
        window.changeFriendsSortOrder = changeFriendsSortOrder;

        // カード生成ヘルパー
        // 遅延保存用のタイマー
        let saveFriendsTimeout = null;

        // 同一 Twitch ID を持つ他グループのカードへリアルタイム同期する共通関数
        function updateFriendField(ci, fi, field, value) {
            if (!friendsConfig[ci] || !friendsConfig[ci].friends[fi]) return;
            
            const targetFriend = friendsConfig[ci].friends[fi];
            const targetTwitch = (normalizeFriendTwitch(targetFriend.twitch || targetFriend.name || '') || '').toLowerCase();
            
            // フィールド値を更新
            targetFriend[field] = value;

            // 同一 Twitch ID を持つ他カテゴリの配信者カードを走査し同期
            if (targetTwitch) {
                (friendsConfig || []).forEach((cat, cIdx) => {
                    (cat.friends || []).forEach((f, fIdx) => {
                        if (cIdx === ci && fIdx === fi) return; // 自分自身はスキップ
                        const key = (normalizeFriendTwitch(f.twitch || f.name || '') || '').toLowerCase();
                        if (key === targetTwitch) {
                            f[field] = value;
                            
                            // 画面上の開いている入力欄があれば同期
                            let inputId = '';
                            if (field === 'twitch') inputId = `f-twitch-${cIdx}-${fIdx}`;
                            else if (field === 'x') inputId = `f-x-${cIdx}-${fIdx}`;
                            else if (field === 'youtube') inputId = `f-yt-${cIdx}-${fIdx}`;
                            else if (field === 'birthday') inputId = `f-bday-${cIdx}-${fIdx}`;
                            else if (field === 'anniversary') inputId = `f-anniv-${cIdx}-${fIdx}`;
                            
                            const el = document.getElementById(inputId);
                            if (el && el.value !== value) {
                                el.value = value;
                            }
                        }
                    });
                });
            }

            // バッチ保存をトリガー
            saveFriendsLocalDebounced();
        }
        window.updateFriendField = updateFriendField;

        function saveFriendsLocalDebounced() {
            if (saveFriendsTimeout) clearTimeout(saveFriendsTimeout);
            saveFriendsTimeout = setTimeout(() => {
                saveFriendsLocal(false);
            }, 300);
        }

        function _buildFriendCard(f, ci, fi, L, I, groupTags, sortMeta) {
            const card = document.createElement('div');
            card.id = `friend-card-${ci}-${fi}`;
            card.className = "record-card" + (f.isOpen ? " open" : "");
            card.setAttribute('data-idx', fi);
            
            // あだな・呼び名 (ツイッチ表示名) の表示ロジック
            const nickname = f.name || '';
            const twitchName = f.displayName || '';
            let displayName = nickname || f.twitch || I.emptyName;
            
            if (twitchName && twitchName.toLowerCase() !== nickname.toLowerCase()) {
                displayName = `${displayName} (${twitchName})`;
            }

            const isSelf = friendsConfig?.[ci]?.kind === 'authenticated-user';
            const shoutoutCount = isSelf ? 0 : Number(f.shoutoutCount || 0);
            const lastDate = isSelf ? '' : (f.lastShoutoutAt ? new Date(f.lastShoutoutAt).toLocaleString() : '');
            const meta = shoutoutCount ? (I.shoutoutMeta || '').replace('{count}', shoutoutCount).replace('{date}', lastDate || '-') : '';

            // グループタグ HTML
            const groupTagsHtml = groupTags && groupTags.length
                ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:2px;">
                    ${groupTags.map(g => `<span style="font-size:9px;background:rgba(145,70,255,0.15);color:var(--twitch-purple);border:1px solid rgba(145,70,255,0.3);border-radius:4px;padding:1px 5px;">${raidSoEscape(g)}</span>`).join('')}
                   </div>`
                : '';

            // ソートメタ表示
            const sortMetaHtml = sortMeta
                ? `<span style="font-size:10px;color:var(--text-muted);margin-left:6px;">${raidSoEscape(sortMeta)}</span>`
                : '';

            card.innerHTML = `
            <div class="record-header" onclick="toggleFriendRecordOpen(${ci}, ${fi})">
                <div style="display:flex; flex-direction:column; min-width:0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>● ${raidSoEscape(displayName)}</span>
                        ${sortMetaHtml}
                        <button class="icon-btn id-action-btn id-edit-action" title="${raidSoEscape(L.alerts.renameId)}" onclick="event.stopPropagation(); renameFriendRecord(${ci}, ${fi})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                    </div>
                    ${groupTagsHtml}
                </div>
                <div style="display:flex; gap:5px; flex-shrink:0;">
                    <button class="icon-btn id-action-btn id-refresh-action" title="情報を更新" onclick="event.stopPropagation(); refreshFriendUserData(${ci}, ${fi}, this)" style="color:var(--twitch-purple); border-color:rgba(145, 70, 255, 0.4); background:rgba(145, 70, 255, 0.08);">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    </button>
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
                ${isSelf ? '' : `
                <span class="field-label">${raidSoEscape(L.labels.twitchId || langMap.ja.labels.twitchId)}</span>
                <input type="text" id="f-twitch-${ci}-${fi}" value="${raidSoEscape(f.twitch || '')}" oninput="updateFriendField(${ci}, ${fi}, 'twitch', this.value)" onchange="autoFillFriendXFromTwitch(${ci}, ${fi})">
                `}
                
                <span class="field-label">${raidSoEscape(L.labels.xUrl || langMap.ja.labels.xUrl)}</span>
                <input type="text" id="f-x-${ci}-${fi}" value="${raidSoEscape(f.x || '')}" oninput="updateFriendField(${ci}, ${fi}, 'x', this.value)">

                <span class="field-label">${raidSoEscape(L.labels.youtubeUrl || 'YouTube リンク')}</span>
                <input type="text" id="f-yt-${ci}-${fi}" value="${raidSoEscape(f.youtube || '')}" oninput="updateFriendField(${ci}, ${fi}, 'youtube', this.value)">

                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <span class="field-label" style="margin-bottom: 4px; display: block;">${raidSoEscape(L.labels.birthday || '誕生日')}</span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <input type="text" id="f-bday-${ci}-${fi}" value="${raidSoEscape(f.birthday || '')}" placeholder="MM/DD (例: 04/25)" oninput="updateFriendField(${ci}, ${fi}, 'birthday', this.value); checkBirthdaysAndAnniversaries()" style="margin-bottom: 0; flex: 1; background: var(--bg-base); color: var(--text-main); border: 1px solid var(--border-color);">
                            <button type="button" class="btn-secondary" onclick="openMiniDatePicker(${ci}, ${fi}, 'birthday')" style="padding: 4px 6px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; background: var(--bg-item); color: var(--text-main);" title="カレンダーから選択">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </button>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <span class="field-label" style="margin-bottom: 4px; display: block;">${raidSoEscape(L.labels.anniversary || '記念日')}</span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <input type="text" id="f-anniv-${ci}-${fi}" value="${raidSoEscape(f.anniversary || '')}" placeholder="MM/DD (例: 10/01)" oninput="updateFriendField(${ci}, ${fi}, 'anniversary', this.value); checkBirthdaysAndAnniversaries()" style="margin-bottom: 0; flex: 1; background: var(--bg-base); color: var(--text-main); border: 1px solid var(--border-color);">
                            <button type="button" class="btn-secondary" onclick="openMiniDatePicker(${ci}, ${fi}, 'anniversary')" style="padding: 4px 6px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer; background: var(--bg-item); color: var(--text-main);" title="カレンダーから選択">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <span class="field-label">${raidSoEscape(L.labels.memo)}</span>
                <textarea onchange="updateFriendField(${ci}, ${fi}, 'memo', this.value)">${raidSoEscape(f.memo || '')}</textarea>
            </div>`;
            return card;
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

            // ----- グループ別表示（手動ソート・ドラッグ可能） -----
            if (friendsSortOrder === 'group') {
                (friendsConfig || []).forEach((cat, ci) => {
                    if (cat.kind === 'authenticated-user') {
                        const f = cat.friends[0] || { name: settings.userLogin || '', twitch: settings.userLogin || '' };
                        const card = _buildFriendCard(f, ci, 0, L, I, null);
                        card.classList.add('self-account-card');
                        card.style.borderLeft = '4px solid var(--twitch-purple)';
                        
                        // 自分のアカウントなので削除ボタンは非表示（削除不可）にする
                        const deleteBtn = card.querySelector('.btn-delete-item');
                        if (deleteBtn) deleteBtn.remove();
                        
                        // アカウント表示を分かりやすくするため、行頭の中黒「•」をユーザーアイコン「👤」に差し替える
                        const headerSpan = card.querySelector('.record-header span');
                        if (headerSpan) {
                            headerSpan.innerHTML = headerSpan.innerHTML.replace('•', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px; vertical-align:middle;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>');
                        }
                        
                        c.appendChild(card);
                        return;
                    }
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
                        d.querySelector('.category-records').appendChild(_buildFriendCard(f, ci, fi, L, I, null));
                    });
                    c.appendChild(d);
                });
                initSortable();

            // ----- フラット表示（ソート順表示、名前abc順・応援回数順など） -----
            } else {
                // 全配信者を1フラット配列に統合
                const allFriends = [];
                (friendsConfig || []).forEach((cat, ci) => {
                    (cat.friends || []).forEach((f, fi) => {
                        allFriends.push({ f, ci, fi, catName: cat.name });
                    });
                });

                // ソート処理用：誕生日/記念日の残り日数算出
                const today = new Date();
                const tM = today.getMonth() + 1, tD = today.getDate();
                function daysUntil(mmdd) {
                    if (!mmdd) return 9999;
                    const parts = String(mmdd).match(/(\d{1,2})\D+(\d{1,2})/);
                    if (!parts) return 9999;
                    const m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
                    let diff = (m - tM) * 31 + (d - tD);
                    if (diff < 0) diff += 366;
                    return diff;
                }

                allFriends.sort((a, b) => {
                    const fa = a.f, fb = b.f;
                    if (friendsSortOrder === 'name') {
                        const na = (fa.name || fa.twitch || '').toLowerCase();
                        const nb = (fb.name || fb.twitch || '').toLowerCase();
                        return na.localeCompare(nb, 'ja');
                    }
                    if (friendsSortOrder === 'recent-so') {
                        const da = fa.lastShoutoutAt ? new Date(fa.lastShoutoutAt).getTime() : 0;
                        const db = fb.lastShoutoutAt ? new Date(fb.lastShoutoutAt).getTime() : 0;
                        return db - da;
                    }
                    if (friendsSortOrder === 'so-count') {
                        return Number(fb.shoutoutCount || 0) - Number(fa.shoutoutCount || 0);
                    }
                    if (friendsSortOrder === 'birthday') {
                        return daysUntil(fa.birthday) - daysUntil(fb.birthday);
                    }
                    return 0;
                });

                // 重複タグ・グループ名の収集
                const twitchToGroups = {};
                (friendsConfig || []).forEach(cat => {
                    (cat.friends || []).forEach(f => {
                        const key = (normalizeFriendTwitch(f.twitch || f.name || '') || '').toLowerCase();
                        if (!key) return;
                        if (!twitchToGroups[key]) twitchToGroups[key] = [];
                        if (!twitchToGroups[key].includes(cat.name)) twitchToGroups[key].push(cat.name);
                    });
                });

                // ソート付随情報表示
                function getSortMeta(f) {
                    if (friendsSortOrder === 'recent-so' && f.lastShoutoutAt) {
                        return new Date(f.lastShoutoutAt).toLocaleDateString();
                    }
                    if (friendsSortOrder === 'so-count' && f.shoutoutCount) {
                        return `${f.shoutoutCount}回応援`;
                    }
                    if (friendsSortOrder === 'birthday' && f.birthday) {
                        const d = daysUntil(f.birthday);
                        return d === 0 ? '🎂 今日！' : `誕生日まで${d}日`;
                    }
                    return '';
                }

                allFriends.forEach(({ f, ci, fi, catName }) => {
                    const key = (normalizeFriendTwitch(f.twitch || f.name || '') || '').toLowerCase();
                    const groups = twitchToGroups[key] || [catName];
                    const sortMeta = getSortMeta(f);
                    c.appendChild(_buildFriendCard(f, ci, fi, L, I, groups, sortMeta));
                });
            }

            renderShoutoutSuggestions();
        }


        // --- Twitch ID 重複チェック共通関数 ---

        // --- 記念日・誕生日解析ユーティリティ ---
        function parseMdDate(str) {
            const val = String(str || '').trim();
            if (!val) return null;
            const m = val.match(/(\d{1,2})\D+(\d{1,2})/);
            if (m) {
                const month = parseInt(m[1], 10);
                const day = parseInt(m[2], 10);
                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    return { month, day };
                }
            }
            if (/^\d{4}$/.test(val)) {
                const month = parseInt(val.slice(0, 2), 10);
                const day = parseInt(val.slice(2), 10);
                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    return { month, day };
                }
            }
            return null;
        }
        window.parseMdDate = parseMdDate;

        function getDaysUntil(month, day) {
            const today = new Date();
            const currentYear = today.getFullYear();
            const todayZero = new Date(currentYear, today.getMonth(), today.getDate());
            let target = new Date(currentYear, month - 1, day);
            if (target < todayZero) {
                target = new Date(currentYear + 1, month - 1, day);
            }
            const diffTime = target - todayZero;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        window.getDaysUntil = getDaysUntil;

        function checkBirthdaysAndAnniversaries() {
            const today = new Date();
            const tM = today.getMonth() + 1;
            const tD = today.getDate();
            
            let hasTodayEvent = false;

            (friendsConfig || []).forEach(cat => {
                const friends = cat.friends || [];
                friends.forEach(f => {
                    const bday = parseMdDate(f.birthday);
                    if (bday && bday.month === tM && bday.day === tD) {
                        hasTodayEvent = true;
                    }
                    const anniv = parseMdDate(f.anniversary);
                    if (anniv && anniv.month === tM && anniv.day === tD) {
                        hasTodayEvent = true;
                    }
                });
            });

            const btn = document.getElementById('birthday-indicator-btn');
            if (btn) {
                if (hasTodayEvent) {
                    btn.classList.remove('inactive');
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                    btn.classList.add('inactive');
                }
            }
        }
        window.checkBirthdaysAndAnniversaries = checkBirthdaysAndAnniversaries;

        function toggleBirthdayPopover(event) {
            if (event) event.stopPropagation();
            const popover = document.getElementById('birthday-popover');
            if (!popover) return;
            const isVisible = popover.style.display === 'block';
            
            const langMenu = document.getElementById('language-menu');
            if (langMenu) langMenu.style.display = 'none';

            if (isVisible) {
                popover.style.display = 'none';
            } else {
                renderBirthdayPopoverContent();
                popover.style.display = 'block';
            }
        }
        window.toggleBirthdayPopover = toggleBirthdayPopover;

        function renderBirthdayPopoverContent() {
            const popover = document.getElementById('birthday-popover');
            if (!popover) return;

            const L = langMap[currentLang] || langMap.ja;
            const titleText = L.birthdayTitle || '今日の主役！';
            const birthdayLabel = L.birthdayLabel || '誕生日';
            const anniversaryLabel = L.anniversaryLabel || '記念日';
            const unitDay = currentLang === 'en' ? 'd' : '日';
            
            const today = new Date();
            const tM = today.getMonth() + 1;
            const tD = today.getDate();

            const todayMatches = [];
            const allEvents = [];

            (friendsConfig || []).forEach((cat, ci) => {
                const friends = cat.friends || [];
                friends.forEach((f, fi) => {
                    const nickname = String(f.name || '').trim();
                    const cleanTwitch = normalizeFriendTwitch(f.twitch);
                    const name = nickname || f.displayName || cleanTwitch || f.twitch || 'No Name';

                    const bday = parseMdDate(f.birthday);
                    if (bday) {
                        const daysLeft = getDaysUntil(bday.month, bday.day);
                        const eventObj = { name, type: 'birthday', month: bday.month, day: bday.day, daysLeft, ci, fi };
                        allEvents.push(eventObj);
                        if (bday.month === tM && bday.day === tD) {
                            todayMatches.push(eventObj);
                        }
                    }

                    const anniv = parseMdDate(f.anniversary);
                    if (anniv) {
                        const daysLeft = getDaysUntil(anniv.month, anniv.day);
                        const eventObj = { name, type: 'anniversary', month: anniv.month, day: anniv.day, daysLeft, ci, fi };
                        allEvents.push(eventObj);
                        if (anniv.month === tM && anniv.day === tD) {
                            todayMatches.push(eventObj);
                        }
                    }
                });
            });

            allEvents.sort((a, b) => a.daysLeft - b.daysLeft);

            let html = `<div class="birthday-popover-title" style="font-weight:bold;font-size:13px;border-bottom:1px solid var(--border-color);padding-bottom:6px;margin-bottom:8px;color:var(--twitch-purple);">${titleText}</div>`;

            if (todayMatches.length > 0) {
                todayMatches.forEach(m => {
                    const label = m.type === 'birthday' ? birthdayLabel : anniversaryLabel;
                    const typeClass = m.type === 'birthday' ? 'is-birthday' : 'is-anniversary';
                    html += `
                    <div class="birthday-popover-item today-event" onclick="navigateToFriendCard(${m.ci}, ${m.fi})" style="padding:4px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border-radius:4px;transition:0.15s;" onmouseover="this.style.background='var(--bg-item)'" onmouseout="this.style.background='transparent'">
                        <span style="font-weight:bold;color:var(--twitch-purple);font-size:12px;">🎂 ${raidSoEscape(m.name)}</span>
                        <span style="font-size:10px;padding:1px 5px;background:rgba(145,70,255,0.15);color:var(--twitch-purple);border-radius:4px;">${raidSoEscape(label)}</span>
                    </div>`;
                });
            } else {
                html += `<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;text-align:center;">今日がお祝いの配信者はいません</div>`;
            }

            html += `<div style="font-weight:bold;font-size:11px;margin:12px 0 6px 0;color:var(--text-muted);border-top:1px dashed var(--border-color);padding-top:8px;">近日のスケジュール</div>`;

            const upcoming = allEvents.filter(e => e.daysLeft > 0).slice(0, 3);
            if (upcoming.length > 0) {
                upcoming.forEach(m => {
                    const label = m.type === 'birthday' ? birthdayLabel : anniversaryLabel;
                    const typeClass = m.type === 'birthday' ? 'is-birthday' : 'is-anniversary';
                    html += `
                    <div class="birthday-popover-item" onclick="navigateToFriendCard(${m.ci}, ${m.fi})" style="padding:4px;display:flex;justify-content:space-between;align-items:center;font-size:11px;cursor:pointer;border-radius:4px;transition:0.15s;" onmouseover="this.style.background='var(--bg-item)'" onmouseout="this.style.background='transparent'">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;color:var(--text-main);">${raidSoEscape(m.name)}</span>
                            <span style="color:var(--text-muted);font-size:9px;">${m.month}/${m.day}</span>
                        </div>
                        <div style="display:flex;gap:4px;align-items:center;">
                            <span style="color:var(--twitch-purple);font-weight:bold;">あと${m.daysLeft}${unitDay}</span>
                            <span style="font-size:8px;padding:1px 4px;border-radius:3px;background:${m.type==='birthday'?'rgba(255,74,154,0.1)':'rgba(29,155,240,0.1)'};color:${m.type==='birthday'?'#ff4a9a':'#1d9bf0'};">${raidSoEscape(label)}</span>
                        </div>
                    </div>`;
                });
            } else {
                html += `<div style="font-size:10px;color:var(--text-muted);text-align:center;">予定はありません</div>`;
            }

            // 下部ナビゲーションボタンエリア
            html += `
            <div style="display:flex; gap:6px; border-top:1px solid var(--border-color); padding-top:8px; margin-top:8px;">
                <button onclick="openCalendarWithTab('list')" class="btn-secondary" style="flex:1; padding:4px 0; font-size:10px; font-weight:bold; cursor:pointer; background:var(--bg-item); border:1px solid var(--border-color); color:var(--text-main); border-radius:4px; text-align:center;">一覧表示</button>
                <button onclick="openCalendarWithTab('calendar')" class="btn-secondary" style="flex:1; padding:4px 0; font-size:10px; font-weight:bold; cursor:pointer; background:var(--bg-item); border:1px solid var(--border-color); color:var(--text-main); border-radius:4px; text-align:center;">カレンダー</button>
            </div>`;

            popover.innerHTML = html;
        }
        window.renderBirthdayPopoverContent = renderBirthdayPopoverContent;

        function openCalendarWithTab(tabType) {
            const popover = document.getElementById('birthday-popover');
            if (popover) popover.style.display = 'none';

            openModal('birthdayCalendarModal');
            switchCalendarModalTab(tabType);
        }
        window.openCalendarWithTab = openCalendarWithTab;

        function navigateToFriendCard(ci, fi) {
            // 全てのモーダル・ポップアップを閉じる
            closeModal('birthdayCalendarModal');
            const popover = document.getElementById('birthday-popover');
            if (popover) popover.style.display = 'none';

            // 「ユーザー管理」タブに遷移する
            const friendsTabBtn = document.querySelector('[data-tab-target="friends-tab"]');
            if (friendsTabBtn) {
                friendsTabBtn.click();
            } else if (typeof switchTab === 'function') {
                switchTab('friends-tab');
            }

            // データのアコーディオン状態を開く
            if (friendsConfig && friendsConfig[ci] && friendsConfig[ci].friends[fi]) {
                friendsConfig[ci].friends[fi].isOpen = true;
                renderFriends();
            }

            // カード要素を探してスクロール
            setTimeout(() => {
                const card = document.getElementById(`friend-card-${ci}-${fi}`);
                if (card) {
                    // 親アコーディオン（カテゴリボックス）があれば、閉じている場合は開く
                    const catBox = card.closest('.category-box');
                    if (catBox && catBox.classList.contains('closed')) {
                        const header = catBox.querySelector('.category-name');
                        if (header) header.click();
                    }

                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 見つけやすくするためのハイライト点滅
                    card.style.transition = 'outline var(--transition-fast, 0.2s)';
                    card.style.outline = '2px solid var(--twitch-purple)';
                    setTimeout(() => {
                        card.style.outline = '2px solid transparent';
                    }, 1500);
                }
            }, 120);
        }
        window.navigateToFriendCard = navigateToFriendCard;


        function checkTwitchIdDuplicate(twitchId, excludeCi, excludeFi) {
            const cleanId = (normalizeFriendTwitch(twitchId || '') || '').toLowerCase();
            if (!cleanId) return null;
            
            for (let cIdx = 0; cIdx < (friendsConfig || []).length; cIdx++) {
                const cat = friendsConfig[cIdx];
                for (let fIdx = 0; fIdx < (cat.friends || []).length; fIdx++) {
                    if (excludeCi !== undefined && excludeFi !== undefined) {
                        if (cIdx === excludeCi && fIdx === excludeFi) continue;
                    }
                    const key = (normalizeFriendTwitch(cat.friends[fIdx].twitch || '') || '').toLowerCase();
                    if (key === cleanId) {
                        return {
                            friend: cat.friends[fIdx],
                            categoryName: cat.name,
                            ci: cIdx,
                            fi: fIdx
                        };
                    }
                }
            }
            return null;
        }
        window.checkTwitchIdDuplicate = checkTwitchIdDuplicate;

        // 大カレンダーの現在表示中年月
        let calendarCurrentYear = new Date().getFullYear();
        let calendarCurrentMonth = new Date().getMonth() + 1;
        let selectedCalendarDay = null; // { year, month, day }

        function renderCalendarGrid(year, month) {
            const gridBody = document.getElementById('calendar-grid-body');
            const monthLabel = document.getElementById('calendar-month-title');
            if (!gridBody || !monthLabel) return;

            calendarCurrentYear = year;
            calendarCurrentMonth = month;
            monthLabel.innerText = `${year}年 ${month}月`;
            gridBody.innerHTML = '';

            // 今月のお祝いイベント (誕生日・記念日) を集計
            const monthEvents = {};
            const langMapLoc = langMap[currentLang] || langMap.ja;
            
            (friendsConfig || []).forEach(cat => {
                (cat.friends || []).forEach(f => {
                    // 誕生日
                    if (f.birthday) {
                        const parsed = parseMdDate(f.birthday);
                        if (parsed && parsed.month === month) {
                            if (!monthEvents[parsed.day]) monthEvents[parsed.day] = [];
                            monthEvents[parsed.day].push({ name: f.name || f.twitch, type: 'birthday' });
                        }
                    }
                    // 記念日
                    if (f.anniversary) {
                        const parsed = parseMdDate(f.anniversary);
                        if (parsed && parsed.month === month) {
                            if (!monthEvents[parsed.day]) monthEvents[parsed.day] = [];
                            monthEvents[parsed.day].push({ name: f.name || f.twitch, type: 'anniversary' });
                        }
                    }
                });
            });

            const firstDayIndex = new Date(year, month - 1, 1).getDay();
            const daysInMonth = new Date(year, month, 0).getDate();

            const today = new Date();
            const isCurrentYearMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
            const todayDay = today.getDate();

            // 前月の空セル
            for (let i = 0; i < firstDayIndex; i++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day-cell empty';
                gridBody.appendChild(cell);
            }

            // 日付セル
            for (let day = 1; day <= daysInMonth; day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day-cell';
                cell.style.cursor = 'pointer';

                const dayEvents = monthEvents[day] || [];
                if (dayEvents.length > 0) {
                    cell.classList.add('has-event');
                    const bLabel = langMapLoc.birthdayLabel || '誕生日';
                    const aLabel = langMapLoc.anniversaryLabel || '記念日';
                    const titleText = dayEvents.map(e => `${e.name} (${e.type === 'birthday' ? bLabel : aLabel})`).join('\n');
                    cell.title = titleText;

                    const badge = document.createElement('span');
                    badge.className = 'calendar-day-cell-badge';
                    badge.innerText = '★';
                    cell.appendChild(badge);
                }

                // 今日の日付強調（背景色のみ）
                if (isCurrentYearMonth && day === todayDay) {
                    cell.classList.add('today');
                }

                // 選択日付のハイライト
                if (selectedCalendarDay &&
                    selectedCalendarDay.year === year &&
                    selectedCalendarDay.month === month &&
                    selectedCalendarDay.day === day) {
                    cell.classList.add('selected');
                }

                const numSpan = document.createElement('span');
                numSpan.innerText = day;
                numSpan.style.zIndex = '2';
                cell.appendChild(numSpan);

                // セルクリック → 選択表示更新 + 追加ポップアップ
                const _day = day, _month = month;
                cell.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day-cell.selected').forEach(c => c.classList.remove('selected'));
                    cell.classList.add('selected');
                    selectedCalendarDay = { year, month: _month, day: _day };
                    openCalDayPopup(_month, _day, dayEvents);
                });

                gridBody.appendChild(cell);
            }

            // 6行固定埋め
            const totalCells = firstDayIndex + daysInMonth;
            const paddingCells = 42 - totalCells;
            for (let i = 0; i < paddingCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day-cell empty';
                gridBody.appendChild(cell);
            }

            const popup = document.getElementById('cal-day-popup');
            if (popup) popup.style.display = 'none';
        }
        window.renderCalendarGrid = renderCalendarGrid;

        function navigateCalendarMonth(dir) {
            calendarCurrentMonth += dir;
            if (calendarCurrentMonth > 12) {
                calendarCurrentMonth = 1;
                calendarCurrentYear += 1;
            } else if (calendarCurrentMonth < 1) {
                calendarCurrentMonth = 12;
                calendarCurrentYear -= 1;
            }
            renderCalendarGrid(calendarCurrentYear, calendarCurrentMonth);
        }
        window.navigateCalendarMonth = navigateCalendarMonth;

        function goCalendarToday() {
            const today = new Date();
            calendarCurrentYear = today.getFullYear();
            calendarCurrentMonth = today.getMonth() + 1;
            const tD = today.getDate();

            // 選択日付も今日に変更
            selectedCalendarDay = { year: calendarCurrentYear, month: calendarCurrentMonth, day: tD };

            renderCalendarGrid(calendarCurrentYear, calendarCurrentMonth);

            // 今日用のポップアップを開く
            const monthEvents = [];
            (friendsConfig || []).forEach(cat => {
                (cat.friends || []).forEach(f => {
                    if (f.birthday) {
                        const parsed = parseMdDate(f.birthday);
                        if (parsed && parsed.month === calendarCurrentMonth && parsed.day === tD) {
                            monthEvents.push({ name: f.name || f.twitch, type: 'birthday' });
                        }
                    }
                    if (f.anniversary) {
                        const parsed = parseMdDate(f.anniversary);
                        if (parsed && parsed.month === calendarCurrentMonth && parsed.day === tD) {
                            monthEvents.push({ name: f.name || f.twitch, type: 'anniversary' });
                        }
                    }
                });
            });
            openCalDayPopup(calendarCurrentMonth, tD, monthEvents);

            showToast('今日に移動しました ✓');
        }
        window.goCalendarToday = goCalendarToday;

        function switchCalendarModalTab(tabType) {
            const listBtn = document.getElementById('btn-calendar-tab-list');
            const gridBtn = document.getElementById('btn-calendar-tab-grid');
            const listView = document.getElementById('calendar-modal-list-view');
            const gridView = document.getElementById('calendar-modal-grid-view');
            
            if (tabType === 'list') {
                if (listBtn) { listBtn.className = 'btn-primary'; listBtn.style.background = 'var(--twitch-purple)'; listBtn.style.color = 'var(--text-white)'; }
                if (gridBtn) { gridBtn.className = 'btn-secondary'; gridBtn.style.background = 'var(--bg-item)'; gridBtn.style.color = 'var(--text-main)'; }
                if (listView) listView.style.display = 'block';
                if (gridView) gridView.style.display = 'none';
                renderCalendarModalListView();
            } else {
                if (gridBtn) { gridBtn.className = 'btn-primary'; gridBtn.style.background = 'var(--twitch-purple)'; gridBtn.style.color = 'var(--text-white)'; }
                if (listBtn) { listBtn.className = 'btn-secondary'; listBtn.style.background = 'var(--bg-item)'; listBtn.style.color = 'var(--text-main)'; }
                if (listView) listView.style.display = 'none';
                if (gridView) gridView.style.display = 'flex';
                renderCalendarGrid(calendarCurrentYear, calendarCurrentMonth);
            }
        }
        window.switchCalendarModalTab = switchCalendarModalTab;

        function renderCalendarModalListView() {
            const c = document.getElementById('calendar-modal-list-view');
            if (!c) return;

            const L = langMap[currentLang] || langMap.ja;
            const birthdayLabel = L.birthdayLabel || '誕生日';
            const anniversaryLabel = L.anniversaryLabel || '記念日';
            const unitDay = currentLang === 'en' ? 'd' : '日';

            const allEvents = [];

            (friendsConfig || []).forEach((cat, ci) => {
                const friends = cat.friends || [];
                friends.forEach((f, fi) => {
                    const nickname = String(f.name || '').trim();
                    const cleanTwitch = normalizeFriendTwitch(f.twitch);
                    const name = nickname || f.displayName || cleanTwitch || f.twitch || 'No Name';

                    const bday = parseMdDate(f.birthday);
                    if (bday) {
                        const daysLeft = getDaysUntil(bday.month, bday.day);
                        allEvents.push({ name, type: 'birthday', month: bday.month, day: bday.day, daysLeft, ci, fi });
                    }

                    const anniv = parseMdDate(f.anniversary);
                    if (anniv) {
                        const daysLeft = getDaysUntil(anniv.month, anniv.day);
                        allEvents.push({ name, type: 'anniversary', month: anniv.month, day: anniv.day, daysLeft, ci, fi });
                    }
                });
            });

            allEvents.sort((a, b) => a.daysLeft - b.daysLeft);

            if (allEvents.length === 0) {
                c.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size:12px;">${currentLang === 'en' ? 'No anniversaries registered.' : (currentLang === 'zh' ? '暂无日程。' : '記念日の登録がありません。')}</div>`;
                return;
            }

            let html = '';
            allEvents.forEach(m => {
                const typeLabel = m.type === 'birthday' ? birthdayLabel : anniversaryLabel;
                const typeClass = m.type === 'birthday' ? 'is-birthday' : 'is-anniversary';
                html += `
                <div class="birthday-popover-item" onclick="navigateToFriendCard(${m.ci}, ${m.fi})" style="padding:8px 6px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-radius:6px; transition:0.15s;" onmouseover="this.style.background='var(--bg-item)'" onmouseout="this.style.background='transparent'">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size: 13px; font-weight:bold; color:var(--text-main);">${raidSoEscape(m.name)}</span>
                        <span style="font-size: 11px; color:var(--text-muted);">${m.month}/${m.day}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
                        <span style="font-size: 11px; font-weight:bold; color:var(--twitch-purple);">あと ${m.daysLeft}${unitDay}</span>
                        <span style="font-size: 9px; padding:1px 5px; border-radius:4px; background:${m.type==='birthday'?'rgba(255,74,154,0.15)':'rgba(29,155,240,0.15)'}; color:${m.type==='birthday'?'#ff4a9a':'#1d9bf0'};">${raidSoEscape(typeLabel)}</span>
                    </div>
                </div>`;
            });
            c.innerHTML = html;
        }
        window.renderCalendarModalListView = renderCalendarModalListView;


        // 年月ピッカー
        function renderCalYMMonths(year, currentMonth) {
            const container = document.getElementById('cal-ym-months');
            if (!container) return;
            const monthNamesJA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
            container.innerHTML = '';
            monthNamesJA.forEach((name, idx) => {
                const m = idx + 1;
                const btn = document.createElement('button');
                btn.className = 'ym-month-btn';
                btn.innerText = name;
                btn.style.cssText = `padding:5px 2px;border-radius:5px;border:1px solid var(--border-color);background:var(--bg-item);color:var(--text-main);cursor:pointer;font-size:11px;transition:0.15s;`;
                if (m === currentMonth) {
                    btn.style.background = 'var(--twitch-purple)';
                    btn.style.color = 'var(--text-white)';
                    btn.style.borderColor = 'var(--twitch-purple)';
                    btn.classList.add('selected');
                }
                btn.onclick = () => {
                    calendarCurrentMonth = m;
                    renderCalendarGrid(calendarCurrentYear, calendarCurrentMonth);
                    document.getElementById('cal-ym-picker').style.display = 'none';
                };
                container.appendChild(btn);
            });
        }

        function toggleCalendarYMPicker() {
            const picker = document.getElementById('cal-ym-picker');
            if (!picker) return;
            const isVisible = picker.style.display !== 'none';
            picker.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) renderCalYMMonths(calendarCurrentYear, calendarCurrentMonth);
        }
        window.toggleCalendarYMPicker = toggleCalendarYMPicker;

        function shiftCalendarYear(dir) {
            calendarCurrentYear += dir;
            const label = document.getElementById('cal-ym-year-label');
            if (label) label.innerText = `${calendarCurrentYear}年`;
            renderCalYMMonths(calendarCurrentYear, calendarCurrentMonth);
        }
        window.shiftCalendarYear = shiftCalendarYear;

        // 日付ポップアップ
        let calDayPopupMonth = 0, calDayPopupDay = 0;
        function openCalDayPopup(month, day, events) {
            const popup = document.getElementById('cal-day-popup');
            const titleEl = document.getElementById('cal-day-popup-title');
            const existingEl = document.getElementById('cal-day-existing');
            const personSelect = document.getElementById('cal-day-person-select');
            if (!popup || !titleEl || !existingEl || !personSelect) return;

            calDayPopupMonth = month;
            calDayPopupDay = day;
            titleEl.innerText = `${month}月${day}日`;

            if (events.length > 0) {
                const L = langMap[currentLang] || langMap.ja;
                const bLabel = L.birthdayLabel || '誕生日';
                const aLabel = L.anniversaryLabel || '記念日';
                existingEl.innerHTML = events.map(e =>
                    `<div style="padding:3px 0;display:flex;align-items:center;gap:6px;">
                        <span style="width:6px;height:6px;border-radius:50%;background:${e.type==='birthday'?'#ff4a9a':'#1d9bf0'};display:inline-block;flex-shrink:0;"></span>
                        <span style="font-size:12px;">${raidSoEscape(e.name)}</span>
                        <span style="font-size:10px;color:var(--text-muted);">${e.type==='birthday'?bLabel:aLabel}</span>
                    </div>`
                ).join('');
            } else {
                existingEl.innerHTML = '';
            }

            personSelect.innerHTML = '';
            (friendsConfig || []).forEach((cat, ci) => {
                (cat.friends || []).forEach((f, fi) => {
                    const nickname = String(f.name || '').trim();
                    const cleanTwitch = normalizeFriendTwitch(f.twitch);
                    const label = nickname || f.displayName || cleanTwitch || f.twitch || `(&nbsp;${ci}-${fi})`;
                    const opt = document.createElement('option');
                    opt.value = `${ci}:${fi}`;
                    opt.innerText = label;
                    personSelect.appendChild(opt);
                });
            });

            const optNew = document.createElement('option');
            optNew.value = 'new_person';
            optNew.innerText = '＋ 新規ID作成';
            personSelect.appendChild(optNew);

            const newNameInput = document.getElementById('cal-day-new-name');
            if (newNameInput) {
                newNameInput.value = '';
                newNameInput.style.display = 'none';
            }

            const addForm = document.getElementById('cal-day-add-form');
            if (addForm) addForm.style.display = 'block';

            popup.style.display = 'block';
            selectCalDayType('birthday');
            popup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        window.openCalDayPopup = openCalDayPopup;

        function handleCalPersonSelectChange() {
            const select = document.getElementById('cal-day-person-select');
            const inputName = document.getElementById('cal-day-new-name');
            const inputTwitch = document.getElementById('cal-day-new-twitch');
            if (select && inputName && inputTwitch) {
                if (select.value === 'new_person') {
                    inputName.style.display = 'block';
                    inputTwitch.style.display = 'block';
                    inputName.focus();
                } else {
                    inputName.style.display = 'none';
                    inputTwitch.style.display = 'none';
                }
            }
        }
        window.handleCalPersonSelectChange = handleCalPersonSelectChange;

        function selectCalDayType(type) {
            document.getElementById('cal-day-type-value').value = type;
            const btnB = document.getElementById('cal-type-btn-birthday');
            const btnA = document.getElementById('cal-type-btn-anniversary');
            if (!btnB || !btnA) return;
            if (type === 'birthday') {
                btnB.style.background = 'var(--twitch-purple)';
                btnB.style.borderColor = 'var(--twitch-purple)';
                btnB.style.color = 'var(--text-white)';
                btnA.style.background = 'var(--bg-item)';
                btnA.style.borderColor = 'var(--border-color)';
                btnA.style.color = 'var(--text-muted)';
            } else {
                btnA.style.background = 'var(--twitch-purple)';
                btnA.style.borderColor = 'var(--twitch-purple)';
                btnA.style.color = 'var(--text-white)';
                btnB.style.background = 'var(--bg-item)';
                btnB.style.borderColor = 'var(--border-color)';
                btnB.style.color = 'var(--text-muted)';
            }
        }
        window.selectCalDayType = selectCalDayType;

        async function confirmCalDayAdd() {
            const personSelect = document.getElementById('cal-day-person-select');
            const typeInput = document.getElementById('cal-day-type-value');
            if (!personSelect || !typeInput) return;

            const selectedVal = personSelect.value;
            const type = typeInput.value;
            const mm = String(calDayPopupMonth).padStart(2, '0');
            const dd = String(calDayPopupDay).padStart(2, '0');
            const dateStrReal = `${mm}/${dd}`;

            if (selectedVal === 'new_person') {
                const nameInput = document.getElementById('cal-day-new-name');
                const twitchInput = document.getElementById('cal-day-new-twitch');
                const newName = nameInput ? nameInput.value.trim() : '';
                const newTwitch = twitchInput ? twitchInput.value.trim() : '';
                
                if (!newName) {
                    showToast('ニックネームを入力してください');
                    return;
                }

                // Twitch ID または ニックネームでの重複チェック
                let dupe = checkTwitchIdDuplicate(newTwitch || newName);
                if (!dupe && newTwitch) {
                    // 同一のニックネームが存在するか検索
                    for (let cIdx = 0; cIdx < (friendsConfig || []).length; cIdx++) {
                        const cat = friendsConfig[cIdx];
                        for (let fIdx = 0; fIdx < (cat.friends || []).length; fIdx++) {
                            const f = cat.friends[fIdx];
                            if ((f.name || '').toLowerCase() === newName.toLowerCase()) {
                                dupe = { friend: f, ci: cIdx, fi: fIdx, categoryName: cat.name };
                                break;
                            }
                        }
                        if (dupe) break;
                    }
                }

                if (dupe) {
                    const confirmOverwrite = await customConfirm({
                        title: '重複の警告',
                        message: `「${newName}」は既にグループ「${dupe.categoryName}」に登録されています。上書きしますか？`
                    });
                    if (!confirmOverwrite) return;
                    
                    // 既存データの上書き
                    dupe.friend[type] = dateStrReal;
                    if (newTwitch) dupe.friend.twitch = newTwitch;
                    saveFriendsLocal(false);
                    renderFriends();
                    checkBirthdaysAndAnniversaries();
                    renderCalendarGrid(calendarCurrentYear, calendarCurrentMonth);
                    showToast('上書き保存しました ✓');
                    return;
                }

                let targetCat = (friendsConfig || []).find(cat => cat.name === '未分類');
                if (!targetCat) {
                    targetCat = { name: '未分類', friends: [], isClosed: false };
                    if (!friendsConfig) friendsConfig = [];
                    friendsConfig.push(targetCat);
                }

                const newFriend = { name: newName, twitch: newTwitch, displayName: "", youtube: "", x: "", memo: "", isOpen: true };
                newFriend[type] = dateStrReal;
                targetCat.friends.push(newFriend);

                saveFriendsLocal(false);
                renderFriends();
                checkBirthdaysAndAnniversaries();
            } else {
                const [ci, fi] = selectedVal.split(':').map(Number);
                if (!friendsConfig[ci] || !friendsConfig[ci].friends[fi]) return;

                const friend = friendsConfig[ci].friends[fi];
                if (friend[type] && friend[type] !== dateStrReal) {
                    const confirmOverwrite = await customConfirm({
                        title: '上書きの確認',
                        message: `既に設定されている日付「${friend[type]}」を「${dateStrReal}」に変更しますか？`
                    });
                    if (!confirmOverwrite) return;
                }

                friend[type] = dateStrReal;
                saveFriendsLocal(false);
                renderFriends();
                checkBirthdaysAndAnniversaries();
            }

            renderCalendarGrid(calendarCurrentYear, calendarCurrentMonth);
            showToast('保存しました ✓');
        }
        window.confirmCalDayAdd = confirmCalDayAdd;

        // ミニ日付ピッカー
        let miniPickerCi = 0, miniPickerFi = 0, miniPickerType = '';
        let miniPickerYear = new Date().getFullYear(), miniPickerMonth = new Date().getMonth() + 1;

        function openMiniDatePicker(ci, fi, type) {
            miniPickerCi = ci; miniPickerFi = fi; miniPickerType = type;
            miniPickerYear = new Date().getFullYear();
            miniPickerMonth = new Date().getMonth() + 1;

            const currentVal = friendsConfig[ci]?.friends[fi]?.[type] || '';
            const parsed = parseMdDate(currentVal);
            if (parsed) miniPickerMonth = parsed.month;

            let overlay = document.getElementById('mini-date-picker-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'mini-date-picker-overlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center;';
                overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
                document.body.appendChild(overlay);
            }
            renderMiniDatePicker(overlay);
        }
        window.openMiniDatePicker = openMiniDatePicker;

        function renderMiniDatePicker(overlay) {
            const monthNamesJA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
            const firstDayIndex = new Date(miniPickerYear, miniPickerMonth - 1, 1).getDay();
            const daysInMonth = new Date(miniPickerYear, miniPickerMonth, 0).getDate();
            const todayD = new Date();
            const isTodayMonth = todayD.getFullYear() === miniPickerYear && (todayD.getMonth() + 1) === miniPickerMonth;
            const todayDay = todayD.getDate();

            const currentVal = friendsConfig[miniPickerCi]?.friends[miniPickerFi]?.[miniPickerType] || '';
            const parsedSel = parseMdDate(currentVal);
            const selectedDay = (parsedSel && parsedSel.month === miniPickerMonth) ? parsedSel.day : -1;

            const typeLabel = miniPickerType === 'birthday' ? '誕生日' : '記念日';

            let cellsHtml = '';
            for (let i = 0; i < firstDayIndex; i++) cellsHtml += '<div></div>';
            for (let day = 1; day <= daysInMonth; day++) {
                const isToday = isTodayMonth && day === todayDay;
                const isSel = day === selectedDay;
                let bg = 'var(--bg-item)';
                let color = 'var(--text-main)';
                let outline = 'none';
                if (isToday) { bg = 'var(--color-today)'; color = 'var(--color-today-text)'; }
                if (isSel) { outline = '2px solid var(--twitch-purple)'; }

                cellsHtml += `<button
                    onclick="selectMiniDate(${day})"
                    style="aspect-ratio:1;min-width:28px;min-height:28px;border-radius:5px;border:1px solid var(--border-color);background:${bg};color:${color};cursor:pointer;font-size:12px;font-weight:${isToday?'bold':'normal'};outline:${outline};outline-offset:-2px;transition:0.15s;"
                    onmouseover="if(!this.dataset.sel){this.style.background='var(--twitch-purple)';this.style.color = 'var(--text-white)';}"
                    onmouseout="if(!this.dataset.sel){this.style.background='${bg}';this.style.color='${color}';}"
                    ${isSel ? 'data-sel="1"' : ''}>${day}</button>`;
            }
            const total = firstDayIndex + daysInMonth;
            for (let i = 0; i < 42 - total; i++) cellsHtml += '<div></div>';

            overlay.innerHTML = `
            <div style="background:var(--bg-card);border:2px solid var(--border-color);border-radius:12px;padding:16px;width:300px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <strong style="color:var(--twitch-purple);font-size:13px;">${typeLabel}を選択</strong>
                    <button onclick="document.getElementById('mini-date-picker-overlay').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;line-height:1;padding:2px 6px;">×</button>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <button onclick="miniPickerMonth--;if(miniPickerMonth<1){miniPickerMonth=12;}renderMiniDatePicker(document.getElementById('mini-date-picker-overlay'))" style="background:var(--bg-item);border:1px solid var(--border-color);color:var(--text-main);border-radius:5px;padding:4px 12px;cursor:pointer;font-weight:bold;font-size:13px;">&lt;</button>
                    <span style="font-weight:bold;color:var(--text-main);font-size:13px;">${monthNamesJA[miniPickerMonth-1]}</span>
                    <button onclick="miniPickerMonth++;if(miniPickerMonth>12){miniPickerMonth=1;}renderMiniDatePicker(document.getElementById('mini-date-picker-overlay'))" style="background:var(--bg-item);border:1px solid var(--border-color);color:var(--text-main);border-radius:5px;padding:4px 12px;cursor:pointer;font-weight:bold;font-size:13px;">&gt;</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;font-size:10px;color:var(--text-muted);margin-bottom:3px;">
                    <span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(6,1fr);gap:3px;height:168px;">
                    ${cellsHtml}
                </div>
                <div style="margin-top:8px;text-align:center;font-size:10px;color:var(--text-muted);">日付をクリックで選択</div>
                <div style="margin-top:3px;text-align:center;font-size:9px;color:var(--text-muted);opacity:0.6;">※曜日は今年を参照しています</div>
            </div>`;
        }
        window.renderMiniDatePicker = renderMiniDatePicker;

        function selectMiniDate(day) {
            const mm = String(miniPickerMonth).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateStrReal = `${mm}/${dd}`;

            if (!friendsConfig[miniPickerCi] || !friendsConfig[miniPickerCi].friends[miniPickerFi]) return;

            updateFriendField(miniPickerCi, miniPickerFi, miniPickerType, dateStrReal);
            checkBirthdaysAndAnniversaries();

            const inputId = miniPickerType === 'birthday'
                ? `f-bday-${miniPickerCi}-${miniPickerFi}`
                : `f-anniv-${miniPickerCi}-${miniPickerFi}`;
            const inputEl = document.getElementById(inputId);
            if (inputEl) inputEl.value = dateStrReal;

            document.getElementById('mini-date-picker-overlay')?.remove();
            showToast('保存しました ✓');
        }
        window.selectMiniDate = selectMiniDate;

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
            if (options.sendChat) {
                try {
                    const msgId = await sendRaidSoChat(renderRaidSoTemplate(options.template, data));
                    if (msgId && settings.autoPinEnabled) {
                        await pinRaidSoChatMessage(msgId, 1200);
                    }
                } catch (e) {
                    raidSoLog(`紹介メッセージ送信失敗: ${e.message || e}`, 'warn');
                }
            }
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
            return sent?.message_id;
        }

        async function pinRaidSoChatMessage(messageId, durationSeconds = 1200) {
            try {
                ensureRaidSoBaseSettings();
                await raidSoHelix(`/chat/pins?broadcaster_id=${settings.userId}&moderator_id=${settings.userId}&message_id=${messageId}&duration=${durationSeconds}`, {
                    method: 'POST'
                });
                raidSoLog(`紹介・応援メッセージをピン留めしました（${Math.floor(durationSeconds / 60)}分間）`);
            } catch (err) {
                raidSoLog(`ピン留め失敗: ${err.message || err}`, 'warn');
            }
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

        async function restoreFromLocalFile() {
            const file = document.getElementById('ui-restore-file')?.files?.[0];
            if (!file) {
                showToast(uiText('runtime.selectBackupFile') || 'バックアップファイルを選択してください。', 'error');
                return;
            }
            const reader = new FileReader(); reader.onload = async (e) => {
                try {
                    const d = JSON.parse(e.target.result);

                    // 復元方法の選択ダイアログ (上書き / マージ / キャンセル)
                    const choice = await new Promise((resolveDlg) => {
                        showCustomDialog({
                            title: 'バックアップの復元方法',
                            type: 'alert',
                            messageHtml: `
                                <div style="font-size:13px; line-height:1.6; margin-bottom:18px; color: var(--text-main);">
                                    バックアップデータをどのように復元しますか？<br><br>
                                    <strong>・消去して上書き</strong><br>
                                    既存のデータをすべて削除し、バックアップファイルの内容で完全に上書きします。<br><br>
                                    <strong>・差分のみ追加</strong><br>
                                    既存のデータを残したまま、重複しない差分データのみを追加（マージ）します。
                                </div>
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <button class="btn-danger-soft" id="restore-opt-overwrite" style="padding:10px; font-weight:bold; width:100%;">消去して上書き</button>
                                    <button class="btn-primary" id="restore-opt-merge" style="padding:10px; font-weight:bold; width:100%;">差分のみ追加</button>
                                    <button class="btn-secondary" id="restore-opt-cancel" style="padding:10px; font-weight:bold; width:100%;">キャンセル</button>
                                </div>
                            `
                        });
                        setTimeout(() => {
                            const btnOverwrite = document.getElementById('restore-opt-overwrite');
                            const btnMerge = document.getElementById('restore-opt-merge');
                            const btnCancel = document.getElementById('restore-opt-cancel');
                            const closeTopBtn = document.getElementById('cd-btn-close-top');
                            
                            const finish = (result) => {
                                if (closeTopBtn) closeTopBtn.click();
                                resolveDlg(result);
                            };
                            
                            if (btnOverwrite) btnOverwrite.onclick = () => finish('overwrite');
                            if (btnMerge) btnMerge.onclick = () => finish('merge');
                            if (btnCancel) btnCancel.onclick = () => finish('cancel');
                        }, 50);
                    });

                    if (choice === 'overwrite') {
                        // 完全上書き
                        if (d.config) localStorage.setItem('stream_config_v16', JSON.stringify(d.config));
                        if (d.friends) localStorage.setItem('stream_friends_v16', JSON.stringify(d.friends));
                        if (d.settings) localStorage.setItem('stream_settings_v16', JSON.stringify(d.settings));
                        if (d.memoList) localStorage.setItem('stream_memo_v16', JSON.stringify(d.memoList));
                        if (d.raidShoutOut) localStorage.setItem(RAIDSO_STORAGE_KEY, JSON.stringify(d.raidShoutOut));
                        if (d.raidShoutOutTemplates) localStorage.setItem(RAIDSO_CUSTOM_TEMPLATES_KEY, JSON.stringify(d.raidShoutOutTemplates));
                        if (Array.isArray(d.supporterArchives)) localStorage.setItem(SUPPORTER_ARCHIVE_STORAGE_KEY, JSON.stringify(d.supporterArchives.slice(0, SUPPORTER_ARCHIVE_LIMIT)));
                        
                        raidSoLog(uiText('runtime.operationLog.backupRestored') || 'バックアップを上書き復元しました。');
                        showToast('データを上書き復元しました。', 'success');
                        setTimeout(() => location.reload(), 1000);
                    } else if (choice === 'merge') {
                        // 差分統合マージ処理
                        mergeBackupData(d);

                        raidSoLog('バックアップデータを統合復元しました。');
                        showToast('データを統合（マージ）しました。', 'success');
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        showToast('復元をキャンセルしました。', 'info');
                    }
                } catch (error) {
                    showToast(uiText('runtime.restoreFailed') || '復元に失敗しました。', 'error');
                }
            }; reader.readAsText(file);
            reader.onerror = () => showToast(uiText('runtime.restoreFailed') || '復元に失敗しました。', 'error');
        }

        function mergeBackupData(d) {
            // 1. config
            if (d.config && Array.isArray(d.config)) {
                let localConfig = JSON.parse(localStorage.getItem('stream_config_v16') || '[]');
                d.config.forEach(cfg => {
                    const idx = localConfig.findIndex(c => c.id === cfg.id);
                    if (idx > -1) localConfig[idx] = cfg;
                    else localConfig.push(cfg);
                });
                localStorage.setItem('stream_config_v16', JSON.stringify(localConfig));
            }

            // 2. settings
            if (d.settings) {
                let localSettings = JSON.parse(localStorage.getItem('stream_settings_v16') || '{}');
                const mergedSettings = { ...localSettings, ...d.settings };
                localStorage.setItem('stream_settings_v16', JSON.stringify(mergedSettings));
            }

            // 3. friends (IDリストの差分マージ)
            if (d.friends && Array.isArray(d.friends)) {
                let localFriends = JSON.parse(localStorage.getItem('stream_friends_v16') || '[]');
                d.friends.forEach(bkCat => {
                    let targetCat = localFriends.find(c => c.name === bkCat.name);
                    if (!targetCat) {
                        localFriends.push(bkCat);
                    } else {
                        if (!targetCat.friends) targetCat.friends = [];
                        bkCat.friends.forEach(bkF => {
                            let existingFriend = targetCat.friends.find(f => f.twitch === bkF.twitch || (bkF.name && f.name === bkF.name));
                            if (!existingFriend) {
                                targetCat.friends.push(bkF);
                            } else {
                                Object.assign(existingFriend, bkF);
                            }
                        });
                    }
                });
                localStorage.setItem('stream_friends_v16', JSON.stringify(localFriends));
            }

            // 4. memoList (メモ帳のマージ)
            if (d.memoList && Array.isArray(d.memoList)) {
                let localMemo = JSON.parse(localStorage.getItem('stream_memo_v16') || '[]');
                d.memoList.forEach(bkM => {
                    let existingMemo = localMemo.find(m => m.title === bkM.title);
                    if (!existingMemo) {
                        localMemo.push(bkM);
                    } else {
                        existingMemo.content = bkM.content;
                    }
                });
                localStorage.setItem('stream_memo_v16', JSON.stringify(localMemo));
            }

            // 5. raidShoutOut
            if (d.raidShoutOut) {
                let localRSO = JSON.parse(localStorage.getItem(RAIDSO_STORAGE_KEY) || '{}');
                const mergedRSO = { ...localRSO, ...d.raidShoutOut };
                localStorage.setItem(RAIDSO_STORAGE_KEY, JSON.stringify(mergedRSO));
            }

            // 6. raidShoutOutTemplates
            if (d.raidShoutOutTemplates && Array.isArray(d.raidShoutOutTemplates)) {
                let localRSOTemplates = JSON.parse(localStorage.getItem(RAIDSO_CUSTOM_TEMPLATES_KEY) || '[]');
                d.raidShoutOutTemplates.forEach(bkT => {
                    let idx = localRSOTemplates.findIndex(t => t.name === bkT.name);
                    if (idx > -1) localRSOTemplates[idx] = bkT;
                    else localRSOTemplates.push(bkT);
                });
                localStorage.setItem(RAIDSO_CUSTOM_TEMPLATES_KEY, JSON.stringify(localRSOTemplates));
            }

            // 7. supporterArchives
            if (Array.isArray(d.supporterArchives)) {
                let localArchives = JSON.parse(localStorage.getItem(SUPPORTER_ARCHIVE_STORAGE_KEY) || '[]');
                d.supporterArchives.forEach(bkA => {
                    if (!localArchives.some(a => a.id === bkA.id)) {
                        localArchives.push(bkA);
                    }
                });
                localStorage.setItem(SUPPORTER_ARCHIVE_STORAGE_KEY, JSON.stringify(localArchives.slice(0, SUPPORTER_ARCHIVE_LIMIT)));
            }
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
                const autoAdCheck = document.getElementById('settings_auto_ad');
                if (autoAdCheck) autoAdCheck.checked = !!settings.autoAdEnabled;
                const autoPinCheck = document.getElementById('settings_auto_pin');
                if (autoPinCheck) autoPinCheck.checked = !!settings.autoPinEnabled;

                // 画面表示微調整（文字サイズ・行間）の初期化
                const fontSizeOffset = Number(settings.fontSizeOffset ?? 0);
                const lineHeight = Number(settings.lineHeight ?? 1.5);
                
                initCustomSlider('slider-font-size-wrapper', 'settings_font_size_offset', -3, 5, 1, fontSizeOffset, (val) => {
                    applyFontAdjustments(val, Number(document.getElementById('settings_line_height')?.dataset.value ?? 1.5));
                });
                
                initCustomSlider('slider-line-height-wrapper', 'settings_line_height', 1.1, 2.2, 0.1, lineHeight, (val) => {
                    applyFontAdjustments(Number(document.getElementById('settings_font_size_offset')?.dataset.value ?? 0), val);
                });

                applyFontAdjustments(fontSizeOffset, lineHeight);
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
        `<button type="button" class="btn-danger-soft" onclick="(function(){ var t = document.querySelector('.display-settings-tab.active'); toggleAllCategories(t ? t.dataset.tab : '${initialTabId}', false); })()">${raidSoEscape(displaySettingsText('btnAllOff', 'すべてOFF'))}</button>` +
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



