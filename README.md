# NJUPT Evaluation Helper

用于南京邮电大学评教页面的浏览器控制台辅助脚本。

## 文件说明

- `evaluation-helper.js`：推荐使用的统一入口脚本，可自动识别课程评价和教学质量评价页面。
- `course-evaluation.js`：课程评价脚本。
- `teaching-quality-evaluation.js`：教学质量评价脚本。

脚本会跳过课程选择下拉框，只处理评价题目的下拉框。遇到一门课有多个老师时，会按题组生成不同的选项组合，避免多个老师的评价结果完全相同而无法提交。

## 使用方式

推荐使用 `evaluation-helper.js`：

1. 打开对应的评教页面。
2. 按 `F12` 打开浏览器开发者工具。
3. 进入 `Console`。
4. 复制 `evaluation-helper.js` 的完整内容并粘贴执行。

默认会自动填写并提交前面的课程，直到最后一页时停止。最后一页只会填写选项，请确认后手动提交。

`evaluation-helper.js` 内置了基础的 `debugger` 防暂停保护，会尽量拦截后续创建的反调试定时器和动态 `debugger` 代码。如果打开开发者工具时页面已经暂停，先按一次 `F8` 继续运行，再粘贴脚本执行。

如果只想填写当前页面、不自动提交，可以把脚本最后一行的：

```js
runNjuptEvaluation();
```

改成：

```js
runNjuptEvaluation({ autoSubmit: false });
```

如果确认最后一页也要自动提交，可以把最后一行改成：

```js
runNjuptEvaluation({ leaveLastForManual: false });
```

如果自动识别页面类型失败，可以手动指定：

```js
runNjuptEvaluation({ type: "course" })
runNjuptEvaluation({ type: "teachingQuality" })
```

旧脚本 `course-evaluation.js` 和 `teaching-quality-evaluation.js` 仍然保留，可以继续按原来的方式复制执行。

## 注意事项

- `evaluation-helper.js` 默认会自动提交前面的课程，但最后一页会停下，方便手动确认。
- `course-evaluation.js` 用于课程评价，不要和教学质量评价页面混用。
- `teaching-quality-evaluation.js` 用于教学质量评价，不要和课程评价页面混用。
- 如果页面结构发生变化，脚本可能需要调整。
- 运行前建议先确认当前页面和脚本类型一致。
