(function () {
    "use strict";

    var PAGE_TYPES = {
        course: {
            label: "课程评价",
            bestTexts: ["完全认同"],
            secondBestTexts: ["相对认同"]
        },
        teachingQuality: {
            label: "教学质量评价",
            bestTexts: ["好"],
            secondBestTexts: ["较好"]
        }
    };

    var COMMON_QUESTION_COUNTS = [20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4];
    var internalSetTimeout = window.setTimeout.bind(window);
    var internalClearTimeout = window.clearTimeout.bind(window);
    var internalRequestAnimationFrame = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : null;
    var internalCancelAnimationFrame = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : null;

    function scheduleInternalDelay(callback, delayMs) {
        if (!internalRequestAnimationFrame || !internalCancelAnimationFrame) {
            var timeoutId = internalSetTimeout(callback, delayMs);
            return {
                cancel: function () {
                    internalClearTimeout(timeoutId);
                }
            };
        }

        var startedAt = Date.now();
        var frameId = null;
        var cancelled = false;

        function tick() {
            if (cancelled) {
                return;
            }

            if (Date.now() - startedAt >= delayMs) {
                callback();
                return;
            }

            frameId = internalRequestAnimationFrame(tick);
        }

        frameId = internalRequestAnimationFrame(tick);

        return {
            cancel: function () {
                cancelled = true;
                if (frameId !== null) {
                    internalCancelAnimationFrame(frameId);
                }
            }
        };
    }

    function removeDebuggerStatements(code) {
        return String(code).replace(/\bdebugger\s*;?/g, "");
    }

    function shouldBlockTimerHandler(handler) {
        return typeof handler === "function" && /\bdebugger\b/.test(Function.prototype.toString.call(handler));
    }

    function installDebuggerGuard(targetWindow) {
        targetWindow = targetWindow || window;

        if (targetWindow.__njuptEvaluationDebuggerGuardInstalled) {
            return;
        }

        targetWindow.__njuptEvaluationDebuggerGuardInstalled = true;

        var nativeSetInterval = targetWindow.setInterval;
        var nativeSetTimeout = targetWindow.setTimeout;
        var nativeFunction = targetWindow.Function;
        var nativeEval = targetWindow.eval;

        targetWindow.setInterval = function (handler, timeout) {
            if (shouldBlockTimerHandler(handler)) {
                console.warn("已拦截包含 debugger 的 setInterval。");
                return 0;
            }

            if (typeof handler === "string" && /\bdebugger\b/.test(handler)) {
                arguments[0] = removeDebuggerStatements(handler);
            }

            return nativeSetInterval.apply(targetWindow, arguments);
        };

        targetWindow.setTimeout = function (handler, timeout) {
            if (shouldBlockTimerHandler(handler)) {
                console.warn("已拦截包含 debugger 的 setTimeout。");
                return 0;
            }

            if (typeof handler === "string" && /\bdebugger\b/.test(handler)) {
                arguments[0] = removeDebuggerStatements(handler);
            }

            return nativeSetTimeout.apply(targetWindow, arguments);
        };

        targetWindow.Function = function () {
            if (arguments.length > 0) {
                arguments[arguments.length - 1] = removeDebuggerStatements(arguments[arguments.length - 1]);
            }

            return nativeFunction.apply(this, arguments);
        };
        targetWindow.Function.prototype = nativeFunction.prototype;

        targetWindow.eval = function (code) {
            return nativeEval.call(targetWindow, removeDebuggerStatements(code));
        };

        console.log("已启用 debugger 防暂停保护。若页面已经暂停，请先按 F8 继续一次。");
    }

    function installDebuggerGuards() {
        installDebuggerGuard(window);

        for (var i = 0; i < window.frames.length; i++) {
            try {
                installDebuggerGuard(window.frames[i]);
            } catch (error) {
                console.warn("无法为 iframe 安装 debugger 防暂停保护。", error);
            }
        }
    }

    function toArray(list) {
        return Array.prototype.slice.call(list);
    }

    function getTargetDocument() {
        try {
            if (window.frames && window.frames["iframeautoheight"] && window.frames["iframeautoheight"].document) {
                return window.frames["iframeautoheight"].document;
            }
        } catch (error) {
            console.warn("无法访问 iframeautoheight，将尝试使用当前页面 document。", error);
        }

        var iframe = document.getElementById("iframeautoheight") || document.querySelector("iframe[name='iframeautoheight']");
        if (iframe && iframe.contentDocument) {
            return iframe.contentDocument;
        }

        return document;
    }

    function getOptionText(option) {
        return (option.textContent || option.innerText || "").replace(/\s+/g, "").trim();
    }

    function optionTextMatches(option, texts) {
        var optionText = getOptionText(option);

        for (var i = 0; i < texts.length; i++) {
            if (optionText === texts[i]) {
                return true;
            }
        }

        return false;
    }

    function selectHasAnyText(select, texts) {
        var options = toArray(select.options || []);

        for (var i = 0; i < options.length; i++) {
            if (optionTextMatches(options[i], texts)) {
                return true;
            }
        }

        return false;
    }

    function scorePageType(selects, config) {
        var score = 0;

        for (var i = 0; i < selects.length; i++) {
            if (selectHasAnyText(selects[i], config.bestTexts)) {
                score++;
            }

            if (selectHasAnyText(selects[i], config.secondBestTexts)) {
                score++;
            }
        }

        return score;
    }

    function detectPageType(selects, requestedType) {
        if (requestedType && PAGE_TYPES[requestedType]) {
            return PAGE_TYPES[requestedType];
        }

        var bestType = null;
        var bestScore = 0;

        for (var type in PAGE_TYPES) {
            if (Object.prototype.hasOwnProperty.call(PAGE_TYPES, type)) {
                var score = scorePageType(selects, PAGE_TYPES[type]);
                if (score > bestScore) {
                    bestType = PAGE_TYPES[type];
                    bestScore = score;
                }
            }
        }

        return bestType;
    }

    function findCourseSelect(doc, selects, config) {
        var courseSelect = doc.getElementById("pjkc");
        if (courseSelect) {
            return courseSelect;
        }

        for (var i = 0; i < selects.length; i++) {
            var select = selects[i];
            var idOrName = ((select.id || "") + " " + (select.name || "")).toLowerCase();

            if (idOrName.indexOf("pjkc") !== -1 || idOrName.indexOf("kc") !== -1 || idOrName.indexOf("course") !== -1) {
                return select;
            }
        }

        for (var j = 0; j < selects.length; j++) {
            if (!selectHasAnyText(selects[j], config.bestTexts) && !selectHasAnyText(selects[j], config.secondBestTexts)) {
                return selects[j];
            }
        }

        return null;
    }

    function getEvaluationSelects(selects, courseSelect, config) {
        var evaluationSelects = [];

        for (var i = 0; i < selects.length; i++) {
            var select = selects[i];

            if (select.disabled || select === courseSelect) {
                continue;
            }

            if (selectHasAnyText(select, config.bestTexts) || selectHasAnyText(select, config.secondBestTexts)) {
                evaluationSelects.push(select);
            }
        }

        return evaluationSelects;
    }

    function inferQuestionCount(total) {
        for (var i = 0; i < COMMON_QUESTION_COUNTS.length; i++) {
            var count = COMMON_QUESTION_COUNTS[i];
            if (total > count && total % count === 0) {
                return count;
            }
        }

        return total;
    }

    function dispatchChange(select) {
        if (typeof Event === "function") {
            select.dispatchEvent(new Event("change", { bubbles: true }));
            return;
        }

        var event = select.ownerDocument.createEvent("HTMLEvents");
        event.initEvent("change", true, false);
        select.dispatchEvent(event);
    }

    function setSelectByText(select, texts) {
        var options = toArray(select.options || []);

        for (var i = 0; i < options.length; i++) {
            if (optionTextMatches(options[i], texts)) {
                select.value = options[i].value;
                dispatchChange(select);
                return true;
            }
        }

        console.warn("未找到匹配选项：", texts, select);
        return false;
    }

    function fillEvaluationSelects(selects, config, round) {
        var questionCount = inferQuestionCount(selects.length);
        var groupCount = Math.ceil(selects.length / questionCount);
        var filled = 0;

        for (var groupIndex = 0; groupIndex < groupCount; groupIndex++) {
            var start = groupIndex * questionCount;
            var end = Math.min(start + questionCount, selects.length);
            var groupLength = end - start;
            var secondBestIndex = (round + groupIndex) % groupLength;

            for (var i = start; i < end; i++) {
                var texts = i - start === secondBestIndex ? config.secondBestTexts : config.bestTexts;
                if (setSelectByText(selects[i], texts)) {
                    filled++;
                }
            }
        }

        return {
            filled: filled,
            total: selects.length,
            questionCount: questionCount,
            groupCount: groupCount
        };
    }

    function findSubmitButton(doc) {
        var button = doc.getElementById("Button1");
        if (button) {
            return button;
        }

        var candidates = toArray(doc.querySelectorAll("button,input[type='button'],input[type='submit']"));
        var texts = ["提交", "保存", "下一门", "下一步"];

        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            var label = ((candidate.value || candidate.textContent || candidate.innerText || "") + "").replace(/\s+/g, "");

            for (var j = 0; j < texts.length; j++) {
                if (label.indexOf(texts[j]) !== -1) {
                    return candidate;
                }
            }
        }

        return null;
    }

    function fillCurrentPage(options, round) {
        var doc = getTargetDocument();
        if (doc.defaultView) {
            installDebuggerGuard(doc.defaultView);
        }

        var selects = toArray(doc.getElementsByTagName("select"));
        var config = detectPageType(selects, options.type);

        if (!config) {
            console.warn("无法识别当前评教页面类型，请尝试指定 type：course 或 teachingQuality。");
            return null;
        }

        var courseSelect = findCourseSelect(doc, selects, config);
        var evaluationSelects = getEvaluationSelects(selects, courseSelect, config);

        if (evaluationSelects.length === 0) {
            console.warn("没有找到可填写的评价下拉框。");
            return null;
        }

        var result = fillEvaluationSelects(evaluationSelects, config, round);
        result.doc = doc;
        result.config = config;
        result.courseCount = courseSelect ? courseSelect.options.length : 1;

        console.log(
            "已填写",
            config.label,
            "：",
            result.filled,
            "/",
            result.total,
            "个选项；识别到",
            result.groupCount,
            "组评价题。"
        );

        return result;
    }

    function runNjuptEvaluation(options) {
        options = options || {};

        var autoSubmit = options.autoSubmit !== false;
        var leaveLastForManual = options.leaveLastForManual !== false;
        var intervalMs = typeof options.intervalMs === "number" ? options.intervalMs : 1500;
        var processed = 0;
        var totalCourses = null;
        var task = null;
        var stopped = false;

        if (!autoSubmit) {
            fillCurrentPage(options, processed);
            console.log("已关闭自动提交。如需自动处理课程并在最后一页停下，请运行：runNjuptEvaluation()");
            return;
        }

        function stop(message) {
            stopped = true;

            if (task) {
                task.cancel();
            }

            if (message) {
                console.log(message);
            }
        }

        function scheduleNextStep() {
            if (!stopped) {
                task = scheduleInternalDelay(step, intervalMs);
            }
        }

        function step() {
            if (stopped) {
                return;
            }

            if (!leaveLastForManual && totalCourses !== null && processed >= totalCourses) {
                stop("评价流程已结束。");
                return;
            }

            var result = fillCurrentPage(options, processed);
            if (!result) {
                stop("填写失败，已停止自动提交。");
                return;
            }

            if (totalCourses === null) {
                totalCourses = result.courseCount;
                console.log("共识别到", totalCourses, "门课程。将自动提交前面的课程，最后一页保留手动提交。");
            }

            if (leaveLastForManual && processed >= totalCourses - 1) {
                stop("最后一页已填写完成，请确认后手动提交。");
                return;
            }

            var button = findSubmitButton(result.doc);
            if (!button) {
                stop("未找到提交按钮，已停止自动提交。");
                return;
            }

            button.click();
            processed++;
            console.log("自动提交进度：", processed, "/", leaveLastForManual ? totalCourses - 1 : totalCourses);

            if (!leaveLastForManual && processed >= totalCourses) {
                stop("评价流程已结束。");
                return;
            }

            console.log("等待下一页加载，约", intervalMs, "ms 后继续。");
            scheduleNextStep();
        }

        step();
    }

    window.runNjuptEvaluation = runNjuptEvaluation;
    installDebuggerGuards();
    runNjuptEvaluation();
})();
