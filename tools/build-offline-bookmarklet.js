const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "evaluation-helper.js");
const distDir = path.join(rootDir, "dist");
const docsDir = path.join(rootDir, "docs");
const bookmarkletPath = path.join(distDir, "evaluation-helper.offline-bookmarklet.txt");
const installPath = path.join(rootDir, "install.html");
const pagesInstallPath = path.join(docsDir, "index.html");

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const source = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
const base64Source = Buffer.from(source, "utf8").toString("base64");
const bookmarklet = [
    "javascript:(function(){",
    "var b='", base64Source, "';",
    "var s=atob(b);",
    "var a=new Uint8Array(s.length);",
    "for(var i=0;i<s.length;i++){a[i]=s.charCodeAt(i);}",
    "var c=new TextDecoder('utf-8').decode(a);",
    "var w=window;",
    "try{if(window.top&&window.top.document){w=window.top;}}catch(e){}",
    "try{var x=w.document.createElement('script');x.textContent=c+'\\n//# sourceURL=njupt-evaluation-helper.js';w.document.documentElement.appendChild(x);x.parentNode.removeChild(x);}catch(e){w.eval(c);}",
    "}())"
].join("");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NJUPT 评教助手安装</title>
    <style>
        :root {
            --page: #f6f8fa;
            --card: #ffffff;
            --ink: #172033;
            --muted: #66758a;
            --line: #dde5ee;
            --soft: #f8fafc;
            --brand: #205783;
            --brand-dark: #174461;
            --accent: #2e7a61;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif;
            color: var(--ink);
            background:
                linear-gradient(180deg, #fbfcfd 0%, var(--page) 100%);
        }

        main {
            width: min(760px, calc(100% - 32px));
            margin: 0 auto;
            padding: 56px 0;
        }

        .card {
            border: 1px solid var(--line);
            border-radius: 14px;
            background: var(--card);
            box-shadow: 0 20px 54px rgba(31, 45, 61, 0.08);
        }

        .intro {
            padding: 42px 44px 22px;
        }

        .kicker {
            color: var(--accent);
            font-size: 14px;
            font-weight: 700;
        }

        h1 {
            margin: 14px 0 0;
            font-size: clamp(34px, 7vw, 48px);
            line-height: 1.15;
            letter-spacing: 0;
        }

        p {
            margin: 0;
            line-height: 1.7;
        }

        .lead {
            margin-top: 14px;
            color: var(--muted);
            font-size: 17px;
        }

        .install-box {
            margin: 0 44px 30px;
            padding: 24px;
            border: 1px solid #c8d8e6;
            border-radius: 12px;
            background: var(--soft);
            text-align: center;
        }

        .install-title {
            font-size: 21px;
            font-weight: 800;
        }

        .install-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: 18px;
            min-width: 210px;
            min-height: 56px;
            padding: 16px 22px;
            border-radius: 8px;
            color: #ffffff;
            background: var(--brand);
            box-shadow: 0 12px 24px rgba(32, 87, 131, 0.2);
            text-decoration: none;
            font-size: 18px;
            font-weight: 800;
            transition: transform 140ms ease, background 140ms ease, box-shadow 140ms ease;
            user-select: none;
            cursor: grab;
        }

        .install-link:hover {
            background: var(--brand-dark);
            box-shadow: 0 16px 34px rgba(32, 85, 127, 0.28);
            transform: translateY(-1px);
        }

        .install-link:active {
            cursor: grabbing;
        }

        .install-tip {
            max-width: 520px;
            margin: 16px auto 0;
            color: var(--muted);
            font-size: 15px;
        }

        .flow {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            border-top: 1px solid var(--line);
            border-bottom: 1px solid var(--line);
        }

        .flow-item {
            padding: 24px 26px;
            border-right: 1px solid var(--line);
        }

        .flow-item:last-child {
            border-right: 0;
        }

        .number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            margin-bottom: 12px;
            border-radius: 999px;
            color: #ffffff;
            background: var(--accent);
            font-weight: 700;
        }

        .flow-title {
            font-size: 17px;
            font-weight: 800;
        }

        .flow-text {
            margin-top: 8px;
            color: var(--muted);
            font-size: 14px;
        }

        .panel {
            padding: 22px 44px;
            color: var(--muted);
            background: #fbfcfd;
        }

        details {
            padding: 0 44px 34px;
            background: #fbfdff;
        }

        summary {
            cursor: pointer;
            font-weight: 700;
            color: var(--ink);
        }

        details p {
            margin-top: 10px;
            color: var(--muted);
            font-size: 14px;
        }

        textarea {
            width: 100%;
            min-height: 118px;
            margin-top: 14px;
            padding: 12px;
            border: 1px solid var(--line);
            border-radius: 8px;
            color: #263244;
            background: #ffffff;
            font-family: Consolas, "Courier New", monospace;
            font-size: 12px;
            line-height: 1.45;
            resize: vertical;
        }

        @media (max-width: 760px) {
            main {
                width: min(100% - 20px, 760px);
                padding: 18px 0;
            }

            .intro {
                padding: 28px 24px 18px;
            }

            .install-box {
                margin: 0 24px 24px;
                padding: 22px 18px;
            }

            .flow {
                grid-template-columns: 1fr;
            }

            .flow-item {
                padding: 20px 24px;
                border-right: 0;
                border-bottom: 1px solid var(--line);
            }

            .flow-item:last-child {
                border-bottom: 0;
            }

            .panel,
            details {
                padding-left: 24px;
                padding-right: 24px;
            }
        }
    </style>
</head>
<body>
    <main>
        <div class="card">
            <section class="intro">
                <div class="kicker">NJUPT 评教助手</div>
                <h1>把按钮拖到书签栏</h1>
                <p class="lead">安装一次即可。以后打开评教页面，点击书签栏里的按钮运行。</p>
            </section>
            <section class="install-box" aria-label="安装书签">
                <div class="install-title">按住下面这个按钮，拖到浏览器顶部书签栏</div>
                <a class="install-link" href="${escapeHtml(bookmarklet)}" onclick="alert('不要点击这个按钮。请按住它，拖到浏览器顶部的书签栏。'); return false;">NJUPT 评教助手</a>
                <p class="install-tip">不要点击按钮；要按住拖动。书签栏没显示时，先按 Ctrl + Shift + B。</p>
            </section>
            <section class="flow" aria-label="使用步骤">
                <div class="flow-item">
                    <div class="number">1</div>
                    <div class="flow-title">拖好书签</div>
                    <p class="flow-text">书签栏里出现 NJUPT 评教助手。</p>
                </div>
                <div class="flow-item">
                    <div class="number">2</div>
                    <div class="flow-title">打开评教页面</div>
                    <p class="flow-text">进入课程评价或教学质量评价。</p>
                </div>
                <div class="flow-item">
                    <div class="number">3</div>
                    <div class="flow-title">点击书签运行</div>
                    <p class="flow-text">前面的课程自动提交，最后一页手动确认。</p>
                </div>
            </section>
            <div class="panel">
                <p>脚本更新后，重新打开新版安装页并重新拖一次书签。</p>
            </div>
            <details>
                <summary>不能拖拽时展开备用安装方式</summary>
                <p>新建一个书签，把下面这一整段复制到书签的网址 / URL 字段。</p>
                <textarea readonly>${escapeHtml(bookmarklet)}</textarea>
            </details>
        </div>
    </main>
</body>
</html>
`;

fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(bookmarkletPath, bookmarklet + "\n", "utf8");
fs.writeFileSync(installPath, html, "utf8");
fs.writeFileSync(pagesInstallPath, html, "utf8");

console.log("Generated " + path.relative(rootDir, bookmarkletPath));
console.log("Generated " + path.relative(rootDir, installPath));
console.log("Generated " + path.relative(rootDir, pagesInstallPath));
