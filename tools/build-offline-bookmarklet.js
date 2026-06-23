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
const bookmarklet = "javascript:(function(){eval(decodeURIComponent(\"" + encodeURIComponent(source) + "\"));}())";

const html = `<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>NJUPT 评教助手安装</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, "Microsoft YaHei", sans-serif;
            color: #1f2933;
            background: #f5f7fa;
        }

        main {
            max-width: 760px;
            margin: 0 auto;
            padding: 48px 20px;
        }

        h1 {
            margin: 0 0 12px;
            font-size: 28px;
        }

        p {
            line-height: 1.7;
        }

        .install-link {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 16px;
            border-radius: 6px;
            color: #ffffff;
            background: #1f4e79;
            text-decoration: none;
            font-weight: 700;
        }

        .panel {
            margin-top: 20px;
            padding: 16px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #ffffff;
        }

        textarea {
            width: 100%;
            min-height: 120px;
            box-sizing: border-box;
            font-family: Consolas, monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <main>
        <h1>NJUPT 评教助手</h1>
        <p>把下面的蓝色按钮拖到浏览器书签栏。以后打开评教页面，点击这个书签即可运行脚本。</p>
        <a class="install-link" href="${escapeHtml(bookmarklet)}">NJUPT 评教助手</a>
        <div class="panel">
            <p>如果不能拖拽，新建一个书签，把下面这一整段复制到书签的网址 / URL 字段。</p>
            <textarea readonly>${escapeHtml(bookmarklet)}</textarea>
        </div>
        <div class="panel">
            <p>这个安装页是离线版，不依赖油猴、GitHub 或 CDN。脚本更新后需要重新打开新版安装页并重新拖一次书签。</p>
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
