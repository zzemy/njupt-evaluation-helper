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

默认只会填写当前页面，不会自动提交。确认无误后可以手动提交。

如果确认要自动提交全部课程，先执行完整脚本加载入口函数，然后运行：

```js
runNjuptEvaluation({ autoSubmit: true })
```

如果自动识别页面类型失败，可以手动指定：

```js
runNjuptEvaluation({ type: "course" })
runNjuptEvaluation({ type: "teachingQuality" })
```

旧脚本 `course-evaluation.js` 和 `teaching-quality-evaluation.js` 仍然保留，可以继续按原来的方式复制执行。

## 注意事项

- `evaluation-helper.js` 默认不自动提交，避免误操作。
- `course-evaluation.js` 用于课程评价，不要和教学质量评价页面混用。
- `teaching-quality-evaluation.js` 用于教学质量评价，不要和课程评价页面混用。
- 如果页面结构发生变化，脚本可能需要调整。
- 运行前建议先确认当前页面和脚本类型一致。
