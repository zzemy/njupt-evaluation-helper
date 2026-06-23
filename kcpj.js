var obj = frames['iframeautoheight'].contentDocument.getElementById("pjkc")
var length = obj.options.length
console.log("你有", length, "门课程需要进行课程评价")
var finished = 0;

function getEvaluationSelects(doc) {
    return Array.prototype.slice.call(doc.getElementsByTagName("select")).filter(function (select, index) {
        return index > 0 && select.id !== "pjkc" && !select.disabled;
    });
}

function inferQuestionCount(total) {
    var commonQuestionCounts = [20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4];

    for (var i = 0; i < commonQuestionCounts.length; i++) {
        var count = commonQuestionCounts[i];
        if (total > count && total % count === 0) {
            return count;
        }
    }

    return total;
}

function setSelectValue(select, value) {
    select.value = value;

    if (typeof Event === "function") {
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return;
    }

    var event = select.ownerDocument.createEvent("HTMLEvents");
    event.initEvent("change", true, false);
    select.dispatchEvent(event);
}

function fillEvaluationSelects(selects, bestValue, secondBestValue, round) {
    var questionCount = inferQuestionCount(selects.length);
    var groupCount = Math.ceil(selects.length / questionCount);

    for (var groupIndex = 0; groupIndex < groupCount; groupIndex++) {
        var start = groupIndex * questionCount;
        var end = Math.min(start + questionCount, selects.length);
        var groupLength = end - start;
        var secondBestIndex = (round + groupIndex) % groupLength;

        for (var i = start; i < end; i++) {
            setSelectValue(selects[i], i - start === secondBestIndex ? secondBestValue : bestValue);
        }
    }
}

var task = window.setInterval(function () {
    // 结束条件
    if (finished >= length) {
        window.clearInterval(task);
        console.log("所有评价已完成");
        return;
    }
  
    var doc = frames['iframeautoheight'].contentDocument;
    var evaluationSelects = getEvaluationSelects(doc);
    fillEvaluationSelects(evaluationSelects, "完全认同", "相对认同", finished);
  
    finished++;
  
    // 防止最后一次溢出报错，加个判断
    var btn = doc.getElementById("Button1");
    if(btn) btn.click();
  
    console.log("任务进度：", finished, " / ", length, " 门课");
}, 1000);
