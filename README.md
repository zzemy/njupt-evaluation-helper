# NJUPT Evaluation Helper

用于南京邮电大学评教页面的浏览器控制台辅助脚本。

## 文件说明

- `evaluation-helper.js`：推荐使用的统一入口脚本，可自动识别课程评价和教学质量评价页面。
- `course-evaluation.js`：课程评价脚本。
- `teaching-quality-evaluation.js`：教学质量评价脚本。

脚本会跳过课程选择下拉框，只处理评价题目的下拉框。遇到一门课有多个老师时，会按题组生成不同的选项组合，避免多个老师的评价结果完全相同而无法提交。

## 推荐使用方式

最简约、最不依赖网络和浏览器扩展的方式是离线书签：

1. 打开 `install.html`。
2. 把页面里的 `NJUPT 评教助手` 蓝色按钮拖到浏览器书签栏。
3. 以后打开评教页面，点击这个书签即可运行脚本。

如果书签栏没显示，可以先按 `Ctrl + Shift + B` 显示书签栏。

这个方式不依赖油猴、GitHub 或 CDN。脚本更新后，需要重新打开新版 `install.html` 并重新拖一次书签。

如果修改了 `evaluation-helper.js`，需要重新生成离线书签：

```powershell
node .\tools\build-offline-bookmarklet.js
```

## 油猴方式

推荐使用 Tampermonkey / Violentmonkey，安装一次，每学期期末直接点页面右下角按钮即可：

1. 安装 Tampermonkey 或 Violentmonkey 浏览器扩展。
2. 打开 `njupt-evaluation-helper.user.js` 的 raw 地址：
   <https://raw.githubusercontent.com/zzemy/njupt-evaluation-helper/main/njupt-evaluation-helper.user.js>
3. 扩展会提示安装脚本，确认安装。
4. 打开南邮教务评教页面，右下角会出现“评教助手”按钮。
5. 点击按钮运行脚本。

脚本不会进入页面就自动执行，只会显示按钮。点击按钮后，默认会自动填写并提交前面的课程，直到最后一页时停止。最后一页只会填写选项，请确认后手动提交。

## 书签方式

推荐保存成浏览器书签，后续在评教页面点一下书签即可运行：

1. 打开 `dist/evaluation-helper.bookmarklet.txt`。
2. 复制里面以 `javascript:` 开头的完整内容。
3. 新建一个浏览器书签，名称例如 `NJUPT 评教助手`。
4. 把复制的内容粘贴到书签的网址 / URL 字段。
5. 打开评教页面后，点击这个书签运行脚本。

这个书签会从 GitHub CDN 加载最新版 `evaluation-helper.js`，以后脚本更新后通常不需要重新保存书签。

如果书签加载失败，也可以在控制台执行这一行：

```js
fetch("https://raw.githubusercontent.com/zzemy/njupt-evaluation-helper/main/evaluation-helper.js?t=" + Date.now()).then(function (res) { return res.text(); }).then(function (code) { (0, eval)(code); });
```

## 控制台完整脚本方式

推荐使用 `evaluation-helper.js`：

1. 打开对应的评教页面。
2. 按 `F12` 打开浏览器开发者工具。
3. 进入 `Console`。
4. 复制 `evaluation-helper.js` 的完整内容并粘贴执行。

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

## 本地测试

如果真实评教入口已经消失，可以用本地模拟页测试：

1. 用浏览器打开 `test/evaluation-helper-test.html`。
2. 选择“课程评价”或“教学质量评价”模拟场景。
3. 打开开发者工具的 `Console`。
4. 粘贴执行 `evaluation-helper.js` 的完整内容。

默认应自动提交前两门课，并在第三门课填好后停下，等待手动提交。左侧“提交记录”会显示模拟提交进度。

## 注意事项

- `evaluation-helper.js` 默认会自动提交前面的课程，但最后一页会停下，方便手动确认。
- `course-evaluation.js` 用于课程评价，不要和教学质量评价页面混用。
- `teaching-quality-evaluation.js` 用于教学质量评价，不要和课程评价页面混用。
- 如果页面结构发生变化，脚本可能需要调整。
- 运行前建议先确认当前页面和脚本类型一致。
