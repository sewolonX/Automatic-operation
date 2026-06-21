# Automatic-operation 🎯

[油猴脚本（Tampermonkey）](https://www.tampermonkey.net/) — 在任意网页上自动操作（点击 / 填充）元素。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 选择版本安装脚本，打开任意网页，左上角出现 **自动操作** 面板（初始为折叠状态）

| 版本 | 链接 | 说明 |
| --- | --- | --- |
| **正式版** | [点击安装](https://sewolon.oss-cn-shanghai.aliyuncs.com/automatic-operation/Automatic-operation.js) | OSS CDN，稳定版本 |
| **Dev 版** | [点击安装](https://github.com/sewolonX/Automatic-operation/raw/refs/heads/main/Automatic-operation.js) | GitHub 直连，随 `main` 分支更新 |

---

## 目录

- [安装](#安装)
- [架构概览](#架构概览)
- [界面概览](#界面概览)
- [详细教程](#详细教程)
  - [一、元素选取与指纹提取](#一元素选取与指纹提取)
  - [二、匹配规则详解](#二匹配规则详解)
  - [三、元素设置面板](#三元素设置面板)
  - [四、元素测试系统](#四元素测试系统)
  - [五、操作执行（点击 / 填充）](#五操作执行点击--填充)
  - [六、多选模式与操作策略](#六多选模式与操作策略)
  - [七、自动填充](#七自动填充)
  - [八、自动刷新](#八自动刷新)
  - [九、自动启动](#九自动启动)
  - [十、省电模式](#十省电模式)
  - [十一、屏幕常亮与禁止聚焦](#十一屏幕常亮与禁止聚焦)
  - [十二、配置管理（10 套独立配置）](#十二配置管理10-套独立配置)
  - [十三、主题系统](#十三主题系统)
  - [十四、面板交互](#十四面板交互)
  - [十五、存储与持久化](#十五存储与持久化)
  - [十六、跨刷新状态恢复](#十六跨刷新状态恢复)
- [十七、SVG 图标一览](#十七svg-图标一览)
- [十八、主题监听优化](#十八主题监听优化)
- [十九、元素详情面板按钮透明度](#十九元素详情面板按钮透明度)
- [参数参考](#参数参考)
- [技术参考](#技术参考)
- [仓库概览](#仓库概览)
- [文件结构](#文件结构)
- [主脚本代码行数分布](#主脚本代码行数分布)
- [许可与作者](#许可与作者)

---

## 架构概览

脚本是一个 **IIFE（立即执行函数表达式）**，纯 JavaScript 无外部依赖（字体 CDN 除外），在 `document-idle` 时运行，匹配所有 `*://*/*` 页面。

### 代码结构（~5135 行）

```
┌─ 元数据 (UserScript header)
├─ IIFE 入口
│  ├─ 环境检测 (http / iframe / mobile)
│  ├─ 存储键定义 (per hostname)
│  ├─ 全局状态变量 (~20 个)
│  ├─ 配置系统 (10 套 configs[])
│  ├─ WakeLock / Focus 工具函数
│  ├─ CSS 注入 (~1900 行)
│  ├─ 主题检测 (MutationObserver + matchMedia)
│  ├─ DOM 构建 (panel / info overlay / power save overlay / config menu)
│  ├─ DOM 引用缓存
│  ├─ 配置菜单逻辑
│  ├─ 省电模式逻辑
│  ├─ switchConfig() — 配置切换核心
│  ├─ 持久化 (save/load/migrate)
│  ├─ 元素工具函数 (fingerprint / selectors / text / match / find / discover)
│  ├─ 父级解析与高亮 (resolveParentInfo / refreshParentHighlights)
│  ├─ 分页导航 + 折叠/展开 + 面板透明度
│  ├─ 确认对话框
│  ├─ 自动刷新 (progress / trigger / countdown)
│  ├─ 自动启动 (countdown / timer)
│  ├─ 运行计时
│  ├─ 目标列表事件委托
│  ├─ 信息面板 (show/hide/transition)
│  ├─ 元素设置面板 (show/hide/transition)
│  ├─ 面板高度适配 (fitBodyToOverlay / restoreBodyHeight)
│  ├─ 元素测试 (runElementTest)
│  ├─ 信息面板事件委托 (toggle / change / input)
│  ├─ UI 更新函数 (target list / count / running display)
│  ├─ 拖拽处理
│  ├─ 全局交互事件 (checkbox / select / input changes)
│  ├─ 元素选取 (selectTarget / exitPickMode)
│  ├─ 操作执行 (start / stop / doClick / wait / cleanup)
│  ├─ 全局事件 (panel click / visibility change)
│  └─ 初始化 (load / collapse / restore / observe)
```

### 数据流

```
用户操作 → DOM 事件 → 状态变量更新 → savePerConfig()/saveShared()
                                              ↓
                                    localStorage (按域名隔离)
                                              ↓
页面刷新 → loadData() → 状态恢复 → UI 同步 → 继续运行
```

## 界面概览

面板分为**四个页面**，通过顶部的图标按钮栏切换：

| 页面 | 图标 | 内容 |
| --- | --- | --- |
| **第 1 页（操作）** | 文档列表 | 多选模式开关、操作策略、目标元素列表 |
| **第 2 页（参数）** | 滑块开关 | 操作次数、操作时间、操作间隔、自动启动、元素消失处理 |
| **第 3 页（自动刷新）** | 刷新循环 | 自动刷新开关、刷新间隔、刷新日志 |
| **第 4 页（系统设置）** | 齿轮 | 选取放行、省电模式、屏幕常亮、禁止聚焦、主题模式、面板字体 |

**标题栏**：折叠按钮 `−/+` | 开始/停止 `▶/■` | 面板标题 | 配置切换 `①~⑩`

**底部状态栏**：已操作次数 | 运行计时 | 当前状态文字

---

## 详细教程

### 一、元素选取与指纹提取

#### 1.1 选取流程

1. 点击「选取元素」按钮 → 按钮变为橙色脉冲「取消选取」
2. 鼠标移至目标元素 → 显示**虚线高亮框**（`.auto-op-highlight`，橙色 `#f59e0b`）
3. 点击目标元素 → `selectTarget(el)` 被调用

#### 1.2 `selectTarget(el)` 核心逻辑

```
selectTarget(el)
  ├─ 移除悬停高亮
  ├─ buildSelectors(el) → { strict, loose }
  │   ├─ strict: tag.class:nth-of-type(n) 或 #id
  │   └─ loose:  tag.class 或 #id
  ├─ getElementFingerprint(el) → fingerprint 对象
  │   ├─ tagName: 小写标签名
  │   ├─ text: getElText(el) 提取文本
  │   ├─ id / className (过滤 auto-op-* 类)
  │   ├─ dataAttrs: 所有 data-* 属性键值对
  │   ├─ attrs: href, src, value, type, name, role,
  │   │         alt, title, placeholder, action, method
  │   ├─ onclickParam: useItem(N) 中的参数 N
  │   └─ hasStrong: 有 id / data-* / 关键属性时为 true
  ├─ 构建 parentSelector（首个可唯一识别的祖先选择器）
  ├─ 构建 parentChain（祖先选择器链）
  ├─ 组装 targetObj
  └─ 多选模式：追加到列表，保持选取
     单选模式：替换列表，退出选取
```

#### 1.3 `getElText(el)` — 文本提取

提取优先级：
1. `textContent`（优先）
2. `alt` / `title` / `placeholder` / `aria-label` / `value` 属性
3. 递归子元素文本
4. `::before` / `::after` 伪元素内容（过滤图标字体 Unicode 私用区 U+E000–U+F8FF）

#### 1.4 `buildBaseSelector(el)` — 基础选择器

- 有 `id` → `#id`（CSS.escape 转义）
- 无 `id` → `tag.class1.class2...`（过滤 `auto-op-*` 类名）

#### 1.5 指纹示例

```js
{
  tagName: 'button',
  text: '提交订单',
  id: 'submit-btn',
  className: 'btn primary large',
  dataAttrs: { 'data-id': '88234', 'data-type': 'submit' },
  attrs: { type: 'button', name: 'submit', role: 'button' },
  onclickParam: '42',
  hasStrong: true
}
```

---

### 二、匹配规则详解

元素详情面板中，每项匹配规则**独立开关**，所有开启的规则必须**全部满足**才算匹配成功（AND 逻辑）。

#### 2.1 规则一览

| 规则 | 存储键 | 默认值 | 匹配逻辑 |
| --- | --- | --- | --- |
| **标签匹配** | `matchTag` | `true` | `el.tagName === fp.tagName`（忽略大小写） |
| **文字匹配** | `matchText` | `true` | 完全匹配：`text === fp.text` / 模糊匹配：`text.includes(fp.text)` |
| **id 匹配** | `matchId` | `true` | `el.id === fp.id` |
| **class 匹配** | `matchClass` | `true` | 元素 class 列表包含 fp 的所有 class |
| **标准属性匹配** | `matchAttrs` | `true` | 每个 `fp.attrs[key] === el.getAttribute(key)`，值留空则只检查属性存在 |
| **data-\* 匹配** | `matchDataAttrs` | `true` | 每个 `fp.dataAttrs[key] === el.getAttribute(key)`，值留空则只检查属性存在 |
| **onclick 匹配** | `matchOnclick` | `true` | `el.onclick` 中包含 `useItem(fp.onclickParam)` |
| **父级容器匹配** | `matchParent` | `!!parentSelector` | `parentSelector` 容器存在 + 元素在其内部（`parent.contains(el)`），双重校验（搜索范围 + 指纹匹配） |
| **自动发现** | `autoDiscover` | `true` | 运行时扫描父容器中断增的匹配元素 |

#### 2.2 `parentSelector` — 父级容器生成

选取元素时，从目标父级向上遍历祖先，找到**第一个有 id 或 class 的祖先**：

```text
body → div#app → div.main-content → ul.list → li → [目标 button]
                                            ↑ 有 class，选中
                                            parentSelector = "ul.list"
```

- `buildBaseSelector(ancestor)` 返回纯标签名（如 `li`）→ 跳过
- 返回 `#id` 或 `tag.class` → 设为 `parentSelector`
- 后续祖先继续收集到 `parentChain`（详情面板显示层级关系）
- `matchParent` 开关在有 `parentSelector` 时默认 `true`

#### 2.3 `matchesFingerprint(el, t)` — 核心匹配函数

```js
function matchesFingerprint(el, t) {
  const fp = t.fingerprint;
  // 0. 父级容器校验 —— 元素必须在 parentSelector 容器内
  if (matchParent && t.parentSelector) {
    let parent;
    try { parent = document.querySelector(t.parentSelector); } catch(e) {}
    if (!parent || !parent.contains(el)) return false;
  }
  // 1. 标签匹配（开关控制）
  if (matchTag && el.tagName.toLowerCase() !== fp.tagName) return false;
  // 2. id 匹配
  if (matchId && fp.id && el.id !== fp.id) return false;
  // 3. class 匹配（全部 fp class 都必须存在）
  if (matchClass && fp.className) {
    if (!fpClasses.every(c => elClasses.includes(c))) return false;
  }
  // 4. data-* 属性匹配（逐个比对）
  if (matchDataAttrs) {
    for (const [k, v] of Object.entries(fp.dataAttrs))
      if (v && el.getAttribute(k) !== v) return false;
  }
  // 5. 标准属性匹配（逐个比对）
  if (matchAttrs) {
    for (const [k, v] of Object.entries(fp.attrs))
      if (v && el.getAttribute(k) !== v) return false;
  }
  // 6. onclick 参数匹配
  if (matchOnclick && fp.onclickParam) {
    const m = el.getAttribute('onclick').match(/useItem\((\d+)\)/);
    if (m && m[1] !== fp.onclickParam) return false;
  }
  // 7. 文字匹配（完全/模糊）
  if (matchText && fp.text) {
    const elText = fp.hasStrong ? el.textContent : getElText(el);
    if (textMode === 'fuzzy' ? !elText.includes(fp.text) : elText !== fp.text)
      return false;
  }
  return true; // 所有开启的规则都通过
}
```

#### 2.4 `tryFindTarget(targetObj)` — 目标查找

```
tryFindTarget(targetObj)
  ├─ 确定查找根节点
  │   ├─ matchParent 开启且有 parentSelector → root = parent
  │   └─ 否则 → root = document
  ├─ 依次尝试选择器
  │   ├─ strict 选择器 → cachedQuery(root, strict)
  │   ├─ loose 选择器  → cachedQuery(root, loose)
  │   └─ tagName       → cachedQuery(root, tagName)
  ├─ 每个结果用 matchesFingerprint() 验证
  ├─ 过滤掉面板自身元素 (panel.contains)
  └─ 若 root != document 时未找到 → 回退到 document 全局查找
```

#### 2.5 `discoverNewTargetsFor(ci)` — 自动发现

运行时在每个操作周期调用，扫描父容器中新增的匹配元素：

```
discoverNewTargetsFor(ci)
  ├─ 遍历 targets（仅 autoDiscover !== false 的）
  ├─ 在 parentSelector 内查询 loose/strict 选择器
  ├─ 过滤已有元素 (existingElements + discoveredElements)
  ├─ 用 matchesFingerprint() 验证
  └─ 新元素加入 c.discoveredElements，并目标列表
```

---

### 三、元素设置面板

点击目标元素右侧的 ⚙ 按钮打开，与匹配规则面板共用同一套 CSS 结构和滑入/滑出动画。

#### 3.1 面板结构

```
┌──────────────────────────────────┐
│  ← 元素描述              (可拖动) │ ← header
├──────────────────────────────────┤
│  启用此元素               [开关] │
│  元素描述              [______]  │
│  输入元素                 [开关] │
│  填充文本              [______]  │ ← isInput 开时才显示
│  独立间隔 (ms)          [______]  │
│  启用高亮                 [开关] │ ← 默认开启
│  滚动到可视区             [开关] │
│  显示父级                 [开关] │
└──────────────────────────────────┘
```

#### 3.2 设置项说明

| 设置 | 存储键 | 类型 | 说明 |
| --- | --- | --- | --- |
| 启用此元素 | `enabled` | boolean | 关闭后该元素不参与操作，列表中灰显 |
| 元素描述 | `desc` | string | 可编辑，修改后列表和面板标题同步更新 |
| 输入元素 | `isInput` | boolean | 标记为输入框，开启后显示填充文本输入框 |
| 填充文本 | `customFill` | string | 每元素独立填充内容，留空则无填充（不依赖全局设置） |
| 独立间隔 | `customInterval` | number/null | 见 §3.3 |
| 启用高亮 | `enableHighlight` | boolean | 默认开启；关闭后该元素不显示绿色选中高亮及父级高亮（测试高亮除外） |
| 滚动到可视区 | `scrollIntoView` | boolean | 操作前调用 `el.scrollIntoView({ behavior: 'smooth', block: 'center' })` |
| 显示父级 | `showParent` | boolean | 控制目标列表中是否显示父级容器链 `└>` |

#### 3.3 独立间隔（customInterval）

仅对**队列（顺序）模式**生效。元素完成操作后，用该值替代全局操作间隔：

| 输入 | 行为 |
| --- | --- |
| 留空 | 使用全局 `操作间隔` |
| `0` | 不等待，立刻处理下一个 |
| 数字（如 `500`） | 等待指定毫秒数 |

**实现**：顺序模式使用 `setTimeout` 链式调度。每个 tick 处理一个元素后，根据刚处理元素的 `customInterval` 决定下次延迟：

```
元素① customInterval=500  → 等 500ms → 元素②
元素② customInterval=空   → 等 1000ms(全局) → 元素③
元素③ customInterval=0    → 立刻 → 元素①(下一轮)
```

同时模式不受影响，统一用全局间隔。

#### 3.4 启用高亮

默认开启。关闭后，该元素的**绿色选中高亮**（`.auto-op-selected-highlight`，`#22c55e` 实线边框）和**父级高亮**（蓝色阴影 / 红色虚线）在任何情况下都不会显示。

> **例外**：元素测试高亮（`.auto-op-test-highlight`，粉色虚线）不受此开关影响，始终显示。

关闭时立即移除已有的高亮，开启时恢复。每个元素独立控制。

#### 3.5 滚动到可视区

开启后，在点击/填充之前将元素滚到屏幕中央。`scrollIntoView` 使用浏览器原生 `behavior: 'smooth'`，兼容所有内部滚动容器（不仅限于 `window` 滚动）。

#### 3.6 显示父级

纯 UI 开关。开启后在目标列表的元素描述下方显示父级容器链：

```text
元素描述
└> div#app
└> ul.list
└> li.item
```

关闭则只显示元素描述，父级链隐藏。每元素独立控制。

---

### 四、元素测试系统

#### 4.1 触发方式

点击详情面板顶部的「测试」按钮 → 事件委托捕获 → `runElementTest()`

#### 4.2 执行流程

```
runElementTest()
  ├─ clearTestHighlights()
  │   ├─ 清除页面上所有 auto-op-test-highlight
  │   ├─ 清空 _testHighlightedElements 数组
  │   └─ 重置所有 .auto-op-test-result / .auto-op-test-count 的文本和状态
  ├─ 获取当前目标 t = cv().targets[infoCurrentIndex]
  ├─ 若元素已禁用 → 全部显示 ⊘（灰色）并返回
  ├─ 若已启用 → 所有测试项初始化为 ⊘（灰色）
  ├─ CSS 选择器测试 (strict → loose → tagName)
  │   └─ 结果写入 #auto-op-test-css-result（单独的 CSS 结果显示区）
  ├─ 逐项测试（每项独立查询、独立高亮）：
  │   ├─ 标签匹配 (matchTag)
  │   │   └─ querySelectorAll(fp.tagName) → 过滤 panel
  │   ├─ id 匹配 (matchId)
  │   │   └─ document.getElementById(fp.id)
  │   ├─ class 匹配 (matchClass)
  │   │   └─ querySelectorAll + fpClasses.every()
  │   ├─ 标准属性匹配 (matchAttrs)
  │   │   └─ 构建联合选择器 tag[href="x"][title="y"] → querySelectorAll
  │   ├─ data-* 属性匹配 (matchDataAttrs)
  │   │   └─ 构建联合选择器 tag[data-id="1"][data-type="x"] → querySelectorAll
  │   ├─ onclick 匹配 (matchOnclick)
  │   │   └─ querySelectorAll('[onclick]') → includes(fp.onclickParam)
  │   ├─ 父级容器匹配 (matchParent)
  │   │   └─ querySelectorAll(parentSelector)
  │   ├─ 自动发现 (autoDiscover)
  │   │   └─ parent.querySelectorAll + matchesFingerprint()
  │   └─ 文字匹配 (matchText)
  │       └─ querySelectorAll + 完全/模糊比对
  └─ 每项结果写入 DOM
      ├─ setResult(criterion, found, count)
      │   └─ header 行 span：✓ N (绿色/pass) 或 ✕ (红色/fail)
      └─ setCount(criterion, count)
          └─ 所有同名 count span：纯数字（0 时清空 + zero class）
```

#### 4.3 测试结果显示

测试后，详情面板各规则旁会显示：

- **标题后**：`✓ 3`（绿色）或 `✕`（红色）—— 通过/失败 + 匹配数量
- **字段值旁**：紧贴标签名/id/class 等显示匹配数量（如 `BUTTON 3`）
- **属性行**：计数紧贴属性键名（如 `href3`），表示组合条件匹配到的元素总数
- **CSS 选择器**：独立显示在「启用此元素」行
- **页面高亮**：所有匹配元素显示粉色虚线框（`#F8BBD0`）
- **已禁用元素**：所有测试项显示灰色 `⊘`，不执行测试
- **未参与的匹配项**：开关关闭的匹配规则显示灰色 `⊘`（如关闭了 id 匹配则 id 项显示 `⊘`）
- **测试按钮**：位于启用开关左侧，靠右排列

#### 4.4 辅助函数

```js
// 写入 header 行结果
function setResult(criterion, found, count) {
  const el = infoContentEl.querySelector(
    `.auto-op-test-result[data-test-criterion="${criterion}"]`
  );
  if (el) {
    el.textContent = found ? `✓ ${count}` : '✕';
    el.className = `auto-op-test-result ${found ? 'pass' : 'fail'}`;
  }
}
// 未参与测试的项保持 ⊘（disabled 类，灰色）
  }
}

// 写入所有 count span（支持多实例，如多个属性行）
function setCount(criterion, count) {
  const els = infoContentEl.querySelectorAll(
    `.auto-op-test-count[data-test-criterion="${criterion}"]`
  );
  els.forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.className = `auto-op-test-count${count === 0 ? ' zero' : ''}`;
  });
}
```

---

### 五、操作执行（点击 / 填充）

#### 5.1 启动流程

```
点击 ▶ 按钮 → handleToggleRunning()
  ├─ 若未运行 → startClickingFor(ci)
  │   ├─ exitPickMode()（若为当前配置）
  │   ├─ 重新解析元素 (tryFindTarget)
  │   ├─ discoverNewTargetsFor(ci)
  │   ├─ 设置 isRunning = true, clickedCount = 0
  │   ├─ startElapsedTimer()
  │   ├─ 启动 maxDuration 定时器
  │   ├─ 停止 autoStart 倒计时
  │   ├─ requestWakeLock()
  │   ├─ suppressFocus()
  │   ├─ doClickFor(ci) 立即执行一次
  │   └─ setInterval(doClickFor, clickInterval)
  └─ 若已运行 → stopClickingFor(ci)
```

#### 5.2 `doClickFor(ci)` — 每次操作周期

```
doClickFor(ci)
  ├─ beginQueryCycle() → 查询缓存周期
  ├─ discoverNewTargetsFor(ci) → 扫描新元素
  ├─ UI 节流 (100ms)
  ├─ 评估目标状态
  │   ├─ disabled → 跳过
  │   ├─ 有效 (matchesFingerprint 通过) → 执行操作
  │   └─ 缺失 (元素不存在或不匹配) → tryFindTarget 尝试恢复
  ├─ 同时模式 (simultaneous)
  │   ├─ 遍历所有 target
  │   ├─ 输入框：el.value = content, dispatchEvent(input/change)
  │   ├─ contentEditable：el.innerHTML = content
  │   └─ 普通元素：el.click()
  ├─ 队列模式 (sequential)
  │   ├─ 操作 currentQueueIndex 指向的元素
  │   ├─ 成功 → currentQueueIndex++
  │   ├─ 缺失 → startWaitTimer() 或 stopClickingFor()
  │   └─ 队列结束后重新开始
  ├─ 检查 maxClicks / maxDuration
  └─ cleanupAutoTargetsFor(ci) → 清理失效的自动发现元素
```

#### 5.3 元素消失处理

| 设置 | 行为 |
| --- | --- |
| **等待重试**（默认） | `startWaitTimer()`：等待 `clickInterval × 2` 时间，期间每 1ms 轮询检查元素是否重新出现。超时后跳过并前进队列 |
| **立即停止** | 调用 `stopClickingFor(ci)`，立即终止运行 |

#### 5.4 停止流程

```
stopClickingFor(ci)
  ├─ isRunning = false, isWaiting = false
  ├─ 清除所有定时器 (timerID, waitTimerID, maxDurationTimerID, autoStart)
  ├─ stopElapsedTimer()
  ├─ 若没有其他配置运行 → restoreFocus() + releaseWakeLock()
  ├─ 若配置了自动启动 → 重新启动倒计时
  └─ 更新 UI 按钮状态
```

---

### 六、多选模式与操作策略

#### 6.1 多选模式

开启后，每次点击「选取元素」不会退出选取模式，可以连续点选多个目标。

#### 6.2 操作策略

| 策略 | 行为 | 适用场景 |
| --- | --- | --- |
| **同时操作** | 每个间隔同时点击所有可用目标 | 批量操作（如批量点赞） |
| **队列操作** | 按列表顺序依次点击，每次一个目标 | 有顺序要求的操作（如多步骤流程） |

#### 6.3 队列模式细节

- `currentQueueIndex` 跟踪当前队列位置
- 遇到禁用的元素自动跳过
- 遇到缺失的元素根据 `missingAction` 决定等待或停止
- 队列到达末尾后重新从开头开始
- 状态栏显示当前队列进度

---

### 七、自动填充

当目标元素的「输入元素」开关打开时，操作执行时自动填充文本。

- **填充文本**：通过元素设置面板（⚙ 按钮）为每个元素独立配置 `customFill`，留空则无填充
- 支持的输入类型：`<input>`（排除 checkbox/radio/hidden/file/color/submit/button/reset/image）、`<textarea>`、`contentEditable`
- 填写时触发 `input` 和 `change` 事件，兼容 React/Vue 等前端框架
- 对于 `contentEditable`，直接设置 `innerHTML`

---

### 八、自动刷新

#### 8.1 配置

- 开启开关，设置间隔（10s ~ 86400s）
- 实时进度条显示百分比和剩余时间
- 剩余 < 30s 时进度条变红

#### 8.2 刷新流程

```
startAutoRefreshCountdown()
  ├─ isAutoRefresh = true
  ├─ 显示进度条
  ├─ 每 100ms 更新进度条 UI
  └─ setTimeout → triggerRefresh()

triggerRefresh()
  ├─ saveRefreshState() → localStorage (REFRESH_STATE_KEY)
  ├─ saveData() → 所有配置和共享状态
  ├─ addRefreshLog('页面刷新')
  └─ location.reload()
```

#### 8.3 日志

刷新日志记录在 `refreshLogs[]` 中：
- 每条日志包含时间戳和消息
- 日志保存在共享状态中，跨刷新持久
- 可一键清空

---

### 九、自动启动

#### 9.1 工作原理

```
autoStartIntervalInput 输入分钟数（支持小数）
  └─ setupAutoStartFromInput()
      └─ startAutoStartCountdownTimerFor(ci)
          └─ 每 500ms 检查 remaining <= 0
              └─ doAutoStartFor(ci)
                  ├─ 目标为空 → 重新倒计时
                  └─ 有目标 → startClickingFor(ci)
```

#### 9.2 循环逻辑

1. 自动启动 → 运行操作 → 操作完成/停止 → 重新倒计时 → 再次自动启动
2. 手动停止后，倒计时重新开始
3. 目标为空时跳过并继续倒计时

---

### 十、省电模式

#### 10.1 启用

- 手动：第 4 页开关
- 自动：运行时自动启用

#### 10.2 行为

- 全屏黑色遮罩覆盖页面
- 四个随机分布的元素，定时移动位置：
  - **当前时间**（40px 大号字体）
  - **运行时长**
  - **已操作次数**
  - **开关按钮**（可关闭省电模式）
- 自动尝试进入全屏模式（`requestFullscreen`）
- 退出全屏时自动关闭省电模式
- 点击遮罩可重试全屏（当全屏被浏览器拒绝时）

#### 10.3 位置随机化

```
randomizePSPositions()
  ├─ 为每个元素随机生成 viewport 内坐标
  ├─ isTooClose() 检查避免重叠
  │   └─ 水平 < 220px 且垂直 < 60px → 视为过近
  └─ 使用 CSS transition (left 5s, top 5s) 平滑移动
```

---

### 十一、屏幕常亮与禁止聚焦

#### 11.1 Wake Lock

- 使用 `navigator.wakeLock.request('screen')` API
- 运行操作或自动刷新时自动请求
- 全部停止后自动释放
- 页面变为可见时（`visibilitychange`）自动重新请求

#### 11.2 禁止聚焦

- 覆盖 `HTMLElement.prototype.focus`：仅面板内元素可获取焦点
- 全局 `focusin` 事件监听器：自动 blur 面板外元素
- 防止页面元素抢夺焦点中断自动操作

---

### 十二、配置管理（10 套独立配置）

#### 12.1 配置结构

```
configs[i] = {
  targets: [],           // 目标元素列表
  isRunning: false,      // 是否正在运行
  timerID: null,         // 操作间隔定时器
  clickedCount: 0,       // 已操作次数
  maxClicks: Infinity,   // 最大操作次数
  clickInterval: 1000,   // 操作间隔 (ms)
  isMultiMode: false,    // 多选模式
  clickStrategy: 'simultaneous', // 操作策略
  currentQueueIndex: 0,  // 队列当前位置
  autoStartEnabled: false,
  autoStartIntervalMin: 0,
  maxDurationMin: 0,     // 最大运行时长 (分钟)
  discoveredElements: new Set(), // 自动发现的元素
  missingAction: 'wait'  // 元素消失处理
};
```

#### 12.2 `switchConfig(newIndex)`

```
switchConfig(newIndex)
  ├─ exitPickMode()
  ├─ hideInfoPanel()
  ├─ 保存当前配置到 UI → savePerConfig(activeConfig)
  ├─ 清除旧配置高亮
  ├─ activeConfig = newIndex
  ├─ beginQueryCycle()
  ├─ 为新配置所有目标 tryFindTarget() + resolveParentInfo()
  ├─ 验证 _isValid (matchesFingerprint)
  ├─ 同步所有 UI 控件
  ├─ refreshParentHighlights()
  ├─ updateTargetUI() + updateTargetCount()
  └─ saveData()
```

---

### 十三、主题系统

#### 13.1 主题模式

| 模式 | 行为 |
| --- | --- |
| `auto`（默认） | 扫描网页 `class`/`style`/`data-*` 属性，同时检测系统主题，取第一个匹配 |
| `system` | 仅跟随操作系统 `prefers-color-scheme` |
| `light` | 强制亮色 |
| `dark` | 强制暗色 |

#### 13.2 实现机制

- CSS 变量定义在 `:root` 和 `[data-theme="light"]` 中
- `applyTheme()` 在 `<html>` 上设置 `data-theme` 属性
- 两个 `MutationObserver` 监听 `<html>` 和 `<body>` 的 `class`/`style` 变化
- `matchMedia('prefers-color-scheme: dark')` 监听系统主题切换
- 200ms 防抖避免频繁切换

#### 13.3 网页主题扫描

```
scanWebpageTheme(el)
  ├─ 检查 classList 中的 DARK_CLS / LIGHT_CLS
  ├─ 检查 style 中的 color-scheme
  └─ 检查任意属性的值
```

---

### 十四、面板交互

#### 14.1 拖拽

- 鼠标/触屏按住标题栏空白区域拖动
- `onDragStart` 记录偏移量，`onDragMove` 更新 `left/top`，`onDragEnd` 释放
- 详情面板头部也支持拖拽
- 配置按钮、折叠按钮、开始按钮区域不触发拖拽

#### 14.2 折叠/展开

```
折叠 (performCollapse):
  ├─ 隐藏 body，toggleBtn → '+'
  ├─ 计算折叠宽度 (collapsedWidth)
  ├─ 面板宽度从 300px 过渡到 collapsedWidth
  └─ 1s 后面板自动半透明

展开 (performExpand):
  ├─ 面板宽度从 collapsedWidth 过渡到 300px
  ├─ 显示 body，toggleBtn → '−'
  └─ 恢复完全不透明
```

#### 14.3 面板透明度

- **选取元素时**：立即半透明（opacity 0.65）
- **折叠后**：1s 后自动半透明
- **点击面板**：恢复不透明，2s 后再次半透明
- **退出选取 / 展开**：恢复完全不透明

#### 14.4 详情面板（overlay）动画

匹配规则和元素设置面板从右侧滑入/滑出：

```css
transform: translateX(105%);
transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
will-change: transform;
```

- **打开**：`display:flex` -> 双 `requestAnimationFrame` -> `classList.add('open')` -> `translateX(0)` 过渡
- **关闭(动画)**：inline `display:flex` 保活 -> `classList.remove('open')` -> `translateX(105%)` -> `transitionend` -> `display:none`
- **关闭(无动画)**：直接 `display:none`
- 两个面板互斥
- header 可拖动，与主面板一致

#### 14.5 面板高度自适应

打开 overlay 时 body 自动适配内容高度：

- **测量**：离屏探针（`position:fixed; left:-9999px`）克隆 overlay HTML，读 `scrollHeight` 获取真实高度，减去 `.auto-op-header` 高度
- **伸缩**：设 `min-height` + `max-height` 到目标值，CSS `0.4s cubic-bezier(0.4,0,0.2,1)` 过渡
- **并行**：`fitBodyToOverlay()` 和 `classList.add('open')` 在同一帧执行，overlay 滑入和 body 伸缩同步
- **恢复**：`restoreBodyHeight()` 清除 inline 高度，`max-height` 回到保存原值
- **折叠兼容**：`collapsed/body-hidden` CSS 规则包含 `min-height:0 !important` 覆盖 inline 值

---

### 十五、存储与持久化

#### 15.1 存储键

| 键 | 内容 |
| --- | --- |
| `AUTO_OP_SHARED_<host>` | 全局共享状态 |
| `AUTO_OP_CFG_<host>_<0~9>` | 每套配置 |
| `AUTO_OP_REFRESH_STATE_<host>` | 跨刷新临时状态 |

#### 15.2 保存时机

- 切换配置 → `savePerConfig()` + `saveShared()`
- 修改参数（change/input 事件）→ `savePerConfig()` 或 `saveShared()`
- 修改匹配规则 → `savePerConfig()`
- 选取/删除目标 → `savePerConfig()`
- 刷新前 → `saveRefreshState()` + `saveData()`

#### 15.3 数据结构

配置序列化时，`discoveredElements`（Set）和 DOM 元素引用被过滤：
- `element` 不持久化（刷新后通过 `tryFindTarget` 重新查找）
- 保留 `strict`、`loose`、`fingerprint`、匹配开关等完整数据

---

### 十六、跨刷新状态恢复

#### 16.1 保存刷新状态

```
saveRefreshState()
  ├─ isAutoRefresh, refreshIntervalSec, nextRefreshTime
  ├─ refreshLogs[]
  ├─ isPowerSave
  └─ 每个运行中的配置：operationStartTimestamp, clickedCount
```

#### 16.2 恢复刷新状态

```
初始化时：
  loadRefreshState()
    ├─ 有刷新状态 → 恢复日志、省电模式、继续倒计时
    │   └─ 200ms 后 → 重新启动之前运行的配置
    │       └─ startClickingFor(ci, savedTimestamp)
    │           └─ 恢复运行计时和操作计数
    └─ 无刷新状态但有 isAutoRefresh → 正常启动倒计时
```

### 十七、SVG 图标一览

面板内所有图标均为内联 SVG，通过 `fill="currentColor"` 继承按钮文字色。

| 图标 | 位置 | 尺寸 | 说明 |
| --- | --- | --- | --- |
| 文档列表 | 第 1 页按钮 | 16px | 操作页面 |
| 滑块开关 | 第 2 页按钮 | 16px | 参数页面 |
| 刷新循环 | 第 3 页按钮 | 16px | 自动刷新页面 |
| 齿轮 | 第 4 页按钮 | 16px | 系统设置页面 |
| 长箭头 + 横线 | 详情面板返回按钮 | 14px | 指向左侧 |
| 长箭头（旋转） | 目标元素上移 / 下移 | 10px | `rotate(90deg)` ↑ / `rotate(-90deg)` ↓ |
| 三角播放 | 折叠标题栏播放按钮 | 14px | 停止状态显示，绿色背景 |
| 双竖线停止 | 折叠标题栏停止按钮 | 14px | 运行状态显示，红色背景（`is-stop`） |
| 展开箭头 | 折叠/展开按钮 | 14px | 面板折叠时显示（箭头向外） |
| 收起箭头 | 折叠/展开按钮 | 14px | 面板展开时显示（箭头向内） |
| 列表图标 | 目标元素查看详情 ⓘ | 12px | 3 条横线 + 展开角标 |
| 垃圾桶 | 目标元素删除 ✕ | 10px | hover 变红 `#dc2626` |
| ① ~ ⑩ 编号 | 配置切换按钮 + 下拉菜单 | 20px / 20px | 圆角矩形框内数字 |

> **兼容修复**：按钮内嵌 SVG 后，`e.target` 可能指向 `<path>` 元素。目标列表事件委托已改用 `e.target.closest('[data-action]')` 向上查找，确保点击 SVG 内部仍能触发。

### 十八、主题监听优化

为减少不必要的 DOM 监听，系统主题检测器在非 `auto` 模式下自动关闭：

```text
startThemeWatchers()
  ├─ stopThemeWatchers()           → 先清理旧监听
  ├─ mode = 'system' | 'auto'      → matchMedia 监听系统主题切换
  ├─ mode = 'auto'                 → + MutationObserver 监听网页 class/style 变化
  └─ mode = 'light' | 'dark'       → 无监听（颜色固定）
```

| 模式 | matchMedia | MutationObserver × 2 |
| --- | :---: | :---: |
| `light` / `dark` | 关闭 | 关闭 |
| `system` | 开启 | 关闭 |
| `auto` | 开启 | 开启 |

切换模式时自动调用 `startThemeWatchers()` 重建，确保零浪费。

### 十九、元素详情面板按钮透明度

目标列表中的小按钮（上移、下移、删除、查看详情）默认 `opacity: 0.9`，hover 恢复 `opacity: 1`。避免按钮过于醒目干扰目标文字阅读，悬停时完整显示。

---

## 参数参考

| 参数 | 位置 | 默认值 | 说明 |
| --- | --- | --- | --- |
| **多选模式** | 第 1 页 | 关闭 | 开启后可选取多个目标 |
| **操作策略** | 第 1 页 | 同时操作 | 同时 / 队列 |
| **操作次数** | 第 2 页 | 无限 | 留空 = 无限；填入数字限制 |
| **操作时间 (min)** | 第 2 页 | 无限 | 最长运行时长，支持小数；到时自动停止 |
| **操作间隔 (ms)** | 第 2 页 | 1000 | 每次操作的间隔毫秒数 |
| **自动启动 (min)** | 第 2 页 | 关闭 | 定时自动开始，留空 = 关闭 |
| **元素消失后** | 第 2 页 | 等待重试 | `等待重试` / `立即停止` |
| **自动刷新网页** | 第 3 页 | 关闭 | 定时刷新 |
| **刷新间隔 (s)** | 第 3 页 | 60 | 范围 10 ~ 86400 |
| **选取放行点击** | 第 4 页 | 关闭 | 选取模式下允许页面响应点击 |
| **省电模式** | 第 4 页 | 关闭 | 全屏黑色遮罩 |
| **屏幕常亮** | 第 4 页 | 关闭 | Wake Lock API |
| **禁止聚焦** | 第 4 页 | 关闭 | 阻止页面抢焦点 |
| **主题模式** | 第 4 页 | auto | auto / system / light / dark |
| **面板字体** | 第 4 页 | MiSans VF | 可选 system-ui 回退 |

---

## 技术参考

### CSS 变量（`:root` 暗色默认值）

| 变量 | 用途 |
| --- | --- |
| `--panel-bg: #18181b` | 面板背景 |
| `--panel-border: #333` | 面板边框 |
| `--panel-text: #e0e0e0` | 主文字色 |
| `--panel-input-bg: #27272a` | 输入框背景 |
| `--panel-input-border: #333` | 输入框边框 |
| `--panel-label-text: #888` | 标签文字色 |
| `--panel-button-bg/hover-bg` | 按钮背景 |
| `--panel-highlight-border: #277AF7` | 高亮色（蓝） |
| `--panel-active-border/text: #22c55e` | 激活/成功色（绿） |
| `--panel-missing-border/text: #dc2626` | 缺失/失败色（红） |
| `--panel-waiting-text: #f59e0b` | 等待色（橙） |
| `--auto-op-font` | 字体栈：MiSans VF → system-ui |

亮色模式通过 `[data-theme="light"]` 覆盖为浅色值。

### 查询缓存

```
beginQueryCycle()           // 重置缓存 Map
cachedQuery(root, selector) // 同一周期内复用 querySelectorAll 结果
```

在每个操作周期的开始调用 `beginQueryCycle()`，后续所有 `cachedQuery()` 调用共享缓存，避免对同一选择器重复查询 DOM。

### DOM 观察器

| 观察器 | 目标 | 用途 |
| --- | --- | --- |
| `MutationObserver × 2` | `<html>` + `<body>` | 监听 class/style 变化 → 更新主题 |
| `ResizeObserver × 4` | 4 个 `.auto-op-page` | 监听页面高度变化 → 调整容器高度 |
| `matchMedia` | `prefers-color-scheme` | 系统主题切换 → 更新主题 |

### 事件委托

详情面板使用事件委托（而非为每个元素绑定事件）：

```
infoContentEl.addEventListener('change', ...)  → 所有 toggle/select
infoContentEl.addEventListener('input', ...)  → 所有文本输入
infoContentEl.addEventListener('click', ...)  → 测试按钮
```

所有操作通过 `data-info-action` 属性分发：

| action | 触发元素 | 行为 |
| --- | --- | --- |
| `toggle-enabled` | checkbox | 切换元素启用/禁用 |
| `toggle-matchTag` | checkbox | 切换标签匹配 |
| `toggle-matchText` | checkbox | 切换文字匹配 |
| `toggle-matchId` | checkbox | 切换 id 匹配 |
| `toggle-matchClass` | checkbox | 切换 class 匹配 |
| `toggle-matchAttrs` | checkbox | 切换标准属性匹配 |
| `toggle-matchDataAttrs` | checkbox | 切换 data-* 匹配 |
| `toggle-matchOnclick` | checkbox | 切换 onclick 匹配 |
| `toggle-matchParent` | checkbox | 切换父容器匹配 |
| `toggle-autoDiscover` | checkbox | 切换自动发现 |
| `change-matchTextMode` | select | 切换文字匹配模式 |
| `change-text` | input | 修改匹配文字 |
| `change-attr` | input | 修改属性值 |

---

## 仓库概览

| 项目 | 说明 |
| --- | --- |
| **仓库地址** | [github.com/sewolonX/Automatic-operation](https://github.com/sewolonX/Automatic-operation) |
| **主分支** | `main` |
| **许可证** | MIT |
| **语言** | JavaScript（纯 JS，无构建工具） |
| **运行时** | Tampermonkey / Greasemonkey / Violentmonkey |
| **运行位置** | `document-idle`，匹配 `*://*/*`（所有 HTTP(S) 页面） |
| **外部依赖** | 无（字体 CDN 可选，加载失败自动回退 `system-ui`） |

### 文件结构

```text
Automatic-operation/
├── Automatic-operation.js    # 主脚本（~5135 行），全部功能
├── Automatic-clicker.js      # 早期简化版（~777 行），单目标点击器
├── README.md                 # 本文档
└── LICENSE                   # MIT 许可证
```

### 主脚本代码行数分布

| 模块 | 大致行数 | 内容 |
| --- | --- | --- |
| 用户脚本元数据 | 1–12 | `@name` `@version` `@match` 等 |
| 全局状态 & 配置初始化 | 13–100 | 变量声明、10 套 `configs[]`、CONFIG_SVGS |
| CSS 注入 | 138–1470 | 暗/亮双主题 ~1900 行 CSS（展开格式） |
| 主题检测 & 监听管理 | 3050–3220 | `scanWebpageTheme` `startThemeWatchers` `stopThemeWatchers` |
| DOM 构建（面板 + 覆盖层） | 1800–2250 | 4 页面板、信息覆盖层、省电覆盖层、配置菜单 |
| DOM 引用缓存 | 2250–2320 | 所有 `getElementById` 引用 |
| 配置菜单 & 省电模式 | 2320–2550 | 菜单开关、随机位置、全屏管理 |
| `switchConfig` — 配置切换 | 2550–2700 | 保存当前→清高亮→加载新→同步 UI |
| 持久化（save / load / migrate） | 2700–2950 | 3 级存储键、旧数据迁移 |
| 元素工具函数 | 2950–3040 | `buildSelectors` `getElText` `getElementFingerprint` `matchesFingerprint` |
| 查找 & 发现 & 查询缓存 | 2860–3000 | `tryFindTarget` `discoverNewTargetsFor` `cachedQuery` `beginQueryCycle` |
| 分页 & 折叠 & 透明度 & 对话框 | 3400–3550 | `goToPage` `performCollapse` `performExpand` `showConfirm` |
| 自动刷新 | 3550–3700 | 进度条、触发刷新、日志 |
| 自动启动 & 运行计时 | 3700–3800 | 倒计时、`startElapsedTimer` |
| 目标列表事件委托 | 3800–3950 | `delete` `info` `settings` `move-up` `move-down` |
| 信息面板（show / hide） | 3950–4150 | 详情 HTML 构建、滑入/滑出动画 |
| 元素测试 `runElementTest` | 4150–4350 | 9 项逐一测试 + `setResult` / `setCount` |
| 信息面板事件委托 | 4350–4500 | 14 种 `data-info-action` 分发 |
| 元素设置面板（show / hide） | 4500–4700 | 设置面板 HTML 构建、表单事件、滑入/滑出 |
| 面板高度适配 | 3720–3790 | 离屏探针测高、`fitBodyToOverlay` / `restoreBodyHeight` |
| UI 更新 & 拖拽 & 全局事件 | 4700–4900 | `updateTargetUI` `updateTargetCount` 拖拽处理 |
| 元素选取 & 开始/停止操作 | 4900–5100 | `selectTarget` `startClickingFor` `doClickFor` `stopClickingFor` |
| 初始化 | 5100–5135 | 主题→加载→折叠→恢复状态→自动启动 |

---

## 许可与作者

MIT License

[sewolon](https://github.com/sewolonX)
