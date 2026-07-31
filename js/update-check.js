(function initializeTwitchManagerUpdate(root) {
    'use strict';

    const LATEST_RELEASE_API = 'https://api.github.com/repos/MagnestGames/TwitchManager/releases/latest';
    const LATEST_RELEASE_PAGE = 'https://github.com/MagnestGames/TwitchManager/releases/latest';
    const CACHE_KEY = 'stream_update_check_v1';
    const FAILURE_KEY = 'stream_update_check_failure_v1';
    const NOTIFIED_KEY = 'stream_update_last_notified_v1';
    const SKIPPED_VERSION_KEY = 'stream_update_skipped_version_v1';
    const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
    const DEFER_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;
    const FAILURE_RETRY_MS = 60 * 60 * 1000;
    const REQUEST_TIMEOUT_MS = 7000;

    function parseVersion(value) {
        const match = String(value || '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?(?:[-_+].*)?$/i);
        if (!match) return null;
        return match.slice(1, 5).map(part => Number(part || 0));
    }

    function compareVersions(left, right) {
        const leftParts = parseVersion(left);
        const rightParts = parseVersion(right);
        if (!leftParts || !rightParts) return null;
        for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
            const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
            if (difference !== 0) return difference > 0 ? 1 : -1;
        }
        return 0;
    }

    function isBetaVersion(value) {
        return /(?:^|[._+-])beta(?:[._-]?\d*)?(?:$|[._+-])/i.test(String(value || '').trim());
    }

    function readStorage(storage, key) {
        try {
            return storage?.getItem(key) || '';
        } catch (error) {
            return '';
        }
    }

    function writeStorage(storage, key, value) {
        try {
            storage?.setItem(key, value);
        } catch (error) {}
    }

    function removeStorage(storage, key) {
        try {
            storage?.removeItem(key);
        } catch (error) {}
    }

    function parseCachedRelease(value) {
        try {
            const cached = JSON.parse(value || '{}');
            if (!Number.isFinite(cached.checkedAt) || !cached.release || !parseVersion(cached.release.version)) return null;
            return cached;
        } catch (error) {
            return null;
        }
    }

    function parseNotification(value) {
        try {
            const notification = JSON.parse(value || '{}');
            if (!parseVersion(notification.version)) return null;
            if (Number.isFinite(notification.deferredUntil)) return notification;
            if (Number.isFinite(notification.notifiedAt)) {
                return { ...notification, deferredUntil: notification.notifiedAt + DEFER_INTERVAL_MS };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    function normalizeRelease(data) {
        if (!data || data.draft || data.prerelease || !parseVersion(data.tag_name)) {
            throw new Error('Latest stable release response is invalid.');
        }
        const providedUrl = String(data.html_url || '');
        const trustedPrefix = 'https://github.com/MagnestGames/TwitchManager/releases/';
        return {
            version: String(data.tag_name).trim(),
            name: String(data.name || data.tag_name).trim(),
            url: providedUrl.startsWith(trustedPrefix) ? providedUrl : LATEST_RELEASE_PAGE
        };
    }

    async function fetchLatestRelease(fetchImpl = root.fetch, timeoutMs = REQUEST_TIMEOUT_MS) {
        if (typeof fetchImpl !== 'function') throw new Error('Fetch API is unavailable.');
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
            const response = await fetchImpl(LATEST_RELEASE_API, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2026-03-10'
                },
                signal: controller?.signal
            });
            if (!response?.ok) throw new Error(`GitHub release check failed: ${response?.status || 'unknown'}`);
            return normalizeRelease(await response.json());
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    function currentVersion() {
        return String(root.TWITCH_MANAGER_BUILD?.version || '').trim();
    }

    async function checkForUpdate(options = {}) {
        const storage = options.storage || root.localStorage;
        const now = Number.isFinite(options.now) ? options.now : Date.now();
        const installedVersion = String(options.currentVersion || currentVersion()).trim();
        if (!parseVersion(installedVersion)) return { status: 'unavailable', reason: 'invalid-current-version' };
        if (isBetaVersion(installedVersion)) return { status: 'unavailable', reason: 'beta-build' };
        const pendingNotification = parseNotification(readStorage(storage, NOTIFIED_KEY));
        if (!options.force && pendingNotification && now < pendingNotification.deferredUntil) {
            return { status: 'deferred', reason: 'remind-later' };
        }

        let release = null;
        let source = 'network';
        const cached = parseCachedRelease(readStorage(storage, CACHE_KEY));
        if (!options.force && cached && now - cached.checkedAt < CHECK_INTERVAL_MS) {
            release = cached.release;
            source = 'cache';
        } else {
            const failureValue = readStorage(storage, FAILURE_KEY);
            const lastFailure = failureValue ? Number(failureValue) : Number.NaN;
            if (!options.force && Number.isFinite(lastFailure) && now - lastFailure < FAILURE_RETRY_MS) {
                return { status: 'unavailable', reason: 'failure-backoff' };
            }
            try {
                release = await fetchLatestRelease(options.fetchImpl || root.fetch, options.timeoutMs);
                writeStorage(storage, CACHE_KEY, JSON.stringify({ checkedAt: now, release }));
                removeStorage(storage, FAILURE_KEY);
            } catch (error) {
                writeStorage(storage, FAILURE_KEY, String(now));
                return { status: 'unavailable', reason: 'request-failed', error };
            }
        }

        const comparison = compareVersions(release.version, installedVersion);
        if (comparison === null) return { status: 'unavailable', reason: 'invalid-release-version' };
        if (comparison <= 0) return { status: 'current', release, source };
        if (readStorage(storage, SKIPPED_VERSION_KEY) === release.version) {
            return { status: 'skipped', release, source };
        }
        return { status: 'available', release, source };
    }

    function deferVersion(version, storage = root.localStorage, now = Date.now()) {
        if (!parseVersion(version) || !Number.isFinite(now)) return false;
        writeStorage(storage, NOTIFIED_KEY, JSON.stringify({
            version: String(version).trim(),
            deferredUntil: now + DEFER_INTERVAL_MS
        }));
        return true;
    }

    const markNotified = deferVersion;

    function skipVersion(version, storage = root.localStorage) {
        if (!parseVersion(version)) return false;
        writeStorage(storage, SKIPPED_VERSION_KEY, String(version).trim());
        removeStorage(storage, NOTIFIED_KEY);
        return true;
    }

    function openRelease(url, openImpl = root.open) {
        const trustedPrefix = 'https://github.com/MagnestGames/TwitchManager/releases/';
        const target = String(url || '').startsWith(trustedPrefix) ? String(url) : LATEST_RELEASE_PAGE;
        if (typeof openImpl !== 'function') return false;
        const opened = openImpl(target, '_blank', 'noopener,noreferrer');
        try { if (opened) opened.opener = null; } catch (error) {}
        return true;
    }

    root.TwitchManagerUpdate = Object.freeze({
        checkForUpdate,
        compareVersions,
        currentVersion,
        deferVersion,
        fetchLatestRelease,
        isBetaVersion,
        markNotified,
        openRelease,
        parseVersion,
        skipVersion,
        constants: Object.freeze({
            CACHE_KEY,
            CHECK_INTERVAL_MS,
            DEFER_INTERVAL_MS,
            FAILURE_KEY,
            FAILURE_RETRY_MS,
            LATEST_RELEASE_API,
            NOTIFIED_KEY,
            SKIPPED_VERSION_KEY
        })
    });
})(typeof window === 'undefined' ? globalThis : window);
