# Automatic-operation 🎯

> **当前版本**：v5.3.0-78 · **代码行数**：8032 行（CSS ~2654 + JS ~5378）· **许可**：GPL-3.0

[油猴脚本（Tampermonkey）](https://www.tampermonkey.net/) — 在任意网页上自动操作（点击 / 填充 / 执行 JS）元素。纯 JavaScript 实现，8032 行（CSS ~2654 行 + JS 逻辑 ~5378 行），无外部依赖。

## 安装

[↑ 回到顶部](#automatic-operation-)

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 选择版本安装脚本，打开任意网页，左上角出现 **自动操作** 面板（初始为折叠状态）

| 版本 | 链接 | 说明 |
| --- | --- | --- |
| **正式版** | [点击安装](https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js) | OSS CDN，稳定版本 |
| **Dev 版** | [点击安装](https://github.com/sewolonX/Automatic-operation/raw/refs/heads/main/Automatic-operation.js) | GitHub 直链，随 `main` 分支更新 |

> **早期版本**：[Automatic-clicker.js](Automatic-clicker.js)（777 行）是单目标简化版自动点击器。

---

## 快速开始

[↑ 回到顶部](#automatic-operation-)

安装完成后，打开任意网页，左上角会出现一个**半透明的折叠面板**。点击面板可唤醒，展开后的完整操作面板如下：

```text
┌──────────────────────────────────┐
│ −/+  ▶/■           自动操作   ⑩  │ ← 标题栏
├──────────────────────────────────┤
│ 📄 </> ⚙ 🔄 ⚙   ← 5个页面按钮  │
├──────────────────────────────────┤
│                                  │
│   当前页面的内容（5页之一）       │
│                                  │
├──────────────────────────────────┤
│ 选取元素          [开始]         │ ← 操作按钮
│ 已操作：0次00:00:00  请选取或添加目标 │ ← 底部状态栏
└──────────────────────────────────┘

```

**三步上手**：① 点击「选取元素」→ ② 点击页面上的目标按钮/链接 → ③ 点击「开始」

---

## 键盘快捷键

[↑ 回到顶部](#automatic-operation-)

| 快捷键 | 作用位置 | 功能 |
| --- | --- | --- |
| `Ctrl + Enter` | JS 指令输入框（第 2 页） | 执行当前编写的 JS 代码（测试运行） |
| `↑` / `↓` | JS 指令输入框（第 2 页） | 浏览命令历史（上一条 / 下一条） |
| `Esc` | 配置下拉菜单 | 关闭配置切换菜单 |
| `Esc` | 确认对话框 | 取消确认（同点击取消按钮） |
| 自定义按键 | 全局（输入框未聚焦时） | 触发绑定的目标元素操作（v5.2.9+ 按键绑定功能） |

> **注意**：指令输入框中的 `↑`/`↓` 仅在输入框获得焦点时有效。`cmdHistory` 数组存储所有执行过的命令，`cmdHistoryIndex` 跟踪当前浏览位置。当 `cmdHistoryIndex === -1` 时，`↑` 回到最新历史记录。
>
> **按键绑定**：每个目标元素可绑定一个自定义按键组合（如 `Ctrl+K`、`F2`、`Shift+A` 等），在页面输入框未聚焦时按下即可触发该目标的操作（点击/填充/执行指令）。支持组合键（Ctrl/Alt/Shift/Meta+普通键），按键释放后有 150ms 容差窗口防止误触发。双击按键绑定输入框可清空绑定。详见[第十三课：按键绑定](#第十三课按键绑定)。

---

## 目录

[↑ 回到顶部](#automatic-operation-)

- [教程](#教程)
  - [第一课：首次自动点击](#第一课首次自动点击)
  - [第二课：匹配规则与元素查找](#第二课匹配规则与元素查找)
  - [第三课：多目标选取与操作策略](#第三课多目标选取与操作策略)
  - [第四课：自动填充输入框](#第四课自动填充输入框)
  - [第五课：JS 指令](#第五课js-指令)
  - [第六课：网络请求监测](#第六课网络请求监测)
  - [第七课：自动刷新与自动启动](#第七课自动刷新与自动启动)
  - [第八课：配置管理](#第八课配置管理)
  - [第九课：系统设置](#第九课系统设置)
  - [第十课：省电模式](#第十课省电模式)
  - [第十一课：面板交互细节](#第十一课面板交互细节)
  - [第十二课：元素设置面板详解](#第十二课元素设置面板详解)
  - [第十三课：按键绑定](#第十三课按键绑定)
  - [界面总览](#界面总览)
- [参数速查表](#参数速查表)
- [键盘快捷键](#键盘快捷键)
- [常见问题 (FAQ)](#常见问题-faq)
- [技术参考](#技术参考)
  - [架构概览](#架构概览)
  - [元素选取与指纹（源码详解）](#元素选取与指纹源码详解)
  - [匹配规则与目标查找（源码详解）](#匹配规则与目标查找源码详解)
  - [操作执行（源码详解）](#操作执行源码详解)
  - [UI 节流机制](#ui-节流机制)
  - [指令系统（源码详解）](#指令系统源码详解)
  - [网络监测（源码详解）](#网络监测源码详解)
  - [配置管理（源码详解）](#配置管理源码详解)
  - [面板交互（源码详解）](#面板交互源码详解)
  - [高度管理（源码详解）](#高度管理源码详解)
  - [存储与持久化（源码详解）](#存储与持久化源码详解)
  - [主题系统（源码详解）](#主题系统源码详解)
  - [省电模式（源码详解）](#省电模式源码详解)
  - [字体加载系统（源码详解）](#字体加载系统源码详解)
  - [CSS 变量参考](#css-变量参考)
  - [CSS 类名参考](#css-类名参考)
  - [DOM 观察器与事件委托](#dom-观察器与事件委托)
- [文件结构](#文件结构)
- [版本历史](#版本历史)
- [许可与作者](#许可与作者)

---

## 教程

[↑ 回到顶部](#automatic-operation-)

### 第一课：首次自动点击

[↑ 回到顶部](#automatic-operation-)

**目标**：让脚本每隔 1 秒自动点击页面上的一个按钮。

**操作步骤**：

#### 1. 进入选取模式

[↑ 回到顶部](#automatic-operation-)

展开面板（点击左上角半透明条），点击第 1 页的「选取元素」按钮。按钮会变为**橙色脉冲**状态，表示正在等待你选择目标。面板变为半透明（`opacity: 0.65`），减少对页面内容的遮挡。

#### 2. 选择目标元素

[↑ 回到顶部](#automatic-operation-)

将鼠标移到页面上你想自动点击的按钮上——会看到**橙色虚线高亮框**（CSS class `auto-op-highlight`）。单击该元素，选取完成：

- 高亮框变为**绿色实线框**（CSS class `auto-op-selected-highlight`）
- 元素描述显示在目标列表中
- 「开始」按钮变为可用状态
- 选取后不会退出选取模式，可继续点击选取更多目标

#### 3. 调整参数（可选）

[↑ 回到顶部](#automatic-operation-)

点击第 3 页（⚙ 滑块图标），可调整：

- **操作次数**：留空 = 无限次。填入 `100` 则点击 100 次后自动停止
- **操作间隔**：默认 1000ms。改为 `500` 则每 0.5 秒点击一次
- **操作时间**：最长运行多少分钟后自动停止（与操作次数是 **OR** 关系——任一先到就停止）

#### 4. 开始运行

[↑ 回到顶部](#automatic-operation-)

回到第 1 页，点击「开始」→ 按钮变红「停止」，状态栏显示运行中。同时自动：

- 请求屏幕常亮（Wake Lock），防止屏幕休眠
- 启用禁止聚焦，防止页面弹窗中断操作
- 锁定操作策略/参数输入框

#### 5. 停止运行

[↑ 回到顶部](#automatic-operation-)

点击红色的「停止」按钮，或等待操作次数/时间到达上限自动停止。停止后：

- 释放 Wake Lock
- 恢复页面焦点控制
- 如果设置了自动启动，开始新的倒计时
- 解锁所有参数输入框

> **提示**：面板折叠时，标题栏会出现 ▶ 播放/■ 停止按钮，无需展开面板即可控制操作。

---

### 第二课：匹配规则与元素查找

[↑ 回到顶部](#automatic-operation-)

#### 为什么需要匹配规则？

[↑ 回到顶部](#automatic-operation-)

页面刷新后，脚本选中的 DOM 元素引用会失效。脚本通过**指纹 + 选择器 + 匹配规则**三级机制重新定位元素，确保持久化后仍能找到目标。

#### 理解匹配规则

[↑ 回到顶部](#automatic-operation-)

选取元素后，点击目标右侧的 ⓘ 按钮打开详情面板，可以看到 8 项匹配规则：

| 规则 | 说明 | 示例 |
| --- | --- | --- |
| 标签匹配 | HTML 标签名是否一致 | `BUTTON` |
| 文字匹配 | 元素文本是否匹配（完全/模糊） | `"提交订单"` |
| id 匹配 | `id` 属性是否相同 | `#submit-btn` |
| class 匹配 | CSS 类名是否全部包含 | `.btn.primary` |
| 标准属性匹配 | `href`/`src`/`type`/`name` 等属性 | `type="button"` |
| data-* 匹配 | 自定义 `data-*` 属性 | `data-id="88234"` |
| onclick 匹配 | 内联 onclick 中的参数 | `onclick="fn(42)"` |
| 父级容器匹配 | 祖先容器是否存在且包含元素 | `ul.list` |

**关键概念**：所有开启的规则是 **AND（与）** 关系——必须**全部满足**才算匹配成功。你可以关闭不需要的规则来放宽匹配条件。

**匹配规则的实际应用场景**：

| 场景 | 建议设置 |
| --- | --- |
| 页面上的唯一按钮（有 id） | 全部开启，非常精确 |
| 动态列表中的按钮（class 相同、文本不同） | 关闭 class 匹配，仅靠文字 + 标签 |
| 翻页按钮（文本相同，位置固定） | 全部开启，依赖父级容器限定范围 |
| 变化频繁的动态内容 | 关闭严格属性匹配，适当放宽条件 |

#### 使用「测试」按钮

[↑ 回到顶部](#automatic-operation-)

在详情面板顶部点击「测试」按钮，脚本会逐项测试每条规则，并：

1. 在面板中显示结果：`✓ 3`（绿色=通过，找到3个匹配元素）或 `✕`（红色=失败）
2. 在页面上用**粉色虚线框**（`outline: 2px dashed #F8BBD0`，class `auto-op-test-highlight`）高亮所有匹配元素
3. 测试完成后自动清理高亮
4. 帮你判断选择器是否过于宽泛或过于严格

**info 面板结构**（v5.2.3 重构，`runElementTest` 约 170 行）：

info 面板的匹配规则检查区域按以下顺序组织：

1. **元素引用**（新增）：显示当前 `t.element` 是否存活（`document.contains`），提供两个快速操作按钮：
   - **测试按钮**：运行全部匹配规则测试（含 CSS 选择器测试 + 逐规则测试）
   - **更新按钮**（`updateElementRef`）：仅重新查找元素的 DOM 引用，不运行测试，更新父级链
2. **元素 CSS 匹配**：显示复合选择器（`buildCompoundSelector`）的全局匹配数量
3. **标签匹配**：tagName 匹配开关 + 标签名显示
4. **父级容器匹配**：开关 + 父级链逐链节显示（每链节的独立测试结果）+ **更新按钮**（`updateParentChain`，仅重建 parentChain 不运行测试）
5. **id 匹配**：开关 + id 显示
6. **class 匹配**：开关 + class 显示
7. **data-\* 属性匹配**：开关 + 各属性独立显示
8. **标准属性匹配**：开关 + 各属性独立显示
9. **onclick 匹配**：仅在有 onclickParam 时显示，开关 + 参数值显示
10. **文字匹配**：开关 + 文字模式（exact/fuzzy）+ 文字内容编辑

**测试的具体流程**（`runElementTest`）：

1. **前置清理**：调用 `clearTestHighlights()` 清除上一次测试的所有粉色高亮和结果文本
2. **重新定位目标**：在当前页面上重新查找目标元素（刷新 `t.element`、`t.nearestParent`、`t.blueParent` 引用）
3. **元素存活检测**（新增）：检查 `t.element && document.contains(t.element)`，在 `.auto-op-test-elref-result` 显示结果；如果元素在 CSS 匹配结果中，显示 `✓`，不在则显示 `⚠ (非当前匹配)`
4. **CSS 选择器测试**（独立步骤）：
   - 首选 `buildCompoundSelector(t)`（含完整 parentChain 的复合选择器）→ 在 document 范围内 `querySelectorAll`
   - 回退到 `cssSel`（tag#id.class）→ `querySelectorAll`
   - 再回退到 `tagName` → `getElementsByTagName`
   - 结果传入 `verifyList` 做指纹过滤
   - 显示匹配计数在 `.auto-op-test-css-result` 元素上（绿色 pass / 红色 fail）
5. **逐规则测试**：对全部匹配规则逐一测试：
   - 所有逐规则测试共享 `candidateElements` 集合（即 CSS 选择器测试找到的 `cssElements`，已按父级链限定范围）
   - 若 CSS 选择器测试无结果，`candidateElements` 回退为 `document.querySelectorAll(tagName || '*')`（全局范围）
   - 每条规则在 `candidateElements` 上做 `.filter()`，而非重新全局查询
   - **父级容器匹配**（v5.2.3 重构）：当 `parentChain` 存在时，逐链节验证——对每个链节，筛选满足该链节选择器的候选元素，结果写入对应链节的独立 `.auto-op-test-result`（`data-parent-index`）；无 `parentChain` 时回退为全局 `querySelector` + `contains` 检测
   - **文字匹配**（v5.2.3 优化）：`hasStrong` 元素使用 `extractText` 快速提取（`textContent` + `alt`/`title`/`placeholder`/`aria-label`/`value` 回退），非 `hasStrong` 使用 `getElText` 深度遍历
   - 结果写入对应的 `.auto-op-test-result`（pass/fail/disabled）+ `.auto-op-test-count`（匹配数量）元素
6. **粉色高亮**：所有匹配的元素添加 `.auto-op-test-highlight` class（`outline: 2px dashed #F8BBD0`），存储在 `_testHighlightedElements` 数组中
7. **自动清理**：测试高亮在下次测试或关闭 info 面板时清除（`clearTestHighlights()`）

#### 文字匹配模式

[↑ 回到顶部](#automatic-operation-)

点击文字匹配规则旁的 select，可切换：

- **完全匹配**（`exact`）：`元素文本 === 指纹文本`（严格，默认）
- **模糊匹配**（`fuzzy`）：`元素文本.includes(指纹文本)`（宽松）

对于 `hasStrong === true`（有 id 或 data-* 属性或关键属性）的元素，文字匹配走快速路径（直接取 `textContent`），否则用 `getElText()` 完整提取。

#### 父级容器的作用

[↑ 回到顶部](#automatic-operation-)

选取元素时，脚本自动向上遍历祖先链，找到第一个有 `id` 或 `class` 的祖先作为 `blueParent`（蓝色父容器），其选择器保存为 `parentSelector`。父级匹配开启后，查找范围限定在父容器内，提高精度。页面上会显示：

- **蓝色大方框**（`box-shadow`，class `auto-op-parent-highlight`）：蓝色父容器
- **红色虚线框**（`outline: dashed`，class `auto-op-nearest-parent-highlight`）：直接父元素
- 当 `blueParent` 和直接父元素是同一个时，显示**细蓝框**（class `auto-op-parent-highlight-Overlap`）

#### 元素消失后的处理

[↑ 回到顶部](#automatic-operation-)

第 3 页的「元素消失后」下拉：

| 选项 | 行为 |
| --- | --- |
| **等待重试** | 等待 `间隔×2` 时间，每 5ms 轮询检查。超时则跳过（队列模式继续下一个） |
| **立即停止** | 立即终止运行 |

---

### 第三课：多目标选取与操作策略

[↑ 回到顶部](#automatic-operation-)

#### 多目标选取

[↑ 回到顶部](#automatic-operation-)

选取元素时，选取完成后**不会自动退出选取模式**，可以连续点选多个目标。状态栏会实时显示 `已选 N 个，继续选取或取消`。点击「选取元素」按钮可手动退出选取模式。

**操作策略**（当有多个目标时生效）

| 策略 | 图标 | 行为 | 适用场景 |
| --- | --- | --- | --- |
| **同时操作** | — | 每个间隔**一次性**操作所有可用目标 | 批量点赞、批量领取 |
| **队列操作** | ①→②→③ | 按列表顺序**逐个**操作，每次一个 | 多步骤流程、需按顺序的操作 |

#### 队列模式进阶：独立间隔

[↑ 回到顶部](#automatic-operation-)

每个目标元素的 ⚙ 设置页中有「独立间隔 (ms)」选项：

- 留空 → 使用全局操作间隔
- `0` → 不等待，立刻处理下一个
- `500` → 操作此元素后等 500ms 再处理下一个

```text
元素① customInterval=500 → 等500ms → 元素②
元素② customInterval=空  → 等1000ms(全局) → 元素③
元素③ customInterval=0   → 立刻 → 回到元素①循环

```

#### 目标列表操作

[↑ 回到顶部](#automatic-operation-)

每个目标右侧有 4 个小按钮：

| 按钮 | 功能 |
| --- | --- |
| ⓘ | 查看匹配规则详情 + 测试 |
| ⚙ | 打开元素设置面板 |
| ↑/↓ | 上移/下移（调整队列顺序） |
| ✕ | 删除目标（hover 变红） |

**目标列表状态显示**：

- 有效目标：正常显示，元素存在且匹配指纹
- 缺失目标：**红色**文字，虚线边框，表示元素在页面上已消失
- 禁用目标：灰色文字，`disabled` CSS class
- 指令目标：显示 `[CMD]` 前缀

---

### 第四课：自动填充输入框

[↑ 回到顶部](#automatic-operation-)

**适用场景**：在搜索框、表单、评论框中自动填入内容。

**支持的输入类型**：

- `<input>` 元素（排除 checkbox/radio/hidden/file/color/submit/button/reset/image）
- `<textarea>` 元素
- `contentEditable` 元素（如富文本编辑器 div）

**操作步骤**：

1. 选取一个输入框元素（`<input>` 或 `<textarea>` 或 `contentEditable`）
2. 点击该目标右侧的 ⚙ 按钮，打开元素设置面板
3. 开启「输入元素」开关
4. 在「填充文本」输入框中填入你想自动填充的内容
5. 回到第 1 页，点击「开始」

每次操作周期中，脚本会执行：

1. 对于 `<input>` / `<textarea>`：`el.value = fill` 设置值，然后 `dispatchEvent(new Event('input'))` 和 `dispatchEvent(new Event('change'))`
2. 对于 `contentEditable`：`el.innerHTML = fill` 直接设置 HTML 内容

> 触发 `input` 和 `change` 事件是为了兼容 React / Vue 等前端框架，它们通过事件监听来更新组件状态。

**每元素独立填充**：不同目标可以设置不同的填充内容。填充文本留空则做清空操作（value 设为空字符串）。

---

### 第五课：JS 指令

[↑ 回到顶部](#automatic-operation-)

**第 2 页**提供了 JavaScript 执行环境，可以直接在目标页面上运行自定义代码。

**布局说明**：

```text
┌──────────────────────────────────┐
│ JavaScript 指令                  │
│ ┌──────────────────────────┐     │
│ │ // 输入你的JS代码          │     │ ← 等宽字体，可拖拽拉伸
│ │ $el.click()              │     │
│ └──────────────────────────┘     │
│ 快捷指令 [▼下拉选择]    [📡]     │ ← 预设 + 网络监测入口
│ [测试运行 Ctrl+Enter] [设为目标] │
│ ──────────────────────────       │
│ 输出                     [清空]  │
│ [15:30:42] [log] > $el.click()  │ ← 彩色日志
│ [15:30:42] [result] ↳ undefined │
└──────────────────────────────────┘

```

**可用变量**：

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| `$el` | HTMLElement | 当前配置中第一个启用的有效目标元素 |
| `$target` | Object | 目标对象（含指纹、选择器、设置项等完整数据） |
| `$config` | Object | 当前配置对象 `configs[activeConfig]` |
| `$index` | number | 队列中的索引（测试模式为 -1） |
| `$targets` | Array | 当前配置的所有目标数组 |

**三种使用方式**：

#### 方式一：测试运行

[↑ 回到顶部](#automatic-operation-)

在输入框中写 JS 代码，点击「测试运行」或按 `Ctrl+Enter`。脚本会：

1. 拦截 `console.log/warn/error/info/debug` 输出（透传到原始 console）
2. 在 `new Function()` 沙箱中执行代码
3. 显示返回值（支持 async/await — 返回 Promise 时自动 `then/catch`）
4. 所有输出显示在下方的日志区域（上限 500 条，超限自动删除旧记录）

#### 方式二：快捷指令

[↑ 回到顶部](#automatic-operation-)

下拉选择预设指令，自动填入输入框，再点击测试运行。预设包括：

| 预设 | 代码 |
| --- | --- |
| 点击元素 | `$el.click()` |
| 滚动到元素 | `$el.scrollIntoView({behavior:'smooth',block:'center'})` |
| 清空输入框 | 设 value 为空 + 触发 input/change |
| 显示元素信息 | 打印 tag/id/class/text/rect/attrs |
| 打印元素文本 | `console.log($el.textContent)` |
| 隐藏/显示/删除元素 | 操作 style.display 或 remove() |
| GET 当前页面 | `return fetch(location.href).then(r=>r.text()).then(t=>{console.log(t);return t.length})` |
| POST JSON | `return fetch('/api',{method:'POST',headers:{...},body:...}).then(r=>r.json()).then(d=>{console.log(JSON.stringify(d,null,2));return d})` |
| 触发点击事件 | 拦截 addEventListener 检测 click 监听器 |

#### 方式三：设为目标

[↑ 回到顶部](#automatic-operation-)

点击「设为目标」将代码作为操作队列中的一项。运行时这段代码会被执行（而非 click），支持 `async/await`。在有多个目标时也可用于添加额外的指令目标。

**命令历史**：`↑` 上一条、`↓` 下一条，存储在 `cmdHistory` 数组中，`cmdHistoryIndex` 跟踪当前位置。

**日志颜色**：`log`=白、`warn`=橙、`info`=蓝、`debug`=粉、`error`=红、`result`=绿

**错误处理**：如果代码抛出异常，捕获 `e.message` 并显示为红色 error 日志。对于异步代码，`.catch()` 同样捕获并显示。

#### 重要：`new Function()` 与 `return` 关键字

[↑ 回到顶部](#automatic-operation-)

脚本使用 `new Function()` 沙箱执行代码。普通函数不会自动返回最后一个表达式的值（只有箭头函数 `() => expr` 才会）。因此：

- ❌ `fetch(url).then(...)` — 函数返回 `undefined`，脚本不会等待异步结果，console 拦截提前恢复
- ✅ `return fetch(url).then(...)` — 显式 `return` 返回 Promise，脚本识别并等待完成后才恢复 console

所有涉及异步操作（fetch、setTimeout 等）的代码都应使用 `return`。

#### 输出日志展开/折叠

[↑ 回到顶部](#automatic-operation-)

日志区域有**点击展开/折叠**机制：

- 每条日志超过 **150 字符**自动折叠，末尾显示 `…点击展开`（蓝色提示）
- 点击折叠的日志行 → 展开显示全文
- 再次点击 → 折叠回 150 字符
- 短于 150 字符的日志不受影响，始终完整显示
- 底部滚动条可见，方便浏览长内容

---

### 第六课：网络请求监测

[↑ 回到顶部](#automatic-operation-)

**入口**：第 2 页标题栏右侧的 📡 按钮。

点击后，面板内滑入网络监测 overlay：

```text
┌──────────────────────────────────┐
│ ← 网络请求监测    [开关]  总计:N │
│ [清空] [复制全部]                │ ← 工具栏
│ ──────────────────────────────   │
│ GET  /api/users         200  [✕] │ ← 可展开
│ POST /api/login         201  [✕] │
│ ...                             │
└──────────────────────────────────┘

```

**功能**：

| 操作 | 说明 |
| --- | --- |
| 开关 | 开启后拦截所有 fetch/XHR 请求 |
| 点击请求行 | 展开查看完整请求头、请求体、响应头、响应体 |
| 单个 ✕ | 删除该条记录 |
| 清空 | 清空全部记录 |
| 复制 | 将一条请求复制为 `fetch()` 代码 |
| 复制全部 | 将所有请求复制为分号分隔的 fetch 代码 |

**Method 颜色**：GET=绿、POST=橙、PUT=蓝、DELETE=红、PATCH=紫、XHR=灰蓝

**状态颜色**：200-399=绿色 `ok`、其他=红色 `err`、pending=灰色 `...`

**限制**：请求体/响应体截取前 50000 字符，最多保留 500 条记录。请求列表滚动条可见，方便浏览大量记录。

**网络监测持久化**（v5.2.0+ 新增）：

网络监测状态和请求记录会在**页面刷新后自动恢复**：

- 监测开关状态（`isNetworkMonitoring`）和所有请求记录统一通过 `AUTO_OP_NETMON_<host>` 键持久化（`{active, requests}` 结构）
- 刷新后自动注入一条「刷新」标记记录（method=`刷新`，status=`refresh`）
- 页面隐藏时（`visibilitychange` → hidden）自动保存
- 初始化时先恢复保存的请求记录，然后重新挂载拦截器

---

### 第七课：自动刷新与自动启动

[↑ 回到顶部](#automatic-operation-)

**自动刷新**（第 4 页）

开启「自动刷新网页」开关，设置间隔（10s ~ 86400s）。脚本会在计时到达后：

1. 保存当前所有状态到 GM 存储（包括所有配置 + 刷新状态 + 网络监测状态）
2. 记录刷新日志（`addRefreshLog`，时间戳使用 `toLocaleString('zh-CN')` 格式 `YYYY-MM-DD HH:mm:ss`，含运行中配置编号如 `运行中 [①,③]`）
3. 调用 `saveRefreshState()` 保存跨刷新临时状态（`nextRefreshTime`、`isPowerSave`、各运行中配置的 `operationStartTimestamp` 和 `clickedCount`）
4. 调用 `saveData()` → `saveShared()` + `savePerConfig(ci)` ×10 持久化全部数据
5. 清除进度条定时器（`refreshProgressTimerID`）和刷新触发定时器（`refreshTimerID`）
6. 执行 `location.reload()`

刷新后脚本自动恢复：

- 之前的刷新日志（保留完整的时间戳和消息）
- 运行中的配置（继续操作，保留已操作计数和运行计时，通过 `savedTimestamp` 扣除已消耗的最大运行时长）
- 省电模式状态（300ms 延迟恢复）
- 自动刷新倒计时（如果剩余时间 > 0，精确恢复；否则立即触发）

**刷新进度条**（第 4 页）：

开启自动刷新后，面板内出现实时进度条（位于页面内容区与操作按钮之间）：

```text
┌──────────────────────────────────┐
│ 45.3%              剩余 00:32    │ ← 百分比 + 倒计时
│ ████████████░░░░░░░░░░░░░░░░░░   │ ← 进度条
└──────────────────────────────────┘

```

- 剩余 < 30 秒时：进度条和百分比变为**红色**（`--panel-missing-border`）
- 正常运行：蓝色进度条（`--panel-highlight-border`）
- 百分比精确到小数点后 1 位（`percent.toFixed(1)`）
- 进度条平滑填充（CSS `transition` on `width`）
- 进度更新由 `refreshProgressTimerID`（`setInterval` 100ms）驱动，调用 `updateRefreshProgressUI()`
- 刷新触发由 `refreshTimerID`（`setTimeout`，`remaining + 50ms` 容差）驱动，调用 `triggerRefresh()`

**刷新倒计时启停流程**：

`startAutoRefreshCountdown(initial)` 函数执行以下步骤：

1. 设置 `isAutoRefresh = true`，勾选 checkbox，显示进度条容器
2. `initial === true` 时：`refreshStartTimestamp = Date.now()`（全新开始）
3. `initial === false` 时：使用已有的 `refreshStartTimestamp`（跨刷新恢复场景）
4. 启动 100ms 进度条更新定时器 → `setInterval(updateRefreshProgressUI, 100)`
5. 计算剩余时间 → `setTimeout(triggerRefresh, remaining + 50)`（+50ms 容差确保不提前触发）
6. 调用 `requestWakeLock()` 保持屏幕常亮

`stopAutoRefreshCountdown()` 函数执行以下步骤：

1. 清除 100ms 进度条定时器和刷新触发定时器
2. 隐藏进度条容器，重置进度条宽度和文字为初始值
3. 调用 `clearRefreshState()` 删除 GM 存储中的临时刷新状态
4. 检查是否需要释放 WakeLock（所有配置停止 + 未开启自动刷新 → `releaseWakeLock()`）

**时间格式化工具函数**：

- `formatRefreshTime(ms)`（第 4968 行）：`MM:SS` 或 `HH:MM:SS`，`Math.ceil(ms/1000)` 向上取整
- `formatAutoStartCountdown(ms)`（第 5125 行）：`XhXXmXXs`（>1h）或 `XXmXXs`（<1h）
- `formatElapsedTime(ms)`（第 5223 行）：`HH:MM:SS`，`Math.floor(ms/1000)` 向下取整
- `formatReqTime(ts)`（第 7244 行）：`YYYY/MM/DD HH:MM:SS.mmm`（网络请求时间戳，含完整日期）

**自动启动**（第 3 页）

在「自动启动 (min)」输入框中填入分钟数（支持小数如 `0.5` = 30 秒）。脚本会在指定时间后自动开始操作。

**循环逻辑**：自动启动 → 运行操作 → 停止（达到上限/手动停止）→ 重新倒计时 → 再次自动启动。形成一个「定时运行」的自动循环。

**倒计时显示**：参数页面「自动启动」标签右侧实时显示 `MM:SS` 或 `HH:MM:SS` 倒计时（橙色）。

**最大运行时长**（第 3 页）

「操作时间 (min)」用于限制单次运行的最长时间。与操作次数是 OR 关系——任一项先到达就停止。

**最大运行时长的跨刷新恢复**：

- 保存 `operationStartTimestamp`
- 刷新后计算已消耗时间，剩余时间 = `maxDurationMs - alreadyElapsed`
- 如果剩余 ≤ 0，启动后立即停止
- `setTimeout` 以剩余时间延迟执行停止

**跨刷新日志格式**：`2026-06-22 15:30:45 页面已刷新 运行中 [①,③]` — 时间戳 + 操作信息

---

### 第八课：配置管理

[↑ 回到顶部](#automatic-operation-)

**10 套独立配置**，每套有独立的：目标列表、操作参数、操作策略、自动启动设置。

**切换配置**：

点击标题栏右侧的 ⑩ 按钮（显示当前配置编号和图标），弹出下拉菜单。菜单中：

- 当前选中的配置项**蓝色高亮**（`active` class）
- 正在运行的配置右侧有**绿色小圆点**（通过 `updateConfigBtnLabel()` 动态更新）
- 点击某个编号切换

**切换配置的完整流程**（`switchConfig`，77 行）：

1. 退出选取模式，关闭 overlay 面板
2. 从 UI 控件读取当前值保存到旧配置对象
3. 清除旧配置所有高亮（选中高亮、父容器高亮、最近父级高亮）
4. 切换到新配置 → 通过 `tryFindTarget` 恢复所有目标的 element 引用
5. 重新应用选中高亮到有效元素
6. 同步所有 UI 控件（策略、次数、间隔、时间等）
7. 刷新父容器高亮、目标 UI、计数、配置按钮标签
8. 保存数据、跳转到第 0 页

**配置间的关系**：

- 每套配置**完全独立**：配置①的参数不影响配置②
- 可以**多套同时运行**：比如①自动刷新 + ②自动点击。使用 `configs.some(c => c.isRunning)` 判断是否有任何配置在运行
- 切换配置时自动保存当前配置的 UI 参数
- 折叠状态下的 ▶/■ 按钮始终控制 `activeConfig`（当前显示的配置）
- 停止时 `configs.some(cc => cc.isRunning)` 检查 → 无运行配置时才释放 WakeLock

**配置的域名隔离**：

所有配置通过 `window.location.hostname` 进行域名隔离。这意味着：

- `example.com` 和 `sub.example.com` 拥有**完全独立**的配置集（各自 10 套）
- `http` 和 `https` 的同域名共享配置（因为 `hostname` 不包含协议）
- 端口不影响隔离（`example.com:8080` 和 `example.com:3000` 共享配置）
- IP 地址的每个不同 IP 独立存储

**存储键生成逻辑**：

```js
const SHARED_KEY = 'AUTO_OP_SHARED_' + window.location.hostname;
const PER_CONFIG_KEY = 'AUTO_OP_CFG_' + window.location.hostname + '_';
// → AUTO_OP_CFG_www.example.com_0, AUTO_OP_CFG_www.example.com_1, ...
```

**配置导入/导出**：

点击第 1 页的页签按钮（📄 操作），页签图标切换为配置加载图标，第 1 页内容替换为两个按钮：

| 按钮 | 功能 |
| --- | --- |
| **导出配置** | 序列化当前配置为 `.json` 文件并触发浏览器下载 |
| **导入配置** | 打开文件选择器，验证并导入之前导出的配置文件 |

**导出文件格式**：与 `savePerConfig` 序列化完全一致，额外包含 `version`（脚本版本）、`exportedAt`（导出时间戳）、`hostname`（来源域名）三个元数据字段。

**导入安全机制**：

1. 文件扩展名检查（`.json`）
2. 文件大小检查（≤ 10MB）
3. JSON 格式校验（`JSON.parse`）
4. 结构校验（`targets` 数组 + 配置字段存在性）
5. **导入前备份**：深拷贝当前配置的全部字段（含 DOM 引用如 `element`, `_blueParent`, `_nearestEl`）
6. **导入确认**：弹窗显示目标数量、间隔、策略等摘要信息，用户确认后执行
7. **失败回滚**：应用失败时自动恢复备份配置（含高亮清除、UI 同步）

再次点击页签按钮退出配置加载模式，恢复正常操作界面（`exitConfigLoadMode()` 恢复所有隐藏元素）。

配置加载模式由全局 `isConfigLoadMode` 状态变量跟踪，在以下场景中自动退出：

- 点击第 1 页页签按钮切换回正常模式
- 切换到其他页面时（`goToPage` 检测 `clamped !== 0`）
- 切换配置时（`switchConfig` 开头检测并退出）

这种设计确保配置加载模式不会跨配置或跨页面意外停留。

---

### 第九课：系统设置

[↑ 回到顶部](#automatic-operation-)

**第 5 页（齿轮图标）**包含：

**选取放行点击**：开启后，选取元素模式下的点击会穿透到页面（不会阻止页面自身的点击处理）。关闭时调用 `e.preventDefault()` + `e.stopPropagation()` 拦截。默认关闭。

**省电模式**：全屏黑色遮罩覆盖页面，仅显示 4 个浮动元素（当前时间、运行时长、已操作次数、关闭开关）。自动尝试全屏，每 5s 随机移动位置。详见[第十课](#第十课省电模式)。

**屏幕常亮**：使用 [Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/WakeLock) 防止屏幕关闭。运行时自动请求，停止后自动释放。页面可见性恢复时自动重新请求（`visibilitychange` → visible）。注意：WakeLock 为全局共享状态——仅当所有配置均停止运行且未开启自动刷新时才释放，避免多配置并发运行时的竞争条件。

**禁止聚焦**：覆盖 `HTMLElement.prototype.focus`，阻止面板外的页面元素获取焦点（防止页面弹窗/跳转中断自动操作）。使用引用计数（`_suppressFocusCount`）——多次启动不会重复覆盖，仅当所有配置均停止运行且计数归零时才还原原始 `focus` 方法，避免多配置并发运行时的竞争条件。

**主题模式**：

- `auto`：自动检测网页主题（扫描 class/style/data-* 属性）+ 回退系统主题
- `system`：仅跟随操作系统 `prefers-color-scheme`
- `light`/`dark`：强制模式

**主题检测详情**：

- `auto` 模式：先从 `document.documentElement` 检测 → 回退 `document.body` → 回退系统主题
- 扫描 HTML/body 的 class（`dark`, `dark-mode`, `night`, `theme-dark`, `tw-dark`, `bp3-dark`, `chakra-ui-dark` 等 7 种暗色 + 4 种亮色）
- 扫描 `style` 属性中的 `color-scheme`
- 扫描任意属性值中的 `dark`/`light` 关键字
- `auto` 模式启动全部监听器（MutationObserver ×2 + matchMedia），`system` 仅 matchMedia，`light`/`dark` 关闭所有

**面板字体**：MiSans VF（小米字体 CDN）或 system-ui 回退。

**字体加载机制**：

- MiSans VF 从 `https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap` 加载
- 加载失败时（`onerror`），移除 `<link>` 元素，显示「MiSans VF 加载失败」提示
- `--auto-op-font` CSS 变量始终保留 `system-ui` 回退

**恢复默认设置**（隐藏按钮）：在第 5 页连续点击第 5 页图标 4 次（2 秒内）出现，确认后清除当前域名所有 GM 存储键（`AUTO_OP_` 前缀），然后刷新页面。

**恢复流程**：

- 首次点击显示「再次点击确认恢复默认设置」（橙色，5 秒超时自动取消）
- 二次确认 → 扫描 GM 存储中所有 `AUTO_OP_` 前缀的键 → 逐个删除 → `location.reload()`

**一键清除所有自动启动**（隐藏按钮）：在第 2 页（JS 指令页）连续点击第 2 页图标 4 次（2 秒内）触发，调用 `clearAllAutoStart()` → 遍历全部 10 套配置，关闭自动启动开关、清空间隔和倒计时、停止运行中的配置、持久化保存、重置面板自动启动输入框。适用于需要快速终止所有自动定时任务的场景。离开第 2 页时计数自动清零。

---

### 第十课：省电模式

[↑ 回到顶部](#automatic-operation-)

省电模式提供全屏遮罩界面，隐藏页面内容，仅显示关键信息。

**开启方式**：第 5 页「省电模式」开关。

**显示元素**（4 个浮动组件）：

| 元素 | ID | 内容 |
| --- | --- | --- |
| 当前时间 | `ps-time` | `HH:MM:SS`，每秒更新 |
| 运行时长 | `ps-elapsed` | `已运行 01:23:45` 格式 |
| 已操作次数 | `ps-count` | `已操作 42 次` |
| 关闭开关 | `ps-switch` | Switch 开关，关闭即退出省电模式 |

**行为**：

- 进入时尝试全屏（`document.documentElement.requestFullscreen()`），失败不报错（`catch` 静默处理）
- 每 5 秒随机移动 4 个浮动元素到屏幕不同位置（`powerSaveTimerID = setInterval(randomizePowerSavePositions, 5000)`）
- 随机位置算法：`Math.random() * (innerWidth - 200)` 和 `Math.random() * (innerHeight - 100)`，留出 200px×100px 安全边距避免元素超出屏幕
- 文本投影发光效果（`text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.4)`）——多层投影营造柔和光晕
- 进入时自动同步运行状态：调用 `updatePowerSaveTime()`、`updatePowerSaveElapsed()`、`updatePowerSaveCount()` 初始化显示
- 退出时完整清理：`document.exitFullscreen()` 关闭全屏 → `clearInterval(powerSaveTimerID)` 清除随机移动定时器 → 清除时间/运行时长/操作次数各自的更新定时器 → `restorePanelOpacity()` 恢复面板透明度
- 退出后重新 `applyTheme()` 确保主题正确（全屏期间可能触发系统主题切换）

**跨刷新恢复**：刷新前省电模式状态保存到 `REFRESH_STATE_KEY`，刷新后 300ms 延迟自动恢复。

---

### 第十一课：面板交互细节

[↑ 回到顶部](#automatic-operation-)

#### 面板透明度系统

[↑ 回到顶部](#automatic-operation-)

折叠状态下，面板 1 秒后自动变为半透明（`opacity: 0.65`），减少视觉干扰。交互规则：

| 事件 | 行为 |
| --- | --- |
| 折叠 → 1s 后 | `schedulePanelTransparent(1000)` 设置透明度 |
| 点击面板任意位置 | `onPanelClickRestore()` → 恢复不透明，2s 后重新半透明 |
| 展开面板 | `restorePanelOpacity()` → 完全恢复，取消所有定时器 |
| 进入选取模式 | 立即设置半透明 |
| 退出选取模式 | 恢复不透明 |

定时器管理：`panelTransparentTimer`（延迟透明）、`panelClickRestoreTimer`（点击恢复后重新计时）。

#### 确认对话框

[↑ 回到顶部](#automatic-operation-)

用于需要用户确认的危险操作（如清空目标列表），支持移动端和桌面端：

- 半透明黑色遮罩 + 居中白色弹窗
- 「确定」/「取消」两个按钮
- 点击遮罩 = 取消
- 返回 `Promise<boolean>`

#### 面板拖拽

[↑ 回到顶部](#automatic-operation-)

所有标题栏支持拖拽移动（鼠标 + 触屏）：

- 主面板标题栏（`.auto-op-header`）
- info overlay 标题栏
- settings overlay 标题栏
- network overlay 标题栏

拖拽实现：

- `mousedown`/`touchstart` → 记录偏移量
- `mousemove`/`touchmove` → 更新 `panel.style.left/top`
- `mouseup`/`touchend`/`touchcancel` → 结束拖拽
- 拖动时自动关闭配置菜单
- 拖拽启动时排除按钮元素（toggle、header-start、config-btn、back-btn、network-toggle、switch）

**页签「回弹」机制**：已在当前页再次点击不会重复触发跳转。

**恢复默认按钮的「4 次点击」触发**：

- 仅在已处于第 5 页时点击第 5 页按钮才计数
- 切换到其他页签时计数清零
- 2 秒定时器自动清零计数

---

### 第十二课：元素设置面板详解

[↑ 回到顶部](#automatic-operation-)

点击目标右侧的 ⚙ 按钮打开元素设置面板（右侧滑入 overlay），包含以下设置项：

| 设置项 | 类型 | 说明 |
| --- | --- | --- |
| **启用此元素** | switch | 关闭后该目标在操作周期中被标记为 `disabled`，队列模式下自动跳过 |
| **元素描述** | text input | 自定义目标在列表中的显示名称，同步更新 info/settings 标题栏 |
| **输入元素** | switch | 开启后显示「填充文本」输入框（仅非指令目标） |
| **填充文本** | text input | 自动填充的内容（仅输入元素开启后可见） |
| **JS 指令** | textarea | 指令代码编辑（仅指令目标，等宽字体，支持拖拽拉伸） |
| **独立间隔 (ms)** | number input | 操作该元素后的等待时间，留空使用全局 |
| **启用高亮** | switch | 关闭后该元素不显示绿色选中高亮和父容器高亮 |
| **滚动到可视区** | switch | 开启后每次操作前自动 `scrollIntoView({behavior:'smooth',block:'center'})` |
| **显示父级** | switch | 开启后显示蓝色父容器框和红色直接父级框 |
| **按键绑定** | text input (readonly) | 自定义按键组合（v5.2.9+），点击输入框进入录制模式，按下按键组合后自动保存。双击清空绑定 |

**面板高度自适应**：设置面板内 textarea 和输入框变化时，通过 ResizeObserver + MutationObserver 动态调整面板高度以匹配内容。

---

### 第十三课：按键绑定

[↑ 回到顶部](#automatic-operation-)

**适用场景**：需要通过键盘快捷键快速触发某个目标元素的操作（点击/填充/执行指令），无需展开面板。

**v5.2.9+ 新增功能**。

#### 设置按键绑定

[↑ 回到顶部](#automatic-operation-)

1. 选取一个目标元素
2. 点击目标右侧的 ⚙ 按钮，打开元素设置面板
3. 找到「按键绑定」输入框（位于设置面板底部）
4. **点击输入框** → 进入录制模式，输入框显示「请按下按键...」并有橙色脉冲动画
5. **按下想要绑定的按键组合**（如 `Ctrl+K`、`F2`、`Shift+Alt+S` 等）
6. **松开所有按键**后等待 600ms → 自动保存绑定，输入框显示按键组合文本
7. 按 `Esc` 可取消录制，恢复之前的值

**清除绑定**：双击按键绑定输入框即可清空。

#### 使用按键绑定

[↑ 回到顶部](#automatic-operation-)

绑定完成后，在页面上（输入框未聚焦时）按下绑定的按键组合即可触发目标操作：

- **普通目标**：触发 `el.click()` 点击
- **输入目标**：触发填充操作（设置 value + 触发 input/change 事件）
- **指令目标**：执行 JS 指令代码

触发后页面右上角会显示浮动提示（`auto-op-keybind-tip`），显示目标描述和按键组合，绿色=成功，红色=失败（元素缺失或执行异常）。提示自动在 2.5 秒后淡出。

#### 按键绑定的技术细节

[↑ 回到顶部](#automatic-operation-)

| 项目 | 说明 |
| --- | --- |
| 支持的修饰键 | `Ctrl`、`Alt`、`Shift`、`Meta`（Windows 键 / Mac Command） |
| 支持的普通键 | 字母（自动大写）、数字、功能键（F1-F12）、方向键（↑↓←→）、Space、Enter、Tab、Esc、Del、Backspace |
| 组合键格式 | 修饰键在前，普通键在后，用 `+` 连接，如 `Ctrl+Shift+K` |
| 按键释放容差 | 150ms（`_KEYBIND_RELEASE_TOLERANCE`）——按键释放后 150ms 内仍视为按下，防止快速输入时误判 |
| 录制完成延迟 | 600ms（`_KEYBIND_FINALIZE_DELAY`）——最后一个按键释放后等待 600ms 才确认录制完成 |
| 冲突处理 | 多个目标绑定同一按键时，按目标列表顺序依次触发所有匹配的目标 |
| 输入框排除 | 当焦点在 `<input>`、`<textarea>`、`<select>` 或 `contentEditable` 元素内时，按键绑定不生效 |
| 持久化 | `keybind` 字段通过 `savePerConfig` 序列化到 GM 存储，刷新后自动恢复 |
| 导入/导出 | `exportConfig`/`importConfig` 包含 `keybind` 字段 |

**内部函数**：

| 函数 | 说明 |
| --- | --- |
| `normalizeKeyName(key)` | 将 `Event.key` 标准化为显示名称（`Control`→`Ctrl`、` `→`Space`、`ArrowUp`→`↑` 等） |
| `formatKeyCombo(e)` | 从 keydown 事件提取修饰键+普通键，生成 `Ctrl+K` 格式字符串 |
| `formatKeyComboFromSet(heldKeys)` | 从 Set 生成组合键字符串（修饰键优先排序） |
| `finalizeKeybindRecording()` | 录制完成：保存绑定值到目标对象 + 持久化 |
| `executeTargetByKeybind(t, idx)` | 按键触发时执行目标操作（click/fill/command）+ 显示浮动提示 |
| `showKeybindTip(desc, combo, success)` | 显示浮动提示（支持多条同时显示，自动堆叠偏移） |

**CSS 类名**：

| 类名 | 作用 |
| --- | --- |
| `.auto-op-keybind-input` | 按键绑定输入框（readonly，点击触发录制） |
| `.auto-op-keybind-input.recording` | 录制中状态（橙色脉冲动画 `keybind-pulse`） |
| `.auto-op-keybind-tip` | 浮动提示容器（固定定位，右上角） |
| `.auto-op-keybind-tip.show` | 显示状态（淡入动画） |
| `.auto-op-keybind-tip.success` | 成功提示（绿色边框/背景） |
| `.auto-op-keybind-tip.fail` | 失败提示（红色边框/背景） |

---

<!-- markdownlint-disable MD033 -->
## 常见问题 (FAQ)

[↑ 回到顶部](#automatic-operation-)

### 通用

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 脚本安装后没有出现面板？</b></summary>

**A:** 按顺序排查：

1. 确认 Tampermonkey 扩展已启用，且脚本已开启（Tampermonkey 图标显示数字）
2. 确认当前页面不是 `file://` 或 `chrome://` 等特殊协议页面（脚本自动跳过）
3. 确认当前页面不在 iframe 内（`IS_TOP` 检测会跳过 iframe）
4. 查看浏览器控制台（F12）中是否有 `[AUTO_OP]` 前缀的日志
5. 尝试刷新页面，或在 Tampermonkey 中手动重新安装脚本

</details>

<details>
<summary><b>Q: 这个脚本会影响网页的正常使用吗？</b></summary>

**A:** 脚本设计上尽量减少对网页的影响：

- 面板 `z-index: 2147483647`（最大值），固定定位，不参与页面布局流
- 折叠后半透明（`opacity: 0.65`），占用空间极小
- `isProgrammaticClick` 标记用于区分脚本触发和用户触发的点击
- 网络监测 `fetch`/`XHR` 拦截会**透传**所有请求和响应，不影响页面逻辑
- 选取元素时的点击拦截（`pickPassThrough`）默认关闭，可选放行

如果遇到兼容性问题，可以在 Tampermonkey 中临时禁用脚本。

</details>

<details>
<summary><b>Q: 脚本支持哪些浏览器？</b></summary>

**A:** 支持所有支持 Tampermonkey 的浏览器：

- **Chrome** / **Edge** / **Brave** / **Opera**（Chromium 内核，推荐）
- **Firefox**（部分 API 如 Wake Lock 可能受限）
- **Safari**（需安装 Tampermonkey for Safari）

移动端浏览器（Android Firefox + Tampermonkey 扩展、Kiwi Browser 等）也支持触屏拖拽操作。

</details>

### 选取与匹配

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 选取元素后刷新页面，脚本提示「元素缺失」？</b></summary>

**A:** 这是正常现象。刷新后原 DOM 引用失效，脚本通过 `tryFindTarget` 三级回退机制（`compoundSelector → cssSel → tagName`）重新查找。如果仍然找不到，请检查：

1. 目标元素的属性/文本是否在刷新后发生变化
2. 进入目标的 ⓘ 详情面板，点击「测试」查看各条规则的匹配计数
3. 关闭过于严格的匹配规则（如 `class` 匹配、`id` 匹配），仅保留「文字匹配」+「标签匹配」
4. 对于动态内容，考虑放宽匹配规则或使用 JS 指令方式操作

</details>

<details>
<summary><b>Q: 选取按钮后点击了多个相似元素（误选）？</b></summary>

**A:** 提高匹配精度：

1. 在目标 ⓘ 详情面板中，确保「父级容器匹配」已开启——这会将搜索范围限制在特定容器内
2. 开启 `id` 匹配（如果元素有 id）
3. 开启 `class` 匹配（如果元素的 class 是唯一的）
4. 使用「测试」按钮确认选择器只匹配到 1 个元素

</details>

<details>
<summary><b>Q: 选取元素时页面上看不到高亮框？</b></summary>

**A:** 检查以下情况：

1. 元素是否在可视区域之外（尝试滚动）
2. 元素是否被其他层遮挡（高亮框的 `z-index` 可能低于遮挡层的 `z-index`）
3. 是否开启了省电模式（省电模式下不显示高亮）
4. `enableHighlight` 是否被关闭（⚙ 元素设置面板中）

</details>

### 运行与停止

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 点击「开始」后脚本没有操作元素？</b></summary>

**A:** 按顺序排查：

1. 确保至少有一个有效目标（绿色 ✅ 状态）
2. 检查元素的「启用此元素」开关（⚙ 设置面板）是否为开启状态
3. 多选 + 队列模式下，确认 `currentQueueIndex` 对应的目标是有效的
4. 检查「操作次数」是否已用完（如果是 0 次会立即停止）
5. 打开浏览器控制台（F12），查看是否有 `[AUTO_OP]` 前缀的错误日志

</details>

<details>
<summary><b>Q: 页面刷新后自动操作没有恢复？</b></summary>

**A:** 确认以下条件：

1. 刷新前操作确实在运行中（`c.isRunning === true`）
2. 刷新是通过脚本的「自动刷新」触发的（手动按 F5 也会保存刷新状态）
3. 检查浏览器控制台中是否有恢复相关的日志
4. `REFRESH_STATE_KEY` 键中的临时状态是否正确保存到了 GM 存储
5. 如果操作时间设置了上限，刷新后剩余时间可能已耗尽（立即停止）

</details>

<details>
<summary><b>Q: 为什么操作会意外停止？</b></summary>

**A:** 可能的停止原因：

1. **操作次数到达上限**：`clickedCount >= maxClicks` → 自动调用 `stopClickingFor`
2. **操作时间到达上限**：`maxDurationTimerID` 的 `setTimeout` 触发 → 自动停止
3. **元素缺失**：`missingAction === 'stop'` 时，队列模式下目标元素的 `status[i]` 为 `false` 导致立即停止
4. **手动停止**：点击了红色「停止」按钮或折叠面板的 ■ 按钮
5. **所有目标被禁用**：`c.targets` 全部 `enabled === false` 时无有效目标

</details>

<details>
<summary><b>Q: 队列模式下，元素缺失后会跳过该元素继续下一个吗？</b></summary>

**A:** 取决于「元素消失后」设置：

- **等待重试**（默认）：等待 `间隔×2` 时间（每 5ms 轮询），超时后**跳过该元素**，`currentQueueIndex` 移动到下一个。如果下一个也缺失，同样等待→跳过，形成「跳过链」。所有元素都缺失时才触发停止逻辑
- **立即停止**：任一目标元素缺失且无法通过 `tryFindTarget` 恢复时，立即终止运行

注意：队列模式下跳过的元素不会增加 `clickedCount`，所以操作次数上限不受缺失元素影响。

</details>

<details>
<summary><b>Q: 同时模式下，多个目标的操作顺序是怎样的？</b></summary>

**A:** 每个操作周期（由 `setInterval` 驱动，间隔 = `clickInterval`）按目标列表的**数组顺序**（即面板中显示的从上到下顺序）依次操作所有有效目标。要调整顺序，使用目标右侧的 ↑/↓ 按钮。

在同一个周期内，所有目标几乎同时执行（实际上是一个同步 `for` 循环，间隔在毫秒级）。如果需要严格控制先后顺序，应使用队列模式。

</details>

### 配置与存储

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 配置数据存储在哪里？会丢失吗？</b></summary>

**A:** 所有数据通过 Tampermonkey 的 `GM_setValue`/`GM_getValue` 存储 API（内部基于 `localStorage`）按**域名**隔离存储：

- `AUTO_OP_SHARED_<host>`：全局共享状态（主题、字体、当前配置等）
- `AUTO_OP_CFG_<host>_0` ~ `_9`：10 套配置各自独立存储
- `AUTO_OP_REFRESH_STATE_<host>`：跨刷新临时状态
- `AUTO_OP_NETMON_<host>`：网络监测数据（开关状态 + 请求记录，`{active, requests}` 结构）

数据在以下时机保存：切换配置、修改参数、选取/删除目标、刷新前、主题/字体切换、页面切换、页面隐藏时。

> **注意**：清除浏览器缓存时如果选中了「网站数据」，这些数据会被清除。建议使用**导出配置**功能定期备份——点击第 1 页页签切换到「配置加载」模式，点击「导出配置」即可下载 `.json` 备份文件。

</details>

<details>
<summary><b>Q: 如何导出/导入配置？</b></summary>

**A:** 点击第 1 页的页签按钮（📄 操作），页签图标会切换为配置加载图标，页面显示两个按钮：

- **导出配置**：将当前配置（含所有目标、匹配规则、操作参数）序列化为 `.json` 文件并触发下载。文件名格式：`auto-op-config-<域名>-<时间戳>.json`
- **导入配置**：选择之前导出的 `.json` 文件 → 显示配置摘要确认 → 备份当前配置 → 导入新配置。如果导入失败，自动回滚到备份配置。

导入时会验证：

1. 文件扩展名是否为 `.json`
2. 文件大小是否 ≤ 10MB
3. JSON 格式是否有效
4. 是否包含 `targets` 数组
5. 是否有有效的配置字段

再次点击页签按钮可退出配置加载模式，返回正常操作界面。

</details>

<details>
<summary><b>Q: 如何重置某个域名下的所有设置？</b></summary>

**A:** 进入第 5 页（⚙ 齿轮图标），**连续点击 4 次**第 5 页的页签按钮（2 秒内），会出现「恢复默认设置」按钮。点击并确认后，脚本会扫描并删除当前域名下所有 `AUTO_OP_` 前缀的 GM 存储键，然后自动刷新页面。

只删除当前域名，不影响其他网站的数据。

</details>

<details>
<summary><b>Q: 不同域名之间的配置能共享吗？</b></summary>

**A:** 不能直接共享。每套配置通过 `AUTO_OP_CFG_<host>_<N>` 键独立存储，`<host>` 为 `window.location.hostname`。这是有意设计——不同网站的 DOM 结构不同，即使相同选择器在同一网站也不一定有效。

如果需要在多个网站使用相似的自动操作，可以：

1. 在一个网站上配置好 → 复制 GM 存储中的配置 JSON
2. 在另一个网站上手动粘贴到对应键中
3. 刷新页面让脚本加载新配置

</details>

<details>
<summary><b>Q: 多套配置可以同时运行吗？如何管理？</b></summary>

**A:** 可以。每套配置完全独立运行，互不干扰。使用场景：

- 配置①：自动点击按钮 A（每 1s）
- 配置②：自动填充表单（每 5s）
- 配置③：自动刷新页面（每 30min）

管理方式：

- 标题栏右侧的 ⑩ 按钮显示当前配置，下拉菜单切换
- 运行中的配置在菜单中有**绿色圆点**指示
- 折叠面板的 ▶/■ 按钮始终控制当前显示的配置
- `configs.some(c => c.isRunning)` 判断是否有任何配置在运行
- WakeLock 仅在所有配置都停止时才释放

</details>

### 面板操作

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 面板遮挡了页面重要内容怎么办？</b></summary>

**A:** 有多种方式减少面板干扰：

1. **折叠面板**：点击 − 按钮折叠，面板缩小为标题栏（约 180-240px 宽，因字体而异）
2. **半透明**：折叠后 1 秒自动变为半透明（`opacity: 0.65`）
3. **拖拽移动**：拖拽标题栏将面板移到屏幕任意位置
4. **省电模式**：第 5 页开启省电模式，隐藏面板，仅显示 4 个浮动元素

</details>

<details>
<summary><b>Q: 面板拖拽位置会保存吗？</b></summary>

**A:** 不会。拖拽仅设置面板的内联 `style.left` / `style.top`，在当前会话中生效。刷新页面后面板位置会重置为默认（左上角）。如需固定位置，可在 Tampermonkey 中通过 `@match` 限定域名后自行修改 CSS 定位。

</details>

### JS 指令

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: fetch 请求的结果没有显示在输出日志中？</b></summary>

**A:** 这是最常见的 JS 指令误区。脚本使用 `new Function()` 沙箱执行代码，**不会**自动返回最后一个表达式的值。异步代码必须显式使用 `return`：

```js
// ❌ 错误：不知道什么时候完成，console 提前恢复
fetch('/api').then(r => r.json()).then(d => console.log(d))

// ✅ 正确：显式 return 返回 Promise，脚本等待完成后才恢复 console
return fetch('/api').then(r => r.json()).then(d => console.log(d))
```

详细原因见[第五课：JS 指令中关于 `new Function()` 与 `return` 关键字的说明](#第五课js-指令)。

</details>

<details>
<summary><b>Q: 指令输出日志太多，如何清理？</b></summary>

**A:** 第 2 页输出日志区域有「清空」按钮，点击即可清空。另外，日志上限为 500 条，超限后自动删除最旧的记录（`shift`）。

</details>

<details>
<summary><b>Q: JS 指令执行出错或 timeout 怎么办？</b></summary>

**A:** 脚本不会对 JS 指令设置执行超时——代码在页面主线程中运行。如果代码卡死（如死循环），整个页面都会卡死。建议：

1. 在编写循环时确保有终止条件
2. `fetch` 请求添加超时机制（浏览器本身有超时）
3. 避免同步 `XMLHttpRequest`
4. 大操作拆分为多次执行

</details>

### 网络监测

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 网络监测开启后页面刷新，之前的请求记录还在吗？</b></summary>

**A:** 是的（v5.2.0+）。刷新前监测开关状态和所有请求记录统一保存到 `AUTO_OP_NETMON_<host>` 键（`{active, requests}` 结构），刷新后自动恢复。刷新时刻会注入一条标记记录（`method=刷新, status=refresh`），方便区分刷新前后的请求。

</details>

<details>
<summary><b>Q: 网络监测会影响页面性能吗？</b></summary>

**A:** 监测是通过拦截 `window.fetch` 和 `XMLHttpRequest` 实现的，会对每个请求额外执行：

1. 克隆响应（`response.clone()`）以读取 body
2. 字符串截取（请求体/响应体截前 50000 字符）
3. UI 更新（DOM 操作）

对于请求量大的页面（如实时数据看板），建议在不需要时关闭监测开关。请求记录上限 500 条，超限后自动删除最旧的记录。

</details>

<details>
<summary><b>Q: 网络监测复制的 fetch 代码可以直接在其他地方使用吗？</b></summary>

**A:** 可以。复制的代码是标准 `fetch()` 调用，去除了脚本特定的 header（如 cookie 等敏感信息会保留在请求头中）。注意事项：

1. 复制单条请求 → 生成完整 `fetch()` 代码，含 method、headers、body
2. 复制全部 → 所有请求用分号 `;` 分隔拼接
3. 跨域请求可能需要目标服务器支持 CORS
4. 部分网站可能有 CSRF 保护，复制的请求可能因 token 过期而失败

</details>

### 自动刷新

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 自动刷新和自动启动有什么区别？</b></summary>

**A:** 两者功能不同：

- **自动刷新**（第 4 页）：定时刷新整个页面（`location.reload()`）。适用于需要定期刷新以获取新数据的页面（如看板、监控页）。刷新后自动恢复操作状态
- **自动启动**（第 3 页）：定时开始操作（不刷新页面）。适用于在特定时间启动自动点击/填充。支持自动循环：启动→运行→停止→重新倒计时→再次启动

两者可以同时使用：比如每 30 分钟自动刷新页面，每次刷新后 1 分钟自动开始操作。

</details>

<details>
<summary><b>Q: 自动刷新后操作状态能恢复多少？</b></summary>

**A:** 跨刷新恢复涵盖以下状态：

- ✅ 当前运行的配置编号（`activeConfig`）
- ✅ 已操作次数（`clickedCount`）
- ✅ 运行计时（通过 `savedTimestamp` 恢复）
- ✅ 最大运行时长剩余时间（扣除已消耗时间）
- ✅ 自动刷新倒计时（精确到毫秒）
- ✅ 刷新日志（含刷新前时间戳和操作信息）
- ✅ 省电模式状态（300ms 延迟恢复）
- ✅ 网络监测开关和请求记录（统一存储在 `NETWORK_MONITOR_KEY` 中）
- ❌ DOM 元素引用（刷新后通过 `tryFindTarget` 重新查找）
- ❌ 正在等待的 `setTimeout`/`setInterval`（刷新后重新创建）

</details>

### 主题

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: Auto 主题模式下，面板颜色没有跟随网页主题？</b></summary>

**A:** `auto` 模式按以下优先级检测：

1. `<html>` 元素的 class 是否包含已知暗色/亮色类名（如 `dark`, `dark-mode`, `night`, `light`, `light-mode` 等 11 种）
2. `<html>` 的 `style` 属性中是否有 `color-scheme`
3. `<html>` 的其他属性值是否匹配 `dark`/`light` 关键字
4. 回退到 `<body>` 重复上述检测
5. 最终回退到系统 `prefers-color-scheme`

如果网页使用了脚本未识别的自定义类名，可能检测不到。此时可手动切换到 `dark` 或 `light` 模式。

</details>

<details>
<summary><b>Q: 页面加载时面板会闪烁（亮变暗或反之）？</b></summary>

**A:** 这是 CSS 变量初始化和 JS 主题检测之间的时序问题。脚本在 CSS 注入时使用 `:root` 默认暗色值，然后 JS 初始化阶段调用 `applyTheme()` 切换到检测到的主题。解决方案是直接使用 `system` 或手动指定 `light`/`dark` 模式，跳过 `auto` 检测的开销。

</details>

### 性能与限制

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 脚本对页面性能有什么影响？</b></summary>

**A:** 脚本设计上尽量减小性能开销：

- **操作间隔 ≥1ms**：用户可设置的最小操作间隔为 1ms
- **UI 节流 100ms**：操作循环中 UI 更新频率上限为 100ms 一次
- **查询缓存**：每个操作周期内相同选择器的查询复用 `Map` 缓存结果
- **日志上限 500 条**：指令输出日志超限后自动删除最旧记录
- **网络记录上限 500 条**：请求记录同样有上限
- **请求体/响应体截断 50000 字符**：避免大响应占用内存
- **CSS 注入一次**：样式在初始化时一次性注入 `<style>` 标签，不重复创建

对于大部分页面，脚本的性能影响几乎不可感知。

</details>

<details>
<summary><b>Q: 脚本可以在多少个网站上同时使用？有数量限制吗？</b></summary>

**A:** 理论上没有限制。每个域名的数据独立存储在 Tampermonkey 的 GM 存储中（内部基于 `localStorage`）：

- 存储上限通常为 5-10MB（因浏览器而异）
- 脚本每个域名约占用几百 KB（取决于目标数量和配置复杂度）
- 10 个域名使用基本不会达到存储上限
- 如果某个域名数据过多，可以使用「恢复默认设置」清除该域名数据

Tampermonkey 本身不限制脚本运行的网站数量，脚本通过 `@match *://*/*` 在所有 HTTP/HTTPS 页面运行。

</details>

<details>
<summary><b>Q: 操作间隔最短可以设置多少？设置 0ms 会怎样？</b></summary>

**A:**

- `clickInterval` 的 `min` 属性为 `1`（最小值 1ms）
- 同时模式：`setInterval(doClickFor, 1)` 约每秒 1000 次操作（受浏览器 `setInterval` 最小间隔限制，通常约 4ms）
- 队列模式：每个目标的 `customInterval` 设为 `0` 则表示立刻处理下一个（`setTimeout(doClickFor, 0)`）
- ⚠️ 过于频繁的操作可能被浏览器节流（特别是后台标签页），也可能触发网站的速率限制或反爬机制

</details>

### 自动启动与恢复

[↑ 回到顶部](#automatic-operation-)

<details>
<summary><b>Q: 自动启动倒计时结束后没有开始操作？</b></summary>

**A:** 按顺序排查：

1. 确认当前配置至少有一个有效目标（绿色 ✅ 状态，非禁用）
2. 确认「操作次数」输入框不是 `0`（0 次会立即停止）
3. 确认「操作时间」没有设置为 `0`（0 分钟会立即停止）
4. 检查自动启动是否在停止后被正确重置：`stopClickingFor` 末尾会调用 `startAutoStartCountdownTimerFor` 重新开始倒计时
5. 打开浏览器控制台，查看是否有 `[AUTO_OP]` 前缀的倒计时相关日志

**自动启动的内部逻辑**（`startAutoStartCountdownTimerFor`，第 5156 行）：

- `autoStartCountdownTimerID` 使用 `setInterval` 每 200ms 更新一次倒计时显示
- 当 `Date.now() >= autoStartNextTime` 时，调用 `startClickingFor(ci)` 启动操作
- 启动后立即 `clearInterval(autoStartCountdownTimerID)` 清除倒计时定时器
- 停止操作后，如果 `autoStartEnabled && autoStartIntervalMin > 0`，重新计算 `autoStartNextTime` 并启动新的倒计时

</details>

<details>
<summary><b>Q: 多套配置同时运行时，WakeLock 和禁止聚焦的行为如何？</b></summary>

**A:** 脚本使用全局共享的 WakeLock 和禁止聚焦状态：

- **WakeLock**：`requestWakeLock()` 检查 `configs.some(c => c.isRunning) || isAutoRefresh`——只要任意配置在运行或自动刷新开启，就保持屏幕常亮。`stopClickingFor` 中检查 `!configs.some(cc => cc.isRunning) && !isAutoRefresh` 时才释放
- **禁止聚焦**：`suppressFocus()` 在每次 `startClickingFor` 时调用（覆盖 `HTMLElement.prototype.focus`），`restoreFocus()` 仅在**所有**配置都停止后才恢复原始 `focus` 方法
- 这意味着：启动第一个配置时激活 WakeLock 和禁止聚焦，后续配置启动不会重复请求，最后一个配置停止时才释放

</details>

<details>
<summary><b>Q: 在 React / Vue / Angular 页面中，填充输入框后数据没有生效？</b></summary>

**A:** 前端框架使用虚拟 DOM 和状态管理，直接设置 `el.value` 不会触发框架的状态更新。脚本通过以下方式兼容：

1. 设置 `value` 后触发原生 `input` 事件（`dispatchEvent(new Event('input', {bubbles: true}))`）——React 通过 `onInput` 监听
2. 同时触发 `change` 事件（`dispatchEvent(new Event('change', {bubbles: true}))`）——Vue 的 `v-model` 依赖 `input` + `change`
3. 对于 `contentEditable` 元素，直接设置 `innerHTML`

如果仍然不生效，说明该网站使用了更复杂的输入处理（如富文本编辑器的 `execCommand`、拼音输入法等），建议改用 JS 指令方式手动操作。

</details>

<details>
<summary><b>Q: 脚本在隐身模式 / 无痕模式下能正常工作吗？</b></summary>

**A:** 大部分情况下可以：

- ✅ 脚本安装后可以正常运行（Tampermonkey 扩展需要在隐身模式下启用）
- ✅ GM 存储在隐身模式下可用（Chrome/Edge 在隐身窗口关闭后清除）
- ⚠️ 「恢复默认设置」删除的数据在隐身模式下无法恢复（隐身窗口关闭后所有数据自动清除）
- ⚠️ 隐身模式下 `Wake Lock` API 可能被浏览器限制
- ⚠️ 部分浏览器的隐身模式可能禁用 `localStorage`（如 Safari 旧版本），导致 GM 存储不可用

需要在 Tampermonkey 扩展管理页面中手动启用「在隐身模式下允许」选项。

</details>

<details>
<summary><b>Q: 选取元素后同一页面上其他相同的元素也被高亮了？</b></summary>

**A:** 这是因为选择器匹配到了多个元素。解决方法：

1. 在目标 ⓘ 详情面板中，开启「父级容器匹配」——将搜索范围限制在特定容器内
2. 如果元素有唯一 `id`，确保「id 匹配」开启
3. 如果元素有独特 `data-*` 属性，确保「data-* 匹配」开启
4. 使用「测试」按钮查看实际匹配了几个元素——如果 > 1，说明选择器过于宽泛
5. 对于完全相同的元素（如列表项中的按钮），考虑放宽匹配条件或手动逐一选取

**注意**：选中高亮（绿色实线框）只显示在 `t.element` 引用上（仅一个元素），即使有多个元素通过了指纹匹配。

</details>

<details>
<summary><b>Q: 同时使用多套配置时，WakeLock 和禁止聚焦的启停逻辑是怎样的？</b></summary>

**A:** 两者都采用「全局共享状态 + 引用计数」模式：

**WakeLock**：

- 请求：`requestWakeLock()` 内部检查 `configs.some(c => c.isRunning) || isAutoRefresh`——只要任意配置在运行或自动刷新开启，即请求屏幕常亮。如果 WakeLock 已激活，不会重复请求
- 释放：`releaseWakeLock()` 内部检查 `!configs.some(cc => cc.isRunning) && !isAutoRefresh`——仅当所有配置停止且自动刷新关闭时才释放
- 页面可见性恢复：`visibilitychange` → `visible` 时，自动重新请求（浏览器会在页面隐藏时自动释放 WakeLock）

**禁止聚焦**：

- `suppressFocus()` 保存 `HTMLElement.prototype.focus` 到 `originalFocus`，然后覆盖为拦截函数（非面板元素调用 focus 时在 capture 阶段 `blur()`）
- `restoreFocus()` 检查 `!configs.some(c => c.isRunning)`——仅当所有配置停止后才还原 `HTMLElement.prototype.focus = originalFocus`
- 多次调用 `suppressFocus()` 不会重复覆盖（因为覆盖的是同一个 function），不会产生引用链问题

**典型场景**：

- 配置①和②同时运行，停止配置① → WakeLock 和禁止聚焦保持激活（配置②仍在运行）
- 配置①运行中，配置②启动 → 不重复请求 WakeLock（已激活），不重复覆盖 focus（已覆盖）
- 所有配置停止 → WakeLock 释放 + focus 恢复

</details>

<details>
<summary><b>Q: 测试按钮显示「pass」但匹配计数为 0 时代表什么？</b></summary>

**A:** 每个匹配规则的测试有两种显示：

- **左侧状态**（`.auto-op-test-result`）：`✓` pass（规则有对应数据可匹配）、`✕` fail（无数据）、`-` disabled（规则已关闭）
- **右侧计数**（`.auto-op-test-count`）：实际的匹配元素数量

`✓ 0` 的含义：规则本身有数据（如指纹中记录了 `className: 'btn primary'`），但当前页面上没有元素满足该规则——可能是目标元素暂时不在 DOM 中、元素已被移除、或 class 在刷新后发生了变化。

此时应：

1. 确认目标元素确实在页面上可见
2. 检查元素的属性/文字是否发生变化
3. 尝试关闭一些过于严格的匹配规则后重新测试

</details>

<details>
<summary><b>Q: 配置导入失败后如何恢复之前的配置？</b></summary>

**A:** 导入流程内置了完整的备份+回滚机制：

1. **导入前备份**：在应用新配置前，脚本会深拷贝当前配置的**全部字段**（包括 `element`、`_blueParent`、`_nearestEl` 等 DOM 引用）保存到 `backup` 对象
2. **应用失败**：如果 JSON 解析、字段写入或 `tryFindTarget` 恢复元素引用过程中任何步骤出错，catch 块会执行：
   - 清除当前配置的高亮（移除 `.auto-op-selected-highlight`、父容器高亮等）
   - 将 `backup` 的每个字段写回配置对象（`Object.assign(c, backup)`）
   - 重新恢复 DOM 元素引用（`tryFindTarget`）
   - 同步 UI（`updateTargetUI()`、`refreshParentHighlights()` 等）
   - 弹出错误提示
3. **结果**：配置完全回滚到导入前的状态，目标列表、匹配规则、操作参数均保持不变

此外，**导出文件包含了 `version`、`exportedAt`、`hostname` 元数据**，可以在导入失败时参考这些信息排查兼容性问题。

</details>

<details>
<summary><b>Q: `buildFetchCode` 生成的 fetch 代码和原始请求有何差异？</b></summary>

**A:** `buildFetchCode`（第 7404 行）生成的代码是对原始请求的简化重建：

**保留的内容**：

- ✅ URL（`JSON.stringify(req.url)` 精确编码）
- ✅ HTTP Method（`JSON.stringify(req.method)`）
- ✅ 请求头（`JSON.stringify(req.reqHeaders)`，所有已记录的 header）
- ✅ 请求体（`JSON.stringify(req.body)`，截取前 50000 字符）

**不保留/有差异的**：

- ❌ Cookie：网络监测记录中不包含 Cookie（浏览器自动管理），生成的 fetch 代码默认不携带 Cookie。如需携带，需手动添加 `credentials: 'include'`
- ❌ 动态 Header：如 CSRF Token 可能已过期
- ❌ 响应处理：生成的是 `.then(r => r.text()).then(console.log)`（输出到控制台），而非原始业务逻辑
- ❌ multipart/form-data 请求体：仅保留前 50000 字符的字符串表示，不可直接使用
- ⚠️ 「刷新」标记记录（`status: 'refresh'`）生成 `location.reload()` 而非 fetch 代码

</details>

<!-- markdownlint-enable MD033 -->

---

## 界面总览

[↑ 回到顶部](#automatic-operation-)

### 标题栏（从左到右）

[↑ 回到顶部](#automatic-operation-)

| 元素 | 说明 |
| --- | --- |
| −/+ 折叠按钮 | 折叠/展开面板，折叠后标题栏出现 ▶ 播放/■ 停止按钮 |
| ▶/■ 开始/停止 | **仅折叠状态显示**，绿色播放 / 红色停止，fade-in 动画 |
| 自动操作 | 面板标题，右对齐，使用 MiSans VF 字体 |
| ①~⑩ 配置切换 | 下拉菜单切换配置，运行中的有绿色圆点指示 |

### 五个页面

[↑ 回到顶部](#automatic-operation-)

| 页码 | data-page | 图标 | 内容 |
| --- | --- | --- | --- |
| 第 1 页 | 0 | 📄 操作 / 配置加载 | 操作策略、目标列表、选取/开始按钮；再次点击页签切换为「配置加载」模式（导入/导出配置） |
| 第 2 页 | 1 | </> 代码 | JS 代码输入、快捷预设、📡 网络监测入口、输出日志；连续点击4次→一键清除所有自动启动 |
| 第 3 页 | 2 | ⚙ 滑块 | 操作次数/时间/间隔、自动启动、元素消失处理 |
| 第 4 页 | 3 | 🔄 刷新 | 自动刷新开关、刷新间隔、刷新进度条、刷新日志 |
| 第 5 页 | 4 | ⚙ 齿轮 | 选取放行、省电模式、屏幕常亮、禁止聚焦、主题、字体 |

**页面切换**：切换时自动关闭所有 overlay（info/settings/network），离开第 5 页时隐藏恢复默认按钮，离开第 2 页时清零 `page2ClickCount` 计数。

### 三种 Overlay 面板

[↑ 回到顶部](#automatic-operation-)

| Overlay | 触发方式 | 内容 |
| --- | --- | --- |
| **infoOverlay** | 目标 ⓘ 按钮 | 匹配规则详情 + 测试按钮 + 匹配计数 |
| **settingsOverlay** | 目标 ⚙ 按钮 | 元素设置（启用、描述、填充、JS指令、间隔、高亮、滚动、父级） |
| **networkOverlay** | 📡 按钮 | 网络请求监测列表 + 工具栏 |

三者互斥，从右侧滑入/滑出（`translateX(105%)` → `translateX(0)`，过渡动画 `transition: transform 0.25s`）。

### 省电模式 Overlay

[↑ 回到顶部](#automatic-operation-)

| 元素 | ID | 说明 |
| --- | --- | --- |
| 当前时间 | `ps-time` | 顶部分布，实时 HH:MM:SS |
| 运行时长 | `ps-elapsed` | 中部，格式 `已运行 HH:MM:SS` |
| 已操作次数 | `ps-count` | 中部，格式 `已操作 N 次` |
| 开关 | `ps-switch` | 切换开关，控制省电模式启停 |

---

## 参数速查表

[↑ 回到顶部](#automatic-operation-)

| 参数 | 位置 | 默认值 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| 操作策略 | 第1页 | 同时操作 | select | 同时/队列（有多个目标时可切换） |
| 操作次数 | 第3页 | ∞ | number | 留空=无限 |
| 操作时间 (min) | 第3页 | ∞ | number | 最大运行时长，支持小数 |
| 自动启动 (min) | 第3页 | 关闭 | number | 定时自动开始，支持小数 |
| 操作间隔 (ms) | 第3页 | 1000 | number | min=1 |
| 元素消失后 | 第3页 | 等待重试 | select | 等待重试/立即停止 |
| 自动刷新 | 第4页 | 关闭 | boolean | 定时刷新开关 |
| 刷新间隔 (s) | 第4页 | 60 | number | 10–86400 |
| 选取放行 | 第5页 | 关闭 | boolean | 选取时穿透点击 |
| 省电模式 | 第5页 | 关闭 | boolean | 全屏黑遮罩 |
| 屏幕常亮 | 第5页 | 关闭 | boolean | Wake Lock |
| 禁止聚焦 | 第5页 | 关闭 | boolean | 阻止页面抢焦点 |
| 主题 | 第5页 | system | select | auto/system/light/dark |
| 面板字体 | 第5页 | MiSans VF | select | MiSans VF/system-ui |

### 每元素参数（元素设置面板）

[↑ 回到顶部](#automatic-operation-)

| 参数 | 默认值 | 类型 | 说明 |
| --- | --- | --- | --- |
| 启用此元素 | true | boolean | 关闭后跳过该目标 |
| 元素描述 | 自动生成 | string | 自定义目标名称 |
| 输入元素 | false | boolean | 标记为填充操作 |
| 填充文本 | 空 | string | 填充的内容 |
| JS 指令 | 空 | string | 指令代码（仅指令目标） |
| 独立间隔 (ms) | 空(全局) | number | 操作后等待时间 |
| 启用高亮 | true | boolean | 绿色选中高亮 + 父容器高亮 |
| 滚动到可视区 | false | boolean | 操作前 scrollIntoView |
| 显示父级 | false | boolean | 显示父容器高亮框 |
| 按键绑定 | 空 | string | 自定义按键组合（v5.2.9+），如 `Ctrl+K`、`F2` |

### 每元素匹配开关（info 面板）

[↑ 回到顶部](#automatic-operation-)

| 开关 | 默认值 | 说明 |
| --- | --- | --- |
| 标签匹配 | true | 匹配 HTML tagName |
| 文字匹配 | true | 匹配文本内容 |
| 文字模式 | exact | exact / fuzzy |
| id 匹配 | 有 id 时为 true | 匹配 id 属性 |
| class 匹配 | 有 class 时为 true | 匹配全部 CSS class |
| 标准属性匹配 | true | 匹配 href/src/type/name 等 |
| data-* 匹配 | true | 匹配自定义属性 |
| onclick 匹配 | 有 onclick 时为 true | 匹配内联事件参数 |
| 父级容器匹配 | 有父容器时为 true | 限制搜索范围 |

---

## 技术参考

[↑ 回到顶部](#automatic-operation-)

### 架构概览

[↑ 回到顶部](#automatic-operation-)

脚本是一个 **IIFE**（立即执行函数表达式），`document-idle` 时运行在 `*://*/*`。**无任何外部 JS 依赖**。

**环境检测**（第 18–40 行）：

```js
(function() {
    if (!location.protocol.startsWith('http')) return;  // 非HTTP页面跳过
    if (!document.body) {
        console.error('[AUTO_OP] body 跳过:');
        return;
    }
    const IS_TOP = (() => {
        try {
            return window.top === window.self;
        } catch (e) {
            console.error('[AUTO_OP] IS_TOP 异常:', e);
            return true;  // 跨域 iframe 异常 → 当作顶层继续
        }
    })();
    if (!IS_TOP) return;  // iframe 内跳过
    const IS_MOBILE = (() => {
        try {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
        } catch (e) {
            console.error('[AUTO_OP] IS_MOBILE 异常:', e);
            return false;
        }
    })();

```

**全局状态变量**（第 41–87 行）：

```js
const SHARED_KEY = 'AUTO_OP_SHARED_' + window.location.hostname;
const REFRESH_STATE_KEY = 'AUTO_OP_REFRESH_STATE_' + window.location.hostname;
const NETWORK_MONITOR_KEY = 'AUTO_OP_NETMON_' + window.location.hostname;
const PER_CONFIG_KEY = 'AUTO_OP_CFG_' + window.location.hostname + '_';

let isAutoRefresh = false, refreshIntervalSec = 60, refreshTimerID = null,
    refreshStartTimestamp = 0, _refreshIntervalAtStart = 60,
    refreshProgressTimerID = null, refreshLogs = [];
let currentPage = 0;
const PAGE_COUNT = 5;
let isConfigLoadMode = false;
let collapseAnimPhase = 'collapsed', collapsedWidth = 300;
let wakeLock = null, stateTimerID = null;
let isPicking = false, isDarkMode = false;
let originalFocus = HTMLElement.prototype.focus, focusinHandler = null,
    _suppressFocusCount = 0;
let elapsedTimerID_global = null;
let isProgrammaticClick = false;
let pickPassThrough = false;
let panelFont = 'MiSans VF';
let isPowerSave = false, powerSaveTimerID = null;
let themeMode = 'system';
let _testHighlightedElements = [];
let panelTransparentTimer = null, panelClickRestoreTimer = null,
    isPanelTransparent = false;
let cmdOutputLogs = [], cmdHistory = [], cmdHistoryIndex = -1;
let isNetworkMonitoring = false, networkRequests = [],
    _origFetch = null, _origXHROpen = null, _origXHRSend = null,
    _networkReqId = 0;

```

**网络监测状态恢复**（第 89–113 行）：初始化时从 `NETWORK_MONITOR_KEY` 恢复监测开关状态和历史请求记录（`{active, requests}` 结构）。如果监测开关之前为开启，注入一条「刷新」标记记录。

**10 套配置数组**（第 114–145 行）：

```js
const CONFIG_COUNT = 10;
const CONFIG_NAMES = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
// CONFIG_SVGS: 10 个内联 SVG 图标（数字 1-10 的独特路径）
let activeConfig = 0;
let configs = [];
for (let i = 0; i < CONFIG_COUNT; i++) {
    configs.push({
        targets: [], isRunning: false, timerID: null, clickedCount: 0,
        maxClicks: Infinity, clickInterval: 1000,
        clickStrategy: 'simultaneous', currentQueueIndex: 0,
        waitStartTime: 0, isWaiting: false, waitTimerID: null,
        operationStartTimestamp: 0, autoStartEnabled: false,
        autoStartIntervalMin: 0, autoStartCountdownTimerID: null,
        autoStartNextTime: 0, maxDurationMin: 0, maxDurationTimerID: null,
        uiThrottled: false,
        doClickLastUIUpdate: 0, missingAction: 'wait'
    });
}
function cv() { return configs[activeConfig]; }

```

**数据流**：

```text
用户操作 → DOM 事件 → 状态变量更新 → savePerConfig()/saveShared()
                                            ↓
                                  GM 存储（按域名隔离，GM_setValue/GM_getValue）
                                            ↓
页面刷新 → loadData() → 状态恢复 → UI 同步 → 继续运行
                                            ↓
                          isNetworkMonitoring + networkRequests 恢复（NETWORK_MONITOR_KEY）

```

---

### 元素选取与指纹（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`buildBaseSelector(el)`** — 第 3894 行：

```js
function buildBaseSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);          // id优先 → #id
    let sel = el.tagName.toLowerCase();                  // tagName
    if (el.className && typeof el.className === 'string') {
        const cls = el.className.trim().split(/\s+/)
            .filter(c => c && !c.startsWith('auto-op-'))  // 过滤脚本类名
            .map(c => '.' + CSS.escape(c)).join('');
        if (cls) sel += cls;                             // → tag.class1.class2
    }
    return sel;
}

```

**`buildAncestorSelector(el)`** — 第 3904 行：

```js
function buildAncestorSelector(el) {
    const base = buildBaseSelector(el);
    if (el.id) return base;                // 有id直接返回 #id
    const idx = getNthOfType(el);          // 计算在同标签兄弟中的位置
    return base + ':nth-of-type(' + idx + ')';  // 始终追加（v5.2.3+），保持一致性
}

```

示例：`div.content` 中第 2 个 `<button>`:

- 返回: `button.primary:nth-of-type(2)`

**`getElementFingerprint(el)`** — 第 3976 行：

```js
function getElementFingerprint(el) {
    const dataAttrs = {}, attrs = {};
    const keyAttrs = ['href','src','value','type','name','role',
        'alt','title','placeholder','action','method','onclick'];
    Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) dataAttrs[attr.name] = attr.value;
        else if (keyAttrs.includes(attr.name)) attrs[attr.name] = attr.value;
    });
    // 提取 onclick="fn(N)" 中的参数（通用，匹配第一个括号内容）
    let onclickParam = '';
    if (attrs.onclick) {
        const match = attrs.onclick.match(/\(([^)]*)\)/);
        if (match) onclickParam = match[1];
    }
    let text = getElText(el);
    if (!text && isInputField(el) && el.value != null && String(el.value).trim())
        text = String(el.value).trim();  // 输入框用 value 作为文本
    return {
        tagName: el.tagName.toLowerCase(), text, dataAttrs, attrs,
        onclickParam, id: el.id || '',
        className: (typeof el.className === 'string'
            ? el.className.trim().split(/\s+/)
                .filter(c => c && !c.startsWith('auto-op-')).join(' ') : ''),
        hasStrong: !!el.id || Object.keys(dataAttrs).length > 0
            || keyAttrs.some(k => attrs[k])
    };
}

```

指纹示例：

```js
{ tagName: 'button', text: '提交订单', id: 'submit-btn',
  className: 'btn primary large',
  dataAttrs: { 'data-id': '88234', 'data-type': 'submit' },
  attrs: { type: 'button', name: 'submit', role: 'button' },
  onclickParam: '42', hasStrong: true }

```

**`selectTarget(el)`** — 选取核心函数，流程：

1. 清除待机状态定时器
2. 移除元素的 hover 高亮（`auto-op-highlight`）
3. 调用 `buildAncestorSelector(el)` 构建祖先选择器
4. 调用 `getElementFingerprint(el)` → fingerprint 对象（onclick 正则通用化：`/\(([^)]*)\)/`）
5. 构建描述字符串：`tag#id.class "text" (isInput)`
6. 向上遍历祖先链构建 `parentSelector` 和 `parentChain`（`parentChain` 仅存 `[{selector}]`，不含 `desc`）
7. 组装 `targetObj`（含 25+ 字段：element, fingerprint, desc, isInput, parentSelector, parentChain, nearestParent, blueParent, _isValid, enabled, enableHighlight, matchTag, matchText, matchTextMode, matchDataAttrs, matchAttrs, matchOnclick, matchParent, matchId, matchClass 等，无 `missCount`）
8. → `c.targets.push(targetObj)`，设置选中高亮，不退出选取（可继续选取更多目标）
9. 不再区分单选/多选模式 → 始终 `push` 新目标，用户可手动退出选取
10. **选取防抖**（v5.2.3+）：`endPickClick` 事件增加 500ms 防抖（`lastPickTime`），避免触屏设备的 touchend + click 双重触发导致重复添加
11. UI 更新：`updateTargetUI()`, `updateTargetCount()`, `refreshParentHighlights()`, `savePerConfig()`

**`getElText(el)`** — 深度优先遍历提取可见文本节点（跳过 `<script>`/`<style>`/`<title>`），每节点截取前 300 字符，总上限 600 字符。额外回退 `alt`/`title`/`placeholder`/`aria-label`/`value` 属性（无字符限制）。用于弱指纹元素（无 id/class/属性）的精确文字提取。

**`isInputField(el)`** — 第 3920 行：

```js
function isInputField(el) {
    if (!el) return false;
    if (el.isContentEditable || el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
        const t = (el.type || '').toLowerCase();
        return t !== 'checkbox' && t !== 'radio' && t !== 'hidden'
            && t !== 'file' && t !== 'color' && t !== 'submit'
            && t !== 'button' && t !== 'reset' && t !== 'image';
    }
    return false;
}

```

---

### 匹配规则与目标查找（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`matchesFingerprint(el, t)`** — 第 4003 行，65 行核心函数：

```js
function matchesFingerprint(el, t) {
    if (!el) return false;
    const fp = t.fingerprint;
    // 读取各匹配开关（默认值为true，即非false时开启）
    const matchTag        = t.matchTag !== false;
    const matchText       = t.matchText !== false;
    const matchDataAttrs  = t.matchDataAttrs !== false;
    const matchAttrs      = t.matchAttrs !== false;
    const matchOnclick    = t.matchOnclick !== false;
    const matchId         = t.matchId !== false;
    const matchClass      = t.matchClass !== false;
    const matchParent     = t.matchParent !== false;
    const textMode        = t.matchTextMode || 'exact';

    // ① 标签匹配
    if (matchTag && el.tagName.toLowerCase() !== fp.tagName) return false;

    // ② 父级容器匹配（双重校验：querySelector + contains）
    if (matchParent && t.parentSelector) {
        let parent;
        try { parent = document.querySelector(t.parentSelector); } catch(e){}
        if (!parent || !parent.contains(el)) return false;
    }

    // ③ id匹配
    if (matchId && fp.id && el.id !== fp.id) return false;

    // ④ class匹配（全部fp.class的class都必须在el上）
    if (matchClass && fp.className) {
        const fpClasses = fp.className.split(/\s+/).filter(Boolean);
        const elClasses = (typeof el.className === 'string'
            ? el.className.trim() : '').split(/\s+/).filter(Boolean);
        if (!fpClasses.every(c => elClasses.includes(c))) return false;
    }

    // ⑤ data-* 属性匹配（逐个比对，值非空才检查）
    if (matchDataAttrs) {
        for (const [k, v] of Object.entries(fp.dataAttrs))
            if (v && el.getAttribute(k) !== v) return false;
    }

    // ⑥ 标准属性匹配
    if (matchAttrs) {
        for (const [k, v] of Object.entries(fp.attrs))
            if (v && el.getAttribute(k) !== v) return false;
    }

    // ⑦ onclick参数匹配（通用：fn(N)中的N）
    if (matchOnclick && fp.onclickParam !== undefined && fp.onclickParam !== null) {
        const m = (el.getAttribute('onclick')||'').match(/\(([^)]*)\)/);
        if (m && m[1] !== fp.onclickParam) return false;
    }

    // ⑧ 文字匹配（完全/模糊，hasStrong时走快捷路径）
    if (matchText && fp.text) {
        let elText;
        if (fp.hasStrong) {
            elText = (el.textContent || '').trim();         // 快速路径
        } else {
            elText = getElText(el);                          // 完整提取
        }
        if (!elText) return false;
        if (textMode === 'fuzzy') {
            if (!elText.includes(fp.text)) return false;    // 模糊匹配
        } else {
            if (elText !== fp.text) return false;           // 完全匹配
        }
    }
    return true;  // 所有开启的规则全部通过
}

```

**查询缓存**（第 4091–4103 行）：

```js
let _queryCache = null;

function beginQueryCycle() { _queryCache = new Map(); }

function cachedQuery(root, selector) {
    const key = (root === document ? ':doc:' : '') + selector;
    if (_queryCache.has(key)) return _queryCache.get(key);
    const result = root.querySelectorAll(selector);
    _queryCache.set(key, result);
    return result;
}

```

每个操作周期调用 `beginQueryCycle()` 重置缓存。同一周期内对同一选择器的重复查询复用结果。不同 `root`（父容器 vs document）通过 key 前缀 `:doc:` 区分。

**`tryFindTarget(targetObj)`** — 第 4126 行，三级查找+回退：

```js
function tryFindTarget(targetObj) {
    if (!targetObj || !targetObj.fingerprint) return null;
    const fp = targetObj.fingerprint;

    function verifyList(list) {
        const matched = [];
        for (const el of list) {
            if (panel.contains(el)) continue;    // 跳过面板自身元素
            if (matchesFingerprint(el, targetObj)) matched.push(el);
        }
        return matched.length > 0 ? matched : null;
    }

    // 三级尝试：compoundSelector（含父链） → cssSel（目标自身） → tagName
    const compoundSel = buildCompoundSelector(targetObj);
    const cssSel = fp.id ? '#' + CSS.escape(fp.id)
        : fp.tagName + (fp.className ? '.' + fp.className
            .split(/\s+/).filter(Boolean).map(c => CSS.escape(c)).join('.') : '');
    try {
        if (compoundSel && compoundSel !== cssSel) {
            const found = verifyList(cachedQuery(document, compoundSel));
            if (found) return found;
        }
        const found = verifyList(cachedQuery(document, cssSel));
        if (found) return found;
        if (cssSel !== fp.tagName) {
            const found2 = verifyList(cachedQuery(document, fp.tagName));
            if (found2) return found2;
        }
    } catch (e) {}
    return null;
}

```

**`resolveParentInfo(el)`** — 第 4155 行：

从目标元素向上遍历祖先，找到第一个有 `id` 或 `class` 的父级作为 `blueParent`，直接父元素作为 `nearestParent`。

**`refreshParentHighlights()`** — 第 4198 行：

```js
function refreshParentHighlights() {
    if (isPowerSave) return;
    // 1. 遍历当前配置所有目标，收集 blueParent → newBlueMap,
    //    nearestParent → newNearestMap
    // 2. 清理旧高亮（_blueParent/_nearestEl不在新Map中的移除class）
    // 3. 应用新高亮：
    //    - blueParent同时是nearestParent → .auto-op-parent-highlight-Overlap（细蓝框）
    //    - blueParent不是nearestParent → .auto-op-parent-highlight（粗蓝阴影）
    //    - nearestParent不是blueParent → .auto-op-nearest-parent-highlight（红色虚线）
}

```

---

### 操作执行（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`startClickingFor(ci, savedTimestamp)`** — 第 7544 行，91 行核心启动函数：

```js
function startClickingFor(ci, savedTimestamp) {
    const c = configs[ci];
    if (isPicking && ci === activeConfig) exitPickMode();
    c.isWaiting = false;
    if (c.waitTimerID) { clearTimeout(c.waitTimerID); c.waitTimerID = null; }

    // 重新解析所有目标元素（刷新后element引用失效，通过tryFindTarget恢复）
    for (let i = 0; i < c.targets.length; i++) {
        const t = c.targets[i];
        if (!t.isCommand && (!t.element || !document.contains(t.element))) {
            const found = tryFindTarget(t);
            if (found && found.length > 0) {
                t.element = found[0];
                const parentInfo = resolveParentInfo(found[0]);
                t.nearestParent = parentInfo.nearestParent;
                t.blueParent = parentInfo.blueParent;
                if (ci === activeConfig && t.enableHighlight !== false
                    && t.enabled !== false)
                    found[0].classList.add('auto-op-selected-highlight');
            }
        }
    }

    // 从UI读取最新参数
    if (ci === activeConfig) {
        c.clickInterval = parseInt(clickIntervalInput.value) || 1000;
        c.maxClicks = maxClicksInput.value.trim() === ''
            ? Infinity : (parseInt(maxClicksInput.value) || Infinity);
        c.missingAction = missingActionSelect.value;
    }

    c.isRunning = true; c.clickedCount = 0; c.currentQueueIndex = 0;

    // UI 更新：按钮变红、禁用参数输入、状态栏显示运行中
    startElapsedTimer(savedTimestamp || 0);

    // 启动最大运行时长定时器（支持跨刷新恢复，已消耗时间被正确扣除）
    if (c.maxDurationMin > 0) {
        const maxDurationMs = c.maxDurationMin * 60 * 1000;
        const alreadyElapsed = savedTimestamp ? (Date.now() - savedTimestamp) : 0;
        const remaining = Math.max(0, maxDurationMs - alreadyElapsed);
        if (remaining <= 0) { stopClickingFor(ci); return; }
        c.maxDurationTimerID = setTimeout(() => {
            if (c.isRunning) stopClickingFor(ci);
        }, remaining);
    }

    doClickFor(ci);  // 首次立即执行
    if (c.clickStrategy !== 'sequential')
        c.timerID = setInterval(() => doClickFor(ci), c.clickInterval);
        // 队列模式由doClickFor内部setTimeout链驱动

    requestWakeLock(); suppressFocus(); savePerConfig(ci);
}

```

**`doClickFor(ci)`** — 第 7726 行，~188 行核心操作循环：

```js
function doClickFor(ci) {
    isProgrammaticClick = true;   // 标记为脚本触发，供全局click监听器判断
    try {
        const c = configs[ci];
        if (!c.isRunning || c.targets.length === 0) {
            stopClickingFor(ci); return;
        }
        beginQueryCycle();          // 重置查询缓存

        // UI节流：100ms内不重复更新
        const now = Date.now();
        c.uiThrottled = (now - c.doClickLastUIUpdate) < 100;
        if (!c.uiThrottled) c.doClickLastUIUpdate = now;

        // 评估每个目标状态：true=有效, false=缺失, 'disabled'=已禁用
        const status = c.targets.map((t, i) => {
            if (t.enabled === false) return 'disabled';
            let isValid = t.isCommand || (t.element
                && document.contains(t.element)
                && matchesFingerprint(t.element, t));
            if (!isValid && !t.isCommand) {
                const found = tryFindTarget(t);     // 尝试恢复
                if (found && found.length > 0) {
                    t.element = found[0];
                    const parentInfo = resolveParentInfo(found[0]);
                    t.nearestParent = parentInfo.nearestParent;
                    t.blueParent = parentInfo.blueParent;
                    isValid = true;
                }
            }
            return isValid;
        });
        for (let i = 0; i < totalCount; i++) c.targets[i]._isValid = status[i];

        // ─── 队列模式 ───
        if (c.clickStrategy === 'sequential') {
            let idx = c.currentQueueIndex;
            if (status[idx] === 'disabled') {
                c.currentQueueIndex = (idx+1) % totalCount;  // 跳过禁用
            } else if (status[idx]) {
                const t = c.targets[idx], el = t.element;
                if (t.scrollIntoView)
                    el.scrollIntoView({behavior:'smooth', block:'center'});
                // 三种操作类型：
                if (t.isCommand) {
                    runUserCommand(t.customCommand, el, t, ci, idx);
                } else if (t.isInput) {
                    el.value = t.customFill || '';
                    el.dispatchEvent(new Event('input', {bubbles:true}));
                    el.dispatchEvent(new Event('change', {bubbles:true}));
                } else { el.click(); }
                c.clickedCount++;
                c.currentQueueIndex = (idx+1) % totalCount;
                // customInterval 决定下次延迟
                let nextDelay = t.customInterval != null
                    ? Number(t.customInterval) : c.clickInterval;
                c.timerID = setTimeout(() => doClickFor(ci), nextDelay);
            } else {
                // 元素缺失 → missingAction判断
                if (c.missingAction === 'stop') stopClickingFor(ci);
                else startWaitTimer(ci, idx);  // 等待重试
            }
        }
        // ─── 同时模式 ───
        else {
            for (let i = 0; i < totalCount; i++) {
                if (status[i] !== true) continue;
                // 同上三种操作类型...
                c.clickedCount++;
            }
            if (c.clickedCount >= c.maxClicks) stopClickingFor(ci);
        }
    } catch(e) { console.error('[AUTO_OP] doClickFor异常:', e);
    } finally {
        isProgrammaticClick = false;  // v5.2.3: 移入 finally 确保异常时也恢复
    }
}

```

**`startWaitTimer(ci, idx)`** — 第 7693 行：

```js
function startWaitTimer(ci, idx) {
    const c = configs[ci];
    function update() {
        if (!c.isWaiting || !c.isRunning) return;
        const elapsed = Date.now() - c.waitStartTime;
        const remaining = c.clickInterval * 2 - elapsed;   // 最大等待=间隔×2（v5.2.3 轮询 5ms）
        if (remaining <= 0) {
            c.isWaiting = false;
            c.currentQueueIndex = (idx+1) % c.targets.length; // 超时跳过
            return;
        }
        c.waitTimerID = setTimeout(update, 5);             // 每5ms轮询（v5.2.3 从 1ms 调整）
    }
    update();
}

```

**`stopClickingFor(ci)`** — 第 7644 行，45 行停止函数：

1. 清除所有定时器（timerID、waitTimerID、maxDurationTimerID、stateTimerID）
2. 停止运行计时器（仅 activeConfig）
3. 恢复焦点（仅当所有配置都停止时）
4. 释放 WakeLock（仅当所有配置都停止且未开启自动刷新时）
5. 如果设置了自动启动，设置下次启动时间并开始倒计时
6. 恢复 UI：开始/停止按钮、参数输入框解锁
7. 更新配置按钮标签

---

### UI 节流机制

[↑ 回到顶部](#automatic-operation-)

`doClickFor(ci)` 中内置了 **100ms UI 更新节流**，避免高频操作时频繁的 DOM 操作影响性能：

```js
// doClickFor 内部
const now = Date.now();
c.uiThrottled = (now - c.doClickLastUIUpdate) < 100;
if (!c.uiThrottled) c.doClickLastUIUpdate = now;
```

**节流影响的操作**：

- 刷新父容器高亮（`refreshParentHighlights`）
- 更新目标列表 UI（`updateTargetUI`）
- 更新目标计数（`updateTargetCount`）
- 更新状态栏显示

**注意**：`uiThrottled` 仅影响 UI 更新，不影响实际的元素操作（click/fill/command）。

---

### 初始化流程（源码详解）

[↑ 回到顶部](#automatic-operation-)

初始化在 IIFE 末尾执行（第 7908–8032 行），共约 124 行。以下是完整流程：

```text
1. 事件绑定（全局）
   ├── panel click (capture) → 关闭配置菜单
   ├── panel mousedown → 半透明面板点击恢复
   └── document visibilitychange → WakeLock 恢复 + 网络监测保存

2. detectBrowserTheme() → 从浏览器/系统检测初始主题

3. loadData()
   ├── loadShared() → 恢复 11 个全局状态
   ├── loadPerConfig(ci) ×10 → 恢复每套配置
   └── applyTheme() + startThemeWatchers() → 应用主题

4. 初始折叠动画（无过渡）
   ├── panel + body transition = 'none'（禁用过渡）
   ├── panel.classList.add('collapsed')
   ├── toggleBtn 设为 + 图标
   ├── measureCollapsedWidth() → 计算折叠宽度
   ├── panel.style.width = collapsedWidth + 'px'（立即设置）
   ├── void panel.offsetWidth（强制回流）
   ├── panel + body transition = ''（恢复过渡）
   └── schedulePanelTransparent(1000) → 1s 后半透明

5. 页面初始化
   ├── goToPage(currentPage, false) → 跳转到上次页面
   └── 更新面板高度

6. 观察器注册
   ├── ResizeObserver ×5 → 观察全部 5 个 page → updatePageHeight()
   ├── ResizeObserver → 观察 #auto-op-cmd-input → updatePageHeight()
   └── MutationObserver → 观察 cmdInput style 属性（兜底）→ updatePageHeight()

7. 跨刷新状态恢复（restoreAutoRefreshState IIFE）
   ├── 恢复刷新日志（兼容旧字符串格式和新的 {time, msg} 格式）
   ├── 恢复省电模式（300ms 延迟）
   ├── 恢复自动刷新倒计时（精确恢复 remaining 或全新开始）
   │   ├── remaining > 0 → refreshStartTimestamp = now - (total - remaining)
   │   │                   → startAutoRefreshCountdown(false)
   │   └── remaining ≤ 0 → startAutoRefreshCountdown(true) 立即开始
   ├── 恢复运行中配置（200ms 延迟）
   │   └── startClickingFor(ciNum, rState.opStart) + 恢复 clickedCount
   └── clearRefreshState() → 删除临时刷新状态

8. 自动启动倒计时恢复（500ms 延迟）
   └── 遍历 10 套配置 → 已停止 + autoStartEnabled → 设置下次启动时间 + 启动倒计时

9. 网络监测恢复
   ├── isNetworkMonitoring 为 true → 重置为 false → startNetworkMonitor()（确保拦截器正确挂载）
   ├── networkRequests.length > 0 → renderNetworkList() + updateNetworkCount()
   └── 同步 networkToggle 和 btnNetworkMonitor 状态

10. panel.style.visibility = ''（面板可见）
```

**关键初始化原则**：

- 折叠动画在初始加载时禁用（`transition = 'none'`），避免首次渲染时出现从全宽收缩到折叠宽度的闪烁动画
- 跨刷新恢复按优先级分阶段执行：刷新状态（同步）→ 运行恢复（200ms 延迟，等 DOM 就绪）→ 自动启动（500ms 延迟，等运行恢复完成）
- 网络监测恢复采用「先关闭再重新开启」策略：将 `isNetworkMonitoring` 重置为 `false`，然后调用 `startNetworkMonitor()`，确保 `_origFetch`/`_origXHROpen`/`_origXHRSend` 引用的是当前页面的原始方法（而非刷新前被覆盖的方法）
- `goToPage` 中的「回弹机制」：`clamped === currentPage` 时直接 return，不触发任何操作——初始化时如果 `currentPage === 0`（默认首页），不会重复执行页面切换

---

### 指令系统（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`runUserCommand(code, el, t, ci, idx, onSettle)`** — 第 6826 行：

```js
function runUserCommand(code, el, t, ci, idx, onSettle) {
    const c = configs[ci];
    const targetList = c.targets;
    const logs = [];
    const _orig = {};

    // 1. 拦截 console 输出
    ['log','warn','error','info','debug'].forEach(m => {
        _orig[m] = console[m];
        console[m] = function() {
            const args = Array.prototype.slice.call(arguments);
            logs.push({
                type: m,
                msg: args.map(a => typeof a === 'object'
                    ? JSON.stringify(a,null,0) : String(a)).join(' ')
            });
            _orig[m].apply(console, arguments);  // 透传到原始console
        };
    });

    function flushLogs()   { logs.forEach(l => appendCmdOutput(l.type, l.msg));
                             logs.length = 0; }
    function restoreConsole() {
        Object.keys(_orig).forEach(m => { console[m] = _orig[m]; });
    }
    function finalize(success, errorMsg, result) {
        flushLogs(); restoreConsole();
        if (!success) appendCmdOutput('error', errorMsg);
        else appendCmdOutput('result', '↳ ' + (result === undefined ? 'undefined'
            : (typeof result === 'object'
                ? JSON.stringify(result,null,0) : String(result))));
    }

    // 2. new Function 沙箱执行
    let result, success = true, errorMsg = '';
    try {
        const fn = new Function('$el','$target','$config','$index','$targets', code);
        result = fn(el, t, c, idx, c.targets);
    } catch(e) {
        success = false; errorMsg = e.message || String(e);
        finalize(false, errorMsg, undefined);
        return { success: false, error: errorMsg, logs };
    }

    // 3. 支持 async/await：返回值是Promise时自动then/catch（v5.2.3+ 15s 超时守卫）
    if (result && typeof result.then === 'function') {
        let settled = false;
        const settle = (ok, msg, val) => {
            if (settled) return; settled = true; clearTimeout(guard);
            flushLogs(); finalize(ok, msg, val);
        };
        const guard = setTimeout(() => settle(false, '超时(15s)：Promise 未解决', undefined), 15000);
        result.then(val => settle(true, '', val))
              .catch(e => settle(false, e.message||String(e), undefined));
        return { success: true, pending: true, logs };
    }

    finalize(success, errorMsg, result);
    return { success, result, error: errorMsg, logs };
}

```

#### 关键设计：Promise 检测与 console 恢复时机

[↑ 回到顶部](#automatic-operation-)

`new Function()` 创建的函数**不会自动返回最后一个表达式**——必须显式 `return`。因此代码分两条路径：

- **Promise 路径**：代码中有 `return fetch(...)` → `result` 为 Promise → 注册 `.then()` 回调 → 异步完成后才调用 `flushLogs()` + `finalize()` → console 拦截在 Promise resolve 后才恢复，确保所有异步 `console.log` 输出被捕获
- **非 Promise 路径**：代码中没有 `return` → `result` 为 `undefined` → 立即调用 `finalize()` → console 提前恢复 → 异步代码的 `console.log` 直接输出到原生控制台，不被面板拦截

这就是为什么涉及异步操作时必须在代码前加 `return`。

**输入框事件绑定**（第 6718–6808 行）：

- `cmdTestBtn` click → 取第一个有效目标元素，调用 `runUserCommand`
- `cmdTargetBtn` click → 包装为 `isCommand:true` 目标加入队列
- `cmdInput` keydown → `Ctrl+Enter` 执行、`↑`/`↓` 浏览历史
- `cmdPresetSelect` change → 填入预设代码
- `cmdOutput` click → 事件委托，展开/折叠日志（超过 150 字符的日志可点击切换）

**日志系统**：`appendCmdOutput` 添加日志条目（含时间戳），上限 500 条（超限 `shift` 最旧）。`updateCmdOutputUI` 渲染彩色日志列表。`escapeHtml` 转义 HTML 特殊字符防止 XSS。

---

### 网络监测（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`startNetworkMonitor()`** — 第 7032 行，拦截 fetch + XHR（v5.3.0+ 使用 `unsafeWindow` 绕过 Tampermonkey 沙箱）：

```js
function startNetworkMonitor() {
    if (isNetworkMonitoring) return;
    isNetworkMonitoring = true; _networkReqId = 0;
    _origFetch = unsafeWindow.fetch;
    _origXHROpen = unsafeWindow.XMLHttpRequest.prototype.open;
    _origXHRSend = unsafeWindow.XMLHttpRequest.prototype.send;

    // ─── 覆盖 unsafeWindow.fetch（v5.2.3+ 支持 Request 对象参数）───
    unsafeWindow.fetch = function(url, options) {
        const id = ++_networkReqId;
        const startTime = Date.now();
        let method, reqHeaders, reqBody;
        if (url instanceof Request) {
            method = url.method || 'GET';
            reqHeaders = {}; url.headers.forEach((v, k) => { reqHeaders[k] = v; });
            reqBody = '';
        } else if (options) {
            method = options.method || 'GET';
            reqHeaders = options.headers ? Object.assign({}, options.headers) : {};
            reqBody = options.body ? String(options.body).slice(0, 50000) : '';
        } else {
            method = 'GET'; reqHeaders = {}; reqBody = '';
        }
        const urlStr = typeof url === 'string' ? url
            : (url.url || String(url));

        addNetworkRequest({ id, method: method.toUpperCase(),
            url: urlStr, reqHeaders, reqBody,
            status: 'pending', startTime });

        const promise = _origFetch.apply(this, arguments);
        promise.then(response => {
            const req = networkRequests.find(r => r.id === id);
            if (req) {
                req.status = response.status;
                req.statusText = response.statusText;
                req.resHeaders = {};
                response.headers.forEach((v,k) => req.resHeaders[k] = v);
                req.duration = Date.now() - startTime;
                response.clone().text().then(body =>
                    req.resBody = body.slice(0, 50000));
                updateNetworkItemUI(req); updateNetworkCount();
            }
            return response;     // 透传，不影响页面逻辑
        }).catch(err => {
            const req = networkRequests.find(r => r.id === id);
            if (req) {
                req.status = 0; req.error = err.message;
                req.duration = Date.now() - startTime;
                updateNetworkItemUI(req); updateNetworkCount();
            }
            throw err;           // 重新抛出，不吞错误
        });
        return promise;
    };

    // ─── 覆盖 XMLHttpRequest ───
    unsafeWindow.XMLHttpRequest.prototype.open = function(method, url) {
        this._autoOpReq = {
            id: ++_networkReqId, method: method.toUpperCase(),
            url: String(url), status: 'pending',
            startTime: Date.now(), reqHeaders: {}
        };
        return _origXHROpen.apply(this, arguments);
    };
    unsafeWindow.XMLHttpRequest.prototype.send = function(body) {
        const reqData = this._autoOpReq;
        if (reqData) {
            reqData.reqBody = body ? String(body).slice(0,50000) : '';
            addNetworkRequest(reqData);
            this.addEventListener('load', function() {
                reqData.status = this.status;
                reqData.resHeaders = {};
                this.getAllResponseHeaders().split('\r\n').forEach(line => {
                    const idx = line.indexOf(': ');
                    if (idx > 0) reqData.resHeaders[line.slice(0,idx)]
                        = line.slice(idx+2);
                });
                reqData.resBody = String(this.responseText).slice(0,50000);
                reqData.duration = Date.now() - reqData.startTime;
                updateNetworkItemUI(reqData); updateNetworkCount();
            });
            this.addEventListener('error', function() {
                reqData.status = 0; reqData.error = 'Network Error';
                reqData.duration = Date.now() - reqData.startTime;
                updateNetworkItemUI(reqData); updateNetworkCount();
            });
            // 拦截 setRequestHeader 记录请求头（完成/错误后自动还原）
            const _setRequestHeader = this.setRequestHeader;
            const self = this;
            this.setRequestHeader = function(name, value) {
                reqData.reqHeaders[name] = value;
                return _setRequestHeader.apply(self, arguments);
            };
            const _restore = () => { self.setRequestHeader = _setRequestHeader; };
            this.addEventListener('load', _restore, { once: true });
            this.addEventListener('error', _restore, { once: true });
        }
        return _origXHRSend.apply(this, arguments);
    };
}

```

**`stopNetworkMonitor()`** — 第 7146 行：还原 `unsafeWindow.fetch`、`unsafeWindow.XMLHttpRequest.prototype.open`、`unsafeWindow.XMLHttpRequest.prototype.send`。

**请求复制为代码**（`buildFetchCode`，第 7404 行）：根据请求的实际内容智能生成 `fetch()` 代码，分四种路径：

```js
// 路径①：有 body + headers → 完整 fetch
fetch(url, { method, headers, body }).then(r => r.text()).then(console.log)

// 路径②：仅有 headers → 省略 body
fetch(url, { method, headers }).then(r => r.text()).then(console.log)

// 路径③：仅有 method（非 GET）→ 仅含 method
fetch(url, { method: 'POST' }).then(r => r.text()).then(console.log)

// 路径④：纯 GET → 最简形式
fetch(url).then(r => r.text()).then(console.log)
```

- `req.status === 'refresh'`（刷新标记记录）→ 生成 `location.reload()` 而非 fetch 代码
- `copyToClipboard` 使用隐藏 `<textarea>` + `document.execCommand('copy')` 兼容方案
- 复制成功后会写入第 2 页指令输出日志（`[log] 已复制: ...`），失败则显示红色错误提示
- 「复制全部」按钮通过 `;\\n` 分号分隔拼接所有请求的 fetch 代码

**网络监测持久化**（`saveNetworkMonitorState` / `loadNetworkMonitorState` / `clearNetworkMonitorState`）：

- 页面隐藏（`visibilitychange` → hidden）且监测开启时自动保存
- 刷新后从 `AUTO_OP_NETMON_<host>` 统一恢复请求记录和开关状态（`{active, requests}` 结构）
- 监测重启时注入「刷新」标记记录

---

### 配置管理（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`switchConfig(newIndex)`** — 第 3569 行，77 行完整流程：

```js
function switchConfig(newIndex) {
    if (isPicking) exitPickMode();
    hideInfoPanel(false); hideSettingsPanel(false);

    // 1. 保存旧配置（从UI控件读取当前值）
    const old = cv();
    old.clickInterval = parseInt(clickIntervalInput.value) || 1000;
    old.maxClicks = maxClicksInput.value === '' ? Infinity
        : (parseInt(maxClicksInput.value) || Infinity);
    old.maxDurationMin = parseFloat(maxDurationInput.value) || 0;
    old.clickStrategy = strategySelect.value;
    old.missingAction = missingActionSelect.value;
    old.autoStartEnabled = autoStartIntervalInput.value.trim() !== ''
        && parseFloat(autoStartIntervalInput.value) > 0;
    old.autoStartIntervalMin = old.autoStartEnabled
        ? parseFloat(autoStartIntervalInput.value) : 0;
    savePerConfig(activeConfig);

    // 2. 清除旧配置所有高亮
    old.targets.forEach(t => {
        if (t.element) t.element.classList.remove('auto-op-selected-highlight');
        if (t._blueParent) t._blueParent.classList.remove(
            'auto-op-parent-highlight', 'auto-op-parent-highlight-Overlap');
        if (t._nearestEl) t._nearestEl.classList.remove(
            'auto-op-nearest-parent-highlight');
    });

    // 3. 切换到新配置 + 恢复目标元素
    activeConfig = newIndex; const c = cv();
    beginQueryCycle();
    c.targets.forEach(t => {
        if (!t.isCommand && (!t.element || !document.contains(t.element))) {
            const found = tryFindTarget(t);
            if (found && found.length > 0) {
                t.element = found[0];
                const pi = resolveParentInfo(found[0]);
                t.nearestParent = pi.nearestParent;
                t.blueParent = pi.blueParent;
            } else t.element = null;
        }
        t._isValid = t.isCommand || (!!t.element
            && document.contains(t.element)
            && matchesFingerprint(t.element, t));
    });
    // 重新应用选中高亮
    c.targets.forEach(t => {
        if (t.enableHighlight !== false && t.enabled !== false
            && t.element && t.element.classList
            && document.contains(t.element))
            t.element.classList.add('auto-op-selected-highlight');
    });

    // 4. 同步所有UI控件
    strategySelect.value = c.clickStrategy;
    maxClicksInput.value = c.maxClicks === Infinity ? '' : c.maxClicks;
    clickIntervalInput.value = c.clickInterval;
    missingActionSelect.value = c.missingAction || 'wait';
    maxDurationInput.value = c.maxDurationMin > 0 ? c.maxDurationMin : '';
    autoStartIntervalInput.value = c.autoStartIntervalMin > 0
        ? c.autoStartIntervalMin : '';
    // 同步运行状态、计时器、按钮状态...
    refreshParentHighlights(); updateTargetUI(); updateTargetCount();
    updateConfigBtnLabel(); saveData(); goToPage(0, false);
}

```

**配置导入/导出**（第 4072–4537 行）：

`toggleConfigLoadMode()` 切换第 1 页页签的显示模式——在「操作」和「配置加载」之间切换。配置加载模式下，页签图标变为 `CONFIG_LOAD_SVG`，页面原有内容隐藏，仅显示导入/导出两个按钮。

**`exportConfig()`**（第 4517 行）：

1. 从 `cv()` 读取当前配置的 7 个配置字段 + 27 个 target 字段
2. 附加元数据：`version`（脚本版本）、`exportedAt`（ISO 时间戳）、`hostname`（当前域名）
3. `JSON.stringify(data, null, 2)` 格式化输出
4. 通过 `Blob` + `URL.createObjectURL` + 隐藏 `<a>` 触发浏览器下载
5. 文件名格式：`auto-op-config-<hostname>-<timestamp>.json`

**`importConfig()`**（第 4574 行，~243 行）：

1. 创建隐藏 `<input type="file" accept=".json">` 并触发点击
2. 验证文件扩展名、大小（≤10MB）、JSON 格式、结构完整性
3. 弹窗显示配置摘要（目标数量、间隔、策略），用户确认后执行
4. **备份阶段**：深拷贝当前配置全部字段（含 DOM 引用），保存到 `backup` 对象
5. **清理阶段**：移除旧目标的所有高亮 class，清空 `c.targets`
6. **导入阶段**：解析 JSON → 写入配置字段 → `tryFindTarget` 逐一恢复 DOM 引用 → 重新应用高亮
7. **失败回滚**：任何步骤失败 → 恢复 `backup` 到配置对象 → 同步 UI → 显示错误提示
8. 成功后调用 `exitConfigLoadMode()` 关闭配置加载模式

---

### 面板交互（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`performCollapse()`** — 第 4836 行：

```js
function performCollapse() {
    const body = panel.querySelector('.auto-op-body');
    collapseAnimPhase = 'collapsing';
    body.style.overflow = 'hidden';

    // 第1步：隐藏body（触发CSS transition: max-height→0, padding→0, opacity→0）
    panel.classList.add('body-hidden');
    // 200ms后进入collapsed状态
    setTimeout(() => {
        panel.classList.remove('body-hidden');
        panel.classList.add('collapsed');
        // 计算折叠宽度（14+30+12+30+12+h3W+12+30+14+2）
        const h3W = dragHandle.querySelector('h3').scrollWidth;
        collapsedWidth = 14 + 30 + 12 + 30 + 12 + h3W + 12 + 30 + 14 + 2;
        // 从300px过渡到collapsedWidth
        panel.style.width = '300px';
        void panel.offsetWidth;                        // 强制回流
        panel.style.width = collapsedWidth + 'px';
        collapseAnimPhase = 'collapsed';
        schedulePanelTransparent(1000);                // 1s后半透明
    }, 200);
}

```

**`performExpand()`** — 第 4857 行：

```js
function performExpand() {
    collapseAnimPhase = 'expanding';
    panel.style.width = collapsedWidth + 'px';
    void panel.offsetWidth;                            // 强制回流
    panel.style.width = '300px';                       // 过渡到完整宽度
    setTimeout(() => {
        panel.classList.remove('collapsed');
        panel.style.width = '';
        toggleBtn.innerHTML = '− SVG';                 // 切换图标
        collapseAnimPhase = 'expanded';
        setTimeout(() => {
            body.style.overflow = 'auto';
        }, 150);
    }, 120);
    restorePanelOpacity();
    if (isPicking) setPanelTransparent();
}

```

**面板透明度系统**（第 4759–4847 行）：

```js
function setPanelTransparent() {
    if (isPanelTransparent) return;
    isPanelTransparent = true;
    panel.style.opacity = '0.65';
}

function restorePanelOpacity() {
    if (panelTransparentTimer) { clearTimeout(panelTransparentTimer); panelTransparentTimer = null; }
    if (panelClickRestoreTimer) { clearTimeout(panelClickRestoreTimer); panelClickRestoreTimer = null; }
    if (!isPanelTransparent) return;
    isPanelTransparent = false;
    panel.style.opacity = '';
    if (!isPicking && collapseAnimPhase === 'collapsed') schedulePanelTransparent(1000);
}

function schedulePanelTransparent(delayMs) {
    if (panelTransparentTimer) clearTimeout(panelTransparentTimer);
    panelTransparentTimer = setTimeout(() => {
        panelTransparentTimer = null;
        setPanelTransparent();
    }, delayMs);
}

function onPanelClickRestore() {
    if (!isPanelTransparent) return;
    restorePanelOpacity();
    if (panelClickRestoreTimer) clearTimeout(panelClickRestoreTimer);
    panelClickRestoreTimer = setTimeout(() => {
        panelClickRestoreTimer = null;
        if (isPicking || collapseAnimPhase === 'collapsed') setPanelTransparent();
    }, 2000);
}
```

**透明度状态机**：

```text
展开态 ──collapse──▶ 折叠不透明 ──1s──▶ 折叠半透明 (opacity:0.65)
                        ▲                     │
                        │       点击面板      │
                        └──── 恢复不透明 ─────┘
                        （2s 后如果不是 picking/折叠态则重新半透明）
```

**面板折叠宽度动态计算**：

折叠时 `collapsedWidth` 不是固定值，而是根据面板标题栏的实际宽度动态计算：

```js
const h3W = dragHandle.querySelector('h3').scrollWidth;
collapsedWidth = 14 + 30 + 12 + 30 + 12 + h3W + 12 + 30 + 14 + 2;
//               │   │   │   │   │   │    │   │   │   │
//              左  折  间  开  间  标  间  配  右  边
//              padding  叠  距  关  距  题  距  置  padding
//                       按        按        文        按
//                       钮        钮        字        钮
```

各段含义：

- `14px` — 左 padding + 左 border
- `30px` — 折叠按钮宽度
- `12px` — 间距
- `30px` — 播放/停止按钮宽度（仅在折叠态且有运行中配置时显示）
- `12px` — 间距
- `h3W` — 标题文字「自动操作」的实际渲染宽度（`scrollWidth`，受字体影响）
- `12px` — 间距
- `30px` — 配置切换按钮 ⑩ 宽度
- `14px` — 右 padding + 右 border
- `2px` — 左右 border 各 1px

这个计算确保折叠后面板的宽度恰好包裹标题栏的全部可见控件。切换字体（MiSans VF ↔ system-ui）后，`h3W` 自动更新，下一次折叠时使用新宽度。

**`goToPage(page, animated)`** — 第 4263 行：

```js
function goToPage(page) {
    closeConfigMenu();
    // 1. 关闭所有overlay，确保body高度重新匹配
    if (infoOverlayEl.classList.contains('open')) hideInfoPanel(false);
    if (settingsOverlayEl.classList.contains('open')) hideSettingsPanel(false);
    if (networkOverlayEl.classList.contains('open')) hideNetworkOverlay(false);

    const clamped = ((page % PAGE_COUNT) + PAGE_COUNT) % PAGE_COUNT;
    if (clamped === currentPage) return;  // 已在当前页 → 不操作

    // 2. 第5页特殊逻辑：离开第5页时隐藏恢复默认按钮
    if (clamped !== 4 && resetBtn.style.display !== 'none') {
        resetBtn.style.display = 'none';
        resetConfirm = false;
        resetBtn.textContent = '恢复默认设置';
        resetBtn.classList.remove('confirm');
        if (resetConfirmTimer) { clearTimeout(resetConfirmTimer); resetConfirmTimer = null; }
        page4ClickCount = 0;
        if (page4ClickTimer) { clearTimeout(page4ClickTimer); page4ClickTimer = null; }
        updatePageHeight();
    }

    // 3. 切换active page
    const pages = pageContainer.querySelectorAll('.auto-op-page');
    const oldPage = pages[currentPage], newPage = pages[clamped];
    currentPage = clamped;
    pageButtons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.page) === clamped);
    });
    // 切换页面（通过opacity过渡）
    oldPage.classList.remove('active');
    oldPage.style.opacity = '0';
    newPage.classList.add('active');
    newPage.style.opacity = '0';
    newPage.offsetHeight;  // 强制回流
    newPage.style.opacity = '1';
    updatePageHeight(); saveShared();
}

```

---

### 高度管理（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`fitBodyToOverlay(overlayEl)`** — 第 5462 行，离屏探针测量：

```js
function fitBodyToOverlay(overlayEl) {
    // 保存原始max-height（仅首次）
    if (!_bodyOrigMaxH)
        _bodyOrigMaxH = panelBody.style.maxHeight
            || getComputedStyle(panelBody).maxHeight;
    // 创建离屏探针（仅首次）
    if (!_heightProbe) {
        _heightProbe = document.createElement('div');
        _heightProbe.style.cssText =
            'position:fixed;left:-9999px;top:0;width:'
            + panelBody.offsetWidth + 'px;'
            + 'visibility:hidden;display:flex;'
            + 'flex-direction:column;font-size:12px;font-family:inherit';
        document.body.appendChild(_heightProbe);
    }
    // 克隆overlay内容到探针 → 测量真实高度
    _heightProbe.innerHTML = overlayEl.innerHTML;
    const mainHeader = panel.querySelector('.auto-op-header');
    let h = _heightProbe.scrollHeight;
    if (mainHeader) h -= mainHeader.offsetHeight;       // 减去标题栏
    if (h > 0) {
        h = Math.min(h, window.innerHeight * 0.65);      // 上限65%视口
        // 两步设置min-height确保过渡生效
        panelBody.style.minHeight = panelBody.offsetHeight + 'px';
        getComputedStyle(panelBody).minHeight;            // 强制回流
        panelBody.style.minHeight = h + 'px';
        panelBody.style.maxHeight = h + 'px';
    }
}

```

**`restoreBodyHeight()`** — 第 5482 行：

```js
function restoreBodyHeight() {
    const pageH = pageContainer.scrollHeight;            // 当前活跃页面内容高度
    // 动画过渡：先锁定当前高度
    if (panelBody.style.maxHeight && panelBody.style.maxHeight !== '') {
        panelBody.style.minHeight = panelBody.offsetHeight + 'px';
        void panelBody.offsetHeight;  // 强制回流锁定高度
    }
    if (pageH > 0) {
        panelBody.style.minHeight = pageH + 'px';       // 收缩到页面高度
    } else {
        panelBody.style.minHeight = '';                 // 清除
    }
    panelBody.style.maxHeight = '';                     // 清除 → CSS 65vh生效
    _bodyOrigMaxH = '';                                 // 下次fitBodyToOverlay重新保存
}

```

**`updatePageHeight()`** — 第 4252 行：

```js
function updatePageHeight() {
    const pages = pageContainer.querySelectorAll('.auto-op-page'),
        el = pages[currentPage];
    if (!el) return;
    const h = el.offsetHeight;
    if (h > 0) pageContainer.style.height = (h + 2) + 'px';
    if (!panelBody.style.maxHeight) panelBody.style.minHeight = '';
}

```

调用时机：`goToPage`、overlay close、`ResizeObserver` on `.auto-op-page`、`ResizeObserver` on `cmdInput`、`MutationObserver` on `cmdInput`。

**元素设置页 textarea 高度自适应**（第 5233–5291 行）：

打开设置面板时绑定 `ResizeObserver` + `MutationObserver`（监听 `style` 属性）。回调守卫 `classList.contains('open')` 确保仅 overlay 打开时调用 `fitBodyToOverlay`。关闭面板时 `disconnect()` 两个 observer。观察者引用存储在 `_settingsCmdResizeObserver` / `_settingsCmdMutationObserver`。

---

### 存储与持久化（源码详解）

[↑ 回到顶部](#automatic-operation-)

**四级存储键**：

| 键 | 变量 | 内容 |
| --- | --- | --- |
| `AUTO_OP_SHARED_<host>` | `SHARED_KEY` | 全局共享状态 |
| `AUTO_OP_CFG_<host>_0`~`_9` | `PER_CONFIG_KEY + i` | 每套配置 |
| `AUTO_OP_REFRESH_STATE_<host>` | `REFRESH_STATE_KEY` | 跨刷新临时状态 |
| `AUTO_OP_NETMON_<host>` | `NETWORK_MONITOR_KEY` | 网络监测开关状态 + 请求记录（`{active, requests}`） |

**`savePerConfig(ci)`** — 第 3678 行：

序列化 15 个 target 字段（`fingerprint`, `desc`, `isInput`, `parentSelector`, `parentChain`, `enabled`, `matchTag`, `matchText`, `matchTextMode`, `matchDataAttrs`, `matchAttrs`, `matchOnclick`, `matchParent`, `matchId`, `matchClass`，其中 `parentChain` 仅存 `[{selector}]` 无 `desc`）+ `keybind` 按键绑定字段 + 6 个配置级字段（`clickStrategy`, `clickInterval`, `maxClicks`, `missingAction`, `autoStartIntervalMin`, `maxDurationMin`）。

**关键设计**：`element`（DOM引用）不序列化。刷新后通过 `tryFindTarget` 重新查找。`isCommand`/`customCommand` 为运行时字段不序列化——导入/刷新后由 `desc` 中的 `[CMD]` 前缀重新识别。`matchMode` 已删除（被 `matchTextMode` 替代）。`missCount` 已删除（从未在匹配逻辑中使用）。所有布尔开关序列化为 `true/false`。

**`saveShared()`** — 第 3795 行：

```js
storageSet(SHARED_KEY, JSON.stringify({
    isAutoRefresh, refreshIntervalSec, refreshLogs,
    currentPage, activeConfig,
    wakeLock: wakeLockCheckbox.checked,
    suppressFocus: suppressFocusCheckbox.checked,
    pickPassThrough, panelFont, themeMode
}));

```

**`saveRefreshState()`** — 保存 `isAutoRefresh`, `refreshIntervalSec`, `nextRefreshTime`, `refreshLogs`, `isPowerSave`, 及各运行中配置的 `operationStartTimestamp` 和 `clickedCount`。

**`saveNetworkMonitorState()` / `loadNetworkMonitorState()` / `clearNetworkMonitorState()`** — 保存/恢复/清除网络监测状态（开关 + 请求记录）。

**保存时机**：切换配置、修改参数、修改匹配规则、选取/删除目标、刷新前、主题切换、页面切换、网络监测状态变化（页面隐藏时）。

**跨刷新状态恢复**（初始化末尾）：

```js
// 初始化时执行
(function restoreAutoRefreshState() {
    const rs = loadRefreshState();
    if (rs && rs.active) {
        // 恢复刷新日志（兼容旧格式字符串和新的 {time, msg} 格式）
        // 恢复省电模式（300ms延迟，等待 DOM 就绪）
        // 恢复自动刷新倒计时（剩余时间 > 0 → 精确恢复；否则 → 立即启动）
        // 恢复运行中的配置（200ms后startClickingFor，保留计数和计时）
            // savedTimestamp 确保最大运行时长正确扣除已消耗时间
        clearRefreshState();    // 删除临时状态
    }
})();
// 500ms后恢复自动启动倒计时
setTimeout(() => {
    for (let i = 0; i < CONFIG_COUNT; i++) {
        const c = configs[i];
        if (c.isRunning) continue;  // 已在运行的配置跳过
        if (c.autoStartEnabled && c.autoStartIntervalMin > 0) {
            c.autoStartNextTime = Date.now() + c.autoStartIntervalMin * 60 * 1000;
            startAutoStartCountdownTimerFor(i);
        }
    }
}, 500);
// 网络监测恢复
if (isNetworkMonitoring && networkContentEl) {
    isNetworkMonitoring = false;
    startNetworkMonitor();  // 先重置再启动，确保拦截器正确挂载
}
if (networkRequests.length > 0 && networkContentEl) {
    renderNetworkList();
    updateNetworkCount();
}

```

---

### 主题系统（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`scanWebpageTheme(el)`** — 第 2860 行：

```js
const DARK_CLS = ['dark','dark-mode','night','theme-dark',
    'tw-dark','bp3-dark','chakra-ui-dark'];
const LIGHT_CLS = ['light','light-mode','theme-light','tw-light'];

function scanWebpageTheme(el) {
    if (!el) return null;
    for (const c of DARK_CLS) if (el.classList.contains(c)) return 'dark';
    for (const c of LIGHT_CLS) if (el.classList.contains(c)) return 'light';
    const st = el.getAttribute('style') || '';
    if (st.includes('color-scheme: dark')) return 'dark';
    if (st.includes('color-scheme: light')) return 'light';
    // 扫描任意属性值
    try {
        for (const attr of el.attributes) {
            const v = attr.value; if (!v) continue;
            if (v==='dark'||v==='dark-mode'||v==='Dark') return 'dark';
            if (v==='light'||v==='light-mode'||v==='Light') return 'light';
        }
    } catch (e) {}
    return null;
}

```

**`resolveTheme()`** — 第 2886 行：

```js
function resolveTheme() {
    switch (themeMode) {
        case 'light':  return 'light';
        case 'dark':   return 'dark';
        case 'system': return matchMedia('(prefers-color-scheme:dark)').matches
                            ? 'dark' : 'light';
        default:       // 'auto'
            return scanWebpageTheme(document.documentElement)
                || scanWebpageTheme(document.body)
                || getSystemTheme();
    }
}

```

**`applyTheme()`** — 设置 `document.documentElement` 的 `data-theme` 属性（`light`/`dark`），CSS 通过 `[data-theme="light"]` 选择器覆盖变量。

**`startThemeWatchers()` / `stopThemeWatchers()`** — 第 2922 / 2953 行：

根据 `themeMode` 动态开关监听器：

- `light`/`dark`：关闭所有监听器
- `system`：仅 `matchMedia('prefers-color-scheme:dark')` 监听
- `auto`：开启全部（`matchMedia` + `MutationObserver` ×2）
- 200ms 防抖（`debouncedApplyTheme`）避免频繁切换
- 观察器存储在 `_sysThemeListener` / `_htmlObserver` / `_bodyObserver`

---

### 省电模式（源码详解）

[↑ 回到顶部](#automatic-operation-)

**`enablePowerSave()`** — 显示 `#auto-op-power-save-overlay`，启动全屏请求，每 5s 随机移动浮动元素位置，启动时间/运行时长/操作次数的更新定时器。

**`disablePowerSave()`** — 关闭全屏，清除所有省电模式定时器，隐藏 overlay，恢复面板透明度调度。

**浮动元素**：

- `ps-time`：时间显示，`HH:MM:SS` 格式
- `ps-elapsed`：运行时长，`已运行 HH:MM:SS`
- `ps-count`：已操作次数，`已操作 N 次`
- `ps-switch`：切换开关，关闭即退出省电模式

---

### 字体加载系统（源码详解）

[↑ 回到顶部](#automatic-operation-)

```js
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap';
fontLink.onerror = () => {
    fontLink.remove();
    try {
        document.getElementById('auto-op-font-failed').style.display = 'inline';
    } catch (e) {}
};
document.head.appendChild(fontLink);

```

- 字体通过 `<link>` 从小米 CDN 异步加载，使用 `display=swap` 确保文字立即可见
- 加载失败时移除 `<link>` 元素，显示第 5 页的「MiSans VF 加载失败」提示
- CSS 变量 `--auto-op-font: "MiSans VF", system-ui` 始终提供 system-ui 回退
- 面板字体选择器（第 5 页）可在 MiSans VF 和 system-ui 之间切换，动态更新 `--auto-op-font` CSS 变量

---

### CSS 变量参考

[↑ 回到顶部](#automatic-operation-)

**暗色默认值（`:root`）**：

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--panel-bg` | `#18181b` | 面板背景 |
| `--panel-border` | `#333` | 面板边框 |
| `--panel-text` | `#e0e0e0` | 主文字 |
| `--panel-input-bg` | `#27272a` | 输入框背景 |
| `--panel-input-border` | `#333` | 输入框边框 |
| `--panel-input-text` | `#e0e0e0` | 输入框文字 |
| `--panel-label-text` | `#888` | 标签文字 |
| `--panel-button-bg` | `rgba(255,255,255,0.06)` | 次级按钮背景 |
| `--panel-button-hover-bg` | `rgba(255,255,255,0.12)` | 次级按钮 hover |
| `--panel-button-border` | `rgba(255,255,255,0.1)` | 次级按钮边框 |
| `--panel-button-text` | `#999` | 次级按钮文字 |
| `--panel-button-hover-text` | `#fff` | 次级按钮 hover 文字 |
| `--panel-highlight-border` | `#277AF7` | 高亮蓝 |
| `--panel-active-border` | `#22c55e` | 激活绿 |
| `--panel-active-text` | `#22c55e` | 激活文字 |
| `--panel-missing-border` | `#dc2626` | 缺失红 |
| `--panel-missing-text` | `#dc2626` | 缺失文字 |
| `--panel-waiting-text` | `#f59e0b` | 等待橙 |
| `--panel-highlight` | `#f59e0b` | 高亮/选取橙 |
| `--auto-op-font` | `"MiSans VF", system-ui` | 字体栈 |

**亮色覆盖（`[data-theme="light"]`）**：

| 变量 | 值 |
| --- | --- |
| `--panel-bg` | `#ffffff` |
| `--panel-border` | `#e5e7eb` |
| `--panel-text` | `#1f2937` |
| `--panel-input-bg` | `#f9fafb` |
| `--panel-input-border` | `#d1d5db` |
| `--panel-input-text` | `#1f2937` |
| `--panel-label-text` | `#6b7280` |
| `--panel-button-bg` | `rgba(0,0,0,0.05)` |
| `--panel-button-border` | `rgba(0,0,0,0.1)` |
| `--panel-button-text` | `#6b7280` |
| `--panel-button-hover-bg` | `rgba(0,0,0,0.1)` |
| `--panel-button-hover-text` | `#1f2937` |
| `--panel-highlight-border` | `#3482FF` |
| `--panel-active-border` | `#07C160` |
| `--panel-active-text` | `#07C160` |
| `--panel-waiting-text` | `#d97706` |
| `--panel-highlight` | `#d97706` |
| `--panel-missing-border` | `#dc2626` |
| `--panel-missing-text` | `#dc2626` |

**额外亮色覆盖**（`[data-theme="light"]`）：

| 选择器 | 属性 | 值 |
| --- | --- | --- |
| `.auto-op-status` | `border-top-color` | `#999` |
| `.auto-op-switch-track` | `border-color`/`background` | `#d1d5db`/`#dedede` |
| `.auto-op-switch-thumb` | `background` | `#ffffff` |
| `.auto-op-modal-overlay` | `background` | `rgba(0,0,0,0.2)` |
| `.auto-op-log-entry` | `border-bottom-color` | `rgba(0,0,0,0.04)` |
| `.auto-op-config-btn` | `background`/`border-color`/`color` | 暗色半透明 |
| `.auto-op-config-menu` | `background`/`border-color`/`box-shadow` | 亮色主题 |
| `.auto-op-config-item` | `color` | `#1f2937` |

**CSS 变量使用场景速查**：

| 变量 | 用途场景 |
| --- | --- |
| `--panel-bg` | 面板主背景、overlay 背景、模态框背景、省电遮罩背景、配置菜单背景 |
| `--panel-border` | 面板边框、输入框边框、分割线、overlay 边框、列表项底部边框 |
| `--panel-text` | 主文字、按钮文字、input/select 文字、overlay 标题、日志文字 |
| `--panel-input-bg` | 数字输入框、文本输入框、select 下拉框、textarea |
| `--panel-input-border` | 输入框/select 边框（focus 高亮时变为 `--panel-highlight-border`） |
| `--panel-input-text` | 输入框内的文字颜色 |
| `--panel-label-text` | 行标签、placeholder、次要提示文字 |
| `--panel-button-bg` | 次级按钮背景、信息按钮、配置按钮、网络请求标签 |
| `--panel-button-border` | 次级按钮边框、选中元素的描述边框 |
| `--panel-button-text` | 次级按钮文字 |
| `--panel-button-hover-bg` | 次级按钮 hover/focus 背景 |
| `--panel-button-hover-text` | 次级按钮 hover/focus 文字 |
| `--panel-highlight-border` | 主要按钮背景（开始/选取/设为）、选中高亮蓝框、focus 状态、config 按钮 active 状态、折叠面板 header-start 背景、进度条、信息链接 |
| `--panel-active-border` | 绿色运行状态指示（运行中圆点、状态栏计数、成功状态）、元素有效时的边框 |
| `--panel-active-text` | 绿色文字（运行状态、计数显示） |
| `--panel-missing-border` | 红色错误/缺失指示（元素缺失边框、停止按钮、重置按钮确认态）、进度条 < 30s 紧急态、删除按钮 hover、错误状态 |
| `--panel-missing-text` | 红色文字（缺失元素名称、错误提示） |
| `--panel-waiting-text` | 橙色等待/警告（等待重试状态、POST 方法标签、配置运行圆点） |
| `--panel-highlight` | 橙色选取高亮（虚线框 `outline`、hover 高亮） |
| `--auto-op-font` | 全局字体栈，默认 `"MiSans VF", system-ui`，通过第 5 页字体选择器切换 |

---

### CSS 类名参考

[↑ 回到顶部](#automatic-operation-)

脚本注入的全部 CSS 类名及其作用：

#### 面板结构

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-panel` | 主面板容器 `#auto-op-panel` |
| `.auto-op-header` | 面板标题栏（拖拽 handle） |
| `.auto-op-body` | 面板主体内容区 |
| `.auto-op-page` | 5 个页面容器（通过 `.active` 切换显示） |
| `.auto-op-row` | 通用水平行布局 |
| `.auto-op-row-switch` | 开关类行布局 |

#### 交互控件

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-toggle` | 折叠/展开按钮（−/+） |
| `.auto-op-config-wrap` | 配置按钮包裹器 |
| `.auto-op-config-btn` | 配置切换按钮 ⑩ |
| `.auto-op-config-menu` | 配置下拉菜单（`max-height` 过渡动画） |
| `.auto-op-config-menu.open` | 菜单展开态 |
| `.auto-op-config-menu.closing` | 菜单关闭动画中 |
| `.auto-op-config-item` | 菜单项（`①`~`⑩`） |
| `.auto-op-config-item.active` | 当前选中配置（蓝色高亮） |
| `.auto-op-config-item.has-run::after` | 运行中绿色圆点指示 |
| `.auto-op-header-start` | 折叠状态下的 ▶/■ 开始/停止按钮 |
| `.auto-op-header-start.is-stop` | 停止状态（红色） |
| `.auto-op-switch` | 开关组件容器 |
| `.auto-op-switch-track` | 开关轨道 |
| `.auto-op-switch-thumb` | 开关滑块（`translateX` 过渡动画） |
| `.auto-op-switch input:checked + .auto-op-switch-track` | 开关开启态轨道（CSS 选择器，非独立 class） |
| `.auto-op-switch input:checked + .auto-op-switch-track .auto-op-switch-thumb` | 开关开启态滑块（CSS 选择器） |

#### 自定义下拉选择框

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-custom-select` | 自定义下拉选择框容器（包裹原生 select + 自定义 UI） |
| `.auto-op-custom-select-btn` | 触发按钮（显示当前选中文本，点击打开下拉列表） |
| `.auto-op-custom-select-btn::after` | 箭头指示器（CSS `::after` 伪元素，旋转 45° 的 border 实现） |
| `.auto-op-custom-select.open .auto-op-custom-select-btn::after` | 下拉展开时箭头翻转（`-135°`） |
| `.auto-op-custom-select-btn.disabled` | 禁用态（`opacity: 0.5; cursor: not-allowed`） |
| `.auto-op-custom-select-list` | 下拉选项列表容器（绝对定位，`max-height: 200px` 可滚动） |
| `.auto-op-custom-select.open .auto-op-custom-select-list` | 下拉列表展开态（`display: block`） |
| `.auto-op-custom-select-list::-webkit-scrollbar` | 下拉列表滚动条（宽度 4px） |
| `.auto-op-custom-select-list::-webkit-scrollbar-thumb` | 滚动条滑块（圆角 2px） |
| `.auto-op-custom-select-option` | 单个选项（hover 时蓝色背景） |
| `.auto-op-custom-select-option.selected` | 当前选中选项（蓝色背景 + 粗体） |

#### 目标列表

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-target-list-container` | 目标列表外层容器（含标题信息） |
| `.auto-op-target-info` | 目标信息区域（已选 N 个、状态） |
| `.auto-op-target-list` | 目标列表滚动容器 |
| `.auto-op-target-item` | 单个目标条目 |
| `.auto-op-target-item.active` | 当前队列操作的目标（蓝色虚线边框，`--panel-highlight-border`） |
| `.auto-op-target-item.missing` | 缺失目标（红色虚线边框，`--panel-missing-border`） |
| `.auto-op-target-item.cmd-target` | 指令类型目标（`[CMD]` 标识） |
| `.auto-op-target-item.cmd-target.cmd-error` | 指令执行出错的目标 |
| `.auto-op-target-parent` | 目标父级容器名称显示 |

#### 控制按钮

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-btn-info` | ⓘ 信息按钮（打开匹配规则面板） |
| `.auto-op-btn-settings` | ⚙ 设置按钮（打开元素设置面板） |
| `.auto-op-btn-up` / `.auto-op-btn-down` | ↑/↓ 顺序调整按钮 |
| `.auto-op-btn-delete` | ✕ 删除按钮（hover 变红） |
| `.auto-op-btn-copy` | 复制按钮（网络监测） |
| `.auto-op-btn-pick` | 「选取元素」按钮（选取模式为橙色脉冲） |
| `.auto-op-btn-start` | 「开始」按钮（运行时变红「停止」） |

#### 页面高亮

[↑ 回到顶部](#automatic-operation-)

| 类名 | 样式 | 说明 |
| --- | --- | --- |
| `.auto-op-highlight` | `outline: 2px dashed var(--panel-highlight)`（橙色虚线） | 鼠标 hover 目标元素时的预览高亮 |
| `.auto-op-selected-highlight` | `outline: 2px solid var(--panel-active-border)`（绿色实线） | 已选取目标的确认高亮 |
| `.auto-op-test-highlight` | `outline: 2px dashed #F8BBD0`（硬编码粉色虚线） | 测试匹配时的高亮（不同于 `--panel-missing-border` 的红色） |
| `.auto-op-parent-highlight` | `box-shadow: 0 0 0 4px var(--panel-highlight-border)`（蓝色粗框） | 蓝色父容器高亮 |
| `.auto-op-parent-highlight-Overlap` | `box-shadow: 0 0 0 2px var(--panel-highlight-border)`（蓝色细框） | 当 `blueParent === nearestParent` 时使用 |
| `.auto-op-nearest-parent-highlight` | `outline: 2px dashed var(--panel-missing-border)`（红色虚线） | 直接父元素高亮 |

#### Overlay 面板

[↑ 回到顶部](#automatic-operation-)

| 类名 / ID | 作用 |
| --- | --- |
| `.auto-op-info-overlay` / `#auto-op-info-overlay` | 匹配规则详情 overlay（class + id 双标识） |
| `.auto-op-info-overlay.open` | info overlay 打开态（`transform: translateX(0)`，过渡 0.25s） |
| `.auto-op-info-content` / `#auto-op-info-content` | info overlay 内容区 |
| `.auto-op-settings-overlay` / `#auto-op-settings-overlay` | 元素设置 overlay（class + id 双标识） |
| `.auto-op-settings-overlay.open` | settings overlay 打开态 |
| `.auto-op-settings-content` / `#auto-op-settings-content` | settings overlay 内容区 |
| `.auto-op-network-overlay` / `#auto-op-network-overlay` | 网络监测 overlay |
| `.auto-op-network-overlay.open` | 网络 overlay 打开态 |

#### 网络监测样式

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-network-item` | 单条请求记录 |
| `.auto-op-network-detail` | 请求详情展开区 |
| `.auto-op-network-method` | HTTP Method 标签（GET/POST/PUT/DELETE/PATCH/XHR） |
| `.auto-op-network-method.get` | GET=绿色背景白色文字 |
| `.auto-op-network-method.post` | POST=橙色背景白色文字 |
| `.auto-op-network-method.put` | PUT=蓝色背景白色文字 |
| `.auto-op-network-method.delete` | DELETE=红色背景白色文字 |
| `.auto-op-network-method.patch` | PATCH=紫色背景白色文字 |
| `.auto-op-network-status` | 响应状态码 |
| `.auto-op-network-status.ok` | 2xx/3xx=绿色 |
| `.auto-op-network-status.err` | 4xx/5xx/0=红色 |
| `.auto-op-network-status.pending` | pending=灰色 |

#### 日志与确认框

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-cmd-output` | 指令输出日志区域 |
| `.auto-op-log-entry` | 单条日志（含下边框分割线） |
| `.auto-op-cmd-expand-hint` | 「…点击展开」提示文字（蓝色，`cursor: pointer`） |
| `.auto-op-modal-overlay` | 确认对话框的半透明遮罩 |
| `.auto-op-modal` | 确认对话框主体 |

#### 按键绑定

[↑ 回到顶部](#automatic-operation-)

| 类名 | 作用 |
| --- | --- |
| `.auto-op-keybind-input` | 按键绑定输入框（readonly，点击触发录制，橙色脉冲 `keybind-pulse` 动画） |
| `.auto-op-keybind-input.recording` | 录制中状态（橙色边框 + 脉冲动画） |
| `.auto-op-keybind-tip` | 按键触发浮动提示（固定定位右上角，淡入/淡出动画） |
| `.auto-op-keybind-tip.show` | 显示状态 |
| `.auto-op-keybind-tip.success` | 成功提示（绿色 `--panel-active-border` 边框/背景） |
| `.auto-op-keybind-tip.fail` | 失败提示（红色 `--panel-missing-border` 边框/背景） |

#### 省电模式

[↑ 回到顶部](#automatic-operation-)

| 类名 / ID | 作用 |
| --- | --- |
| `#auto-op-power-save-overlay` | 省电模式全屏黑色遮罩（ID，`z-index: 2147483647`） |
| `.ps-element.ps-time` / `#ps-time` | 当前时间浮动显示（双 class + ID） |
| `.ps-element.ps-elapsed` / `#ps-elapsed` | 运行时长浮动显示（双 class + ID） |
| `.ps-element.ps-count` / `#ps-count` | 已操作次数浮动显示（双 class + ID） |
| `.ps-switch-area` / `#ps-switch-area` | 省电模式开关容器 |
| `#ps-switch` | 省电模式开关 checkbox |

#### 杂项

[↑ 回到顶部](#automatic-operation-)

| 类名 / ID | 作用 |
| --- | --- |
| `.auto-op-status` / `#auto-op-status` | 底部状态栏（`border-top` 分割） |
| `#auto-op-refresh-progress` | 刷新进度条外层容器（ID） |
| `.auto-op-progress-info` | 进度条信息行（百分比 + 剩余时间） |
| `.auto-op-progress-percent` / `#auto-op-refresh-percent` | 进度百分比文字 |
| `.auto-op-progress-time` / `#auto-op-refresh-time` | 剩余时间文字 |
| `.auto-op-progress-container` | 进度条轨道容器 |
| `.auto-op-progress-fill` / `#auto-op-progress-fill` | 进度条填充条（`width` + `transition` 动画） |

---

### DOM 观察器与事件委托

[↑ 回到顶部](#automatic-operation-)

| 观察器 | 目标 | 触发时机 | 回调 |
| --- | --- | --- | --- |
| `MutationObserver` ×2 | `<html>`,`<body>` | `class`/`style` 属性变化 | `debouncedApplyTheme`（200ms 防抖） |
| `ResizeObserver` ×5 | `.auto-op-page`(0-4) | 页面内容高度变化 | `updatePageHeight`（`querySelectorAll` 遍历全部 5 页） |
| `ResizeObserver` | `#auto-op-cmd-input` | 指令输入框尺寸变化 | `updatePageHeight` |
| `MutationObserver` | `#auto-op-cmd-input` | style属性变化 | 兜底 → `updatePageHeight` |
| `ResizeObserver` | settings textarea | JS指令高度 → 面板高度 | `fitBodyToOverlay`（动态绑定/解绑） |
| `MutationObserver` | settings textarea | style属性 → 兜底 | `fitBodyToOverlay`（动态绑定/解绑） |
| `MutationObserver` ×N | native `<select>` | `disabled` 属性变化 | `syncDisplay`（自定义下拉框禁用态同步，`createCustomSelect` 内动态创建） |
| `matchMedia` | `prefers-color-scheme:dark` | 系统主题切换 | `applyTheme` |

**页面可见性**：

| 事件 | 触发时机 | 行为 |
| --- | --- | --- |
| `visibilitychange` → visible | 标签页恢复可见 | 重新请求 WakeLock（`configs.some(c => c.isRunning) \|\| isAutoRefresh`） |
| `visibilitychange` → hidden | 标签页隐藏 | 保存网络监测状态到 GM 存储（`saveNetworkMonitorState()`，仅在监测开启时） |

WakeLock 的请求和释放遵循「全局判断」原则：

- 请求时：检查是否有**任意**配置在运行，或自动刷新开启
- 释放时：检查**所有**配置均已停止，且自动刷新未开启
- 页面重新可见时：自动重新请求（浏览器会在页面隐藏时自动释放 WakeLock）

这样可以正确处理多配置并行运行、自动刷新、标签页切换等场景。

**全局 click 监听器**（第 7906 行）：

面板在 capture 阶段监听 click 事件，用于关闭配置菜单等全局 UI 状态：

```js
panel.addEventListener('click', (e) => {
    if (e.target === configBtnEl || configBtnEl.contains(e.target)) return;
    closeConfigMenu();
}, true);  // capture 阶段，优先处理

```

此外，脚本使用 `isProgrammaticClick` 布尔标记区分用户真实点击和脚本程序化触发的 `el.click()`。在 `doClickFor` 入口设为 `true`，出口设为 `false`。全局 `document.addEventListener('click', ...)` 在程序化点击期间可据此跳过某些副作用处理。

**事件委托**：所有 info/settings overlay 控件通过 `data-info-action` / `data-settings-action` 自定义属性标识，在父级 `change`/`input`/`click` 事件中通过一个统一的 `switch` 语句分发处理，避免为每个控件单独绑定事件监听器。

**info overlay action 清单**（`data-info-action`，共 14 种，通过 `change`/`click` 事件分发）：

| Action | 事件 | 作用 |
| --- | --- | --- |
| `toggle-enabled` | change | 启用/禁用此元素 |
| `toggle-matchTag` | change | 标签匹配开关 |
| `toggle-matchText` | change | 文字匹配开关 |
| `toggle-matchId` | change | id 匹配开关 |
| `toggle-matchClass` | change | class 匹配开关 |
| `toggle-matchAttrs` | change | 标准属性匹配开关 |
| `toggle-matchDataAttrs` | change | data-* 匹配开关 |
| `toggle-matchOnclick` | change | onclick 匹配开关 |
| `toggle-matchParent` | change | 父级容器匹配开关 |
| `change-matchTextMode` | change | 文字匹配模式（exact/fuzzy） |
| `change-text` | input | 编辑指纹文本内容 |
| `change-attr` | change | 编辑属性值 |
| `delete-target` | click | 删除目标（触发确认对话框） |
| `test` | click | 运行匹配测试（`runElementTest()`） |

**settings overlay action 清单**（`data-settings-action`，共 9 种，通过 `change`/`input` 事件分发）：

| Action | 事件 | 作用 |
| --- | --- | --- |
| `toggle-isInput` | change | 输入元素开关 |
| `toggle-scrollIntoView` | change | 滚动到可视区开关 |
| `toggle-enableHighlight` | change | 启用高亮开关 |
| `toggle-showParent` | change | 显示父级开关 |
| `change-desc` | input | 编辑元素描述 |
| `change-customFill` | input | 编辑填充文本 |
| `change-customCommand` | input | 编辑 JS 指令代码 |
| `change-customInterval` | change | 编辑独立间隔 |
| `delete-target` | click | 删除目标（触发确认对话框） |
| `change-keybind` | click/dblclick | 点击进入按键录制模式；双击清空绑定（v5.2.9+） |

**处理模式**：

- `change` 事件处理 toggle（`t.<field> = e.target.checked`）和 select（`t.<field> = e.target.value`）
- `input` 事件处理文本输入（`t.<field> = e.target.value`），实现实时更新
- 每种 action 处理后统一调用 `savePerConfig(activeConfig)` 持久化
- `delete-target` action 调用 `showConfirm()` 弹出确认对话框，用户确认后执行删除 + `updateTargetUI()` + `refreshParentHighlights()`

---

## 文件结构

[↑ 回到顶部](#automatic-operation-)

```text
Automatic-operation/
├── Automatic-operation.js    # 主脚本 8032行，全部功能（油猴 UserScript）
├── Automatic-clicker.js      # 早期简化版 777行（单目标自动点击器）
├── README.md                 # 本文档（使用说明 + 技术参考）
└── LICENSE                   # GPL-3.0 许可证

```

**代码统计**：

| 文件 | 行数 | 说明 |
| --- | --- | --- |
| `Automatic-operation.js` | **8032** | 主脚本，包含 CSS（~2654行）+ JS 逻辑（~5378行） |
| `Automatic-clicker.js` | **777** | 早期简化版，单目标自动点击器 |
| `README.md` | **~3786** | 本文档（使用说明 + 技术参考） |

| 指标 | 数值 |
| --- | --- |
| 总函数数 | **100+** 个具名函数 |
| CSS 变量 | **34** 个（暗色 17 个 + 亮色覆盖 17 个） |
| CSS 类名 | **60+** 个脚本注入类名（含状态变体和动画类） |
| 配置套数 | **10** 套独立配置（每套可并行运行） |
| 匹配规则 | **8** 项（tag/text/id/class/attrs/data-*/onclick/parent） |
| 存储键 | **4** 类 × 13 键（Shared×1 + PerConfig×10 + RefreshState×1 + NetMon×1） |
| Observer | **11+** 个（ResizeObserver ×5 + MutationObserver ×4 + matchMedia ×1 + 动态绑定 textarea Observer×2） |
| 定时器 | **15+** 种（操作/刷新/省电/透明度/倒计时/运行时长/等待/最大时长/进度条/网络动画等） |
| Overlay 面板 | **3** 个（info/settings/network） + 省电遮罩 overlay |
| 事件监听 | **20+** 个（click/mousedown/mouseup/mousemove/touchstart/touchmove/touchend/keydown/keyUp/change/input/visibilitychange/transitionend/load/dblclick） |
| 可设置参数 | **26+** 个（全局 15 + 每元素 11，含按键绑定） |

| 行号 | 模块 | 行数 | 关键函数/内容 |
| --- | --- | --- | --- |
| 1–16 | 元数据 | 16 | UserScript header（name/version/match/grant×5/unsafeWindow/run-at/downloadURL/updateURL） |
| 18–40 | 环境检测 | 23 | `IS_TOP`, `IS_MOBILE`, 存储键定义（`SHARED_KEY`/`REFRESH_STATE_KEY`/`NETWORK_MONITOR_KEY`/`PER_CONFIG_KEY`） |
| 41–87 | 全局状态变量 | 47 | 面板/选取/运行/主题/省电/网络等全部状态变量声明（含 `_suppressFocusCount`, `_refreshIntervalAtStart`, `isConfigLoadMode`, `page2ClickCount`, `page2ClickTimer`, `page4ClickCount`, `page4ClickTimer`） |
| 89–113 | 网络监测状态恢复 | 25 | `restoreNetworkMonitorData` IIFE, 刷新标记注入 |
| 114–145 | configs 初始化 | 32 | 10 套配置 × 15 字段循环, `cv()` 快捷函数 |
| 149–199 | WakeLock/Focus/字体 | 51 | `requestWakeLock`, `suppressFocus`（引用计数 `_suppressFocusCount`）, 字体 link 创建 |
| 201–2854 | CSS 注入 | ~2654 | 暗/亮双主题全部样式（含 `color-scheme: dark/light`, `contain: layout style` ×7, `will-change` ×2, `transform` 省电动画, `auto-op-parent-chain-key` class, 按钮 `:active` 按压缩放, 网络监测 UI 过渡动画；v5.2.7 移除父容器高亮 `position: relative`；v5.2.8 新增自定义下拉选择框 `.auto-op-custom-select` 系列样式；v5.2.9 新增 `.auto-op-keybind-input` 和 `.auto-op-keybind-tip` 按键绑定样式） |
| 2857–2970 | 主题系统 | 113 | `scanWebpageTheme`（2860）, `resolveTheme`（2893）, `applyTheme`, `startThemeWatchers`（2918）, `stopThemeWatchers`（2970, auto/system/light/dark 四模式，`_themeTimer` 清理） |
| 2973–3367 | DOM 构建 | 394 | `createElement` 构建 panel + 5页面 + 3个overlay + 省电遮罩 + 确认框 + `appendChild` + 60+ `getElementById` |
| 3476–3532 | 省电模式 | 56 | `enablePowerSave`（3476）, `disablePowerSave`（3498, 随机位置从 `left/top` 改为 `transform: translate()`） |
| 3569–3673 | 配置切换 | 104 | `switchConfig`（3569, 核心：保存旧配置→清高亮→恢复元素引用→同步全部UI控件）；`parseFloat` 替代 `parseInt`；`parseInt` 统一加基数 `10` |
| 3678–3808 | 配置持久化 | 131 | `savePerConfig`（3678, 14 个 target 字段+6 配置字段+`keybind` 字段，移除 `matchMode`/`missCount`/`isCommand`/`customCommand` 序列化）, `loadPerConfig`（3719） |
| 3795–3858 | shared 存储 | 64 | `saveShared`（3795, 11 项全局状态）, `loadShared`（3812, `Number.isInteger` 验证 `activeConfig`） |
| 3859–3914 | 数据加载入口 | 56 | `loadData`（3859, 串联 loadShared + loadPerConfig ×10 + 主题初始化） |
| 3894–3957 | 选择器+文本工具 | 63 | `buildBaseSelector`（3894）, `buildAncestorSelector`（3904, 始终追加 `:nth-of-type(N)`）, `isInputField`（3920）, `getElText`（3930, 移除属性 50 字符限制） |
| 3976–4001 | 元素指纹 | 25 | `getElementFingerprint`（3976, onclick 匹配改为通用 `/\(([^)]*)\)/`，空字符串 `onclickParam` 为有效值） |
| 4003–4089 | 匹配规则 | 86 | `matchesFingerprint`（4003, 8 项规则 AND 关系；onclick 匹配用 `!== undefined && !== null` 允许空字符串） |
| 4091–4125 | 查询缓存+复合选择器 | 34 | `beginQueryCycle`（4091）, `cachedQuery`（4095, Map 缓存）, `buildCompoundSelector`（4104, 增强 `chain[i] && chain[i].selector` 防御性检查） |
| 4126–4196 | 目标查找+父容器 | 70 | `tryFindTarget`（4126, 三级回退：compoundSelector→cssSel→tagName）, `resolveParentInfo`（4155, parentChain 仅存 `{selector}` 无 `desc`） |
| 4198–4260 | 父容器高亮 | 62 | `refreshParentHighlights`（4198, blueParent 蓝框 + nearestParent 红虚线框） |
| 4252–4340 | 分页系统 | 89 | `updatePageHeight`（4252）, `goToPage`（4263, 回弹机制；parseInt 基数 10；离开第5/2页隐藏重置/清零计数） |
| 4340–4474 | 页签事件+配置加载模式 | 134 | 页签点击处理（第2页4次点击→`clearAllAutoStart`, 第5页4次点击→恢复默认）, `toggleConfigLoadMode`（📄↔📂 切换）；`exitConfigLoadMode` 移除残留 `btnGroup` 引用 |
| 4458–4574 | 配置加载模式退出+导出 | 116 | `exitConfigLoadMode`, `exportConfig`（4517, 序列化→Blob→下载 .json；版本号 5.3.0-78；移除 `matchMode` 字段） |
| 4574–4834 | 配置导入 | 260 | `importConfig`（4574, 7 层安全校验→备份→清理→导入→恢复引用→失败回滚，移除 `missCount`/`matchMode` 字段） |
| 4834–4934 | 折叠+透明度 | 100 | `performCollapse`（4834, `h3?.scrollWidth \|\| 0` 可选链）, `performExpand`（4854, width 过渡 + body opacity/max-height）, `collapsedWidth` 动态计算, 透明度状态机（3个定时器） |
| 4924–4976 | 确认对话框 | 53 | `showConfirm`（4924, Promise 返回；`_confirmCleanup` 防重叠守卫） |
| 4977–5033 | 刷新日志+状态保存 | 57 | `addRefreshLog`（4977）, `saveRefreshState`（5005, 使用 `_refreshIntervalAtStart` 锁定的间隔值计算剩余时间，含各运行中配置的 timestamp 和 clickedCount） |
| 5034–5126 | 刷新状态恢复+倒计时 | 93 | `loadRefreshState`（5034）, `triggerRefresh`（5070, `_isRefreshing` 防重复标志） |
| 5125–5207 | 自动启动倒计时 + 清除 | 82 | `startAutoStartCountdownTimerFor`（5156, setInterval 200ms 更新→到期调用 startClickingFor→清除定时器）；`clearAllAutoStart`（5207, 遍历10套配置一键清除所有自动启动+停止运行+持久化，入口为第2页4次点击） |
| 5207–5325 | 运行计时+状态更新 | 118 | 运行时长计时（`elapsedTimerID_global`）, 状态栏 UI 更新（100ms 节流；空闲文案从「无目标」改为「未选取目标元素」） |
| 5325–5486 | info/settings overlay 显示 | 161 | `showInfoPanel`（5340, v5.2.3 重构布局：元素引用→标签→父级链逐链节→id→class→data-*→标准属性→onclick→文字匹配；新增「更新」按钮；v5.2.8 文字模式 select 改为自定义下拉框）, `showSettingsPanel`（5501, v5.2.9 新增按键绑定输入框） |
| 5486–5536 | 高度管理 | 50 | `fitBodyToOverlay`（5486, 离屏探针测量→上限 65% 视口）, `restoreBodyHeight`（5505, 动画还原） |
| 5536–5716 | 元素测试+settings 观察器 | 180 | settings ResizeObserver/MutationObserver 动态绑定/解绑 |
| 5960–6110 | 元素测试 | 150 | `runElementTest`（6031, 元素存活检测；父级链逐链节验证；extractText 快速路径；文字匹配测试优化）；`updateElementRef`（5978, 仅更新引用不测试）；`updateParentChain`（6006, 仅重建父链）；`rebuildParentInfo`（4172） |
| 6110–6570 | 事件委托（info+settings） | 460 | 14 种 `data-info-action` + 10 种 `data-settings-action`（含 `change-keybind`）通过 change/input/click/dblclick 事件统一分发；info 面板新增 `updateElementRef`/`updateParentChain` 按钮处理；`_isValid` 计算含 `t.isCommand` |
| 6570–6780 | 元素选取+目标列表UI | 210 | `selectTarget`（6648, endPickClick 500ms 防抖；parentChain 仅存 `{selector}`；移除 `missCount`；`lastPickTime`；v5.2.5 `isDragging` 拖拽状态防误选）, `updateTargetUI`（parentChain 显示 `p.selector` 替代 `p.desc`；缺失/禁用/CMD 状态着色）, 拖拽（鼠标+触屏）, v5.2.5 目标删除时滚动位置保持 |
| 6780–6991 | 指令系统 | 211 | `runUserCommand`（6825, 15s Promise 超时守卫 `settle` + `guard`；console 拦截 5 种方法→new Function 沙箱→Promise 检测 .then/.catch）, 日志系统（`appendCmdOutput`, `updateCmdOutputUI`, 上限 500 条） |
| 6991–7165 | 网络监测核心 | 174 | `normalizeHeaders` 和 `normalizeBody`（v5.2.7-73 截取上限提升至 50000 字符）通用解析函数；`startNetworkMonitor`（7031, v5.3.0 改用 `unsafeWindow.fetch`/`unsafeWindow.XMLHttpRequest` 绕过 Tampermonkey 沙箱；支持 `Request` 对象参数；`setRequestHeader` 拦截在 `load`/`error` 后自动还原 `once: true`）, `stopNetworkMonitor`（7145, 还原 `unsafeWindow` 方法） |
| 7165–7217 | 网络监测开关+持久化 | 52 | `toggleNetworkMonitor`, `saveNetworkMonitorState`（7166, 简化 JSON.stringify）, `loadNetworkMonitorState`（7182）, `clearNetworkMonitorState`（7191） |
| 7217–7543 | 网络监测UI+复制+渲染 | 327 | `updateNetworkCount`（v5.2.5 优化：响应体到达时增量重建详情）, `renderNetworkList`, `buildRequestDetail`, `buildFetchCode`（7404）, `completeJSON`（截断 JSON 补全）, `buildBodyDetail`（请求体/响应体智能格式化：JSON pretty-print + URL 编码解析 + 截断补全）, `formatReqTime`（7244, `YYYY/MM/DD HH:MM:SS.mmm` 完整日期格式）, 复制全部, overlay 事件（parseInt 基数 10） |
| 7544–7692 | 操作启动+停止 | 149 | `startClickingFor`（7544, `parseFloat` 读取 clickInterval；parseInt 基数 10）, `stopClickingFor`（7644, 清所有定时器→释放 WakeLock/恢复 Focus（`_suppressFocusCount` 引用计数）→自动启动倒计时→UI 恢复→保存） |
| 7693–7725 | 等待重试 | 33 | `startWaitTimer`（7693, 轮询间隔从 1ms 调整为 5ms, 超时=间隔×2） |
| 7726–7967 | 操作执行 | 242 | `doClickFor`（7726, `isProgrammaticClick = false` 移入 `finally` 块；beginQueryCycle 重置缓存→status 评估→队列递归 setTimeout + 同时 setInterval） |
| 7908–8032 | 初始化 | 125 | 事件绑定（拖拽/开关/按钮/ResizeObserver/MutationObserver/matchMedia/visibilitychange）→主题→加载→折叠→观察器→跨刷新状态恢复→网络监测恢复→自动启动恢复 |
| 5693–5960 | 按键绑定系统 | 268 | `normalizeKeyName`（5693）, `formatKeyCombo`（5710）, `formatKeyComboFromSet`（5723）, `finalizeKeybindRecording`（5733）, `executeTargetByKeybind`（5911, click/fill/command 三种操作类型）, `showKeybindTip`（5864, 浮动提示堆叠显示）；keydown/keyup/mousedown 全局监听（5746/5804/5818）；录制模式 + 按键释放容差 150ms + 录制完成延迟 600ms；v5.2.9 新增 |
| **合计** | **1–8032** | **8032** | **CSS ~2654 + JS ~5378** |

---

## 版本历史

[↑ 回到顶部](#automatic-operation-)

### v5.3.0-78（当前 · 8032 行）

[↑ 回到顶部](#automatic-operation-)

- **原型链访问规范化**：`createCustomSelect` 中 `nativeSelect.__proto__` 改为 `Object.getPrototypeOf(nativeSelect)`，遵循现代 JavaScript 最佳实践，避免已弃用的 `__proto__` 访问器
- **按键绑定查询缓存修复**：`executeTargetByKeybind` 中 `tryFindTarget` 调用前新增 `beginQueryCycle()`，确保按键触发时的元素查找使用独立的查询缓存，避免复用上一次操作周期的陈旧缓存结果
- **父容器高亮清理修复**：`startClickingFor` 和 `doClickFor` 中重新查找目标元素时，新增对旧 `_blueParent` 和 `_nearestEl` 的高亮 class 清理（移除 `auto-op-parent-highlight`、`auto-op-parent-highlight-Overlap`、`auto-op-nearest-parent-highlight`），防止父容器高亮残留。同时修复 `doClickFor` 中元素有效性检查从 `document.contains(t.element)` 改为 `t.element.classList` 存在性检查（与 `startClickingFor` 保持一致）
- **版本号提升**：`@version` 从 5.3.0-77 提升至 5.3.0-78
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.3.0-77'` 提升至 `'5.3.0-78'`
- **代码行数变化**：从 8013 行增长至 8032 行（+19 行），CSS ~2654，JS ~5378

### v5.3.0-77（8013 行）

[↑ 回到顶部](#automatic-operation-)

- **存储 API 迁移**：所有数据持久化从 `localStorage` 改为 Tampermonkey 的 `GM_setValue`/`GM_getValue`/`GM_deleteValue`/`GM_listValues` 存储 API。封装为 `storageSet`/`storageGet`/`storageRemove`/`storageGetAllKeys` 四个工具函数，提供统一的异常处理和日志输出。解决部分浏览器环境下 `localStorage` 受限或被清理的问题
- **默认主题模式调整**：`themeMode` 默认值从 `'auto'` 改为 `'system'`，减少首次加载时的主题检测开销和闪烁
- **版本号提升**：`@version` 从 5.3.0-76 提升至 5.3.0-77
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.3.0-76'` 提升至 `'5.3.0-77'`
- **代码行数变化**：从 8001 行增长至 8013 行（+12 行），CSS ~2654，JS ~5359

### v5.3.0-76（8001 行）

[↑ 回到顶部](#automatic-operation-)

- **网络监测 `unsafeWindow` 适配**：`startNetworkMonitor` 和 `stopNetworkMonitor` 中的 `window.fetch`、`XMLHttpRequest.prototype.open`、`XMLHttpRequest.prototype.send` 全部改为 `unsafeWindow.fetch`、`unsafeWindow.XMLHttpRequest.prototype.open`、`unsafeWindow.XMLHttpRequest.prototype.send`。解决 Tampermonkey 沙箱环境下 `window` 与页面实际 `window` 不同导致网络拦截失效的问题。UserScript header 新增 `@grant unsafeWindow`
- **版本号提升**：`@version` 从 5.2.9-75 提升至 5.3.0-76
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.9-75'` 提升至 `'5.3.0-76'`
- **代码行数变化**：从 8000 行增长至 8001 行（+1 行 `@grant unsafeWindow`），CSS ~2654，JS ~5347

### v5.2.9-75（8000 行）

[↑ 回到顶部](#automatic-operation-)

- **按键绑定系统**（~305 行新增代码）：每个目标元素可绑定一个自定义按键组合（如 `Ctrl+K`、`F2`、`Shift+Alt+S`），在页面输入框未聚焦时按下即可触发该目标的操作（点击/填充/执行指令）。支持组合键（Ctrl/Alt/Shift/Meta+普通键），按键释放后有 150ms 容差窗口（`_KEYBIND_RELEASE_TOLERANCE`）防止误触发，录制完成延迟 600ms（`_KEYBIND_FINALIZE_DELAY`）。多个目标绑定同一按键时按列表顺序依次触发
- **按键绑定 UI**：元素设置面板（⚙）新增「按键绑定」输入框（readonly），点击进入录制模式（橙色脉冲动画 `keybind-pulse`），按下按键组合后自动保存。双击清空绑定，Esc 取消录制。`normalizeKeyName` 标准化键名（`Control`→`Ctrl`、` `→`Space`、`ArrowUp`→`↑` 等），`formatKeyCombo`/`formatKeyComboFromSet` 生成组合键字符串
- **按键绑定浮动提示**：按键触发后页面右上角显示浮动提示（`auto-op-keybind-tip`），显示目标描述和按键组合，绿色=成功，红色=失败（元素缺失或执行异常）。支持多条提示同时显示（自动堆叠偏移），2.5 秒后淡出。`executeTargetByKeybind` 统一处理 click/fill/command 三种操作类型
- **按键绑定持久化**：`keybind` 字段通过 `savePerConfig`/`loadPerConfig` 序列化到 GM 存储，`exportConfig`/`importConfig` 包含 `keybind` 字段
- **按键绑定 CSS**：新增 `.auto-op-keybind-input`（录制中状态 `.recording` + `keybind-pulse` 动画）、`.auto-op-keybind-tip`（`.show`/`.success`/`.fail` 状态）等 CSS 类
- **settings action 扩展**：`data-settings-action` 新增 `change-keybind`（click 进入录制 + dblclick 清空），总数从 9 种增至 10 种
- **版本号提升**：`@version` 从 5.2.8-74 提升至 5.2.9-75
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.8-74'` 提升至 `'5.2.9-75'`
- **代码行数变化**：从 7570 行增长至 8000 行（+430 行，含 ~107 行 CSS + ~305 行 JS + ~18 行注释），CSS ~2550 → ~2654，JS ~5020 → ~5146

### v5.2.8-74（7570 行）

[↑ 回到顶部](#automatic-operation-)

- **自定义下拉选择框组件**：新增 `createCustomSelect()` 函数（~113 行），将原生 `<select>` 元素替换为自定义样式的下拉选择框。原生 select 被隐藏（`display: none`），由自定义的 `.auto-op-custom-select-btn`（触发按钮）+ `.auto-op-custom-select-list`（下拉列表）+ `.auto-op-custom-select-option`（选项）组合替代。支持键盘操作（Enter/Space 打开、Escape 关闭）、点击外部自动关闭、禁用状态同步（MutationObserver 监听 `disabled` 属性变化）、滚动容器 overflow 溢出处理（打开时临时解除 `.auto-op-page-container` 的 `overflow` 和 `contain` 限制）
- **应用自定义下拉框**：5 个原生 select 改为自定义下拉框——操作策略（第 1 页）、元素消失后（第 3 页）、快捷指令预设（第 2 页）、面板字体（第 5 页）、主题模式（第 5 页）。info 面板的文字模式 select 也在 `showInfoPanel` 动态创建后调用 `createCustomSelect` 转换
- **自定义下拉框样式**：新增 `.auto-op-custom-select`、`.auto-op-custom-select-btn`、`.auto-op-custom-select-btn::after`（箭头指示器）、`.auto-op-custom-select-btn.disabled`、`.auto-op-custom-select-list`、`.auto-op-custom-select-list::-webkit-scrollbar`、`.auto-op-custom-select-option`、`.auto-op-custom-select-option.selected` 等 CSS 类。info 面板和指令预设区域有独立的尺寸覆盖样式
- **版本号提升**：`@version` 从 5.2.7-73 提升至 5.2.8-74
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.7-73'` 提升至 `'5.2.8-74'`
- **代码行数变化**：从 7457 行增长至 7570 行（+113 行，含 ~141 行 CSS + ~113 行 JS − ~1 行注释精简），CSS ~2409 → ~2550，JS ~5048 → ~5020

### v5.2.7-73（7457 行）

[↑ 回到顶部](#automatic-operation-)

- **请求体/响应体截取上限提升**：`normalizeBody()` 中字符串和通用类型的截取上限从 10000 字符提升至 50000 字符；fetch 拦截的响应体截取和 XHR 的请求体/响应体截取同步提升至 50000 字符。适用于需要查看较大请求/响应内容的调试场景
- **网络请求时间戳格式增强**：`formatReqTime(ts)` 从 `HH:MM:SS.mmm` 改为 `YYYY/MM/DD HH:MM:SS.mmm` 完整日期时间格式，方便跨天请求的区分和排序
- **截断 JSON 补全**：新增 `completeJSON(text)` 函数——自动补全被截断的 JSON 字符串（匹配未闭合的 `{`/`[` 和未结束的字符串），用于网络请求详情中截断响应体的 pretty-print 显示
- **请求体/响应体智能格式化**：新增 `buildBodyDetail(bodyText)` 函数——替代原来的 `escapeHtml` 直接输出，支持三种格式化路径：① JSON 内容 pretty-print（含截断补全，末尾显示 `[...截断补全]`）② URL 编码格式（`key=value&key2=value2`）逐行解码显示 ③ 其他内容原样转义。`buildRequestDetail` 中请求体和响应体显示改用 `buildBodyDetail`
- **版本号提升**：`@version` 从 5.2.7-72 提升至 5.2.7-73
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.7-72'` 提升至 `'5.2.7-73'`
- **代码行数变化**：从 7261 行增长至 7457 行（+196 行 JS），净增长率 ~2.7%

### v5.2.7-72（7261 行）

[↑ 回到顶部](#automatic-operation-)

- **CSS 父容器高亮样式精简**：移除 `.auto-op-parent-highlight`、`.auto-op-parent-highlight-Overlap`、`.auto-op-nearest-parent-highlight` 三个 CSS 类中多余的 `position: relative !important` 声明。这些类通过 `outline`/`box-shadow` 实现高亮效果，`position: relative` 对 `outline` 和 `box-shadow` 的渲染无影响（这两个属性不依赖定位上下文），移除此声明减少 3 行无效样式代码，CSS 更简洁
- **版本号提升**：`@version` 从 5.2.6-71 提升至 5.2.7-72
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.6-71'` 提升至 `'5.2.7-72'`
- **代码行数变化**：从 7264 行减少至 7261 行（−3 行 CSS），CSS ~2444 → ~2441

### v5.2.6（7264 行）

[↑ 回到顶部](#automatic-operation-)

- **CSS 分页容器底部内边距**：为 `.auto-op-page` 新增 `padding-bottom: 2px`，替代此前 `updatePageHeight` 中手动追加的 `+2px` 高度补偿。CSS 层面控制间距，JS 高度计算更简洁（`pageContainer.style.height = h + 'px'`，移除硬编码的 `+ 2` 偏移量）
- **版本号提升**：`@version` 从 5.2.5 提升至 5.2.6-71
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.5'` 提升至 `'5.2.6-71'`
- **代码行数变化**：从 7263 行增长至 7264 行（+1 行 CSS），净增长率 ~0.01%

### v5.2.5（7263 行）

[↑ 回到顶部](#automatic-operation-)

- **CSS 样式隔离**：新增 `#auto-op-panel` 样式重置块——显式设置 `line-height: normal`、`letter-spacing: normal`、`word-spacing: normal`、`text-transform: none`、`text-indent: 0`、`text-shadow: none`、`white-space: normal`、`word-break: normal`、`overflow-wrap: normal`、`hyphens: manual`、`tab-size: 8` 共 11 项 CSS 属性。防止网页自定义样式（如全局 `line-height: 2`、`text-transform: uppercase` 等）意外继承到面板内部，确保面板在所有网页上保持一致的排版外观
- **网络请求解析增强**：新增 `normalizeHeaders()` 函数（第 7004 行）——统一处理 Headers 对象（constructor 检测）、forEach 可迭代格式（`headers.forEach`）、Array of pairs 格式（`[[k,v],...]`）三种请求头表示形式，替代原来仅支持 plain object 的 `Object.assign` 方式。兼容各类第三方 fetch 封装库的非标准 headers 格式
- **请求体类型扩展**：新增 `normalizeBody()` 函数（第 7020 行）——统一处理 6 种请求体类型：字符串（截取前 10000 字符）、`URLSearchParams`（`.toString()`）、`FormData`（`Object.fromEntries` 转 JSON）、`Blob`（显示 `[Blob size type]`）、`ArrayBuffer`/`ArrayBufferView`（显示 `[Binary size]`）、其他类型（`String()` 转换）。替代原来仅做 `String(body).slice(0, 10000)` 的简陋处理，避免 `FormData`/`Blob` 等对象被转成无意义的 `[object FormData]`
- **网络监测响应体读取容错**：fetch 拦截的 `.then(response => response.clone().text())` 在失败时新增 `console.error('[AUTO_OP] 读取响应体失败:', req.url, err)` 日志输出，便于排查跨域或其他读取失败场景
- **网络请求详情增量更新**：`updateNetworkItemUI` 优化重建逻辑——新增 `builtWithBody` 标记，仅当响应体数据到达且详情尚未包含 body 时才重建 DOM；没有 body 的 pending 状态不再重复重建。减少高频更新时的不必要 DOM 操作
- **拖拽防误选**：`onPickClick` 新增 `isDragging` 状态检查——面板拖拽期间不会触发元素选取，防止拖动面板时意外选取页面元素。`isDragging` 在拖拽 `mousedown`/`touchstart` 时设为 `false`，`mousemove`/`touchmove` 时设为 `true`
- **面板点击恢复优化**：折叠半透明面板的点击恢复逻辑中，新增 `!e.target.closest('.auto-op-header')` 判断——点击标题栏区域不会触发透明度恢复，仅点击面板内容区（body）时恢复不透明。防止拖拽标题栏时意外触发恢复
- **展开动画加速**：`performExpand` 中 `collapsedWidth → 300px` 的宽度过渡延迟从 120ms 缩短至 70ms，展开响应更快
- **目标删除滚动位置保持**：删除目标元素时，先保存目标列表的 `scrollTop`，在 `updateTargetUI()` 重建 DOM 后恢复滚动位置，避免删除列表中间的目标时自动跳回顶部。scrollTop 通过 `targetListContainer.querySelector('.auto-op-target-list')` 读写，无闪烁感
- **数据序列化精简**：`savePerConfig` 中不再序列化 `isCommand` 和 `customCommand` 字段——两者为运行时字段，分别由 `desc` 中的 `[CMD]` 前缀和匹配开关状态推断。减少 GM 存储体积
- **第 5 页底部 GitHub 链接**：新增指向 `github.com/sewolonX/Automatic-operation` 仓库的小型链接（字体 10px，蓝色），方便用户快速访问项目主页
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.4'` 提升至 `'5.2.5'`
- **代码行数变化**：从 7215 行增长至 7263 行（+48 行，含 ~33 行 CSS + ~15 行 JS），净增长率 ~0.67%
- **版本号提升**：`@version` 从 5.2.4 提升至 5.2.5

### v5.2.4（7215 行）

[↑ 回到顶部](#automatic-operation-)

- **CSS `color-scheme` 支持**：在 `:root` 和 `[data-theme="light"]` 中分别添加 `color-scheme: dark` 和 `color-scheme: light` 声明，让浏览器原生表单控件（input/select/button/scrollbar 等）也跟随面板主题，消除暗色面板中亮色滚动条和输入框的视觉冲突
- **按钮按压动画**：「设为目标」和「测试运行」按钮新增 `:active` 态 `transform: scale(0.96)` 按压缩放反馈；网络监测复制按钮 `:active` 态 `transform: scale(0.85)`，hover 态改为蓝色实色背景 + 白色文字（`--panel-highlight-border`）
- **一键清除所有自动启动**：新增 `clearAllAutoStart()` 函数——遍历全部 10 套配置，关闭自动启动开关、清空间隔和倒计时、停止运行中的配置、持久化保存。入口：在第 2 页（JS 指令页）**连续点击页签按钮 4 次**（2 秒内）触发（类似第 5 页「恢复默认设置」的隐藏操作模式），适用于需要快速终止所有自动定时任务的场景
- **网络监测 UI 优化**：网络按钮 hover 改为蓝色文字 + 浅蓝背景（`rgba(39,122,247,0.1)`）；`.auto-op-network-item` hover/expanded 背景从 `--panel-button-hover-bg` 改为 `--panel-input-bg`（更低调）；请求详情代码块背景从 `--panel-input-bg` 改为 `--panel-button-hover-bg`（增强对比度）；复制按钮新增 `transition: all 0.3s` 过渡动画
- **网络请求详情代码复制按钮增强**：hover 态改为蓝色实色背景 + 白色文字（`--panel-highlight-border`）；`:active` 态新增 `transform: scale(0.85)` 按压反馈
- **导出配置版本号**：`exportConfig()` 中序列化的 `version` 字段从 `'5.2.3'` 提升至 `'5.2.4'`
- **page2ClickCount 重置逻辑**：`goToPage` 离开第 2 页时自动清零 `page2ClickCount` 和 `page2ClickTimer`，防止页签点击计数跨页面残留
- **代码行数变化**：从 7148 行增长至 7215 行（+67 行，含 ~14 行 CSS + ~53 行 JS），净增长率 ~0.9%
- **版本号提升**：`@version` 从 5.2.3 提升至 5.2.4

### v5.2.3（7148 行）

[↑ 回到顶部](#automatic-operation-)

- **info 面板重构**：重新组织匹配规则检查区域，新增「元素引用」行（含元素存活检测 + `updateElementRef` 更新按钮）；父级容器匹配支持逐链节独立验证+更新（`updateParentChain` 重建 parentChain）；文字匹配对 `hasStrong` 元素使用 `extractText` 快速路径（`textContent` + `alt`/`title`/`placeholder`/`aria-label`/`value` 属性回退）；新增 `auto-op-parent-chain-key` CSS class 用于链节选择器显示
- **禁止聚焦引用计数**：`suppressFocus`/`restoreFocus` 改为引用计数（`_suppressFocusCount`）——多次调用 `suppressFocus` 不会重复覆盖 `HTMLElement.prototype.focus`，仅当计数归零时真正恢复。解决多配置并发运行时提前恢复 focus 的竞争问题
- **自动刷新间隔锁定**：新增 `_refreshIntervalAtStart` 在倒计时启动时锁定刷新间隔，防止倒计时期间用户修改间隔导致剩余时间计算错误。`saveRefreshState` 使用锁定的间隔值计算剩余时间
- **刷新防重复**：新增 `_isRefreshing` 标志位，防止 `triggerRefresh` 被多次并发调用（如定时器 + 进度条双重触发）
- **选取防抖**：新增 `lastPickTime` 时间戳，选取模式下 `click` 事件增加 500ms 防抖——触屏设备的 touchend 可能在 click 之前触发 `selectTarget`，避免同一元素被重复添加
- **JS 指令 15 秒超时**：`runUserCommand` 中 Promise 路径新增 15s `setTimeout` 超时守卫。超时后自动 `settle(false, '超时(15s)：Promise 未解决')`，防止 Promise 永不 resolve 导致 console 拦截持续生效
- **onclick 匹配通用化**：`getElementFingerprint` 和 `matchesFingerprint` 中的 onclick 参数提取从硬编码 `/useItem\((\d+)\)/` 改为通用 `/\(([^)]*)\)/`，支持任意函数调用的参数提取。空字符串 `onclickParam` 现为有效匹配值（通过 `!== undefined && !== null` 检测）
- **网络监测增强**：`window.fetch` 拦截支持 `Request` 对象作为参数（`url instanceof Request`）；请求体/响应体截取上限从 4000 字符提升到 10000 字符（v5.2.7-73 进一步提升至 50000 字符）；XHR `setRequestHeader` 拦截在 `load`/`error` 事件后自动还原（`once: true`），防止内存泄漏
- **等待重试优化**：元素消失后的轮询间隔从 1ms 调整为 5ms，减少 CPU 占用
- **CSS 性能优化**：多处容器元素添加 `contain: layout style`（`.auto-op-body`、`.auto-op-target-list-container`、`.auto-op-target-list`、`.auto-op-target-item`、`.auto-op-page-container`、`.auto-op-btn-group`、`.auto-op-progress-container`）——隔离布局和样式计算范围，减少回流开销；`.auto-op-progress-fill` 添加 `will-change: width` 提升进度条动画流畅度
- **省电模式动画优化**：浮动元素从 `left`/`top` 过渡改为 `transform: translate()`（GPU 加速）+ `will-change: transform`；浮动元素初始位置设为 `left:0; top:0`，通过 transform 偏移到随机位置
- **类型安全与健壮性**：全部 `parseInt` 调用添加基数 `10`（防止 '0x' 前缀被解析为十六进制）；`clickInterval` 从 `parseInt` 改为 `parseFloat`（支持小数间隔）；`activeConfig` 验证从 `typeof === 'number'` 改为 `Number.isInteger()`；`h3?.offsetWidth || 0` 和 `h3?.scrollWidth || 0` 添加可选链（防御性编程）；`onPickHover`/`onPickHoverOut` 添加 `el.classList` 存在性检查
- **数据结构精简**：删除 `matchMode` 字段（已被 `matchTextMode` 替代）；删除 `missCount` 字段（从未在匹配逻辑中使用）；`parentChain` 元素从 `{selector, desc}` 简化为 `{selector}`（移除描述字符串，减少序列化体积）；`isCommand`/`customCommand` 不再序列化到 GM 存储（运行时字段，由 `desc` 中的 `[CMD]` 前缀标识）
- **`buildAncestorSelector` 一致性**：始终追加 `:nth-of-type(N)` 后缀（即使 N=1），消除有/无后缀的不一致行为，提升选择器的确定性
- **`getElText` 放宽属性提取**：`alt`/`title`/`placeholder`/`aria-label`/`value` 属性文本提取移除 50 字符限制，允许长属性文本作为元素文本源
- **`doClickFor` 异常安全**：`isProgrammaticClick = false` 从 `try` 块末尾移入 `finally` 块，确保即使操作抛出异常也能正确恢复标记
- **确认对话框防重叠**：新增 `_confirmCleanup` 全局守卫——打开新确认框时自动清理前一个（解绑事件 + 隐藏遮罩），防止多个确认框叠加
- **初始化精简**：移除 `cmdInput` 的 `MutationObserver`（监听 `style` 属性变化），减少不必要的观察器开销；配置恢复增加 `configs[ciNum]` 存在性检查
- **代码行数变化**：从 6999 行增长至 7148 行（+149 行，含 ~20 行 CSS + ~129 行 JS），净增长率 ~2.1%
- **版本号提升**：`@version` 从 5.2.2 提升至 5.2.3

### v5.2.2（· 6999 行）

[↑ 回到顶部](#automatic-operation-)

- **精简多目标选取**：取消独立的多选模式开关，多目标选取始终可用。操作策略（同时/队列）在存在多个目标时直接生效，简化交互流程。修复自动增加大量目标的问题
- **取消自动发现机制**：移除 `autoDiscover` 开关和 `discoveredElements` 集合。`discoverNewTargetsFor` 和 `cleanupAutoTargetsFor` 函数已删除，简化操作周期的执行逻辑，避免非预期的批量目标添加
- **优化选择器构建**：`buildSelectors` 重命名为 `buildAncestorSelector`，返回单一选择器字符串（而非 `{strict, loose}` 对象）。新增 `buildCompoundSelector` 利用 `parentChain` 构建带完整父链的唯一选择器，提升查找精度和效率
- **优化元素查找**：`tryFindTarget` 简化为三级查找（compoundSelector → cssSel → tagName），结合 `beginQueryCycle`/`cachedQuery` 查询缓存机制，统一使用 document 范围 + 复合选择器
- **删除无用代码**：移除 `'use strict'` 声明、`migrateOldData()` 旧版数据迁移函数、`NETWORK_REQUESTS_KEY` 独立存储键。网络请求记录合并到 `NETWORK_MONITOR_KEY` 中（`{active, requests}` 结构）
- **CSS 变量调整**：亮色主题下的 `--panel-active-border` 和 `--panel-active-text` 从 `#32d486` 调整为 `#07C160`（微信绿），提升视觉一致性
- **UI 过渡优化**：为配置加载模式切换、按钮组折叠、状态栏等添加平滑的 CSS 过渡动画（opacity/transform/max-height/margin-top）
- **UI 节流增强**：减少不必要的 UI 更新，在省电模式下或面板折叠时跳过目标计数和状态更新，提升性能
- **修正文本显示**：修复文本提取和显示相关问题
- **版本号提升**：`@version` 从 5.2.1 提升至 5.2.2

### v5.2.1（· 约 7048 行）

[↑ 回到顶部](#automatic-operation-)

- **修复指令无法运行的问题**：修复 `runUserCommand` 中 console 拦截过度导致指令执行失败的问题。具体表现为 JS 指令设为目标后，在操作周期中执行时 `new Function()` 沙箱无法正常获取 `console.log/warn/error` 等输出，导致日志缺失且异步 Promise 链断裂。修复方式为优化 console 拦截的时机和透传逻辑，确保指令执行期间输出正常捕获并在完成后恢复原始 console
- **修复指令错误状态显示**：指令执行失败时，目标列表中对应项现在正确显示 `cmd-error` 样式（红色文字），便于快速定位问题元素
- **优化跨刷新恢复稳定性**：修复极端情况下（刷新间隔 < 1s）重复 save/restore 竞争导致状态不一致的问题
- **版本号提升**：`@version` 从 5.2.0 提升至 5.2.1

### v5.2.0

[↑ 回到顶部](#automatic-operation-)

- **配置导入/导出**（~380 行新增代码）：第 1 页页签切换为配置加载模式（📄→📂），支持导出当前配置为 `.json` 文件（含版本号、时间戳、域名元数据），以及从文件导入配置。7 层安全校验（扩展名→文件大小≤10MB→JSON 格式→targets 数组→配置字段→导入前备份→确认弹窗），失败自动回滚
- **网络监测持久化**：刷新后自动恢复监测状态和请求记录（`NETWORK_MONITOR_KEY` 统一存储 `{active, requests}`），页面隐藏时（`visibilitychange`→hidden）自动保存
- **跨刷新刷新标记**：刷新后在请求列表中注入 `method=刷新, status=refresh` 标记记录，方便区分刷新前后的请求
- **恢复默认设置**：第 5 页连续点击 4 次触发（2 秒超时），首次点击显示橙色提示，二次确认后扫描并删除当前域名所有 `AUTO_OP_` 前缀 GM 存储键
- **输出日志展开/折叠**：超过 150 字符的日志行支持点击展开/折叠（`auto-op-cmd-truncated` / `auto-op-cmd-expanded` class 切换），`…点击展开` 蓝色提示
- **指令设定为目标**：支持将 JS 指令代码作为操作队列的一项（`isCommand: true`），在队列/同时模式下与其他目标统一调度
- **元素消失处理**：新增「等待重试」（1ms 轮询，超时=间隔×2 后跳过）和「立即停止」两种策略
- **最大运行时长跨刷新恢复**：`operationStartTimestamp` 精确扣除已消耗时间，剩余时间 ≤0 时启动后立即停止
- **适配移动端触屏拖拽**：所有标题栏支持 `touchstart`/`touchmove`/`touchend` 事件

### v5.1.x（v5.1.0 · 约 6800 行）

[↑ 回到顶部](#automatic-operation-)

- **10 套独立配置**：每套可独立运行，支持多配置并行
- **队列模式 + 独立间隔**：递归 `setTimeout` 链实现可变间隔
- **JS 指令系统**：`new Function()` 沙箱 + console 拦截 + Promise 检测 + 命令历史
- **网络请求监测**：拦截 fetch/XHR，请求体/响应体截取 50000 字符，复制为代码
- **自动刷新 + 跨刷新恢复**：保存全部运行状态，刷新后精确恢复倒计时和操作计数
- **主题系统**：`auto`/`system`/`light`/`dark` 四种模式，`auto` 检测网页主题
- **省电模式**：全屏遮罩 + 4 个浮动显示 + 自动全屏 + 随机位置
- **面板透明度系统**：定时器驱动的折叠态半透明 + 点击恢复交互
- **高度管理系统**：离屏探针测量 + ResizeObserver/MutationObserver 动态调整
- **面板字体**：MiSans VF（小米 CDN）+ system-ui 回退
- Wake Lock 屏幕常亮 + 禁止聚焦

### v5.0.x（v5.0.0 · 约 5500 行）

[↑ 回到顶部](#automatic-operation-)

- 5 页面板架构：目标操作 / JS 指令 / 参数设置 / 自动刷新 / 系统设置
- 多目标选取 + 同时/队列操作策略
- 8 项匹配规则（tag/text/id/class/attrs/data-*/onclick/parent）
- 元素指纹 + 三级选择器（compoundSelector/cssSel/tagName）查找回退
- 元素设置面板（独立间隔、输入填充、scrollIntoView、高亮开关、父级显示）
- 配置持久化（按域名隔离 + 多套配置）
- 面板折叠展开动画（width 过渡 + body max-height/opacity 过渡）

### v4.x 及更早

[↑ 回到顶部](#automatic-operation-)

- 单目标自动点击器 `Automatic-clicker.js`（777 行）
- 基础元素选取 + 指纹匹配
- 单套配置持久化

---

## 许可与作者

[↑ 回到顶部](#automatic-operation-)

GPL-3.0 License — [sewolon](https://github.com/sewolonX)
