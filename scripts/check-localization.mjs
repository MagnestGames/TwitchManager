import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const supportedLanguages = ["ja", "en", "zh"];
const errors = [];
const warnings = [];

function read(relativePath) {
    return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function loadLocalizationData() {
    const source = `${read("twitch_manager_locales.js")}\n;globalThis.__I18N_DATA__ = I18N_DATA;`;
    const context = {};
    vm.createContext(context);
    vm.runInContext(source, context, {
        filename: "twitch_manager_locales.js",
        timeout: 1000
    });
    return context.__I18N_DATA__;
}

function flatten(value, prefix = "", output = new Map()) {
    if (Array.isArray(value)) {
        value.forEach((entry, index) => flatten(entry, `${prefix}[${index}]`, output));
    } else if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, entry]) => {
            flatten(entry, prefix ? `${prefix}.${key}` : key, output);
        });
    } else {
        output.set(prefix, value);
    }
    return output;
}

function resolvePath(value, keyPath) {
    return String(keyPath || "")
        .split(".")
        .reduce((current, key) => current == null ? undefined : current[key], value);
}

function placeholderSet(value) {
    return [...new Set([...String(value ?? "").matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(match => match[1]))]
        .sort();
}

function sameValues(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function lineNumberAt(source, index) {
    return source.slice(0, index).split(/\r?\n/).length;
}

const localizationData = loadLocalizationData();
const baseLeaves = flatten(localizationData.ja);

for (const language of supportedLanguages) {
    if (!localizationData[language]) {
        errors.push(`Missing language dictionary: ${language}`);
        continue;
    }

    const languageLeaves = flatten(localizationData[language]);
    for (const [key, baseValue] of baseLeaves) {
        if (!languageLeaves.has(key)) {
            errors.push(`${language}: missing key ${key}`);
            continue;
        }
        const translatedValue = languageLeaves.get(key);
        if (typeof translatedValue !== typeof baseValue) {
            errors.push(`${language}: type mismatch at ${key}`);
        }
        if (!sameValues(placeholderSet(baseValue), placeholderSet(translatedValue))) {
            errors.push(`${language}: placeholder mismatch at ${key}`);
        }
    }
    for (const key of languageLeaves.keys()) {
        if (!baseLeaves.has(key)) {
            errors.push(`${language}: unexpected key ${key}`);
        }
    }
}

const html = read("TwitchManagerDock.html");
const htmlReferences = [
    ...html.matchAll(/data-i18n(?:-placeholder|-tooltip|-aria)?="([^"]+)"/g)
].map(match => match[1]);
const strayLocalizedMarkers = [
    ...html.matchAll(/<[^>]*\bdata-i18n="[^"]+"[^>]*>\s*>/g)
];

for (const match of strayLocalizedMarkers) {
    errors.push(`TwitchManagerDock.html:${lineNumberAt(html, match.index)}: localized fallback text starts with an extra ">"`);
}

for (const language of supportedLanguages) {
    for (const key of new Set(htmlReferences)) {
        if (resolvePath(localizationData[language]?.ui, key) === undefined) {
            errors.push(`${language}: HTML references missing UI key ${key}`);
        }
    }
}

const languageOptions = [
    ...html.matchAll(/data-lang-option="([^"]+)"/g)
].map(match => match[1]);
if (!sameValues(languageOptions, supportedLanguages)) {
    errors.push(`Language menu must contain only ${supportedLanguages.join(", ")}; found ${languageOptions.join(", ")}`);
}

const javascriptFiles = [
    "js/api.js",
    "js/eventsub.js",
    "js/main.js",
    "js/storage.js",
    "js/ui.js"
];
const javascriptSources = new Map(javascriptFiles.map(file => [file, read(file)]));
const combinedJavaScript = [...javascriptSources.values()].join("\n");

const languageOptionsBlock = combinedJavaScript.match(/const\s+LANGUAGE_OPTIONS\s*=\s*\[([\s\S]*?)\];/);
if (!languageOptionsBlock) {
    errors.push("LANGUAGE_OPTIONS declaration was not found");
} else {
    const configuredCodes = [
        ...languageOptionsBlock[1].matchAll(/code:\s*['"]([^'"]+)['"]/g)
    ].map(match => match[1]);
    if (!sameValues(configuredCodes, supportedLanguages)) {
        errors.push(`LANGUAGE_OPTIONS must contain only ${supportedLanguages.join(", ")}; found ${configuredCodes.join(", ")}`);
    }
}

const referenceChecks = [
    {
        label: "uiText",
        pattern: /uiText\(\s*['"]([^'"]+)['"]/g,
        pathFor: key => key
    },
    {
        label: "twExt",
        pattern: /twExt\(\s*['"]([^'"]+)['"]/g,
        pathFor: key => `extended.${key}`
    },
    {
        label: "dialogCopy",
        pattern: /dialogCopy\(\s*['"]([^'"]+)['"]/g,
        pathFor: key => `inputDialogs.${key}`
    }
];

for (const check of referenceChecks) {
    const keys = [...combinedJavaScript.matchAll(check.pattern)].map(match => check.pathFor(match[1]));
    for (const language of supportedLanguages) {
        for (const key of new Set(keys)) {
            if (resolvePath(localizationData[language]?.ui, key) === undefined) {
                errors.push(`${language}: ${check.label} references missing UI key ${key}`);
            }
        }
    }
}

const japanesePattern = /[ぁ-んァ-ヶ一-龠]/;
const likelyDisplayContext = /(?:showToast|customAlert|customConfirm|customPrompt|raidSoLog|innerText|textContent|placeholder|aria-label|setAttribute)/;
for (const [file, source] of javascriptSources) {
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;
        if (!japanesePattern.test(line) || !likelyDisplayContext.test(line)) return;
        warnings.push(`${file}:${index + 1}: possible hard-coded display text`);
    });
}

console.log(`Languages: ${supportedLanguages.join(", ")}`);
console.log(`Dictionary leaves: ja=${baseLeaves.size}, en=${flatten(localizationData.en).size}`);
console.log(`HTML i18n references: ${htmlReferences.length} (${new Set(htmlReferences).size} unique)`);
console.log(`Stray localized fallback markers: ${strayLocalizedMarkers.length}`);
console.log(`Hard-coded display candidates: ${warnings.length}`);
warnings.slice(0, 80).forEach(warning => console.log(`WARN ${warning}`));
if (warnings.length > 80) {
    console.log(`WARN ... ${warnings.length - 80} more candidate(s)`);
}

if (errors.length) {
    errors.forEach(error => console.error(`ERROR ${error}`));
    console.error(`Localization check failed with ${errors.length} error(s).`);
    process.exitCode = 1;
} else {
    console.log("Localization check passed.");
}
