const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "evaluation-helper.js");
const distDir = path.join(rootDir, "dist");
const bookmarkletPath = path.join(distDir, "evaluation-helper.offline-bookmarklet.txt");
const installPath = path.join(rootDir, "install.html");

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
            --page: #eef2f6;
            --paper: #ffffff;
            --ink: #17212f;
            --muted: #66758a;
            --line: #d9e1ea;
            --brand: #20557f;
            --brand-dark: #173f60;
            --accent: #2f7d62;
            --soft: #f7fafc;
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
                radial-gradient(circle at top left, rgba(47, 125, 98, 0.12), transparent 28rem),
                linear-gradient(135deg, #f8fafc 0%, var(--page) 58%, #e7edf3 100%);
        }

        main {
            width: min(920px, calc(100% - 40px));
            margin: 0 auto;
            padding: 56px 0;
        }

        .shell {
            border: 1px solid rgba(23, 33, 47, 0.1);
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.88);
            box-shadow: 0 24px 70px rgba(36, 55, 78, 0.12);
            overflow: hidden;
        }

        .hero {
            display: grid;
            grid-template-columns: 1.35fr 0.9fr;
            gap: 32px;
            padding: 38px;
            align-items: center;
        }

        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
            color: var(--accent);
            font-size: 13px;
            font-weight: 700;
        }

        .eyebrow::before {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: var(--accent);
        }

        h1 {
            margin: 0;
            font-size: clamp(32px, 5vw, 54px);
            line-height: 1.05;
            letter-spacing: 0;
        }

        p {
            margin: 0;
            line-height: 1.7;
        }

        .lead {
            max-width: 620px;
            margin-top: 18px;
            color: var(--muted);
            font-size: 17px;
        }

        .install-link {
            display: inline-block;
            margin-top: 26px;
            padding: 14px 20px;
            border-radius: 8px;
            color: #ffffff;
            background: var(--brand);
            box-shadow: 0 12px 28px rgba(32, 85, 127, 0.24);
            text-decoration: none;
            font-weight: 700;
            transition: transform 140ms ease, background 140ms ease, box-shadow 140ms ease;
            user-select: none;
        }

        .install-link:hover {
            background: var(--brand-dark);
            box-shadow: 0 16px 34px rgba(32, 85, 127, 0.28);
            transform: translateY(-1px);
        }

        .browser-card {
            border: 1px solid var(--line);
            border-radius: 14px;
            background: var(--soft);
            overflow: hidden;
        }

        .browser-top {
            display: flex;
            gap: 7px;
            padding: 13px 15px;
            border-bottom: 1px solid var(--line);
            background: #f1f5f9;
        }

        .browser-dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: #b8c3cf;
        }

        .bookmark-bar {
            padding: 18px;
        }

        .bookmark {
            display: inline-block;
            padding: 11px 13px;
            border-radius: 8px;
            color: #ffffff;
            background: var(--brand);
            font-weight: 700;
            font-size: 14px;
        }

        .hint {
            margin-top: 14px;
            color: var(--muted);
            font-size: 14px;
        }

        .steps {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1px;
            border-top: 1px solid var(--line);
            background: var(--line);
        }

        .step {
            padding: 24px;
            background: #ffffff;
        }

        .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            margin-bottom: 14px;
            border-radius: 999px;
            color: #ffffff;
            background: var(--accent);
            font-weight: 700;
        }

        .step-title {
            margin-bottom: 8px;
            font-weight: 700;
        }

        .step-text {
            color: var(--muted);
            font-size: 14px;
        }

        .panel {
            padding: 24px;
            border-top: 1px solid var(--line);
            background: #fbfdff;
            color: var(--muted);
        }

        details {
            padding: 0 24px 26px;
            background: #fbfdff;
        }

        summary {
            cursor: pointer;
            font-weight: 700;
            color: var(--ink);
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
                width: min(100% - 24px, 920px);
                padding: 24px 0;
            }

            .hero {
                grid-template-columns: 1fr;
                padding: 26px;
            }

            .steps {
                grid-template-columns: 1fr;
            }

            .step {
                padding: 20px 24px;
            }
        }
    </style>
</head>
<body>
    <main>
        <div class="shell">
            <section class="hero">
                <div>
                    <div class="eyebrow">离线书签安装</div>
                    <h1>NJUPT 评教助手</h1>
                    <p class="lead">把按钮拖到浏览器书签栏。以后打开评教页面点一次书签即可运行，不需要打开控制台，也不依赖油猴、GitHub 或 CDN。</p>
                    <a class="install-link" href="${escapeHtml(bookmarklet)}">NJUPT 评教助手</a>
                </div>
                <div class="browser-card" aria-hidden="true">
                    <div class="browser-top">
                        <span class="browser-dot"></span>
                        <span class="browser-dot"></span>
                        <span class="browser-dot"></span>
                    </div>
                    <div class="bookmark-bar">
                        <span class="bookmark">NJUPT 评教助手</span>
                        <p class="hint">拖到书签栏后保留这个小按钮。</p>
                    </div>
                </div>
            </section>
            <section class="steps" aria-label="安装步骤">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-title">拖到书签栏</div>
                    <p class="step-text">如果书签栏没显示，先按 Ctrl + Shift + B。</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-title">打开评教页面</div>
                    <p class="step-text">进入课程评价或教学质量评价页面。</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-title">点击书签运行</div>
                    <p class="step-text">前面的课程自动提交，最后一页保留手动确认。</p>
                </div>
            </section>
            <div class="panel">
                <p>脚本更新后，重新打开新版安装页并重新拖一次书签即可。</p>
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
fs.writeFileSync(bookmarkletPath, bookmarklet + "\n", "utf8");
fs.writeFileSync(installPath, html, "utf8");

console.log("Generated " + path.relative(rootDir, bookmarkletPath));
console.log("Generated " + path.relative(rootDir, installPath));
