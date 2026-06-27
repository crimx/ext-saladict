# 沙拉查词 Saladict

[![Version](https://badgen.net/github/tag/crimx/ext-saladict?label=version&icon=github&color=6D5DFB)](https://github.com/crimx/ext-saladict/releases)
[![Build Status](https://github.com/crimx/ext-saladict/actions/workflows/build.yml/badge.svg)](https://github.com/crimx/ext-saladict/actions/workflows/build.yml)  
[![Edge Addons version](https://badgen.net/edge-addons/v/idghocbbahafpfhjnfhpbfbmpegphmmp?icon=windows&color=0078d4&label=version)](https://microsoftedge.microsoft.com/addons/detail/idghocbbahafpfhjnfhpbfbmpegphmmp)
[![Edge Addons stars](https://badgen.net/edge-addons/stars/idghocbbahafpfhjnfhpbfbmpegphmmp?icon=windows&color=0078d4)](https://microsoftedge.microsoft.com/addons/detail/idghocbbahafpfhjnfhpbfbmpegphmmp)
[![Edge Addons users](https://badgen.net/edge-addons/users/idghocbbahafpfhjnfhpbfbmpegphmmp?icon=windows&color=0078d4)](https://microsoftedge.microsoft.com/addons/detail/idghocbbahafpfhjnfhpbfbmpegphmmp)  
[![Chrome Web Store version](https://badgen.net/chrome-web-store/v/cdonnmffkdaoajfknoeeecmchibpmkmg?icon=chrome&color=0f9d58&label=version)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg)
[![Chrome Web Store stars](https://badgen.net/chrome-web-store/stars/cdonnmffkdaoajfknoeeecmchibpmkmg?icon=chrome&color=0f9d58)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg)
[![Chrome Web Store users](https://badgen.net/chrome-web-store/users/cdonnmffkdaoajfknoeeecmchibpmkmg?icon=chrome&color=0f9d58)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg)  
[![Firefox Add-ons version](https://badgen.net/amo/v/ext-saladict?icon=firefox&color=ff9500&label=version)](https://addons.mozilla.org/firefox/addon/ext-saladict/)
[![Firefox Add-ons stars](https://badgen.net/amo/stars/ext-saladict?icon=firefox&color=ff9500)](https://addons.mozilla.org/firefox/addon/ext-saladict/)
[![Firefox Add-ons users](https://badgen.net/amo/users/ext-saladict?icon=firefox&color=ff9500)](https://addons.mozilla.org/firefox/addon/ext-saladict/)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?maxAge=2592000)](http://commitizen.github.io/cz-cli/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg?maxAge=2592000)](https://conventionalcommits.org)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?maxAge=2592000)](https://standardjs.com/)
[![License](https://img.shields.io/github/license/crimx/ext-saladict.svg?colorB=44cc11?maxAge=2592000)](https://github.com/crimx/ext-saladict/blob/dev/LICENSE)

[【官网】](https://www.crimx.com/ext-saladict/)Chrome/Firefox 浏览器插件，网页划词翻译。

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://raw.githubusercontent.com/wiki/crimx/ext-saladict/images/notebook.gif" /></a>
</p>

沙拉查词 7 为完全重写的版本。增加了更多细腻的动效与流畅的交互，更快速更稳定更多自定义设置。

## 下载

见[下载页面](https://saladict.crimx.com/download.html)。

## 改动日志

[CHANGELOG.md](./CHANGELOG.md)

## 从源码构建

```bash
git clone git@github.com:crimx/ext-saladict.git
cd ext-saladict
yarn install
yarn pdf
```

在项目根添加 `.env` 文件，参考 `.env.example` 格式（可留空如果你不需要这些词典）。

```bash
yarn build
```

在 `build/` 目录下可查看针对各个浏览器打包好的扩展包。

## 开发

见[项目贡献指南](./CONTRIBUTING-zh.md)。

## 如何向本项目贡献代码

见[项目贡献指南](./CONTRIBUTING-zh.md)。

## 许可与品牌声明

沙拉查词是自由开源项目，源代码按 [MIT License](./LICENSE) 授权。你可以使用、复制、修改、发布和分发源代码，但必须附带该许可与版权声明。

Saladict / 沙拉查词名称、Logo、图标和相关品牌标识不随 MIT License 授权。公开发布 fork 或派生版本时，请使用自己的名称与品牌标识，并避免造成官方版本或授权版本的混淆。详见 [TRADEMARKS.md](./TRADEMARKS.md)。

请勿将沙拉查词用于任何违法犯罪活动。沙拉查词强烈谴责此类行为，并会尽可能配合追究责任。

## 更多截图

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/screen-notebook.png" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/pin.gif" /></a>
</p>
