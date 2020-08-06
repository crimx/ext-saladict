# 沙拉查词贡献指南

:+1::tada: 首先，感谢你愿意抽时间为这个项目作贡献！ :tada::+1:

## 贡献前注意

:warning: 除非是小的修复，在动手前建议新开一个 WIP（施工中）issue 或 PR 阐述你要做的东西以及将要如何实现，以保证大家达成一致认识，而不白白浪费互相的时间与精力。

- 先阅读 [如何开始](#如何开始).
- 遵循[代码格式](#代码格式)以及 [commit 格式](#commit格式).
- 提交前先本地跑[测试](#测试)以及[构建](#构建)。也可以交给 CI 处理。

## 如何开始

```bash
git clone git@github.com:crimx/ext-saladict.git
cd ext-saladict
yarn install
yarn pdf
```

在项目根添加 `.env` 文件，参考 `.env.example` 格式（可留空如果你不需要这些词典）。

## 修改 UI

运行 `yarn fixtures` 下载测试文件（下载完成以后不必再运行）。

运行 `yarn storybook` 查看所有 UI 组件。

运行 `yarn start --wextentry [entry id]` 查看特定入口。项目会运行在 Webpack 开发服务器下的虚拟扩展环境中。

## 测试

运行 `yarn test`。支持所有 Jest [参数](https://jestjs.io/docs/en/cli)。

## 构建

运行 `yarn build`。

参数:

- `--debug`: 取消压缩代码并输出源码映射（map）文件。
- `--analyze`: 显示打包分析图。

## 如何添加词典

出于安全性和可维护性，沙拉查词不提供热添加词典的功能，所有的词典添加必须向本项目提交 PR 合并。如果词典使用了未公开接口请另起项目发布到 NPM 再引用进来。

1. 在 [`src/components/dictionaries/`](./src/components/dictionaries/) 下以词典 id 新建一个目录。
   1. 可参考已有的词典如[必应](./src/components/dictionaries/bing)，复制文件到新建的目录中。
   1. 把图标换成该词典的 LOGO。
   1. 编辑 `config.ts` 修改词典默认设置。参见 `DictItem` 类型查看选项含义。在 [app config](./src/app-config/dicts.ts) 中注册词典让 TypeScript 生成正确的类型。词典 **必须** 遵循字母表顺序。
   1. 更新 `_locales.json` 添加多语言的词典名字。如果词典有自定义选项请一并添加多语言的名字。
   1. `engine.ts` **必须** `export` 至少两个函数：
      1. `getSrcPage` 函数。当用户点击词典标题时计算出相应的链接。
      1. `search` 函数。负责获取、解析和返回词典结果，可参考类型了解细节。
         - 从网页中解析信息 **必须** 使用 [../helpers.ts](./components/dictionaries/helpers.ts) 中的辅助方法以保证数据干净。
         - 如果词典支持自动发音：
           1. 在 [`config.autopron`](https://github.com/crimx/ext-saladict/blob/a88cfed84129418b65914351ca14b86d7b1b758b/src/app-config/index.ts#L202-L223) 中注册 id。
           2. 在返回的结果中附带 [`audio`](https://github.com/crimx/ext-saladict/blob/a88cfed84129418b65914351ca14b86d7b1b758b/src/typings/server.ts#L5-L9) 域。
      1. 其它 `export` 的方法可以在 `View.tsx` 中通过 `'DICT_ENGINE_METHOD'` 通信通道调用。类型细节见 `src/typings/message`。也可以在项目中搜索 `DICT_ENGINE_METHOD` 查看例子。通信 **必须** 通过 `'@/_helpers/browser-api'` 的 `message` 而不是原生的 `sendMessage` 方法.
   1. 词典结果最终会传到 `View.tsx` 中的 React 组件中。该组件 **应该** 只负责渲染结果而不带复杂逻辑。
   1. `_style.scss` 中的选择器 **应该** 遵循类似 [ECSS](http://ecss.io/chapter5.html#anatomy-of-the-ecss-naming-convention) 的命名方式。

### 热更新开发词典 UI 组件

为了方便在 Storybook 中开发组件我们需要拦截词典引擎的网络请求返回本地文件。

1. 新建 `fixtures.js` 在 `test/specs/components/dictionaries/[dictID]` 下。
   - 格式可参考其它词典。
   - 每个请求可以提供页面链接或者 axios 设置（见 `mojidict` 词典）。如果后面的请求依赖前面请求的结果，可以通过参数获得。
1. 运行 `yarn fixtures` 下载结果。
1. 编辑 `test/specs/components/dictionaries/[dictID]/request.mock.ts`。它会在开发时拦截词典请求并返回下载好的结果。
1. 运行 `yarn storybook`。

### 添加测试

1. 添加 `[dictID]/engine.spec.ts` 测试引擎。

## 代码格式

本项目遵循 [Standard](https://standardjs.com) 的 TypeScript 变种格式。运行 `yarn lint` 可检查。

如果使用 VSCode 等 IDE 请确保 *eslint* 和 *prettier* 插件已安装。或者构建的时候也会进行 TypeScript 完整检查。

## Commit 格式

本项目遵循 [conventional](https://conventionalcommits.org/) commit 格式。

你可以在 commit 时运行 `yarn commit` 按指示选择。或者在 VSCode 中使用 [VSCode Conventional Commits](https://github.com/vivaxy/vscode-conventional-commits) 插件。
