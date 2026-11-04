# 输入框白板（Excalidraw）

把 Excalidraw 做成宿主右侧栏的一种标签：从“开始”页的卡片或输入框旁的按钮打开，画完把结果作为附件插入当前草稿。

## 安装

```
plugin_manager install_bundle target=github:2315137135/dsh-composer-sketch
```

更新时先 `plugin_manager remove_bundle target=@local/dsh-composer-sketch` 再装：`github:` 规格按 lockfile 解析，直接重装会命中旧解析。改过 `index.js` 需重启 DSH。

## 使用

1. 打开白板标签；关闭后再打开会恢复上一次的场景。
2. 点“插入”生成 `board-<时间戳>.png` 进入附件栏。勾选旁边的“附带场景”时，再附上同名 `.excalidraw`（含每个元素的 id、坐标与尺寸）。
3. 首次打开会加载约 3.1 MiB 的分块，之后复用。
4. 反引号 `` ` `` 等同删除，其余快捷键沿用 Excalidraw 的默认设置。

## 文件

- `client.js`：浏览器侧入口——标签类型、标签主体、输入框按钮、附件注入。
- `client.whiteboard.js`：Excalidraw 分块，构建产物。
- `index.js`：Host 半边，为字体提供 `/composer-sketch/` 前缀路由。
- `build/`：分块源码与打包脚本，`cd build && npm ci && node build.mjs` 重新生成分块。
- `assets/fonts/`：Excalidraw 字体（woff2），由 Host 路由读取。

## 约束

- 标签类型走 `ctx.sidebarRightTabs`，它是 reflect 提供的属性而不是 Service：`cordis_inspect_query` 的服务目录里查不到。标签主体的座位 `sidebar.right.pane.tab` 以定义里的 `id` 为 key。
- 冷启动时本模块（`immediately: true`）比右侧栏与 slots 服务更早激活，直接查是 `undefined`，三处注册都经由 `afterAvailable` 等待。
- 附件记录只有 `name`，没有描述字段：要在消息里带上场景，只能把 `.excalidraw` 作为附件本身送达。
- `serializeAsJSON` 是位置参数 `(elements, appState, files, type)`；传对象进去会在内部 `.filter` 上抛错。
- Excalidraw 的属性面板宽度是根元素上的内联变量 `--right-sidebar-width: 302px`，没有配置项，只能用 `!important` 覆盖。
- Excalidraw 的 `getEditorUIOffsets()` 拿 client 坐标当画布内偏移用，画布不在窗口原点时（停靠右栏）适配内容、流程图快捷键、缩放中心的落点都会整体偏一个侧栏宽度。构建时由 `build.mjs` 的 `patch-editor-ui-offsets` 把它换算成画布坐标；升级 Excalidraw 后若补丁目标找不到，构建会直接失败。
- 字体与 CSS 用相对路径引用，浏览器无法从包目录解析，所以由 Host 路由转发、注入样式时重写 `url()`。改 `index.js` 需重启 DSH 生效，重启前字体走 CDN 回退。

## 许可

本仓库代码为 MIT。`client.whiteboard.js` 打包了 [Excalidraw](https://github.com/excalidraw/excalidraw)（MIT）及其字体，字体许可随上游。

