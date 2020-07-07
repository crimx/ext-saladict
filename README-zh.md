# 沙拉查词 Saladict

[![Version](https://img.shields.io/github/release/crimx/ext-saladict.svg?label=version)](https://github.com/crimx/ext-saladict/releases)
[![Chrome Web Store](https://badgen.net/chrome-web-store/users/cdonnmffkdaoajfknoeeecmchibpmkmg?icon=chrome&color=0f9d58)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg?hl=en)
[![Chrome Web Store](https://badgen.net/chrome-web-store/stars/cdonnmffkdaoajfknoeeecmchibpmkmg?icon=chrome&color=0f9d58)](https://chrome.google.com/webstore/detail/cdonnmffkdaoajfknoeeecmchibpmkmg?hl=en)
[![Mozilla Add-on](https://badgen.net/amo/users/ext-saladict?icon=firefox&color=ff9500)](https://addons.mozilla.org/firefox/addon/ext-saladict/)
[![Mozilla Add-on](https://badgen.net/amo/stars/ext-saladict?icon=firefox&color=ff9500)](https://addons.mozilla.org/firefox/addon/ext-saladict/)

[![Build Status](https://travis-ci.com/crimx/ext-saladict.svg)](https://travis-ci.com/crimx/ext-saladict)
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

## 声明

声明：沙拉查词作为自由开源的浏览器辅助插件，仅供学习交流，任何人均可免费获取产品与源码。如果认为你的合法权益收到侵犯请马上联系[作者](https://github.com/crimx)。

沙拉查词项目为 [MIT](https://github.com/crimx/ext-saladict/blob/dev/LICENSE) 许可，你可以随意使用源码，但必须附带该许可与版权声明。请勿用于任何违法犯罪行为，沙拉查词强烈谴责并会尽可能配合追究责任。对于照搬源码二次发布的套壳项目沙拉查词有责任对平台和用户发出相应的举报和提醒。

## 更多截图

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/youdao-page.gif" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/screen-notebook.png" /></a>
</p>

<p align="center">
  <a href="https://github.com/crimx/ext-saladict/releases/" target="_blank"><img src="https://github.com/crimx/ext-saladict/wiki/images/pin.gif" /></a>
</p>
