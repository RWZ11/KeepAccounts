# KeepAccounts · 轻量跨端记账应用

> 一个用 React + Vite 构建的轻量级记账应用，支持网页端与 Android（Capacitor），并内置简易的智能输入解析（Gemini）。

## 目录
- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [安装指南](#安装指南)
- [使用说明](#使用说明)
- [移动端构建（Android）](#移动端构建android)
- [贡献指南](#贡献指南)
- [许可证信息](#许可证信息)
- [截图](#截图)

## 项目简介
- 名称：KeepAccounts（记账助手）
- 目标用户：需要快速、简洁记录日常收支的个人用户
- 核心价值：极简操作、清晰统计、可选的 AI 智能解析，网页与安卓端统一体验

## 功能特性
- 记录收支：支持添加收入/支出、类别、备注、日期
- 分类管理：常见类别快速选择，便于统计
- 数据统计：使用 `Recharts` 展示月度趋势与占比图
- 多语言/货币：支持语言与货币上下文管理
- 智能解析：可用自然语言快速录入（依赖 Gemini API）
- 移动端封装：内置 Capacitor 配置，生成 Android 应用

## 安装指南
### 环境要求
- Node.js ≥ 18（推荐 18.x LTS）
- npm ≥ 9
- 可选（仅 Android 构建需要）：JDK 17、Android Studio、Android SDK、Gradle（使用项目自带 Wrapper 即可）

### 克隆与依赖安装
```bash
# 第一步：进入项目目录（Windows 示例）
cd d:\keepaccounts

# 第二步：安装依赖
npm install

# 第三步：检查版本（出现 v18.x.x 与 9.x.x 说明满足要求）
node -v
npm -v
```

### 环境变量配置
- 本项目的智能解析服务读取环境变量 `API_KEY` 用于访问 Gemini（参考 `services/geminiService.ts:3`）。
- 在项目根目录创建或编辑 `.env.local` 文件，写入：

```bash
# 文件：.env.local（示例）
# 这是一行注释：把你的 Google Gemini 密钥放在等号右边
API_KEY=你的_Gemini_API_Key
```

提示：如果你之前看到 `.env.local` 中是 `GEMINI_API_KEY`，请改为 `API_KEY`，否则智能解析会被认为未配置。

## 使用说明
### 本地开发
```bash
# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```
- 打开浏览器访问 `http://localhost:5173`
- 常见操作：
  - 添加一笔：输入金额、选择类型（支出/收入）、选择类别、写备注、选日期
  - 查看统计：进入统计页查看趋势图与占比图
  - 切换语言/货币：在设置或页面顶栏（如有）中切换

### 生产构建与预览
```bash
# 生成构建产物（输出在 dist/）
npm run build

# 本地预览构建结果
npm run preview
```

### 代码示例（智能解析）
下面是一个最小示例，演示如何把一句自然语言解析成一条结构化记账数据。

```ts
// 文件名：示例用法（可粘贴到任意 TS 文件中测试）
// 作用：演示使用 GeminiService 把自然语言解析成记账对象

import { GeminiService } from "./services/geminiService"; // 引入智能解析服务

async function demo() { // 定义一个异步函数做演示
  const text = "午餐15元"; // 假设用户输入的自然语言
  const result = await GeminiService.parseTransaction(text); // 调用解析方法，得到结构化数据

  if (result) { // 如果成功解析出结果
    console.log(result); // 在控制台打印解析后的对象
  } else { // 如果没有解析结果（通常是未配置 API_KEY）
    console.log("请先在 .env.local 配置 API_KEY"); // 提示开发者先配置密钥
  }
}

demo(); // 调用演示函数，运行上面的流程
```

## 移动端构建（Android）
> Android 子项目已存在于 `android/` 目录，可直接按以下步骤集成网页构建产物。

1. 先生成网页构建产物：
   ```bash
   npm run build
   ```
2. 同步到 Android（Capacitor）：
   ```bash
   npx cap sync android
   ```
3. 打开 Android Studio：
   ```bash
   npx cap open android
   ```
4. 在 Android Studio 中选择目标设备或模拟器，点击运行生成 APK / 安装到设备。

必备工具：JDK 17、Android Studio（含 SDK）。Gradle 使用项目自带 Wrapper，无需单独安装。

## 贡献指南
- 提交流程：
  - Fork 本仓库
  - 从 `main` 新建分支：`feature/xxx` 或 `fix/xxx`
  - 开发完成后运行 `npm run build` 与 `npm run preview` 自查
  - 提交 Pull Request，填写改动说明与截图（如有）
- 代码风格建议：
  - 使用 TypeScript 与函数式 React 组件
  - 保持文件组织与现有目录一致（`components/`, `pages/`, `services/` 等）
  - 避免在代码中输出敏感信息（例如 API Key）

## 许可证信息
- 本项目使用 MIT 许可证开源，你可以自由使用、修改与分发，但需保留版权声明。
- MIT 许可证全文参考：https://opensource.org/licenses/MIT

## 截图
（示例占位，实际文件可按需添加到 `docs/screenshots/`）

- 首页：`docs/screenshots/home.png`
- 统计：`docs/screenshots/stats.png`

——
如需更多帮助：
- 开发入口文件：`index.tsx`
- 主页组件：`pages/Home.tsx`
- 智能服务：`services/geminiService.ts:3` 读取 `API_KEY`
- Capacitor 配置：`capacitor.config.ts`

如果你对安装或构建步骤不熟悉，可以先运行网页端（`npm run dev`），熟悉后再继续 Android 构建。
