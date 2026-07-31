import assert from 'node:assert/strict';

await import('../js/update-check.js');

const update = globalThis.TwitchManagerUpdate;

function createStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem: key => values.has(key) ? values.get(key) : null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key),
        values
    };
}

function releaseResponse(version = 'v1.0.3') {
    return {
        ok: true,
        status: 200,
        json: async () => ({
            tag_name: version,
            name: `TwitchManager ${version}`,
            html_url: `https://github.com/MagnestGames/TwitchManager/releases/tag/${version}`,
            draft: false,
            prerelease: false
        })
    };
}

assert.deepEqual(update.parseVersion('v1.2.3'), [1, 2, 3, 0]);
assert.deepEqual(update.parseVersion('1.2.3_beta'), [1, 2, 3, 0]);
assert.equal(update.isBetaVersion('1.0.2_beta'), true);
assert.equal(update.isBetaVersion('1.0.2-beta.3'), true);
assert.equal(update.isBetaVersion('1.0.2'), false);
assert.equal(update.parseVersion('latest'), null);
assert.equal(update.compareVersions('1.0.10', '1.0.2'), 1);
assert.equal(update.compareVersions('1.0.2', '1.0.2_beta'), 0);
assert.equal(update.compareVersions('1.0.1', '1.0.2'), -1);

const storage = createStorage();
let fetchCount = 0;
const available = await update.checkForUpdate({
    currentVersion: '1.0.2',
    storage,
    now: 100000,
    fetchImpl: async () => {
        fetchCount += 1;
        return releaseResponse();
    }
});
assert.equal(available.status, 'available');
assert.equal(available.release.version, 'v1.0.3');
assert.equal(fetchCount, 1);

const cached = await update.checkForUpdate({
    currentVersion: '1.0.2',
    storage,
    now: 100001,
    fetchImpl: async () => {
        fetchCount += 1;
        return releaseResponse();
    }
});
assert.equal(cached.status, 'available');
assert.equal(cached.source, 'cache');
assert.equal(fetchCount, 1);

assert.equal(update.deferVersion('v1.0.3', storage, 100002), true);
const deferred = await update.checkForUpdate({ currentVersion: '1.0.2', storage, now: 100003 });
assert.equal(deferred.status, 'deferred');
const deferredUntil = 100002 + update.constants.DEFER_INTERVAL_MS;
const stillDeferred = await update.checkForUpdate({ currentVersion: '1.0.2', storage, now: deferredUntil - 1 });
assert.equal(stillDeferred.status, 'deferred');
const availableAgain = await update.checkForUpdate({
    currentVersion: '1.0.2',
    storage,
    now: deferredUntil,
    fetchImpl: async () => releaseResponse()
});
assert.equal(availableAgain.status, 'available');

assert.equal(update.skipVersion('v1.0.3', storage), true);
const skipped = await update.checkForUpdate({ currentVersion: '1.0.2', storage, now: 100004 });
assert.equal(skipped.status, 'skipped');

const newerStorage = createStorage({
    [update.constants.SKIPPED_VERSION_KEY]: 'v1.0.3'
});
const newer = await update.checkForUpdate({
    currentVersion: '1.0.2',
    storage: newerStorage,
    now: 200000,
    fetchImpl: async () => releaseResponse('v1.0.4')
});
assert.equal(newer.status, 'available');

const current = await update.checkForUpdate({
    currentVersion: '1.0.3',
    storage: createStorage(),
    now: 300000,
    fetchImpl: async () => releaseResponse('v1.0.3')
});
assert.equal(current.status, 'current');

let betaFetchCount = 0;
const beta = await update.checkForUpdate({
    currentVersion: '1.0.2_beta',
    storage: createStorage(),
    fetchImpl: async () => {
        betaFetchCount += 1;
        return releaseResponse('v1.0.3');
    }
});
assert.equal(beta.status, 'unavailable');
assert.equal(beta.reason, 'beta-build');
assert.equal(betaFetchCount, 0);

const failedStorage = createStorage();
let failedFetchCount = 0;
const failed = await update.checkForUpdate({
    currentVersion: '1.0.2',
    storage: failedStorage,
    now: 400000,
    fetchImpl: async () => {
        failedFetchCount += 1;
        throw new Error('offline');
    }
});
assert.equal(failed.status, 'unavailable');
assert.equal(failed.reason, 'request-failed');
const backedOff = await update.checkForUpdate({
    currentVersion: '1.0.2',
    storage: failedStorage,
    now: 400001,
    fetchImpl: async () => {
        failedFetchCount += 1;
        return releaseResponse();
    }
});
assert.equal(backedOff.reason, 'failure-backoff');
assert.equal(failedFetchCount, 1);

let openedUrl = '';
assert.equal(update.openRelease(available.release.url, url => {
    openedUrl = url;
    return {};
}), true);
assert.equal(openedUrl, available.release.url);

console.log('Update check tests passed.');
