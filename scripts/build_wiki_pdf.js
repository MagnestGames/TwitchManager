const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WIKI_DIR = path.join(__dirname, '../docs/wiki-mock');
const OUTPUT_HTML = path.join(__dirname, '../docs/wiki_combined.html');
const OUTPUT_PDF = path.join(__dirname, '../TwitchManager_Wiki_Manual.pdf');
const ARTIFACT_DIR = path.join(__dirname, '../output/pdf');
const ARTIFACT_PDF = path.join(ARTIFACT_DIR, 'TwitchManager-1.0.2-Manual-ja.pdf');
const EDGE_PROFILE_DIR = path.join(__dirname, '../tmp/pdf-edge-profile');
const issueDate = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' }).format(new Date());

// ページの構成順序
const PAGES = [
    { file: 'Home.md', title: 'ホーム' },
    { file: 'Release-History.md', title: '更新履歴' },
    { file: 'Getting-Started.md', title: 'インストールとOBSへの追加' },
    { file: 'Authentication.md', title: 'Twitch認証' },
    { file: 'Feature-Overview.md', title: '機能一覧' },
    { file: 'Stream-Title.md', title: '配信タイトル・カテゴリ設定' },
    { file: 'Raid-and-Notifications.md', title: '通知とRaid・紹介' },
    { file: 'Twitch-Tools.md', title: 'Twitchツール・管理' },
    { file: 'Commands.md', title: 'チャットコマンド設定' },
    { file: 'ID-List.md', title: 'IDリスト' },
    { file: 'Memo-and-Other.md', title: 'メモ帳・その他' },
    { file: 'Settings-and-Backup.md', title: '設定・バックアップ' },
    { file: 'Logo-and-Credits.md', title: 'ロゴの利用とクレジット' },
    { file: 'Troubleshooting.md', title: 'トラブルシューティング' },
    { file: 'Q&A.md', title: 'よくある質問 (Q&A)' }
];

function toLocalImageUrl(src, baseImgDir) {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('file:') || src.startsWith('data:')) {
        return src;
    }
    const absolutePath = path.resolve(baseImgDir, src).replace(/\\/g, '/');
    return `file:///${absolutePath}`;
}

function toDocumentHref(href) {
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#')) {
        return href;
    }
    const pageName = href.split('#')[0].replace(/\.md$/i, '');
    const pageId = pageName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return `#section-${pageId}`;
}

// 簡易マークダウンパース関数
function parseMarkdown(md, baseImgDir) {
    // Markdown画像を通常リンクより先に変換する。
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        const imgPath = toLocalImageUrl(src, baseImgDir);
        return `<div class="img-container"><img src="${imgPath}" alt="${alt}" /><span class="img-caption">${alt}</span></div>`;
    });

    // Wikiで幅指定に使うHTML画像も、PDFではローカルファイルを参照する。
    md = md.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (match, before, src, after) => {
        return `${before}${toLocalImageUrl(src, baseImgDir)}${after}`;
    });

    // ページ間リンクを統合PDF内の章アンカーへ変換する。
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
        const target = toDocumentHref(href);
        const external = /^https?:\/\//.test(target) || target.startsWith('mailto:');
        return `<a href="${target}"${external ? ' target="_blank"' : ''}>${text}</a>`;
    });

    // HTMLへのライン単位変換
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let inCode = false;
    let codeLang = '';
    let codeContent = [];
    let inList = false;
    let inTable = false;
    let tableHeaderDone = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // コードブロック
        if (line.trim().startsWith('```')) {
            if (!inCode) {
                inCode = true;
                codeLang = line.trim().substring(3);
                codeContent = [];
            } else {
                inCode = false;
                const escapedCode = codeContent.join('\n')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                html += `<pre><code class="language-${codeLang}">${escapedCode}</code></pre>\n`;
            }
            continue;
        }

        if (inCode) {
            codeContent.push(line);
            continue;
        }

        // 空行
        if (line.trim() === '') {
            if (inList) { html += '</ul>\n'; inList = false; }
            if (inTable) { html += '</table>\n'; inTable = false; tableHeaderDone = false; }
            continue;
        }

        // テーブル
        if (line.trim().startsWith('|')) {
            if (!inTable) {
                inTable = true;
                tableHeaderDone = false;
                html += '<table class="doc-table">\n';
            }
            if (line.includes('---')) {
                tableHeaderDone = true;
                continue;
            }
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            const tag = tableHeaderDone ? 'td' : 'th';
            html += `<tr>${cells.map(c => `<${tag}>${inlineFormatting(c)}</${tag}>`).join('')}</tr>\n`;
            continue;
        } else if (inTable) {
            html += '</table>\n';
            inTable = false;
            tableHeaderDone = false;
        }

        // 見出し
        if (line.startsWith('# ')) {
            if (inList) { html += '</ul>\n'; inList = false; }
            const text = line.substring(2).trim();
            const id = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            html += `<h1 id="${id}">${inlineFormatting(text)}</h1>\n`;
            continue;
        }
        if (line.startsWith('## ')) {
            if (inList) { html += '</ul>\n'; inList = false; }
            const text = line.substring(3).trim();
            const id = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            html += `<h2 id="${id}">${inlineFormatting(text)}</h2>\n`;
            continue;
        }
        if (line.startsWith('### ')) {
            if (inList) { html += '</ul>\n'; inList = false; }
            const text = line.substring(4).trim();
            const id = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            html += `<h3 id="${id}">${inlineFormatting(text)}</h3>\n`;
            continue;
        }
        if (line.startsWith('#### ')) {
            if (inList) { html += '</ul>\n'; inList = false; }
            const text = line.substring(5).trim();
            html += `<h4>${inlineFormatting(text)}</h4>\n`;
            continue;
        }

        // リスト
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            if (!inList) { html += '<ul>\n'; inList = true; }
            const content = line.trim().substring(2);
            html += `<li>${inlineFormatting(content)}</li>\n`;
            continue;
        }

        // 引用
        if (line.trim().startsWith('> ')) {
            if (inList) { html += '</ul>\n'; inList = false; }
            const content = line.trim().substring(2);
            html += `<blockquote>${inlineFormatting(content)}</blockquote>\n`;
            continue;
        }

        // 通常のパラグラフ
        if (inList) { html += '</ul>\n'; inList = false; }
        if (!line.trim().startsWith('<')) {
            html += `<p>${inlineFormatting(line)}</p>\n`;
        } else {
            html += line + '\n';
        }
    }

    if (inList) html += '</ul>\n';
    if (inTable) html += '</table>\n';

    return html;
}

function inlineFormatting(str) {
    return str
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
            if (href.startsWith('http://') || href.startsWith('https://')) {
                return `<a href="${href}">${text}</a>`;
            }
            return `<a href="${toDocumentHref(href)}">${text}</a>`;
        });
}

function generateFullHTML() {
    let sectionsHTML = '';
    let tocListHTML = '';

    PAGES.forEach((pg, index) => {
        const filePath = path.join(WIKI_DIR, pg.file);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        const sectionId = pg.file.replace('.md', '').toLowerCase();
        
        tocListHTML += `<li><a href="#section-${sectionId}"><span class="toc-num">${index + 1}.</span> ${pg.title}</a></li>\n`;

        const parsedContent = parseMarkdown(content, WIKI_DIR);

        sectionsHTML += `
        <section class="wiki-chapter" id="section-${sectionId}">
            <div class="chapter-header">
                <span class="chapter-badge">Chapter ${index + 1}</span>
                <span class="chapter-filename">${pg.file}</span>
            </div>
            ${parsedContent}
        </section>
        `;
    });

    const fullHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>TwitchManager 公式ユーザーマニュアル</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 18mm 15mm 20mm 15mm;
            @bottom-right {
                content: counter(page);
                font-size: 9pt;
                font-family: sans-serif;
                color: #777;
            }
            @bottom-left {
                content: "TwitchManager Official User Manual";
                font-size: 9pt;
                font-family: sans-serif;
                color: #777;
            }
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
            color: #1F1F23;
            line-height: 1.6;
            font-size: 10.5pt;
            background-color: #FFFFFF;
            margin: 0;
            padding: 0;
        }

        /* 表紙 Cover Page */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #18181B 0%, #261646 50%, #9146FF 100%);
            color: #FFFFFF;
            padding: 40px;
            page-break-after: always;
            box-sizing: border-box;
        }

        .cover-logo-badge {
            background-color: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 11pt;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 24px;
        }

        .cover-title {
            font-size: 32pt;
            font-weight: 800;
            margin: 0 0 16px 0;
            letter-spacing: 1px;
            text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .cover-subtitle {
            font-size: 14pt;
            color: #E2D6FF;
            margin-bottom: 40px;
            max-width: 600px;
            font-weight: 300;
        }

        .cover-divider {
            width: 80px;
            height: 4px;
            background-color: #00F0FF;
            margin-bottom: 40px;
            border-radius: 2px;
        }

        .cover-meta {
            font-size: 10pt;
            color: #B9A3E3;
            line-height: 1.8;
        }

        /* 目次 TOC Page */
        .toc-page {
            padding: 20px 0;
            page-break-after: always;
        }

        .toc-title {
            font-size: 20pt;
            color: #9146FF;
            border-bottom: 3px solid #9146FF;
            padding-bottom: 8px;
            margin-bottom: 24px;
        }

        .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .toc-list li {
            padding: 10px 14px;
            margin-bottom: 8px;
            background-color: #F8F6FF;
            border-left: 4px solid #9146FF;
            border-radius: 0 6px 6px 0;
            font-size: 11pt;
        }

        .toc-list a {
            color: #18181B;
            text-decoration: none;
            font-weight: bold;
            display: flex;
            align-items: center;
        }

        .toc-num {
            color: #9146FF;
            font-size: 12pt;
            margin-right: 10px;
            font-weight: 800;
        }

        /* 各章 Wiki Chapter */
        .wiki-chapter {
            page-break-before: always;
            padding-top: 10px;
        }

        .chapter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #F4F0FD;
            padding: 6px 14px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #E4D7FC;
        }

        .chapter-badge {
            background-color: #9146FF;
            color: #FFFFFF;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 9pt;
            font-weight: bold;
        }

        .chapter-filename {
            font-size: 9pt;
            color: #777782;
            font-family: monospace;
        }

        /* 見出しデザイン */
        h1 {
            font-size: 18pt;
            color: #18181B;
            border-bottom: 2px solid #9146FF;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 16px;
        }

        h2 {
            font-size: 14pt;
            color: #4615B2;
            margin-top: 20px;
            margin-bottom: 12px;
            border-left: 4px solid #9146FF;
            padding-left: 10px;
        }

        h3 {
            font-size: 12pt;
            color: #2F2F35;
            margin-top: 16px;
            margin-bottom: 10px;
        }

        p {
            margin-bottom: 12px;
            text-align: justify;
        }

        /* テーブル */
        .doc-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 9.5pt;
        }

        .doc-table th {
            background-color: #9146FF;
            color: #FFFFFF;
            font-weight: bold;
            text-align: left;
            padding: 8px 12px;
            border: 1px solid #9146FF;
        }

        .doc-table td {
            padding: 8px 12px;
            border: 1px solid #E6E6EA;
        }

        .doc-table tr:nth-child(even) {
            background-color: #F9F8FE;
        }

        /* コードブロック */
        pre {
            background-color: #1F1F23;
            color: #F1F1F5;
            padding: 12px 16px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: "Consolas", "Courier New", monospace;
            font-size: 9pt;
            line-height: 1.45;
            margin: 14px 0;
            page-break-inside: avoid;
        }

        code {
            font-family: "Consolas", "Courier New", monospace;
            background-color: #F0ECF9;
            color: #6441A5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9pt;
        }

        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }

        /* 画像 */
        .img-container {
            text-align: center;
            margin: 18px 0;
            page-break-inside: avoid;
        }

        .img-container img {
            max-width: 90%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            border: 1px solid #E0E0E6;
        }

        .img-caption {
            display: block;
            font-size: 8.5pt;
            color: #666670;
            margin-top: 6px;
            font-style: italic;
        }

        /* 引用・注記 */
        blockquote {
            margin: 16px 0;
            padding: 10px 16px;
            background-color: #F4F0FD;
            border-left: 4px solid #9146FF;
            color: #3A3A40;
            border-radius: 0 6px 6px 0;
            font-size: 10pt;
        }

        ul, ol {
            padding-left: 22px;
            margin-bottom: 14px;
        }

        li {
            margin-bottom: 4px;
        }

        a {
            color: #9146FF;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <!-- 表紙 -->
    <div class="cover-page">
        <div class="cover-logo-badge">OBS Studio Custom Browser Dock</div>
        <h1 class="cover-title">TwitchManager</h1>
        <div class="cover-subtitle">公式ユーザーマニュアル &amp; 統合Wikiドキュメント</div>
        <div class="cover-divider"></div>
        <div class="cover-meta">
            Version: 1.0.2<br>
            発行日: ${issueDate}<br>
            対応言語: 日本語 (Japanese)<br>
            ドキュメント形式: 統合PDFマニュアル
        </div>
    </div>

    <!-- 目次 -->
    <div class="toc-page">
        <h2 class="toc-title">目次 (Table of Contents)</h2>
        <ul class="toc-list">
            ${tocListHTML}
        </ul>
    </div>

    <!-- ドキュメント本文 -->
    ${sectionsHTML}

</body>
</html>
`;

    fs.writeFileSync(OUTPUT_HTML, fullHTML.replace(/[ \t]+$/gm, ''), 'utf8');
    console.log(`Combined HTML generated successfully at: ${OUTPUT_HTML}`);
}

generateFullHTML();

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const cmd = `"${edgePath}" --headless=new --disable-gpu --no-first-run --user-data-dir="${EDGE_PROFILE_DIR}" --print-to-pdf="${OUTPUT_PDF}" --no-pdf-header-footer "file:///${OUTPUT_HTML.replace(/\\/g, '/')}"`;

console.log('Generating PDF via Edge Headless...');
async function renderPdf() {
    if (fs.existsSync(OUTPUT_PDF)) fs.unlinkSync(OUTPUT_PDF);
    if (fs.existsSync(ARTIFACT_PDF)) fs.unlinkSync(ARTIFACT_PDF);
    fs.rmSync(EDGE_PROFILE_DIR, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(EDGE_PROFILE_DIR), { recursive: true });

    let playwright = null;
    try { playwright = require('playwright'); } catch (error) {}
    if (playwright) {
        const browser = await playwright.chromium.launch({ executablePath: edgePath, headless: true });
        try {
            const page = await browser.newPage();
            await page.goto(`file:///${OUTPUT_HTML.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
            await page.pdf({ path: OUTPUT_PDF, format: 'A4', printBackground: true, preferCSSPageSize: true });
        } finally {
            await browser.close();
        }
    } else {
        execSync(cmd);
        const deadline = Date.now() + 30000;
        while (!fs.existsSync(OUTPUT_PDF) && Date.now() < deadline) {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
        }
    }
    if (!fs.existsSync(OUTPUT_PDF)) throw new Error('Edge did not create the PDF output.');
    console.log(`PDF successfully created at: ${OUTPUT_PDF}`);

    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    fs.copyFileSync(OUTPUT_PDF, ARTIFACT_PDF);
    console.log(`Copied PDF to artifact location: ${ARTIFACT_PDF}`);
}

renderPdf().catch(err => {
    console.error('Error rendering PDF:', err);
    process.exitCode = 1;
});
