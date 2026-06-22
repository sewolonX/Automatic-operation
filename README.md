# Automatic-operation 🎯

[油猴脚本（Tampermonkey）](https://www.tampermonkey.net/) — 在任意网页上自动操作（点击 / 填充 / 执行 JS）元素。纯 JavaScript 实现，6568 行，无外部依赖。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 选择版本安装脚本，打开任意网页，左上角出现 **自动操作** 面板（初始为折叠状态）

| 版本 | 链接 | 说明 |
| --- | --- | --- |
| **正式版** | [点击安装](https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js) | OSS CDN，稳定版本 |
| **Dev 版** | [点击安装](https://github.com/sewolonX/Automatic-operation/raw/refs/heads/main/Automatic-operation.js) | GitHub 直链，随 `main` 分支更新 |

> **早期版本**：[Automatic-clicker.js](Automatic-clicker.js)（~777 行）是单目标简化版自动点击器。

---

## 快速开始

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
│ 已操作：0次 00:00:00  请选取目标 │ ← 底部状态栏
└──────────────────────────────────┘

```

**三步上手**：① 点击「选取元素」→ ② 点击页面上的目标按钮/链接 → ③ 点击「开始」

---

## 目录

- [教程](#教程)
  - [第一课：首次自动点击](#第一课首次自动点击)
  - [第二课：匹配规则与元素查找](#第二课匹配规则与元素查找)
  - [第三课：多选模式与操作策略](#第三课多选模式与操作策略)
  - [第四课：自动填充输入框](#第四课自动填充输入框)
  - [第五课：JS 指令](#第五课js-指令)
  - [第六课：网络请求监测](#第六课网络请求监测)
  - [第七课：自动刷新与自动启动](#第七课自动刷新与自动启动)
  - [第八课：配置管理](#第八课配置管理)
  - [第九课：系统设置](#第九课系统设置)
  - [第十课：省电模式](#第十课省电模式)
  - [第十一课：面板交互细节](#第十一课面板交互细节)
  - [第十二课：元素设置面板详解](#第十二课元素设置面板详解)
  - [第十三课：自动发现机制](#第十三课自动发现机制)
- [界面总览](#界面总览)
- [参数速查表](#参数速查表)
- [技术参考](#技术参考)
  - [架构概览](#架构概览)
  - [元素选取与指纹（源码详解）](#元素选取与指纹源码详解)
  - [匹配规则与目标查找（源码详解）](#匹配规则与目标查找源码详解)
  - [操作执行（源码详解）](#操作执行源码详解)
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
  - [DOM 观察器与事件委托](#dom-观察器与事件委托)
- [文件结构](#文件结构)
- [许可与作者](#许可与作者)

---

## 教程

### 第一课：首次自动点击

**目标**：让脚本每隔 1 秒自动点击页面上的一个按钮。

**操作步骤**：

#### 1. 进入选取模式

展开面板（点击左上角半透明条），点击第 1 页的「选取元素」按钮。按钮会变为**橙色脉冲**状态，表示正在等待你选择目标。面板变为半透明（`opacity: 0.65`），减少对页面内容的遮挡。

#### 2. 选择目标元素

将鼠标移到页面上你想自动点击的按钮上——会看到**橙色虚线高亮框**（CSS class `auto-op-highlight`）。单击该元素，选取完成：

- 高亮框变为**绿色实线框**（CSS class `auto-op-selected-highlight`）
- 元素描述显示在目标列表中
- 「开始」按钮变为可用状态
- 如果开启多选模式，选取后不会退出选取模式，可继续选取

#### 3. 调整参数（可选）

点击第 3 页（⚙ 滑块图标），可调整：

- **操作次数**：留空 = 无限次。填入 `100` 则点击 100 次后自动停止
- **操作间隔**：默认 1000ms。改为 `500` 则每 0.5 秒点击一次
- **操作时间**：最长运行多少分钟后自动停止（与操作次数是 **OR** 关系——任一先到就停止）

#### 4. 开始运行

回到第 1 页，点击「开始」→ 按钮变红「停止」，状态栏显示运行中。同时自动：

- 请求屏幕常亮（Wake Lock），防止屏幕休眠
- 启用禁止聚焦，防止页面弹窗中断操作
- 锁定多选模式/策略/参数输入框

#### 5. 停止运行

点击红色的「停止」按钮，或等待操作次数/时间到达上限自动停止。停止后：

- 释放 Wake Lock
- 恢复页面焦点控制
- 如果设置了自动启动，开始新的倒计时
- 解锁所有参数输入框

> **提示**：面板折叠时，标题栏会出现 ▶ 播放/■ 停止按钮，无需展开面板即可控制操作。

---

### 第二课：匹配规则与元素查找

#### 为什么需要匹配规则？

页面刷新后，脚本选中的 DOM 元素引用会失效。脚本通过**指纹 + 选择器 + 匹配规则**三级机制重新定位元素，确保持久化后仍能找到目标。

#### 理解匹配规则

选取元素后，点击目标右侧的 ⓘ 按钮打开详情面板，可以看到 9 项匹配规则：

| 规则 | 说明 | 示例 |
| --- | --- | --- |
| 标签匹配 | HTML 标签名是否一致 | `BUTTON` |
| 文字匹配 | 元素文本是否匹配（完全/模糊） | `"提交订单"` |
| id 匹配 | `id` 属性是否相同 | `#submit-btn` |
| class 匹配 | CSS 类名是否全部包含 | `.btn.primary` |
| 标准属性匹配 | `href`/`src`/`type`/`name` 等属性 | `type="button"` |
| data-* 匹配 | 自定义 `data-*` 属性 | `data-id="88234"` |
| onclick 匹配 | 内联 onclick 中的参数 | `useItem(42)` |
| 父级容器匹配 | 祖先容器是否存在且包含元素 | `ul.list` |
| 自动发现 | 是否扫描容器内新增的匹配元素 | — |

**关键概念**：所有开启的规则是 **AND（与）** 关系——必须**全部满足**才算匹配成功。你可以关闭不需要的规则来放宽匹配条件。

**匹配规则的实际应用场景**：

| 场景 | 建议设置 |
| --- | --- |
| 页面上的唯一按钮（有 id） | 全部开启，非常精确 |
| 动态列表中的按钮（class 相同、文本不同） | 关闭 class 匹配，仅靠文字 + 标签 |
| 翻页按钮（文本相同，位置固定） | 全部开启，依赖父级容器限定范围 |
| 变化频繁的广告位 | 开启自动发现，关闭严格属性匹配 |

#### 使用「测试」按钮

在详情面板顶部点击「测试」按钮，脚本会逐项测试每条规则，并：

1. 在面板中显示结果：`✓ 3`（绿色=通过，找到3个匹配元素）或 `✕`（红色=失败）
2. 在页面上用**粉色虚线框**（`outline: 2px dashed #F8BBD0`，class `auto-op-test-highlight`）高亮所有匹配元素
3. 测试完成后自动清理高亮
4. 帮你判断选择器是否过于宽泛或过于严格

**测试的具体流程**：首先用 `strict` 选择器查询，回退到 `loose` 选择器，再回退到 `tagName`。然后逐项测试每条开启的规则，显示匹配计数。

#### 文字匹配模式

点击文字匹配规则旁的 select，可切换：

- **完全匹配**（`exact`）：`元素文本 === 指纹文本`（严格，默认）
- **模糊匹配**（`fuzzy`）：`元素文本.includes(指纹文本)`（宽松）

对于 `hasStrong === true`（有 id 或 data-* 属性或关键属性）的元素，文字匹配走快速路径（直接取 `textContent`），否则用 `getElText()` 完整提取。

#### 父级容器的作用

选取元素时，脚本自动向上遍历祖先链，找到第一个有 `id` 或 `class` 的祖先作为 `blueParent`（蓝色父容器），其选择器保存为 `parentSelector`。父级匹配开启后，查找范围限定在父容器内，提高精度。页面上会显示：

- **蓝色大方框**（`box-shadow`，class `auto-op-parent-highlight`）：蓝色父容器
- **红色虚线框**（`outline: dashed`，class `auto-op-nearest-parent-highlight`）：直接父元素
- 当 `blueParent` 和直接父元素是同一个时，显示**细蓝框**（class `auto-op-parent-highlight-Overlap`）

#### 元素消失后的处理

第 3 页的「元素消失后」下拉：

| 选项 | 行为 |
| --- | --- |
| **等待重试** | 等待 `间隔×2` 时间，每 1ms 轮询检查。超时则跳过（队列模式继续下一个） |
| **立即停止** | 立即终止运行 |

---

### 第三课：多选模式与操作策略

#### 多选模式

第 1 页开启「多选模式」开关后，选取元素时**不会退出选取模式**，可以连续点选多个目标。状态栏会实时显示 `已选 N 个，继续选取或取消`。

**操作策略**（多选模式开启后出现）

| 策略 | 图标 | 行为 | 适用场景 |
| --- | --- | --- | --- |
| **同时操作** | — | 每个间隔**一次性**操作所有可用目标 | 批量点赞、批量领取 |
| **队列操作** | ①→②→③ | 按列表顺序**逐个**操作，每次一个 | 多步骤流程、需按顺序的操作 |

#### 队列模式进阶：独立间隔

每个目标元素的 ⚙ 设置页中有「独立间隔 (ms)」选项：

- 留空 → 使用全局操作间隔
- `0` → 不等待，立刻处理下一个
- `500` → 操作此元素后等 500ms 再处理下一个

```text
元素① customInterval=500 → 等500ms → 元素②
元素② customInterval=空  → 等1000ms(全局) → 元素③
元素③ customInterval=0   → 立刻 → 回到元素①循环

```

**队列模式内部机制**：队列模式不使用 `setInterval`，而是用递归 `setTimeout` 链：每次 `doClickFor` 尾部根据 `customInterval` 或 `clickInterval` 设置下一次 `setTimeout(doClickFor, delay)`，实现可变间隔。

**同时模式内部机制**：使用 `setInterval` 驱动，每个周期按顺序遍历所有目标元素并操作。

#### 目标列表操作

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

在输入框中写 JS 代码，点击「测试运行」或按 `Ctrl+Enter`。脚本会：

1. 拦截 `console.log/warn/error/info/debug` 输出（透传到原始 console）
2. 在 `new Function()` 沙箱中执行代码
3. 显示返回值（支持 async/await — 返回 Promise 时自动 `then/catch`）
4. 所有输出显示在下方的日志区域（上限 500 条，超限自动删除旧记录）

#### 方式二：快捷指令

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

点击「设为目标」将代码作为操作队列中的一项。运行时这段代码会被执行（而非 click），支持 `async/await`。仅在多选模式下可用（有多个目标时才显示为可用）。

**命令历史**：`↑` 上一条、`↓` 下一条，存储在 `cmdHistory` 数组中，`cmdHistoryIndex` 跟踪当前位置。

**日志颜色**：`log`=白、`warn`=橙、`info`=蓝、`debug`=粉、`error`=红、`result`=绿

**错误处理**：如果代码抛出异常，捕获 `e.message` 并显示为红色 error 日志。对于异步代码，`.catch()` 同样捕获并显示。

#### 重要：`new Function()` 与 `return` 关键字

脚本使用 `new Function()` 沙箱执行代码。普通函数不会自动返回最后一个表达式的值（只有箭头函数 `() => expr` 才会）。因此：

- ❌ `fetch(url).then(...)` — 函数返回 `undefined`，脚本不会等待异步结果，console 拦截提前恢复
- ✅ `return fetch(url).then(...)` — 显式 `return` 返回 Promise，脚本识别并等待完成后才恢复 console

所有涉及异步操作（fetch、setTimeout 等）的代码都应使用 `return`。

#### 输出日志展开/折叠

日志区域有**点击展开/折叠**机制：

- 每条日志超过 **150 字符**自动折叠，末尾显示 `…点击展开`（蓝色提示）
- 点击折叠的日志行 → 展开显示全文
- 再次点击 → 折叠回 150 字符
- 短于 150 字符的日志不受影响，始终完整显示
- 底部滚动条可见，方便浏览长内容

---

### 第六课：网络请求监测

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

**限制**：请求体/响应体截取前 4000 字符，最多保留 500 条记录。请求列表滚动条可见，方便浏览大量记录。

**网络监测持久化**（v5.2.0+ 新增）：

网络监测状态和请求记录会在**页面刷新后自动恢复**：

- 监测开关状态（`isNetworkMonitoring`）通过 `AUTO_OP_NETMON_<host>` 键持久化
- 所有请求记录通过 `AUTO_OP_NETREQ_<host>` 键持久化
- 刷新后自动注入一条「刷新」标记记录（method=`刷新`，status=`refresh`）
- 页面隐藏时（`visibilitychange` → hidden）自动保存
- 初始化时先恢复保存的请求记录，然后重新挂载拦截器

---

### 第七课：自动刷新与自动启动

**自动刷新**（第 4 页）

开启「自动刷新网页」开关，设置间隔（10s ~ 86400s）。脚本会在计时到达后：

1. 保存当前所有状态到 localStorage（包括所有配置 + 刷新状态 + 网络监测状态）
2. 记录刷新日志（含运行中配置编号、剩余时间）
3. 执行 `location.reload()`

刷新后脚本自动恢复：

- 之前的刷新日志（保留完整的时间戳和消息）
- 运行中的配置（继续操作，保留已操作计数和运行计时，通过 `savedTimestamp` 扣除已消耗的最大运行时长）
- 省电模式状态（300ms 延迟恢复）
- 自动刷新倒计时（如果剩余时间 > 0，精确恢复；否则立即触发）

**刷新进度条**（第 4 页）：

开启自动刷新后，页面底部出现实时进度条：

```text
┌──────────────────────────────────┐
│ 45.3%              剩余 00:32    │ ← 百分比 + 倒计时
│ ████████████░░░░░░░░░░░░░░░░░░   │ ← 进度条
└──────────────────────────────────┘

```

- 剩余 < 30 秒时：进度条和百分比变为**红色**（`--panel-missing-border`）
- 正常运行：蓝色进度条（`--panel-highlight-border`）
- 百分比精确到小数点后 1 位
- 进度条平滑填充（CSS transition on width）

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

**10 套独立配置**，每套有独立的：目标列表、操作参数、多选模式、操作策略、自动启动设置。

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
6. 同步所有 UI 控件（多选模式、策略、次数、间隔、时间等）
7. 刷新父容器高亮、目标 UI、计数、配置按钮标签
8. 保存数据、跳转到第 0 页

**配置间的关系**：

- 每套配置**完全独立**：配置①的参数不影响配置②
- 可以**多套同时运行**：比如①自动刷新 + ②自动点击。使用 `configs.some(c => c.isRunning)` 判断是否有任何配置在运行
- 切换配置时自动保存当前配置的 UI 参数
- 折叠状态下的 ▶/■ 按钮始终控制 `activeConfig`（当前显示的配置）
- 停止时 `configs.some(cc => cc.isRunning)` 检查 → 无运行配置时才释放 WakeLock

---

### 第九课：系统设置

**第 5 页（齿轮图标）**包含：

**选取放行点击**：开启后，选取元素模式下的点击会穿透到页面（不会阻止页面自身的点击处理）。关闭时调用 `e.preventDefault()` + `e.stopPropagation()` 拦截。默认关闭。

**省电模式**：全屏黑色遮罩覆盖页面，仅显示 4 个浮动元素（当前时间、运行时长、已操作次数、关闭开关）。自动尝试全屏，每 5s 随机移动位置。详见[第十课](#第十课省电模式)。

**屏幕常亮**：使用 [Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/WakeLock) 防止屏幕关闭。运行时自动请求，停止后自动释放。页面可见性恢复时自动重新请求（`visibilitychange` → visible）。

**禁止聚焦**：覆盖 `HTMLElement.prototype.focus`，阻止面板外的页面元素获取焦点（防止页面弹窗/跳转中断自动操作）。在 capture 阶段通过 `focusin` 事件监听，非面板元素自动 `blur()`。

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

**恢复默认设置**（隐藏按钮）：在第 5 页连续点击第 5 页图标 4 次（2 秒内）出现，确认后清除当前域名所有 localStorage 键（`AUTO_OP_` 前缀），然后刷新页面。

**恢复流程**：

- 首次点击显示「再次点击确认恢复默认设置」（橙色，5 秒超时自动取消）
- 二次确认 → 扫描 localStorage 中所有 `AUTO_OP_` 前缀的键 → 逐个删除 → `location.reload()`

---

### 第十课：省电模式

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

- 进入时尝试全屏（`document.documentElement.requestFullscreen()`），失败不报错
- 每 5 秒随机移动 4 个浮动元素到屏幕不同位置（`powerSaveTimerID` 定时器驱动）
- 文本投影发光效果（`text-shadow`）
- 退出时：关闭全屏 → 清除定时器 → 恢复面板透明度调度

**跨刷新恢复**：刷新前省电模式状态保存到 `REFRESH_STATE_KEY`，刷新后 300ms 延迟自动恢复。

---

### 第十一课：面板交互细节

#### 面板透明度系统

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

用于需要用户确认的危险操作（如清空目标列表），支持移动端和桌面端：

- 半透明黑色遮罩 + 居中白色弹窗
- 「确定」/「取消」两个按钮
- 点击遮罩 = 取消
- 返回 `Promise<boolean>`

#### 面板拖拽

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

**面板高度自适应**：设置面板内 textarea 和输入框变化时，通过 ResizeObserver + MutationObserver 动态调整面板高度以匹配内容。

---

### 第十三课：自动发现机制

**自动发现**（`autoDiscover`）允许脚本在运行时扫描并自动添加容器内新增的匹配元素。

**工作原理**（`discoverNewTargetsFor`）：

1. 每个操作周期开头调用，在 `tryFindTarget` 恢复现有元素之后
2. 仅处理 `autoDiscover !== false` 且 `parentSelector` 存在的目标
3. 使用 `loose` / `strict` 选择器在父容器内扫描候选元素
4. 过滤条件：不在面板内、不在已有目标列表中、不在已发现集合中、通过 `matchesFingerprint` 验证
5. 符合条件的候选元素自动加入 `c.targets`，标记 `isAuto: true`，`missCount: 0`

**自动清理机制**（`cleanupAutoTargetsFor`）：

- 仅清理 `isAuto === true` 的目标
- 每当元素缺失（`status[i] === false`），`missCount + 1`
- 连续缺失 ≥ 5 次后从 `c.targets` 中 `splice` 移除
- 同步清理 `c.discoveredElements` 集合中的引用
- 修改 `currentQueueIndex` 防止越界

**适用场景**：动态加载的列表（如无限滚动、实时更新的 feed 流），新出现的匹配元素自动被纳入操作队列。

---

## 界面总览

### 标题栏（从左到右）

| 元素 | 说明 |
| --- | --- |
| −/+ 折叠按钮 | 折叠/展开面板，折叠后标题栏出现 ▶ 播放/■ 停止按钮 |
| ▶/■ 开始/停止 | **仅折叠状态显示**，绿色播放 / 红色停止，fade-in 动画 |
| 自动操作 | 面板标题，右对齐，使用 MiSans VF 字体 |
| ①~⑩ 配置切换 | 下拉菜单切换配置，运行中的有绿色圆点指示 |

### 五个页面

| 页码 | data-page | 图标 | 内容 |
| --- | --- | --- | --- |
| 第 1 页 | 0 | 📄 文档列表 | 多选模式、操作策略、目标列表、选取/开始按钮 |
| 第 2 页 | 1 | </> 代码 | JS 代码输入、快捷预设、📡 网络监测入口、输出日志 |
| 第 3 页 | 2 | ⚙ 滑块 | 操作次数/时间/间隔、自动启动、元素消失处理 |
| 第 4 页 | 3 | 🔄 刷新 | 自动刷新开关、刷新间隔、刷新进度条、刷新日志 |
| 第 5 页 | 4 | ⚙ 齿轮 | 选取放行、省电模式、屏幕常亮、禁止聚焦、主题、字体 |

**页面切换**：切换时自动关闭所有 overlay（info/settings/network），离开第 5 页时隐藏恢复默认按钮。

### 三种 Overlay 面板

| Overlay | 触发方式 | 内容 |
| --- | --- | --- |
| **infoOverlay** | 目标 ⓘ 按钮 | 匹配规则详情 + 测试按钮 + 匹配计数 |
| **settingsOverlay** | 目标 ⚙ 按钮 | 元素设置（启用、描述、填充、JS指令、间隔、高亮、滚动、父级） |
| **networkOverlay** | 📡 按钮 | 网络请求监测列表 + 工具栏 |

三者互斥，从右侧滑入/滑出（`translateX(100%)` → `translateX(0)`，过渡动画 `transition: transform 0.25s`）。

### 省电模式 Overlay

| 元素 | ID | 说明 |
| --- | --- | --- |
| 当前时间 | `ps-time` | 顶部分布，实时 HH:MM:SS |
| 运行时长 | `ps-elapsed` | 中部，格式 `已运行 HH:MM:SS` |
| 已操作次数 | `ps-count` | 中部，格式 `已操作 N 次` |
| 开关 | `ps-switch` | 切换开关，控制省电模式启停 |

---

## 参数速查表

| 参数 | 位置 | 默认值 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| 多选模式 | 第1页 | 关闭 | boolean | 开启后可选取多个目标 |
| 操作策略 | 第1页 | 同时操作 | select | 同时/队列（多选时显示） |
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
| 主题 | 第5页 | auto | select | auto/system/light/dark |
| 面板字体 | 第5页 | MiSans VF | select | MiSans VF/system-ui |

### 每元素参数（元素设置面板）

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

### 每元素匹配开关（info 面板）

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
| 自动发现 | false | 自动扫描新增匹配元素 |

---

## 技术参考

### 架构概览

脚本是一个 **IIFE**（立即执行函数表达式），`document-idle` 时运行在 `*://*/*`。**无任何外部 JS 依赖**。

**环境检测**（第 16–39 行）：

```js
(function() {
    'use strict';
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

**全局状态变量**（第 40–80 行）：

```js
const SHARED_KEY = 'AUTO_OP_SHARED_' + window.location.hostname;
const REFRESH_STATE_KEY = 'AUTO_OP_REFRESH_STATE_' + window.location.hostname;
const NETWORK_MONITOR_KEY = 'AUTO_OP_NETMON_' + window.location.hostname;
const NETWORK_REQUESTS_KEY = 'AUTO_OP_NETREQ_' + window.location.hostname;
const PER_CONFIG_KEY = 'AUTO_OP_CFG_' + window.location.hostname + '_';

let isAutoRefresh = false, refreshIntervalSec = 60, refreshTimerID,
    refreshStartTimestamp = 0, refreshProgressTimerID, refreshLogs = [];
let currentPage = 0;
const PAGE_COUNT = 5;
let collapseAnimPhase = 'collapsed', collapsedWidth = 300;
let wakeLock = null, stateTimerID = null;
let isPicking = false, isDarkMode = false;
let originalFocus = HTMLElement.prototype.focus, focusinHandler = null;
let elapsedTimerID_global = null;
let isProgrammaticClick = false, pickPassThrough = false;
let panelFont = 'MiSans VF';
let isPowerSave = false, powerSaveTimerID = null;
let themeMode = 'auto';
let _testHighlightedElements = [];
let panelTransparentTimer = null, panelClickRestoreTimer = null,
    isPanelTransparent = false;
let cmdOutputLogs = [], cmdHistory = [], cmdHistoryIndex = -1;
let isNetworkMonitoring = false, networkRequests = [],
    _origFetch = null, _origXHROpen = null, _origXHRSend = null,
    _networkReqId = 0;

```

**网络监测状态恢复**（第 82–106 行）：初始化时从 `NETWORK_REQUESTS_KEY` 恢复历史请求记录，从 `NETWORK_MONITOR_KEY` 恢复监测开关状态。如果监测开关之前为开启，注入一条「刷新」标记记录。

**10 套配置数组**（第 107–138 行）：

```js
const CONFIG_COUNT = 10;
const CONFIG_NAMES = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
// CONFIG_SVGS: 10 个内联 SVG 图标（数字 1-10 的独特路径）
let activeConfig = 0;
let configs = [];
for (let i = 0; i < CONFIG_COUNT; i++) {
    configs.push({
        targets: [], isRunning: false, timerID: null, clickedCount: 0,
        maxClicks: Infinity, clickInterval: 1000, isMultiMode: false,
        clickStrategy: 'simultaneous', currentQueueIndex: 0,
        waitStartTime: 0, isWaiting: false, waitTimerID: null,
        operationStartTimestamp: 0, autoStartEnabled: false,
        autoStartIntervalMin: 0, autoStartCountdownTimerID: null,
        autoStartNextTime: 0, maxDurationMin: 0, maxDurationTimerID: null,
        discoveredElements: new Set(), uiThrottled: false,
        doClickLastUIUpdate: 0, missingAction: 'wait'
    });
}
function cv() { return configs[activeConfig]; }

```

**数据流**：

```text
用户操作 → DOM 事件 → 状态变量更新 → savePerConfig()/saveShared()
                                            ↓
                                  localStorage（按域名隔离）
                                            ↓
页面刷新 → loadData() → 状态恢复 → UI 同步 → 继续运行
                                            ↓
                          networkRequests 恢复（NETWORK_REQUESTS_KEY）
                          isNetworkMonitoring 恢复（NETWORK_MONITOR_KEY）

```

---

### 元素选取与指纹（源码详解）

**`buildBaseSelector(el)`** — 第 3363 行：

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

**`buildSelectors(el)`** — 第 3373 行：

```js
function buildSelectors(el) {
    const base = buildBaseSelector(el);
    if (el.id) return { strict: base, loose: base };    // 有id直接返回
    let strict = base;
    const parent = el.parentElement;
    if (parent) {
        const sameTagSiblings = Array.from(parent.children)
            .filter(c => c.tagName === el.tagName);
        if (sameTagSiblings.length > 1)                  // 同标签兄弟>1
            strict += ':nth-of-type('                    // 追加精确索引
                + (sameTagSiblings.indexOf(el) + 1) + ')';
    }
    return { strict, loose: base };
}

```

示例：`div.content` 中第 2 个 `<button>`:

- `strict`: `button.primary:nth-of-type(2)`
- `loose`: `button.primary`

**`getElementFingerprint(el)`** — 第 3451 行：

```js
function getElementFingerprint(el) {
    const dataAttrs = {}, attrs = {};
    const keyAttrs = ['href','src','value','type','name','role',
        'alt','title','placeholder','action','method','onclick'];
    Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) dataAttrs[attr.name] = attr.value;
        else if (keyAttrs.includes(attr.name)) attrs[attr.name] = attr.value;
    });
    // 提取 useItem(N) 中的参数N
    let onclickParam = '';
    if (attrs.onclick) {
        const match = attrs.onclick.match(/useItem\((\d+)\)/);
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

**`selectTarget(el)`** — 第 5266 行，选取核心函数（~90 行），流程：

1. 清除待机状态定时器
2. 移除元素的 hover 高亮（`auto-op-highlight`）
3. 调用 `buildSelectors(el)` → `{strict, loose}`
4. 调用 `getElementFingerprint(el)` → fingerprint 对象
5. 构建描述字符串：`tag#id.class "text" (isInput)`
6. 向上遍历祖先链构建 `parentSelector` 和 `parentChain`
7. 组装 `targetObj`（含 30+ 字段：element, strict, loose, fingerprint, desc, isInput, parentSelector, parentChain, nearestParent, blueParent, isAuto, missCount, _isValid, enabled, enableHighlight, matchTag, matchText, matchTextMode, matchDataAttrs, matchAttrs, autoDiscover, matchParent, matchOnclick, matchId, matchClass 等）
8. 多选模式 → `c.targets.push(targetObj)`，设置选中高亮，不退出选取
9. 单选模式 → 清空旧目标（移除所有高亮），替换为新目标，`exitPickMode()`
10. UI 更新：`updateTargetUI()`, `updateTargetCount()`, `refreshParentHighlights()`, `savePerConfig()`

**`getElText(el)`** — 深度优先遍历提取可见文本节点（跳过 `<script>`/`<style>`/`<title>`），每节点截取前 300 字符，总上限 600 字符。用于弱指纹元素（无 id/class/属性）的精确文字提取。

**`isInputField(el)`** — 第 3395 行：

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

**`matchesFingerprint(el, t)`** — 第 3478 行，65 行核心函数：

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

    // ⑦ onclick参数匹配（useItem(N)中的N）
    if (matchOnclick && fp.onclickParam) {
        const m = (el.getAttribute('onclick')||'').match(/useItem\((\d+)\)/);
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

**查询缓存**（第 3547–3558 行）：

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

**`tryFindTarget(targetObj)`** — 第 3560 行，三级查找+回退：

```js
function tryFindTarget(targetObj) {
    if (!targetObj || !targetObj.fingerprint) return null;

    function verifyList(list) {
        const matched = [];
        for (const el of list) {
            if (panel.contains(el)) continue;    // 跳过面板自身元素
            if (matchesFingerprint(el, targetObj)) matched.push(el);
        }
        return matched.length > 0 ? matched : null;
    }

    let root = document;
    // 父容器模式：限定搜索范围
    if (targetObj.matchParent !== false && targetObj.parentSelector) {
        try { const p = document.querySelector(targetObj.parentSelector);
              if (p) root = p; } catch(e){}
    }

    // 三级尝试：strict → loose → tagName
    if (targetObj.strict) {
        const found = verifyList(cachedQuery(root, targetObj.strict));
        if (found) return found;
    }
    if (targetObj.loose) {
        const found = verifyList(cachedQuery(root, targetObj.loose));
        if (found) return found;
    }
    const tagFound = verifyList(cachedQuery(root, fp.tagName));
    if (tagFound) return tagFound;

    // 父容器内未找到 → 回退到document全局查找
    if (root !== document) { /* 同上三级全局查找 */ }
    return null;
}

```

**`resolveParentInfo(el)`** — 第 3607 行：

从目标元素向上遍历祖先，找到第一个有 `id` 或 `class` 的父级作为 `blueParent`，直接父元素作为 `nearestParent`。

**`refreshParentHighlights()`** — 第 3624 行：

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

**`discoverNewTargetsFor(ci)`** — 第 3708 行：

运行时在每个操作周期调用，在父容器内用 `loose`/`strict` 选择器扫描新增匹配元素，过滤已有元素，验证指纹后追加到 `c.targets`。详见[第十三课](#第十三课自动发现机制)。

---

### 操作执行（源码详解）

**`startClickingFor(ci, savedTimestamp)`** — 第 6043 行，93 行核心启动函数：

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
    discoverNewTargetsFor(ci);

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
    if (!c.isMultiMode || c.clickStrategy !== 'sequential')
        c.timerID = setInterval(() => doClickFor(ci), c.clickInterval);
        // 队列模式由doClickFor内部setTimeout链驱动

    requestWakeLock(); suppressFocus(); savePerConfig(ci);
}

```

**`doClickFor(ci)`** — 第 6221 行，~188 行核心操作循环：

```js
function doClickFor(ci) {
    isProgrammaticClick = true;   // 标记为脚本触发，供全局click监听器判断
    try {
        const c = configs[ci];
        if (!c.isRunning || c.targets.length === 0) {
            stopClickingFor(ci); return;
        }
        beginQueryCycle();          // 重置查询缓存
        discoverNewTargetsFor(ci);   // 扫描新增元素

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
        if (c.isMultiMode && c.clickStrategy === 'sequential') {
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
        cleanupAutoTargetsFor(ci, status);  // 清理连续缺失的自动发现元素
    } catch(e) { console.error('[AUTO_OP] doClickFor异常:', e); }
    isProgrammaticClick = false;
}

```

**`startWaitTimer(ci, idx)`** — 第 6188 行：

```js
function startWaitTimer(ci, idx) {
    const c = configs[ci];
    function update() {
        if (!c.isWaiting || !c.isRunning) return;
        const elapsed = Date.now() - c.waitStartTime;
        const remaining = c.clickInterval * 2 - elapsed;   // 最大等待=间隔×2
        if (remaining <= 0) {
            c.isWaiting = false;
            c.currentQueueIndex = (idx+1) % c.targets.length; // 超时跳过
            return;
        }
        c.waitTimerID = setTimeout(update, 1);             // 每1ms轮询
    }
    update();
}

```

**`cleanupAutoTargetsFor(ci, status)`** — 第 6411 行：

自动发现元素（`isAuto: true`）连续缺失 ≥5 次后从 `c.targets` 中 `splice` 移除，同步清理 `c.discoveredElements`。清理后刷新 UI（父容器高亮、目标列表、计数）。

**`stopClickingFor(ci)`** — 第 6138 行，48 行停止函数：

1. 清除所有定时器（timerID、waitTimerID、maxDurationTimerID、stateTimerID）
2. 停止运行计时器（仅 activeConfig）
3. 恢复焦点（仅当所有配置都停止时）
4. 释放 WakeLock（仅当所有配置都停止且未开启自动刷新时）
5. 如果设置了自动启动，设置下次启动时间并开始倒计时
6. 恢复 UI：开始/停止按钮、参数输入框解锁
7. 更新配置按钮标签

---

### 指令系统（源码详解）

**`runUserCommand(code, el, t, ci, idx)`** — 第 5471 行：

```js
function runUserCommand(code, el, t, ci, idx) {
    const c = configs[ci];
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

    // 3. 支持 async/await：返回值是Promise时自动then/catch
    if (result && typeof result.then === 'function') {
        result.then(val => { flushLogs(); finalize(true, '', val); })
              .catch(e => { flushLogs();
                            finalize(false, e.message||String(e), undefined); });
        return { success: true, pending: true, logs };
    }

    finalize(success, errorMsg, result);
    return { success, result, error: errorMsg, logs };
}

```

#### 关键设计：Promise 检测与 console 恢复时机

`new Function()` 创建的函数**不会自动返回最后一个表达式**——必须显式 `return`。因此代码分两条路径：

- **Promise 路径**：代码中有 `return fetch(...)` → `result` 为 Promise → 注册 `.then()` 回调 → 异步完成后才调用 `flushLogs()` + `finalize()` → console 拦截在 Promise resolve 后才恢复，确保所有异步 `console.log` 输出被捕获
- **非 Promise 路径**：代码中没有 `return` → `result` 为 `undefined` → 立即调用 `finalize()` → console 提前恢复 → 异步代码的 `console.log` 直接输出到原生控制台，不被面板拦截

这就是为什么涉及异步操作时必须在代码前加 `return`。

**输入框事件绑定**（第 5560–5645 行）：

- `cmdTestBtn` click → 取第一个有效目标元素，调用 `runUserCommand`
- `cmdTargetBtn` click → 包装为 `isCommand:true` 目标加入队列（仅多选模式）
- `cmdInput` keydown → `Ctrl+Enter` 执行、`↑`/`↓` 浏览历史
- `cmdPresetSelect` change → 填入预设代码
- `cmdOutput` click → 事件委托，展开/折叠日志（超过 150 字符的日志可点击切换）

**日志系统**：`appendCmdOutput` 添加日志条目（含时间戳），上限 500 条（超限 `shift` 最旧）。`updateCmdOutputUI` 渲染彩色日志列表。`escapeHtml` 转义 HTML 特殊字符防止 XSS。

---

### 网络监测（源码详解）

**`startNetworkMonitor()`** — 第 5620 行，拦截 fetch + XHR：

```js
function startNetworkMonitor() {
    if (isNetworkMonitoring) return;
    isNetworkMonitoring = true; _networkReqId = 0;
    _origFetch = window.fetch;
    _origXHROpen = XMLHttpRequest.prototype.open;
    _origXHRSend = XMLHttpRequest.prototype.send;

    // ─── 覆盖 window.fetch ───
    window.fetch = function(url, options) {
        const id = ++_networkReqId;
        const startTime = Date.now();
        const method = (options && options.method) || 'GET';
        const reqHeaders = options?.headers
            ? Object.assign({}, options.headers) : {};
        const reqBody = options?.body
            ? String(options.body).slice(0, 4000) : '';
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
                    req.resBody = body.slice(0, 4000));
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
    XMLHttpRequest.prototype.open = function(method, url) {
        this._autoOpReq = {
            id: ++_networkReqId, method: method.toUpperCase(),
            url: String(url), status: 'pending',
            startTime: Date.now(), reqHeaders: {}
        };
        return _origXHROpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
        const reqData = this._autoOpReq;
        if (reqData) {
            reqData.reqBody = body ? String(body).slice(0,4000) : '';
            addNetworkRequest(reqData);
            this.addEventListener('load', function() {
                reqData.status = this.status;
                reqData.resHeaders = {};
                this.getAllResponseHeaders().split('\r\n').forEach(line => {
                    const idx = line.indexOf(': ');
                    if (idx > 0) reqData.resHeaders[line.slice(0,idx)]
                        = line.slice(idx+2);
                });
                reqData.resBody = String(this.responseText).slice(0,4000);
                reqData.duration = Date.now() - reqData.startTime;
                updateNetworkItemUI(reqData); updateNetworkCount();
            });
            this.addEventListener('error', function() {
                reqData.status = 0; reqData.error = 'Network Error';
                reqData.duration = Date.now() - reqData.startTime;
                updateNetworkItemUI(reqData); updateNetworkCount();
            });
            // 拦截 setRequestHeader 记录请求头
            const _setRequestHeader = this.setRequestHeader;
            const self = this;
            this.setRequestHeader = function(name, value) {
                reqData.reqHeaders[name] = value;
                return _setRequestHeader.apply(self, arguments);
            };
        }
        return _origXHRSend.apply(this, arguments);
    };
}

```

**`stopNetworkMonitor()`** — 第 5715 行：还原 `window.fetch`、`XMLHttpRequest.prototype.open`、`XMLHttpRequest.prototype.send`。

**请求复制为代码**（`buildFetchCode`）：根据 method/headers/body 智能生成 fetch 代码。无 headers 和 body 的 GET 请求生成简化版。

**网络监测持久化**（`saveNetworkMonitorState` / `loadNetworkMonitorState` / `clearNetworkMonitorState`）：

- 页面隐藏（`visibilitychange` → hidden）且监测开启时自动保存
- 刷新后从 `AUTO_OP_NETREQ_<host>` 恢复请求记录
- 从 `AUTO_OP_NETMON_<host>` 恢复开关状态
- 监测重启时注入「刷新」标记记录

---

### 配置管理（源码详解）

**`switchConfig(newIndex)`** — 第 3013 行，77 行完整流程：

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
    old.isMultiMode = multiModeCheckbox.checked;
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
    multiModeCheckbox.checked = c.isMultiMode;
    strategyRow.style.display = c.isMultiMode ? 'block' : 'none';
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

---

### 面板交互（源码详解）

**`performCollapse()`** — 第 3869 行：

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

**`performExpand()`** — 第 3889 行：

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

**面板透明度系统**（第 3909–3946 行）：

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

**`goToPage(page)`** — 第 3787 行：

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
        page3ClickCount = 0;
        if (page3ClickTimer) { clearTimeout(page3ClickTimer); page3ClickTimer = null; }
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

**`fitBodyToOverlay(overlayEl)`** — 第 4443 行，离屏探针测量：

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

**`restoreBodyHeight()`** — 第 4463 行：

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

**`updatePageHeight()`** — 第 3777 行：

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

**元素设置页 textarea 高度自适应**（第 4509–4533 行）：

打开设置面板时绑定 `ResizeObserver` + `MutationObserver`（监听 `style` 属性）。回调守卫 `classList.contains('open')` 确保仅 overlay 打开时调用 `fitBodyToOverlay`。关闭面板时 `disconnect()` 两个 observer。观察者引用存储在 `_settingsCmdResizeObserver` / `_settingsCmdMutationObserver`。

---

### 存储与持久化（源码详解）

**四级存储键**：

| 键 | 变量 | 内容 |
| --- | --- | --- |
| `AUTO_OP_SHARED_<host>` | `SHARED_KEY` | 全局共享状态 |
| `AUTO_OP_CFG_<host>_0`~`_9` | `PER_CONFIG_KEY + i` | 每套配置 |
| `AUTO_OP_REFRESH_STATE_<host>` | `REFRESH_STATE_KEY` | 跨刷新临时状态 |
| `AUTO_OP_NETMON_<host>` | `NETWORK_MONITOR_KEY` | 网络监测开关状态 |
| `AUTO_OP_NETREQ_<host>` | `NETWORK_REQUESTS_KEY` | 网络请求记录 |

**`savePerConfig(ci)`** — 第 3125 行：

序列化 23 个 target 字段（`strict`, `loose`, `fingerprint`, `desc`, `isInput`, `parentSelector`, `parentChain`, `isAuto`, `enabled`, `matchTag`, `matchText`, `matchTextMode`, `matchDataAttrs`, `matchAttrs`, `matchOnclick`, `autoDiscover`, `matchParent`, `matchId`, `matchClass`, `isCommand`, `customCommand`, `customFill`, `customInterval`, `scrollIntoView`, `showParent`, `enableHighlight`）+ 9 个配置级字段。

**关键设计**：`element`（DOM引用）和 `discoveredElements`（Set）不序列化。刷新后通过 `tryFindTarget` 重新查找。`isCommand` 类型目标保留 `customCommand` 和 `desc`。所有布尔开关序列化为 `true/false`。

**`saveShared()`** — 第 3275 行：

```js
localStorage.setItem(SHARED_KEY, JSON.stringify({
    isAutoRefresh, refreshIntervalSec, refreshLogs,
    currentPage, activeConfig,
    wakeLock: wakeLockCheckbox.checked,
    suppressFocus: suppressFocusCheckbox.checked,
    pickPassThrough, panelFont, themeMode
}));

```

**`saveRefreshState()`** — 保存 `isAutoRefresh`, `refreshIntervalSec`, `nextRefreshTime`, `refreshLogs`, `isPowerSave`, 及各运行中配置的 `operationStartTimestamp` 和 `clickedCount`。

**`saveNetworkMonitorState()` / `loadNetworkMonitorState()` / `clearNetworkMonitorState()`** — 保存/恢复/清除网络监测状态（开关 + 请求记录）。

**`migrateOldData()`** — 第 3258 行：

旧版 `AUTO_OP_CONFIG_<host>` → 新版 `AUTO_OP_CFG_<host>_0` 迁移，提取共享字段到 `SHARED_KEY`。

**保存时机**：切换配置、修改参数、修改匹配规则、选取/删除目标、刷新前、面板拖拽结束、主题切换、页面切换、网络监测状态变化（页面隐藏时）。

**跨刷新状态恢复**（第 6469–6534 行）：

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

**`scanWebpageTheme(el)`** — 第 2469 行：

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

**`resolveTheme()`** — 第 2495 行：

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

**`startThemeWatchers()` / `stopThemeWatchers()`** — 第 2530 行：

根据 `themeMode` 动态开关监听器：

- `light`/`dark`：关闭所有监听器
- `system`：仅 `matchMedia('prefers-color-scheme:dark')` 监听
- `auto`：开启全部（`matchMedia` + `MutationObserver` ×2）
- 200ms 防抖（`debouncedApplyTheme`）避免频繁切换
- 观察器存储在 `_sysThemeListener` / `_htmlObserver` / `_bodyObserver`

---

### 省电模式（源码详解）

**`enablePowerSave()`** — 显示 `#auto-op-power-save-overlay`，启动全屏请求，每 5s 随机移动浮动元素位置，启动时间/运行时长/操作次数的更新定时器。

**`disablePowerSave()`** — 关闭全屏，清除所有省电模式定时器，隐藏 overlay，恢复面板透明度调度。

**浮动元素**：

- `ps-time`：时间显示，`HH:MM:SS` 格式
- `ps-elapsed`：运行时长，`已运行 HH:MM:SS`
- `ps-count`：已操作次数，`已操作 N 次`
- `ps-switch`：切换开关，关闭即退出省电模式

---

### 字体加载系统（源码详解）

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
| `--panel-active-border` | `#32d486` |
| `--panel-active-text` | `#32d486` |
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

---

### DOM 观察器与事件委托

| 观察器 | 目标 | 触发时机 | 回调 |
| --- | --- | --- | --- |
| `MutationObserver` ×2 | `<html>`,`<body>` | `class`/`style` 属性变化 | `debouncedApplyTheme`（200ms 防抖） |
| `ResizeObserver` ×4 | `.auto-op-page`(0-3) | 页面内容高度变化 | `updatePageHeight` |
| `ResizeObserver` | `#auto-op-cmd-input` | 指令输入框尺寸变化 | `updatePageHeight` |
| `MutationObserver` | `#auto-op-cmd-input` | style属性变化 | 兜底 → `updatePageHeight` |
| `ResizeObserver` | settings textarea | JS指令高度 → 面板高度 | `fitBodyToOverlay`（动态绑定/解绑） |
| `MutationObserver` | settings textarea | style属性 → 兜底 | `fitBodyToOverlay`（动态绑定/解绑） |
| `matchMedia` | `prefers-color-scheme:dark` | 系统主题切换 | `applyTheme` |

**页面可见性**：

| 事件 | 触发时机 | 行为 |
| --- | --- | --- |
| `visibilitychange` → visible | 标签页恢复可见 | 重新请求 WakeLock（如有运行中配置或自动刷新） |
| `visibilitychange` → hidden | 标签页隐藏 | 保存网络监测状态到 localStorage |

**全局 click 监听器**（第 6435 行）：

```js
panel.addEventListener('click', (e) => {
    if (e.target === configBtnEl || configBtnEl.contains(e.target)) return;
    closeConfigMenu();
}, true);  // capture 阶段，优先处理

```

**事件委托**：所有 info/settings overlay 控件通过 `data-info-action` / `data-settings-action` 属性，在父级 `change`/`input`/`click` 事件中统一分发：

```js
infoContentEl.addEventListener('change', e => {
    const action = e.target.dataset.infoAction; if (!action) return;
    const t = cv().targets[infoCurrentIndex];
    switch (action) {
        case 'toggle-enabled':   t.enabled = e.target.checked; break;
        case 'toggle-matchTag':  t.matchTag = e.target.checked; break;
        case 'toggle-matchText': t.matchText = e.target.checked; break;
        case 'toggle-matchId':   t.matchId = e.target.checked; break;
        case 'toggle-matchClass': t.matchClass = e.target.checked; break;
        case 'toggle-matchAttrs': t.matchAttrs = e.target.checked; break;
        case 'toggle-matchDataAttrs': t.matchDataAttrs = e.target.checked; break;
        case 'toggle-matchOnclick': t.matchOnclick = e.target.checked; break;
        case 'toggle-matchParent': t.matchParent = e.target.checked; break;
        case 'toggle-autoDiscover': t.autoDiscover = e.target.checked; break;
        case 'change-matchTextMode': t.matchTextMode = e.target.value; break;
        case 'change-text':  t.fingerprint.text = e.target.value; break;
        case 'change-attr':  /* 修改属性值 */ break;
    }
    savePerConfig(activeConfig);
});

```

---

## 文件结构

```text
Automatic-operation/
├── Automatic-operation.js    # 主脚本 6568行，全部功能
├── Automatic-clicker.js      # 早期简化版 ~777行
├── README.md                 # 本文档
└── LICENSE                   # MIT

```

| 行号 | 模块 | 行数 | 关键函数/内容 |
| --- | --- | --- | --- |
| 1–14 | 元数据 | 14 | UserScript header（name/version/match/grant/run-at） |
| 16–80 | 环境检测+全局状态 | 65 | IS_TOP, IS_MOBILE, 四级存储键, 全局变量 |
| 82–106 | 网络监测状态恢复 | 25 | `restoreNetworkMonitorData`, 刷新标记 |
| 107–138 | configs 初始化 | 32 | 10 套配置 × 17 字段, `cv()` |
| 143–186 | WakeLock/Focus/字体 | 44 | `requestWakeLock`, `suppressFocus`, 字体加载 |
| 187–2460 | CSS 注入 | ~2274 | 暗/亮双主题全部样式（含 overlay/省电/日志/进度条/动画/展开折叠） |
| 2498–2611 | 主题系统 | 114 | `scanWebpageTheme`, `resolveTheme`, 观察器管理 |
| 2612–2735 | DOM 构建 | 123 | 5页面板 HTML + 3个overlay HTML + 省电遮罩 + 确认框 |
| 2736–2794 | 追加 DOM+引用 | 58 | appendChild, 60+ getElementById |
| 2795–2962 | 配置菜单+省电UI | 167 | 菜单动画、随机位置、省电 mode 更新函数 |
| 3045–3155 | 配置切换 | 111 | `switchConfig` 核心（77行） |
| 3157–3305 | save/load/migrate | 149 | `savePerConfig`, `loadPerConfig`, 数据迁移 |
| 3307–3392 | shared 存储 | 86 | `saveShared`, `loadShared` |
| 3395–3732 | 元素工具函数 | 338 | `buildSelectors`~`discoverNewTargetsFor` |
| 3739–3807 | 自动发现 | 68 | `discoverNewTargetsFor`（选区+指纹验证+去重） |
| 3809–3859 | 分页 | 50 | `updatePageHeight`, `goToPage` |
| 3861–3978 | 折叠+透明度 | 118 | `performCollapse`, `performExpand`, 透明度系统 |
| 3980–4055 | 确认框+刷新日志 | 76 | `showConfirm`(Promise), `addRefreshLog`, `updateLogUI` |
| 4058–4130 | 刷新状态+进度条 | 73 | `saveRefreshState`, `updateRefreshProgressUI`, `triggerRefresh` |
| 4131–4232 | 刷新执行 | 101 | `triggerRefresh`, `startAutoRefreshCountdown` |
| 4233–4432 | 自动启动+计时 | 200 | `startAutoStartCountdownTimerFor`, 运行计时 |
| 4433–4542 | info/settings 面板显示 | 110 | `showInfoPanel`, `showSettingsPanel` |
| 4543–5032 | 事件委托+元素测试 | 490 | `runElementTest`, 14种 action 分发, 匹配计数 |
| 5033–5432 | UI更新+拖拽+选取 | 400 | `selectTarget`, `updateTargetUI`, 目标列表维护 |
| 5433–5652 | 指令系统 | 220 | `runUserCommand`, 日志系统, 历史浏览, 输出展开/折叠 |
| 5653–5956 | 网络监测 | 305 | `startNetworkMonitor`, `stopNetworkMonitor`, fetch/XHR 拦截, 代码生成 |
| 5957–6073 | 网络监测持久化+UI | 116 | 网络 overlay 事件, 高度管理, 复制, 持久化 |
| 6075–6168 | 操作启动 | 94 | `startClickingFor`（93行） |
| 6170–6218 | 操作停止 | 49 | `stopClickingFor`（48行） |
| 6220–6252 | 等待重试 | 33 | `startWaitTimer`（1ms轮询, 超时=间隔×2） |
| 6253–6441 | 操作执行 | 189 | `doClickFor`（~188行, 队列+同时双模式） |
| 6443–6466 | 自动清理 | 24 | `cleanupAutoTargetsFor`（连续缺失≥5次移除） |
| 6467–6568 | 初始化 | 102 | 事件绑定→主题→加载→折叠→观察器→状态恢复→网络监测恢复→输出展开/折叠 |

---

## 许可与作者

MIT License — [sewolon](https://github.com/sewolonX)
