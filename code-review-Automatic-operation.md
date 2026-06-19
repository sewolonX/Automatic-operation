# Automatic-operation.js 代码审查报告

> 文件：[Automatic-operation.js](Automatic-operation.js)
> 版本：5.0.16
> 审查日期：2026-06-19

---

## 概述

这是一个 Tampermonkey / Greasemonkey 用户脚本，名为「自动操作 (Automatic-operation)」，约 1060 行纯 JavaScript，无外部依赖。核心功能包括：

- 🎯 元素选取与自动点击/填充
- 🔄 自动刷新网页
- ⏱ 定时自动启动
- 🌙 省电模式
- 🔒 屏幕常亮 (WakeLock)
- 🚫 禁止聚焦

架构特点：10 个独立配置槽（①~⑩）、3 个分页、双匹配策略（strict/loose）、两种操作策略（simultaneous/sequential）。

---

## 🔴 Bug 级别（会导致功能异常）

### 1. 正则表达式错误 — onclick 指纹提取失效

**位置：** `getElementFingerprint` 第 679 行 / `matchesFingerprint` 第 680 行

```js
const match = attrs.onclick.match(/useItem$$(\d+)$$/);
```

`$$` 在 JavaScript 正则中不是字面量 `$` 字符。`$` 是"行尾锚点"（end-of-line anchor），`$$` 就是行尾锚点写了两遍，等价于一个 `$`。实际上的正则：

```
/useItem(行尾锚点)(\d+)(行尾锚点)/
```

**它不可能匹配像 `useItem(123)` 这样的 onclick 属性值。** 应该改为：

```js
/useItem\((\d+)\)/
```

**影响：** onclick 参数提取功能完全失效，进而影响严格匹配模式下的元素指纹比对，可能导致页面刷新后无法正确重新定位元素。

---

### 2. 高频定时器浪费 CPU 资源

**位置：** `startWaitTimer` 第 946 行

```js
c.waitTimerID = setTimeout(update, 1); // 每 1ms 递归
```

`startWaitTimer` 用 **1ms** 的 `setTimeout` 递归轮询等待状态。浏览器实际的 `setTimeout` 最小间隔约为 4ms，但这仍然意味着每秒约 250 次回调。考虑到它还在 `doClickFor` 的 `setInterval` 循环中运行，**CPU 占用会非常高**。

**建议：** 改为 100ms 以上的间隔，或改用事件驱动方式。

---

### 3. `discoverNewTargetsFor` 遗漏 parentInfo

**位置：** `discoverNewTargetsFor` 第 687 行

```js
newTargets.push({
  element: el, strict: t.strict, loose: t.loose, fingerprint: t.fingerprint,
  desc: t.desc, isInput: t.isInput, matchMode: t.matchMode,
  parentSelector: t.parentSelector, parentChain: t.parentChain,
  isAuto: true, missCount: 0
  // ↑ 缺少 nearestParent 和 blueParent！
});
```

创建新的 auto target 时，**没有调用 `resolveParentInfo(el)`** 来设置 `nearestParent` 和 `blueParent`。

对比其他正确设置的地方：
- `selectTarget`（第 865-867 行）✅
- `loadPerConfig`（第 616-617 行）✅

**影响：** 新发现的元素没有父级高亮，后续 `refreshParentHighlights` 处理时退化到使用直接 `parentElement`。

---

### 4. `showConfirm` 对话框事件监听器泄漏

**位置：** `showConfirm` 第 715 行

```js
box.addEventListener('click', e => e.stopPropagation());
```

每次调用 `showConfirm` 都会在 `box` 上**新增**一个 `click` 事件监听器，且从不会被移除。如果用户频繁触发需要确认的操作（如移动端删除目标），这个元素上的监听器会不断累积。

---

### 5. `isProgrammaticClick` 全局状态共享

**位置：** `doClickFor` 第 947-989 行 / `document click` 第 408 行

```js
function doClickFor(ci) {
  isProgrammaticClick = true;  // 全局变量
  try { /* ... */ } catch (e) { /* ... */ }
  isProgrammaticClick = false;
}
```

多个 config 可以同时运行（各自有独立的 `timerID`），但 `isProgrammaticClick` 是全局共享的。虽然单线程 JS 下不会出现真正的竞态条件，但如果 `doClickFor` 内部同步触发了其他逻辑需要区分程序化点击，则可能产生混淆。

---

## 🟡 设计缺陷（功能正确但存在隐患）

### 6. 多个 config 同时运行时的 UI 混淆

`cv()` 函数始终返回 `configs[activeConfig]`。不同 config 可以同时运行（各自独立的 `timerID`），但状态栏始终显示的是当前选中 config 的数据。用户看到的点击计数和状态**只代表当前选中配置**，与实际可能有多个 config 在后台并发运行的情况不符。

---

### 7. 省电模式下状态完全冻结

| 函数 | 冻结检查 |
|------|----------|
| `updateTargetUI` | `if (isPowerSave) return;` |
| `updateTargetCount` | `if (isPowerSave) return;` |
| `refreshParentHighlights` | `if (isPowerSave) return;` |
| `updateRunningDisplay` | `if (isPowerSave || ci !== activeConfig) return;` |

省电模式期间，`discoveredElements` 的清理、`_isValid` 的刷新、父级高亮维护等全部停止。退出省电模式时一次性恢复，但如果持续时间很长，DOM 可能已经剧变，恢复逻辑面临较大风险。

---

### 8. `discoveredElements` Set 的内存泄漏

**位置：** config 定义 第 51 行 / `discoverNewTargetsFor` 第 687 行

```js
discoveredElements: new Set(),
```

每个 config 的 `discoveredElements` 只增不减。只有在元素离开 DOM（`!document.contains(el)`）时才删除，但对于 SPA 页面或无限滚动页面，大量已废弃的元素引用会阻止 GC。

---

### 9. `clickInterval` 无代码层下限保护

**位置：** 第 276 行 HTML / `doClickFor` 第 919 行

HTML 属性 `min="1"`，但用户可通过开发者工具绕过。代码中：

```js
c.clickInterval = parseInt(clickIntervalInput.value) || 1000;
```

当用户输入 `0` 时，`0 || 1000` = 1000（被兜底）。但输入 `1` 时，就真的使用 **1ms** 间隔，意味着每秒约 1000 次 DOM 操作，足以让页面卡死。

**建议：** 在代码中强制最小值，如 `Math.max(100, parseInt(...) || 1000)`。

---

### 10. `missingAction='wait'` 全元素消失时空转

**位置：** `doClickFor` 第 946-979 行

队列模式 + `missingAction='wait'` 时，`startWaitTimer` 等待 `clickInterval * 2` 后超时跳过。但如果**所有目标元素都消失了**，`doClickFor` 仍然每 `clickInterval` ms 触发一次，每次都等待→超时→跳过后续元素同样等待→超时，**永远不会自动停止**，形成空转死循环。

---

## 🟢 健壮性问题（边界条件与代码质量）

| 行号 | 问题 |
|------|------|
| 17 | `console.error('[AUTO_OP] body 跳过:')` — 错误信息不完整，缺少具体跳过原因 |
| 225 | `detectBrowserTheme` 中 `isDarkMode` 变量被设置但后续从未使用（主题切换完全依赖 DOM 属性 `data-theme`） |
| 421-440 | `randomizePSPositions` 使用 `Math.random()`，每 10s 重新随机布局，与 5s transition 配合可能导致元素持续处于移动状态 |
| 467-468 | `requestFullscreen()` 返回值的检查 `if (p && p.catch)` 是 duck-typing，依赖 try/catch 兜底 |
| 60 | `suppressFocus` 覆盖了 `HTMLElement.prototype.focus`，影响**页面所有元素**。如果页面其他脚本依赖 `focus()` 的行为（弹窗、模态框），会导致其功能异常 |
| 684 | `tryFindTarget` 对 `parentSelector` 的 catch 是空处理 `catch (e) {}`，选择器语法错误被静默吞掉，难以调试 |
| 687 | `querySelectorAll(t.fingerprint.tagName)` 对 `div`/`span`/`a` 等常见标签会返回数千元素，然后逐个 `matchesFingerprint`，存在性能隐患 |
| 1016-1048 | 恢复自动刷新状态时，`setTimeout(..., 200)` 和 `setTimeout(..., 300)` 硬编码延迟，如果 DOM 未就绪可能恢复失败 |
| 826-830 | 拖拽事件监听注册在 `document` 上但从未移除，虽然对用户脚本影响不大，但不能说是一个干净的模式 |
| 946 | 注释中有个 typo：`'[AUTO_OP] IS_TOP 异常:'`（第 18 行）在 IS_TOP 正常时不会触发，但异常信息中包含中文冒号，与其他 error 信息风格不一致 |

---

## 📋 总结

| 级别 | 数量 | 最需优先修复 |
|------|------|-------------|
| 🔴 Bug | 5 | **#1 正则错误** — onclick 指纹匹配完全失效 |
| 🟡 设计缺陷 | 5 | **#9 无下限保护** — 可能卡死页面 |
| 🟢 健壮性 | 10 | **#60 `suppressFocus` 全局影响** 最值得关注 |

---

## 附录：架构观察

### 优点
- 完善的持久化机制（localStorage 按域名隔离，刷新后可恢复运行状态）
- CSS 变量明暗主题切换设计合理
- 元素指纹匹配策略（strict/loose）考虑了不同场景
- 自动发现（discoverNewTargets）机制设计思路好
- 配置切换时清除旧高亮、查询缓存周期管理等细节处理到位

### 可改进方向
- `doClickFor` 函数体过长（~40 行），承担了查找、点击、UI 更新、清理等多种职责
- 全局变量较多（约 13 个），状态管理分散
- 省电模式与正常运行模式的状态同步可通过状态机方式重构
- 可考虑将 `configs` 操作抽象为类，减少重复的 `if (ci === activeConfig)` 判断
