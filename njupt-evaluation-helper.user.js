// ==UserScript==
// @name         NJUPT Evaluation Helper
// @namespace    https://github.com/zzemy/njupt-evaluation-helper
// @version      0.1.0
// @description  南京邮电大学评教助手：点击按钮后自动处理到最后一页，最后一页保留手动提交。
// @author       zzemy
// @match        *://jwxt.njupt.edu.cn/*
// @match        *://jwxk.njupt.edu.cn/*
// @run-at       document-idle
// @noframes
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    var helperUrl = "https://cdn.jsdelivr.net/gh/zzemy/njupt-evaluation-helper@main/evaluation-helper.js";
    var buttonId = "njupt-evaluation-helper-button";

    function setButtonState(button, text, disabled) {
        button.textContent = text;
        button.disabled = disabled;
        button.style.opacity = disabled ? "0.72" : "1";
        button.style.cursor = disabled ? "default" : "pointer";
    }

    function loadAndRun(button) {
        setButtonState(button, "加载中...", true);

        if (typeof window.runNjuptEvaluation === "function") {
            window.runNjuptEvaluation();
            setButtonState(button, "已运行", false);
            return;
        }

        fetch(helperUrl + "?t=" + Date.now())
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }

                return response.text();
            })
            .then(function (code) {
                (0, eval)(code);
                setButtonState(button, "已运行", false);
            })
            .catch(function (error) {
                console.error("NJUPT Evaluation Helper 加载失败：", error);
                setButtonState(button, "加载失败", false);
                alert("评教助手加载失败，请检查网络后重试。");
            });
    }

    function createButton() {
        if (document.getElementById(buttonId)) {
            return;
        }

        var button = document.createElement("button");
        button.id = buttonId;
        button.type = "button";
        button.textContent = "评教助手";
        button.title = "自动填写并提交前面的课程，最后一页保留手动提交";
        button.style.position = "fixed";
        button.style.right = "16px";
        button.style.bottom = "16px";
        button.style.zIndex = "2147483647";
        button.style.padding = "8px 12px";
        button.style.border = "1px solid #1f4e79";
        button.style.borderRadius = "4px";
        button.style.background = "#1f4e79";
        button.style.color = "#ffffff";
        button.style.fontSize = "14px";
        button.style.lineHeight = "1.4";
        button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.18)";
        button.style.cursor = "pointer";

        button.onclick = function () {
            loadAndRun(button);
        };

        document.documentElement.appendChild(button);
    }

    createButton();
})();
