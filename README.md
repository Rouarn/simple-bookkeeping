# 小绿记账 · App

小绿记账的客户端：一个**本地优先**的记账 App，uni-app（Vue 3 + Pinia）实现，HBuilderX 工程。

- 服务端：[simple-bookkeeping-service](https://github.com/Rouarn/simple-bookkeeping-service)（NestJS + MySQL + Redis）
- 版本：`1.0.7`（versionCode `107`）· 应用标识 `__UNI__195FC35`

## 功能

- **记账**：支出 / 收入、分类、账本、备注与图片凭证
- **流水**：按日分组、筛选与快速编辑，支持同一分钟多笔记账
- **统计**：分类占比与趋势
- **多账本**：账本切换、账本级分类
- **我的**：用户资料、消息、设置与协议
- **体验**：深浅色双主题、液态玻璃界面、记账页预加载
- **在线更新**：检查新版本、下载 APK、签名校验与强制升级兜底

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | uni-app（Vue 3 `script setup`） |
| 状态 | Pinia + 自研持久化（`store/persist.js`） |
| 请求 | `@vakao/axios` 二次封装（`api/http.js`），统一信封与 401 处理 |
| 样式 | `uni.scss` + `theme.json`，玻璃拟态见 `docs/glass-design.md` |
| 工程 | HBuilderX，无打包器配置 |

## 目录结构

```
api/          接口层（auth / bills / books / categories / statistics / uploads / messages）
components/   通用组件
composables/  页面逻辑（useHome / useFlowing / useBookkeeping / useAppUpdate …）
config/       环境配置（env.js：API / 静态资源 / 更新服务地址）
pages/        页面（index · flowing · statistics · my · add · detail · settings · messages · login · agreement）
store/        Pinia store（app / bill / book / category / user）与持久化
static/       图标与壁纸
uni_modules/  第三方 uni 模块
docs/         设计说明与版本公告
```

## 运行

1. 用 HBuilderX 打开本目录（不是 `src` 子目录）。
2. 配置服务端地址：改 `config/env.js` 的 `API_BASE`（真机调试必须用电脑局域网 IP，不能用 `localhost`）。
3. 运行 → 运行到手机或模拟器 / 浏览器。

依赖仅用于 lint 与格式化：

```bash
npm install
npm run lint     # ESLint
npm run check    # Prettier 检查
npm run format   # Prettier 写入
```

## 构建

HBuilderX → 发行 → 原生 App-云打包（Android）。`unpackage/` 为构建产物目录，已在 `.gitignore` 中忽略，不要提交。

## 约定

- 所有服务端地址集中在 `config/env.js`，不要在业务代码里硬编码 `BASE_URL`。
- 生产环境要求 HTTPS；`http://` 明文出网属于缺陷，需要修复而不是绕过。
- 提测前跑一遍 `npm run lint` 与 `npm run check`。

## 许可

[MIT](LICENSE)
