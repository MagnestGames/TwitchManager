import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const css = fs.readFileSync(path.join(repositoryRoot, "twitch_manager.css"), "utf8");
const failures = [];

function readBlock(selector) {
    const selectorIndex = css.indexOf(selector);
    if (selectorIndex < 0) throw new Error(`Selector not found: ${selector}`);
    const start = css.indexOf("{", selectorIndex);
    let depth = 0;
    for (let index = start; index < css.length; index++) {
        if (css[index] === "{") depth++;
        if (css[index] === "}") {
            depth--;
            if (depth === 0) return css.slice(start + 1, index);
        }
    }
    throw new Error(`Unclosed CSS block: ${selector}`);
}

function declarations(block) {
    return new Map(
        [...block.matchAll(/([-\w]+)\s*:\s*([^;]+);/g)]
            .map(match => [match[1].trim(), match[2].replace(/\s*!important\s*$/, "").trim()])
    );
}

function variables(block) {
    return new Map(
        [...block.matchAll(/--([-\w]+)\s*:\s*([^;]+);/g)]
            .map(match => [`--${match[1]}`, match[2].trim()])
    );
}

const darkVariables = variables(readBlock(":root"));
const lightVariables = new Map([...darkVariables, ...variables(readBlock("body.light-theme"))]);

function resolveToken(token, themeVariables, seen = new Set()) {
    const value = String(token).trim();
    const variableMatch = value.match(/^var\((--[-\w]+)\)$/);
    if (!variableMatch) return value;
    const name = variableMatch[1];
    if (seen.has(name)) throw new Error(`Circular CSS variable: ${name}`);
    if (!themeVariables.has(name)) throw new Error(`CSS variable not found: ${name}`);
    seen.add(name);
    return resolveToken(themeVariables.get(name), themeVariables, seen);
}

function parseColor(token, themeVariables) {
    const value = resolveToken(token, themeVariables);
    const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
        const raw = hex[1].length === 3
            ? [...hex[1]].map(character => character + character).join("")
            : hex[1];
        return {
            r: parseInt(raw.slice(0, 2), 16) / 255,
            g: parseInt(raw.slice(2, 4), 16) / 255,
            b: parseInt(raw.slice(4, 6), 16) / 255,
            a: 1
        };
    }
    const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgba) {
        return {
            r: Number(rgba[1]) / 255,
            g: Number(rgba[2]) / 255,
            b: Number(rgba[3]) / 255,
            a: rgba[4] === undefined ? 1 : Number(rgba[4])
        };
    }
    throw new Error(`Unsupported color value: ${value}`);
}

function composite(foreground, background) {
    const alpha = foreground.a + background.a * (1 - foreground.a);
    return {
        r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
        g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
        b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
        a: alpha
    };
}

function luminance(color) {
    const linear = value => value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    return 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b);
}

function contrast(foregroundToken, backgroundToken, themeVariables, surfaceToken = "var(--bg-base)") {
    let foreground = parseColor(foregroundToken, themeVariables);
    let background = parseColor(backgroundToken, themeVariables);
    const surface = parseColor(surfaceToken, themeVariables);
    if (background.a < 1) background = composite(background, surface);
    if (foreground.a < 1) foreground = composite(foreground, background);
    const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
    return (values[0] + 0.05) / (values[1] + 0.05);
}

function check(label, foreground, background, themeVariables, surface, minimum = 4.5) {
    const ratio = contrast(foreground, background, themeVariables, surface);
    console.log(`${label}: ${ratio.toFixed(2)}:1`);
    if (ratio < minimum) {
        failures.push(`${label}: ${ratio.toFixed(2)}:1 is below ${minimum}:1`);
    }
}

const semanticChecks = [
    ["body text", "var(--text-main)", "var(--bg-base)"],
    ["muted text", "var(--text-muted)", "var(--bg-card)"],
    ["placeholder text", "var(--placeholder-text)", "var(--bg-base)"],
    ["accent text", "var(--command-accent)", "var(--bg-card)"],
    ["today marker", "var(--color-today-text)", "var(--color-today)"],
    ["purple action", "var(--text-on-purple)", "var(--twitch-purple)"],
    ["success toast", "#ffffff", "var(--success)"],
    ["danger toast", "#ffffff", "var(--danger)"],
    ["primary button", "var(--button-primary-text)", "var(--button-primary-bg)"],
    ["secondary button", "var(--text-on-secondary)", "var(--button-secondary-bg)"],
    ["add button", "var(--button-add-text)", "var(--button-add-bg)"],
    ["danger button", "var(--button-danger-text)", "var(--button-danger-bg)"]
];

for (const [themeName, themeVariables] of [["dark", darkVariables], ["light", lightVariables]]) {
    for (const [label, foreground, background] of semanticChecks) {
        check(`${themeName} ${label}`, foreground, background, themeVariables);
    }
}

for (const selector of [
    ".calendar-event-type-birthday",
    ".calendar-event-type-anniversary"
]) {
    const rule = declarations(readBlock(selector));
    check(`dark ${selector}`, rule.get("color"), rule.get("background"), darkVariables, "var(--bg-card)");
}

for (const selector of [
    "body.light-theme .calendar-event-type-birthday",
    "body.light-theme .calendar-event-type-anniversary"
]) {
    const rule = declarations(readBlock(selector));
    check(`light ${selector}`, rule.get("color"), rule.get("background"), lightVariables, "var(--bg-card)");
}

for (const [label, selector, themeVariables, surface] of [
    ["dark active toggle", ".active-toggle", darkVariables, "var(--bg-card)"],
    ["light active toggle", "body.light-theme .active-toggle", lightVariables, "var(--bg-card)"],
    ["light clear-chat action", "body.light-theme .tw-chat-clear-btn", lightVariables, "var(--bg-card)"],
    ["light history reset", "body.light-theme .id-history-reset-btn", lightVariables, "var(--bg-card)"],
    ["light inactive celebration icon", "body.light-theme #birthday-indicator-btn.inactive", lightVariables, "var(--bg-header)"]
]) {
    const rule = declarations(readBlock(selector));
    check(label, rule.get("color"), rule.get("background"), themeVariables, surface);
}

const sourceFiles = [
    "TwitchManagerDock.html",
    "js/api.js",
    "js/eventsub.js",
    "js/main.js",
    "js/storage.js",
    "js/ui.js"
];
const sourceContents = new Map();
const hostilePatterns = [
    { label: "fixed low-contrast gray text", pattern: /color\s*:\s*#(?:aaa|888)\b/gi },
    { label: "dark-only purple text", pattern: /color\s*:\s*#bf94ff\b/gi },
    { label: "bright red fixed text", pattern: /color\s*:\s*#(?:ff4a4a|ff6b6b)\b/gi },
    { label: "fixed black panel", pattern: /background\s*:\s*#000(?:000)?\b/gi }
];

for (const relativePath of sourceFiles) {
    const source = fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
    sourceContents.set(relativePath, source);
    for (const checkPattern of hostilePatterns) {
        for (const match of source.matchAll(checkPattern.pattern)) {
            const line = source.slice(0, match.index).split(/\r?\n/).length;
            failures.push(`${relativePath}:${line}: ${checkPattern.label}`);
        }
    }
}

if (resolveToken("var(--text-white)", lightVariables).toLowerCase() !== "#ffffff") {
    failures.push("Light theme --text-white must remain #ffffff for solid accent buttons.");
}

const uiSource = sourceContents.get("js/ui.js");
const applyThemeBlock = uiSource.match(/function\s+applyTheme\(theme\)\s*\{([\s\S]*?)\r?\n\s*\}\r?\n\s*\r?\n\s*function\s+toggleTheme/);
if (!applyThemeBlock || !/classList\.toggle\(['"]light-theme['"],\s*isLight\)/.test(applyThemeBlock[1])) {
    failures.push("applyTheme must toggle the light-theme class.");
} else if (/\bcurrentLang\b/.test(applyThemeBlock[1])) {
    failures.push("Theme application must remain independent of the selected language.");
}
if (!/document\.documentElement\.lang\s*=\s*currentLang/.test(uiSource)) {
    failures.push("Language switching must update the HTML lang attribute.");
}
if (/document\.body\.className\s*=/.test(uiSource)) {
    failures.push("Direct body.className assignment could remove the light-theme class.");
}

if (failures.length) {
    failures.forEach(failure => console.error(`ERROR ${failure}`));
    console.error(`Theme contrast check failed with ${failures.length} error(s).`);
    process.exitCode = 1;
} else {
    console.log("Theme contrast check passed.");
}
